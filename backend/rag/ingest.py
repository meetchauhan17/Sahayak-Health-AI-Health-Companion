"""
ingest.py — Load medical knowledge base documents into ChromaDB.

Reads /backend/data/medical_kb.json, converts each entry into a readable
text chunk, generates embeddings with sentence-transformers (all-MiniLM-L6-v2),
and persists them in a local ChromaDB collection named "medical_kb".
"""

import json
import os
import sys

import chromadb
from sentence_transformers import SentenceTransformer

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KB_PATH = os.path.join(BACKEND_DIR, "data", "medical_kb.json")
CHROMA_DIR = os.path.join(BACKEND_DIR, "chroma_db")
COLLECTION_NAME = "medical_kb"


def _build_chunk(entry: dict) -> str:
    """Convert a single KB entry into a human-readable paragraph for embedding."""
    lines = [f"Symptom: {entry['symptom']}."]

    lines.append("Common causes include: " + "; ".join(entry["causes"]) + ".")

    lines.append(
        "Recommended self-care steps: " + "; ".join(entry["self_care"]) + "."
    )

    lines.append(
        "You should see a doctor if: " + "; ".join(entry["see_doctor_if"]) + "."
    )

    lines.append(
        "Seek emergency care immediately if: "
        + "; ".join(entry["emergency_if"])
        + "."
    )

    return " ".join(lines)


def ingest() -> int:
    """Run the full ingestion pipeline. Returns the number of documents stored."""

    # 1. Load the knowledge base
    with open(KB_PATH, "r", encoding="utf-8") as f:
        kb_entries = json.load(f)

    print(f"[ingest] Loaded {len(kb_entries)} entries from {KB_PATH}")

    # 2. Build text chunks
    ids: list[str] = []
    documents: list[str] = []
    metadatas: list[dict] = []

    for idx, entry in enumerate(kb_entries):
        chunk = _build_chunk(entry)
        documents.append(chunk)
        ids.append(f"med_{idx:03d}")
        metadatas.append(
            {
                "symptom": entry["symptom"],
                "severity_default": entry["severity_default"],
            }
        )

    # 3. Generate embeddings
    print("[ingest] Loading sentence-transformers model (all-MiniLM-L6-v2) ...")
    model = SentenceTransformer("all-MiniLM-L6-v2")
    embeddings = model.encode(documents, show_progress_bar=True).tolist()
    print(f"[ingest] Generated {len(embeddings)} embeddings (dim={len(embeddings[0])})")

    # 4. Store in ChromaDB
    os.makedirs(CHROMA_DIR, exist_ok=True)
    client = chromadb.PersistentClient(path=CHROMA_DIR)

    # Delete existing collection if it exists, so re-runs are idempotent
    try:
        client.delete_collection(COLLECTION_NAME)
    except Exception:
        pass

    collection = client.create_collection(
        name=COLLECTION_NAME,
        metadata={"description": "Sahayak Health medical knowledge base"},
    )

    collection.add(
        ids=ids,
        documents=documents,
        embeddings=embeddings,
        metadatas=metadatas,
    )

    count = collection.count()
    print(f"[ingest] ChromaDB collection '{COLLECTION_NAME}' created with {count} entries.")
    return count


if __name__ == "__main__":
    stored = ingest()
    if stored == 15:
        print("\n[OK] Ingestion complete — all 15 medical KB entries stored successfully.")
    else:
        print(f"\n[WARNING] Expected 15 entries but found {stored}.")
        sys.exit(1)
