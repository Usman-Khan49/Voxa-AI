"""
Text-to-Speech module using IndexTTS2

This module provides voice cloning and speech synthesis using the IndexTTS2 model.
IndexTTS2 features:
- Zero-shot voice cloning from reference audio
- Emotion-aware speech synthesis
- Text-based emotion control
- High-quality speech generation

The IndexTTS2 model runs in its own isolated virtual environment to avoid
dependency conflicts with the main application.

Requirements:
- IndexTTS2 repository cloned in ./index-tts/
- Models downloaded in ./index-tts/checkpoints/
- IndexTTS dependencies installed via: cd index-tts && uv sync --all-extras
- CUDA-capable GPU recommended (CPU mode supported but slower)

For more information: https://github.com/index-tts/index-tts
"""

import os
import subprocess
import sys
import json

# Global TTS model instance marker
_tts_initialized = False

# Index-tts paths
indextts_path = os.path.join(os.path.dirname(__file__), "index-tts")
indextts_venv_python = os.path.join(indextts_path, ".venv", "Scripts", "python.exe")

def _check_tts_available():
    """
    Check if IndexTTS is properly set up
    """
    global _tts_initialized
    if not _tts_initialized:
        # Check if index-tts venv exists
        if not os.path.exists(indextts_venv_python):
            print(f"[TTS] Warning: IndexTTS venv not found at {indextts_venv_python}")
            print(f"[TTS] Please run: cd index-tts && uv sync --all-extras")
            return False
        
        # Check if models exist
        cfg_path = os.path.join(indextts_path, "checkpoints", "config.yaml")
        if not os.path.exists(cfg_path):
            print(f"[TTS] Warning: Models not found. Please download them:")
            print(f"[TTS] hf download IndexTeam/IndexTTS-2 --local-dir=checkpoints")
            return False
        
        _tts_initialized = True
        print("[TTS] IndexTTS2 environment verified")
    
    return True

