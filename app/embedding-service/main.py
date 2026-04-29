"""
Kollab Embedding Service
------------------------
A lightweight FastAPI microservice that generates sentence embeddings
using the sentence-transformers/all-MiniLM-L6-v2 model.

Used by the Kollab recommendation system to convert project descriptions
and user profiles into vectors for semantic similarity matching.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from contextlib import asynccontextmanager
import logging

# ── Logging ────────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ── Constants ──────────────────────────────────────────────────────────────────
MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
EMBEDDING_DIMENSIONS = 384
MAX_TEXT_LENGTH = 6000  # characters — keep well within the model's token limit

# ── Model (loaded once at startup, shared across all requests) ─────────────────
model: SentenceTransformer | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load the SentenceTransformer model when the app starts."""
    global model
    logger.info(f"Loading model: {MODEL_NAME} ...")
    model = SentenceTransformer(MODEL_NAME)
    logger.info("Model loaded successfully.")
    yield
    # Nothing to clean up, but the pattern supports future teardown logic
    logger.info("Embedding service shutting down.")


# ── App ────────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Kollab Embedding Service",
    description="Generates sentence embeddings for the Kollab recommendation system.",
    version="1.0.0",
    lifespan=lifespan,
)

# Allow requests from the local frontend (Vite default port) and backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite dev server
        "http://localhost:5000",   # Express backend
        "http://localhost:3000",   # Common fallback
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request / Response models ──────────────────────────────────────────────────

class EmbedRequest(BaseModel):
    """Body for POST /embed"""
    text: str


class EmbedResponse(BaseModel):
    """Successful response from POST /embed"""
    success: bool
    model: str
    dimensions: int
    embedding: list[float]


class HealthResponse(BaseModel):
    """Response from GET /health"""
    success: bool
    service: str
    status: str


# ── Routes ─────────────────────────────────────────────────────────────────────

@app.get("/health", response_model=HealthResponse, tags=["Health"])
def health_check():
    """
    Returns the current health status of the embedding service.
    The Node backend calls this before forwarding recommendation requests.
    """
    return {
        "success": True,
        "service": "kollab-embedding-service",
        "status": "ok",
    }


@app.post("/embed", response_model=EmbedResponse, tags=["Embeddings"])
def embed_text(request: EmbedRequest):
    """
    Accepts a plain-text string and returns its embedding vector.

    The embedding is a list of 384 floats produced by the
    all-MiniLM-L6-v2 model. Semantically similar texts will have
    high cosine similarity between their embeddings.
    """
    # ── Validation ─────────────────────────────────────────────────────────
    if not isinstance(request.text, str):
        raise HTTPException(status_code=400, detail="'text' must be a string.")

    text = request.text.strip()

    if not text:
        raise HTTPException(
            status_code=400,
            detail="'text' must not be empty or whitespace only.",
        )

    # Truncate silently to avoid hitting the model's token limit
    if len(text) > MAX_TEXT_LENGTH:
        logger.warning(
            f"Input text truncated from {len(text)} to {MAX_TEXT_LENGTH} characters."
        )
        text = text[:MAX_TEXT_LENGTH]

    # ── Safety check ───────────────────────────────────────────────────────
    if model is None:
        raise HTTPException(
            status_code=503,
            detail="Embedding model is not ready yet. Please retry in a moment.",
        )

    # ── Embed ──────────────────────────────────────────────────────────────
    # encode() returns a numpy array; .tolist() converts it to a plain Python list
    # so FastAPI can serialise it as JSON.
    embedding_vector = model.encode(text).tolist()

    return {
        "success": True,
        "model": MODEL_NAME,
        "dimensions": EMBEDDING_DIMENSIONS,
        "embedding": embedding_vector,
    }
