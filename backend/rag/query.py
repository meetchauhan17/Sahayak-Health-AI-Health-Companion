"""
query.py -- RAG query pipeline for Sahayak Health.

1. Retrieve relevant context from ChromaDB using sentence-transformers embeddings.
2. Generate a structured JSON response via Groq (llama-3.3-70b-versatile).
"""

import json
import os
import re
from functools import lru_cache

import chromadb
import groq as groq_sdk
from groq import Groq
from sentence_transformers import SentenceTransformer

# ---------------------------------------------------------------------------
# Paths & constants
# ---------------------------------------------------------------------------
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROMA_DIR = os.path.join(BACKEND_DIR, "chroma_db")
COLLECTION_NAME = "medical_kb"
GROQ_MODEL = "llama-3.3-70b-versatile"

# ---------------------------------------------------------------------------
# Lazy-loaded singletons (expensive objects created once, reused across calls)
# ---------------------------------------------------------------------------
_embedding_model: SentenceTransformer | None = None
_chroma_collection = None
_groq_client: Groq | None = None


def _get_embedding_model() -> SentenceTransformer:
    global _embedding_model
    if _embedding_model is None:
        _embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
    return _embedding_model


def _get_collection():
    global _chroma_collection
    if _chroma_collection is None:
        os.makedirs(CHROMA_DIR, exist_ok=True)
        client = chromadb.PersistentClient(path=CHROMA_DIR)
        _chroma_collection = client.get_or_create_collection(name=COLLECTION_NAME)
    return _chroma_collection


def _get_groq_client() -> Groq:
    global _groq_client
    if _groq_client is None:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise RuntimeError(
                "GROQ_API_KEY is not set. "
                "Create a .env file in /backend with GROQ_API_KEY=your_key_here"
            )
        _groq_client = Groq(api_key=api_key)
    return _groq_client


# ---------------------------------------------------------------------------
# 1. Context retrieval with LRU Cache for performance
# ---------------------------------------------------------------------------
@lru_cache(maxsize=256)
def _encode_query_cached(query: str):
    model = _get_embedding_model()
    return model.encode([query]).tolist()


def retrieve_context(user_query: str, top_k: int = 3) -> str:
    """
    Embed the user query and retrieve the top-k most similar chunks
    from the medical_kb ChromaDB collection.

    Returns: A single string combining the retrieved text chunks.
    """
    query_embedding = _encode_query_cached(user_query)

    collection = _get_collection()
    results = collection.query(
        query_embeddings=query_embedding,
        n_results=top_k,
    )

    # results["documents"] is a list of lists; flatten it
    chunks = results["documents"][0] if (results and results.get("documents")) else []

    return "\n\n---\n\n".join(chunks)


# ---------------------------------------------------------------------------
# 2. Response generation & Language Normalization
# ---------------------------------------------------------------------------
_LANGUAGE_INSTRUCTIONS = {
    "en": (
        "Respond in simple, plain English. "
        "Use everyday language that a non-medical person can easily understand."
    ),
    "hi": (
        "Respond fully in natural, everyday Hindi using Devanagari script "
        "(e.g. 'आपको हल्का बुखार है'). Do NOT use overly formal, textbook, "
        "or Sanskritized Hindi. Write the way a caring family member would speak. "
        "Do NOT transliterate Hindi into Latin/Roman script."
    ),
    "gu": (
        "Respond fully in natural, everyday Gujarati using Gujarati script "
        "(e.g. 'તમને હળવો તાવ છે'). Do NOT use overly formal or literary Gujarati. "
        "Write the way a caring family member would speak. "
        "Do NOT transliterate Gujarati into Latin/Roman script."
    ),
}

# Alias map to ensure full language names and native strings resolve to the correct prompt
_LANGUAGE_ALIAS_MAP = {
    "english": "en",
    "en": "en",
    "hindi": "hi",
    "हिंदी": "hi",
    "hi": "hi",
    "gujarati": "gu",
    "ગુજરાતી": "gu",
    "gu": "gu",
}


def normalize_language_code(lang: str) -> str:
    if not lang:
        return "en"
    clean = lang.strip().lower()
    return _LANGUAGE_ALIAS_MAP.get(clean, _LANGUAGE_ALIAS_MAP.get(lang.strip(), "en"))