def generate_speech(reference_audio_path: str, text: str, output_path: str):
    """
    Generate speech using IndexTTS2 with voice cloning
    
    This function runs IndexTTS2 in its isolated virtual environment to avoid
    dependency conflicts with the main application.
    
    Args:
        reference_audio_path: Path to the original user audio (for voice cloning)
        text: The improved English text to synthesize
        output_path: Where to save the output audio
    """
    if not _check_tts_available():
        # Fallback if IndexTTS not available - just copy the reference audio
        import shutil
        print("[TTS] Warning: IndexTTS not available, using reference audio as output")
        shutil.copy(reference_audio_path, output_path)
        return
    
    try:
        print(f"[TTS] Generating speech with IndexTTS2...")
        print(f"[TTS] Reference audio: {reference_audio_path}")
        print(f"[TTS] Target text: '{text}'")
        
        # Convert reference audio to WAV if needed (IndexTTS works best with WAV)
        ref_audio_for_tts = reference_audio_path
        temp_wav = None
        if not reference_audio_path.lower().endswith('.wav'):
            print(f"[TTS] Converting audio to WAV format for IndexTTS...")
            import librosa
            import soundfile as sf
            temp_wav = os.path.join(os.path.dirname(reference_audio_path), "temp_ref.wav")
            audio, sr = librosa.load(reference_audio_path, sr=None)
            sf.write(temp_wav, audio, sr)
            ref_audio_for_tts = temp_wav
            print(f"[TTS] Audio converted to WAV")
        
        # Prepare arguments for the isolated inference script
        # Ensure proper types for all parameters
        args = {
            "reference_audio": os.path.abspath(ref_audio_for_tts),
            "text": str(text),
            "output_path": os.path.abspath(output_path),
            "cfg_path": os.path.abspath(os.path.join(indextts_path, "checkpoints", "config.yaml")),
            "model_dir": os.path.abspath(os.path.join(indextts_path, "checkpoints")),
            # Optimal settings for quality and performance (explicit types)
            "use_fp16": bool(True),
            "use_cuda_kernel": bool(False),
            "use_deepspeed": bool(False),
            "emo_alpha": float(1.0),  # Use full emotion from reference audio
            "use_emo_text": bool(False),  # Disable text emotion (causes type errors)
            "use_random": bool(False),
            "interval_silence": int(200),
            "max_text_tokens_per_segment": int(120)
        }
        
        # Create inline Python command (safer than temp file)
        python_code = f"""
import sys
import os
import json
import warnings
warnings.filterwarnings('ignore')

# Add index-tts to path
sys.path.insert(0, r'{indextts_path}')

# Parse arguments
args = json.loads(r'''{json.dumps(args)}''')

try:
    from indextts.infer_v2 import IndexTTS2
    
    # Load model
    tts = IndexTTS2(
        cfg_path=args['cfg_path'],
        model_dir=args['model_dir'],
        use_fp16=bool(args['use_fp16']),
        use_cuda_kernel=bool(args['use_cuda_kernel']),
        use_deepspeed=bool(args['use_deepspeed'])
    )
    
    # Generate speech - ensure correct types
    tts.infer(
        spk_audio_prompt=str(args['reference_audio']),
        text=str(args['text']),
        output_path=str(args['output_path']),
        emo_alpha=float(args['emo_alpha']),
        use_emo_text=bool(args['use_emo_text']),
        use_random=bool(args['use_random']),
        interval_silence=int(args['interval_silence']),
        max_text_tokens_per_segment=int(args['max_text_tokens_per_segment']),
        verbose=True
    )
    
    print("TTS_SUCCESS")
    
except Exception as e:
    import traceback
    print(f"TTS_ERROR: {{type(e).__name__}}: {{str(e)}}", file=sys.stderr)
    traceback.print_exc(file=sys.stderr)
    sys.exit(1)
"""
        
        print(f"[TTS] Starting IndexTTS2 inference (this may take 30-60 seconds)...")
        
        # Run in index-tts isolated venv with real-time output
        process = subprocess.Popen(
            [indextts_venv_python, "-c", python_code],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            encoding='utf-8',
            errors='replace',  # Replace invalid chars instead of crashing
            bufsize=1,  # Line buffered
            creationflags=subprocess.CREATE_NO_WINDOW if sys.platform == 'win32' else 0,
            env={**os.environ, 'PYTHONIOENCODING': 'utf-8', 'PYTHONLEGACYWINDOWSSTDIO': '0'}
        )
        
        # Read output in real-time
        stdout_lines = []
        stderr_lines = []
        
        import select
        import time
        start_time = time.time()
        timeout = 300  # 5 minutes
        
        while True:
            # Check timeout
            if time.time() - start_time > timeout:
                process.kill()
                raise Exception(f"IndexTTS2 inference timed out after {timeout} seconds")
            
            # Read stdout
            line = process.stdout.readline()
            if line:
                line = line.strip()
                stdout_lines.append(line)
                print(f"[TTS/IndexTTS] {line}")
            
            # Check if process finished
            if process.poll() is not None:
                # Read remaining output
                remaining = process.stdout.read()
                if remaining:
                    for line in remaining.strip().split('\n'):
                        if line:
                            stdout_lines.append(line)
                            print(f"[TTS/IndexTTS] {line}")
                break
            
            time.sleep(0.1)
        
        # Read stderr
        stderr_output = process.stderr.read()
        if stderr_output:
            stderr_lines = stderr_output.strip().split('\n')
            for line in stderr_lines:
                if line.strip():
                    print(f"[TTS/Info] {line}")
        
        stdout_text = '\n'.join(stdout_lines)
        stderr_text = '\n'.join(stderr_lines)
        
        # Check results
        if process.returncode != 0:
            print(f"[TTS] Error: Subprocess failed with code {process.returncode}")
            raise Exception(f"IndexTTS2 inference failed: {stderr_text}")
        
        if "TTS_SUCCESS" not in stdout_text:
            print(f"[TTS] Warning: Success marker not found in output")
        
        # Verify output was created
        if not os.path.exists(output_path):
            raise Exception(f"Output file was not created at {output_path}")
        
        # Clean up temporary WAV file if created
        if temp_wav and os.path.exists(temp_wav):
            os.remove(temp_wav)
            print(f"[TTS] Cleaned up temporary WAV file")
        
        print(f"[TTS] Speech generation successful! Output saved to: {output_path}")
        
    except subprocess.TimeoutExpired:
        print(f"[TTS] Error: IndexTTS2 inference timed out after 300 seconds")
        # Clean up temp file
        if temp_wav and os.path.exists(temp_wav):
            os.remove(temp_wav)
        raise Exception("TTS generation timed out")
    except Exception as e:
        print(f"[TTS] Error in speech generation: {type(e).__name__}: {str(e)}")
        # Clean up temp file
        if 'temp_wav' in locals() and temp_wav and os.path.exists(temp_wav):
            os.remove(temp_wav)
        # Fallback: copy reference audio if generation fails
        import shutil
        if os.path.exists(reference_audio_path):
            print("[TTS] Falling back to reference audio due to error")
            shutil.copy(reference_audio_path, output_path)
        raise
