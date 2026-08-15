import os, re, tempfile, subprocess, shutil
from urllib.parse import urlparse
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from faster_whisper import WhisperModel
import yt_dlp

app=FastAPI(title="ClipForge Video Worker")
ALLOWED=("youtube.com","youtu.be","tiktok.com","instagram.com","facebook.com","fb.watch","x.com","twitter.com")

class Req(BaseModel):
    url:str

def allowed(url):
    p=urlparse(url)
    if p.scheme not in ("http","https"): return False
    h=(p.hostname or "").lower()
    return any(h==d or h.endswith("."+d) for d in ALLOWED)

@app.get("/")
def root(): return {"ok":True,"service":"clipforge-worker"}

@app.post("/process-url")
def process_url(req:Req):
    if not allowed(req.url):
        raise HTTPException(400,"Platform/link belum didukung. Gunakan link publik dari YouTube, TikTok, Instagram, Facebook, atau X.")
    tmp=tempfile.mkdtemp(prefix="clipforge-")
    try:
        out=os.path.join(tmp,"video.%(ext)s")
        opts={"outtmpl":out,"noplaylist":True,"quiet":True,"no_warnings":True,"restrictfilenames":True}
        with yt_dlp.YoutubeDL(opts) as y:
            info=y.extract_info(req.url,download=True)
            path=y.prepare_filename(info)
        # Convert to mono 16k WAV for Whisper.
        wav=os.path.join(tmp,"audio.wav")
        subprocess.run(["ffmpeg","-y","-i",path,"-vn","-ac","1","-ar","16000",wav],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
        model=WhisperModel(os.getenv("WHISPER_MODEL","small"),device=os.getenv("WHISPER_DEVICE","cpu"),compute_type=os.getenv("WHISPER_COMPUTE_TYPE","int8"))
        segments,_=model.transcribe(wav,vad_filter=True)
        lines=[]
        for s in segments:
            lines.append(f"[{s.start:07.2f}] {s.text.strip()}")
        return {"title":info.get("title",""),"duration":info.get("duration"),"transcript":"\n".join(lines)}
    except Exception as e:
        raise HTTPException(500,f"Worker gagal: {str(e)[:500]}")
    finally:
        shutil.rmtree(tmp,ignore_errors=True)
