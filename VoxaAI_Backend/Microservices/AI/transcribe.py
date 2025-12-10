import os
from faster_whisper import WhisperModel

# Load model once at startup
model_size = os.getenv("WHISPER_MODEL", "base")
model = WhisperModel(model_size, device="cpu", compute_type="int8")

def transcribe_audio(audio_path: str) -> str:
    """
    Transcribe audio file to text using faster-whisper
    """
    segments, info = model.transcribe(audio_path, beam_size=5)
    
    transcribed_text = " ".join([segment.text for segment in segments])
    return transcribed_text.strip()
