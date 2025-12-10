import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

# Configure Gemini API - client gets API key from GEMINI_API_KEY environment variable
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def improve_text(text: str) -> str:
    """
    Improve English grammar and clarity while maintaining length and meaning
    """
    prompt = f"""Improve the English grammar, vocabulary, and clarity of the following text. 
Keep the same length, meaning, and overall message. Only fix language issues.

Text: {text}

Improved text:"""
    
    response = client.models.generate_content(
        model="gemini-2.0-flash-exp",
        contents=prompt
    )
    return response.text.strip()
