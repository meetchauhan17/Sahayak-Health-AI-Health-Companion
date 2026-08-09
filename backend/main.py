import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from rag.query import _get_groq_client, _parse_llm_json, generate_response, retrieve_context, normalize_language_code

# Load environment variables from .env (GROQ_API_KEY, etc.)
load_dotenv()

# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Sahayak Health API",
    description="AI-powered multilingual medical symptom-checker chatbot backend",
    version="0.1.0",
)

# CORS configuration --------------------------------------------------------
_frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")

_allowed_origins = list(
    {
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        _frontend_url,
    }
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------
class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="User's symptom description")
    language: str = Field(
        default="en",
        description="Language code or name for the response (e.g. 'en', 'hi', 'gu', 'English', 'हिंदी', 'ગુજરાતી')",
    )


class ChatResponse(BaseModel):
    response: str = Field(..., description="Plain-language health information")
    severity: str = Field(
        ..., description="Triage level: 'green', 'yellow', or 'red'"
    )
    advice: str = Field(..., description="Specific actionable next step")


class ConversationMessage(BaseModel):
    role: str = Field(..., description="'user' or 'assistant'")
    content: str = Field(..., description="Message text")


class ChatSummaryRequest(BaseModel):
    conversation: list[ConversationMessage] = Field(
        ..., description="Full chat history to summarise"
    )


class SummaryResponse(BaseModel):
    symptoms_discussed: str = Field(..., description="Key symptoms mentioned")
    advice_given: str      = Field(..., description="Main advice provided")
    overall_severity: str  = Field(..., description="green | yellow | red")
    recommendation: str    = Field(..., description="One clear closing sentence")


# ---------------------------------------------------------------------------
# Endpoints (Using def endpoints so FastAPI offloads to threadpools)
# ---------------------------------------------------------------------------
@app.get("/")
def root():
    return {"message": "Hello World", "service": "Sahayak Health API"}


@app.post("/api/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    """
    Accept a symptom description, retrieve relevant medical context via RAG,
    generate a structured response via Groq LLM, and return it.
    """
    try:
        # 1. Retrieve relevant context from ChromaDB
        context = retrieve_context(request.message, top_k=3)

        # 2. Generate LLM response with context
        result = generate_response(
            user_query=request.message,
            context=context,
            language=request.language,
        )

        return ChatResponse(
            response=result.get("response", ""),
            severity=result.get("severity", "yellow"),
            advice=result.get("advice", "Please consult a healthcare professional."),
        )

    except RuntimeError as e:
        # Raised when GROQ_API_KEY is missing
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while processing your request: {str(e)}",
        )


# ---------------------------------------------------------------------------
# /api/summary  —  Conversation summarisation
# ---------------------------------------------------------------------------
_SUMMARY_SYSTEM_PROMPT = """\
You are a medical conversation summariser for Sahayak Health.
Given a chat transcript between a user and the Sahayak Health AI, produce a
concise structured summary ONLY as a raw JSON object — no markdown, no code
fences, no extra text.

The JSON must have exactly these keys:
{
  "symptoms_discussed": "<brief list of the health symptoms the user mentioned>",
  "advice_given": "<summary of the key advice or information provided>",
  "overall_severity": "<MUST be exactly one of: green, yellow, red — always in English>",
  "recommendation": "<one clear, actionable closing sentence for the user>"
}

RULES:
- Keep all text fields in English.
- overall_severity must reflect the most serious concern raised in the conversation.
- Be concise but accurate — 1-3 sentences per field is ideal.
- Do NOT invent symptoms or advice not present in the conversation.
"""


@app.post("/api/summary", response_model=SummaryResponse)
def summarise(request: ChatSummaryRequest):
    """
    Accept a conversation history and return a structured health summary.
    """
    try:
        client = _get_groq_client()

        # Build the transcript string from the conversation list
        transcript_lines = [
            f"{msg.role.capitalize()}: {msg.content}"
            for msg in request.conversation
        ]
        transcript = "\n".join(transcript_lines)

        messages = [
            {"role": "system", "content": _SUMMARY_SYSTEM_PROMPT},
            {
                "role": "user",
                "content": f"Please summarise this health conversation:\n\n{transcript}",
            },
        ]

        from rag.query import GROQ_MODEL
        completion = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=messages,
            temperature=0.2,
            max_tokens=512,
            timeout=15.0,
        )
        raw = completion.choices[0].message.content or "{}"
        parsed = _parse_llm_json(raw)

        return SummaryResponse(
            symptoms_discussed=parsed.get("symptoms_discussed", "Not available"),
            advice_given=parsed.get("advice_given", "Not available"),
            overall_severity=parsed.get("overall_severity", "yellow"),
            recommendation=parsed.get("recommendation", "Please consult a healthcare professional."),
        )

    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Summary generation failed: {str(e)}",
        )
