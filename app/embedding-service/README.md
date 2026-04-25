# Kollab Embedding Service

A lightweight Python microservice that generates sentence embeddings for the Kollab project recommendation system.

**Model used:** `sentence-transformers/all-MiniLM-L6-v2`
**Output:** 384-dimensional float vectors
**Port:** 8001

---

## Prerequisites

- Python 3.10 or higher
- pip

---

## Setup

### 1. Open a terminal inside this folder

```bash
cd app/embedding-service
```

### 2. Create a virtual environment

```bash
python -m venv venv
```

### 3. Activate the virtual environment

**Windows (PowerShell):**
```powershell
.\venv\Scripts\Activate.ps1
```

**Windows (Command Prompt):**
```cmd
venv\Scripts\activate.bat
```

**macOS / Linux:**
```bash
source venv/bin/activate
```

### 4. Install dependencies

```bash
pip install -r requirements.txt
```

> The first install will download the `all-MiniLM-L6-v2` model (~90 MB) from Hugging Face.
> Subsequent runs use the local cache.

---

## Running the service

```bash
uvicorn main:app --reload --port 8001
```

The service will be available at: `http://localhost:8001`

---

## API Reference

### GET /health

Check that the service is running.

**Request:**
```bash
curl http://localhost:8001/health
```

**Response:**
```json
{
  "success": true,
  "service": "kollab-embedding-service",
  "status": "ok"
}
```

---

### POST /embed

Generate an embedding vector for a piece of text.

**Request:**
```bash
curl -X POST http://localhost:8001/embed \
  -H "Content-Type: application/json" \
  -d '{"text": "React developer with experience in Node.js and MongoDB"}'
```

**Response:**
```json
{
  "success": true,
  "model": "sentence-transformers/all-MiniLM-L6-v2",
  "dimensions": 384,
  "embedding": [0.0213, -0.0451, 0.1124, ...]
}
```

**Error — empty text (400):**
```json
{
  "detail": "'text' must not be empty or whitespace only."
}
```

---

## Interactive API Docs

FastAPI generates interactive documentation automatically.
Open your browser at:

- **Swagger UI:** http://localhost:8001/docs
- **ReDoc:** http://localhost:8001/redoc

---

## Notes

- Text longer than 6000 characters is automatically truncated before embedding.
- The model is loaded once at startup to keep request latency low.
- CORS is pre-configured for `localhost:5173` (Vite), `localhost:5000` (Express), and `localhost:3000`.