_SYSTEM_PROMPT_TEMPLATE = """\
You are Sahayak Health Assistant -- a helpful, cautious health information \
assistant. You are NOT a doctor and you do NOT provide medical diagnoses. \
You provide general health information only.

LANGUAGE REQUIREMENT (CRITICAL):
{language_instruction}

RULES:
- Use the reference material below to inform your answer. Do not invent \
  medical facts beyond what the reference material contains.
- ALWAYS err toward HIGHER severity if you are uncertain.
- ALWAYS include a note (in the target language) that this is NOT a medical \
  diagnosis and the user should consult a qualified healthcare professional.
- For anything beyond very mild, clearly self-limiting symptoms, recommend \
  professional consultation.

SEVERITY LEVELS:
- "green"  = Mild / likely self-limiting. Basic self-care is usually sufficient.
- "yellow" = Moderate / warrants a doctor visit soon (within 24-48 hours).
- "red"    = Potentially serious / seek emergency medical care immediately.

REFERENCE MATERIAL:
{context}

RESPONSE FORMAT:
You MUST respond with ONLY a valid JSON object. No markdown, no code fences, \
no extra text before or after the JSON. The JSON must have exactly these keys:
{{
  "response": "<explanation in the specified language>",
  "severity": "<MUST be exactly one of: green, yellow, red — ALWAYS in English>",
  "advice": "<actionable next step in the specified language>"
}}

CRITICAL: The "severity" value MUST ALWAYS be in English (exactly "green", \
"yellow", or "red"). Never translate the severity value. Only the "response" \
and "advice" text fields should be in the target language.
"""

_RETRY_SYSTEM_PROMPT = """\
Your previous response was not valid JSON. Please respond with ONLY a raw \
JSON object -- no markdown code fences, no backticks, no extra text. \
The JSON must have exactly these three keys: "response", "severity", "advice".
"""


def _parse_llm_json(raw: str) -> dict:
    """
    Attempt to extract a JSON object from the LLM's raw text output.
    Handles cases where the model wraps it in markdown code fences.
    """
    # Strip markdown code fences if present
    cleaned = raw.strip()
    cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
    cleaned = re.sub(r"\s*```$", "", cleaned)
    cleaned = cleaned.strip()

    return json.loads(cleaned)


# ─── Fallback response ──────────────────────────────────────────────────────
_FALLBACK_RESPONSE = {
    "response": (
        "I'm having trouble connecting right now — please try again in a moment."
    ),
    "severity": "green",
    "advice": "Please retry your question.",
}


def generate_response(user_query: str, context: str, language: str = "en") -> dict:
    """
    Build a system prompt with retrieved context, call Groq LLM, and return
    a parsed JSON dict with keys: response, severity, advice.
    """
    try:
        client = _get_groq_client()

        lang_code = normalize_language_code(language)
        language_instruction = _LANGUAGE_INSTRUCTIONS.get(
            lang_code,
            _LANGUAGE_INSTRUCTIONS["en"],
        )

        system_prompt = _SYSTEM_PROMPT_TEMPLATE.format(
            context=context,
            language_instruction=language_instruction,
        )

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_query},
        ]

        # ── First attempt (15 s timeout) ──────────────────────────────────────
        try:
            completion = client.chat.completions.create(
                model=GROQ_MODEL,
                messages=messages,
                temperature=0.3,
                max_tokens=1024,
                timeout=15.0,
            )
        except (groq_sdk.APITimeoutError, groq_sdk.APIConnectionError):
            return _FALLBACK_RESPONSE

        raw_output = completion.choices[0].message.content or ""

        try:
            return _parse_llm_json(raw_output)
        except (json.JSONDecodeError, KeyError):
            pass  # Fall through to JSON-retry

        # ── Retry with stricter JSON instruction (15 s timeout) ───────────────
        messages.append({"role": "assistant", "content": raw_output})
        messages.append({"role": "system", "content": _RETRY_SYSTEM_PROMPT})

        try:
            completion = client.chat.completions.create(
                model=GROQ_MODEL,
                messages=messages,
                temperature=0.1,
                max_tokens=1024,
                timeout=15.0,
            )
        except (groq_sdk.APITimeoutError, groq_sdk.APIConnectionError):
            return _FALLBACK_RESPONSE

        raw_output = completion.choices[0].message.content or ""

        try:
            return _parse_llm_json(raw_output)
        except (json.JSONDecodeError, KeyError):
            # Both attempts produced malformed JSON — use fallback
            return {
                "response": (
                    "I'm sorry, I had trouble processing your request. "
                    "Please try rephrasing your symptoms."
                ),
                "severity": "yellow",
                "advice": (
                    "If you are experiencing concerning symptoms, please consult "
                    "a healthcare professional directly."
                ),
            }

    except Exception:
        # Catch-all for any unexpected error (auth issues, rate limits, etc.)
        return _FALLBACK_RESPONSE
