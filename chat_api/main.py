from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
from dotenv import load_dotenv
import os
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize Groq client
client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

# FastAPI app
app = FastAPI()

# Enable CORS for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change later to your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Sample bracelet database
# Later you can load this from Supabase/PostgreSQL
BRACELET_DATA = """
1. Amethyst Bracelet
- Helps with stress, anxiety, calmness, sleep.

2. Tiger Eye Bracelet
- Helps with confidence, courage, focus, business success.

3. Rose Quartz Bracelet
- Helps with love, relationships, emotional healing.

4. Black Tourmaline Bracelet
- Protection from negative energy.

5. Citrine Bracelet
- Wealth, abundance, positivity, success.

6. Clear Quartz Bracelet
- Energy balance and clarity.
"""

# Request schema
class ChatRequest(BaseModel):
    message: str


# Response schema
class ChatResponse(BaseModel):
    reply: str


# Health check route
@app.get("/")
def home():
    return {
        "status": "running",
        "message": "Bracelet AI API is working"
    }


# Main chatbot route
@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    static = True
    user_message = request.message
    logger.info(f"Incoming message: {user_message}")

    prompt = f"""
You are an expert gemstone and healing bracelet advisor.

RULES:
- Recommend bracelets ONLY from provided data.
- Suggest best bracelet according to user's problem.
- Explain benefits clearly.
- Keep answers short and friendly.
- Do not make medical claims.
- If multiple bracelets help, recommend top 2.
- if no bracelet helps, suggest one of them and explain why (whatever appliese or jjust made up).
Bracelet Data:
{BRACELET_DATA}

User Question:
{user_message}
"""

    if static:
        # For testing without API calls
        logger.info("Using static response for testing.")
        return ChatResponse(reply="Based on your question, I recommend the Amethyst Bracelet for stress relief and better sleep.")
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "You are a professional bracelet recommendation assistant."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,
            max_tokens=300
        )
        answer = response.choices[0].message.content
        logger.info(f"AI reply: {answer}")
        return ChatResponse(reply=answer)
    except Exception as e:
        logger.error(f"Groq API call failed: {e}", exc_info=True)
        raise