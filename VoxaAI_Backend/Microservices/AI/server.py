from fastapi import FastAPI, File, UploadFile
from fastapi.responses import FileResponse
import shutil
import os
from pathlib import Path
from dotenv import load_dotenv
from transcribe import transcribe_audio
from reform import improve_text
from tts import generate_speech

load_dotenv()

app = FastAPI()

TEMP_DIR = Path("temp")
TEMP_DIR.mkdir(exist_ok=True)

@app.post("/process")
async def process_audio(audio: UploadFile = File(...)):
    print(f"\n[PIPELINE START] Processing audio file: {audio.filename}")
    input_path = None
    
    try:
        # Save uploaded audio
        input_path = TEMP_DIR / f"input_{audio.filename}"
        print(f"[STAGE 0] Saving uploaded audio to: {input_path}")
        with open(input_path, "wb") as buffer:
            shutil.copyfileobj(audio.file, buffer)
        print(f"[STAGE 0] Audio saved successfully ({audio.filename})")
        
        # Step 1: Transcribe
        print(f"[STAGE 1] Starting transcription...")
        transcribed_text = transcribe_audio(str(input_path))
        print(f"[STAGE 1] Transcription complete. Text: '{transcribed_text}'")
        
        # Step 2: Improve English
        print(f"[STAGE 2] Starting text improvement with Gemini...")
        improved_text = improve_text(transcribed_text)
        print(f"[STAGE 2] Text improvement complete. Improved text: '{improved_text}'")
        
        # Step 3: Generate speech with IndexTTS
        output_path = TEMP_DIR / "output.wav"
        print(f"[STAGE 3] Starting TTS generation with IndexTTS...")
        print(f"[STAGE 3] Reference audio: {input_path}")
        print(f"[STAGE 3] Target text: '{improved_text}'")
        generate_speech(str(input_path), improved_text, str(output_path))
        print(f"[STAGE 3] TTS generation complete. Output saved to: {output_path}")
        
        # Return the audio file
        print(f"[PIPELINE END] Returning improved audio file")
        return FileResponse(
            output_path,
            media_type="audio/wav",
            filename="improved_audio.wav"
        )
    
    except Exception as e:
        print(f"[PIPELINE ERROR] Exception occurred: {type(e).__name__}: {str(e)}")
        return {"error": str(e)}
    finally:
        # Cleanup
        if input_path and input_path.exists():
            print(f"[CLEANUP] Removing temporary input file: {input_path}")
            os.remove(input_path)
            print(f"[CLEANUP] Cleanup complete")

@app.get("/health")
def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
