import os,uuid,json,subprocess,shutil
from pathlib import Path
from fastapi import FastAPI,UploadFile,File,Form,HTTPException
from fastapi.middleware.cors import CORSMiddleware
from faster_whisper import WhisperModel
ROOT=Path(__file__).parent;UP=ROOT/"data"/"uploads";OUT=ROOT/"data"/"clips";UP.mkdir(parents=True,exist_ok=True);OUT.mkdir(parents=True,exist_ok=True)
app=FastAPI(title="ClipForge Worker");app.add_middleware(CORSMiddleware,allow_origins=["*"],allow_methods=["*"],allow_headers=["*"])
model_size=os.getenv("WHISPER_MODEL","small");mdl=None
def get_model():
 global mdl
 if mdl is None: mdl=WhisperModel(model_size,device="cpu",compute_type="int8")
 return mdl
@app.get("/health")
def health(): return {"ok":True,"ffmpeg":bool(shutil.which("ffmpeg")),"whisper":model_size}
def transcribe(p):
 segs,_=get_model().transcribe(str(p),vad_filter=True,word_timestamps=True)
 return [{"start":float(s.start),"end":float(s.end),"text":(s.text or "").strip()} for s in segs if (s.text or "").strip()]
def candidates(segs,n):
 out=[]
 for s in segs:
  st=max(0,s["start"]-2);en=min(segs[-1]["end"],st+55);txt=" ".join(x["text"] for x in segs if x["start"]<en and x["end"]>st);low=txt.lower();score=60+sum(4 for k in ["ternyata","rahasia","alasan","jangan","cara","kenapa","berhasil","gagal","faktanya"] if k in low)+(5 if "?" in txt else 0)
  out.append({"start":round(st,2),"end":round(en,2),"score":min(score,98),"title":"Candidate moment","hook":txt[:100],"reason":"Sinyal hook berdasarkan transcript."})
 out.sort(key=lambda x:x["score"],reverse=True);chosen=[]
 for c in out:
  if all(abs(c["start"]-x["start"])>25 for x in chosen): chosen.append(c)
  if len(chosen)>=n: break
 return chosen
def render(src,c,out):
 cmd=["ffmpeg","-y","-ss",str(c["start"]),"-i",str(src),"-t",str(c["end"]-c["start"]),"-vf","scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920","-c:v","libx264","-preset","veryfast","-crf","23","-c:a","aac","-movflags","+faststart",str(out)]
 subprocess.run(cmd,check=True,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
@app.post("/jobs")
async def jobs(video:UploadFile=File(...),count:int=Form(10),duration:str=Form("30-60")):
 if not shutil.which("ffmpeg"): raise HTTPException(500,"FFmpeg tidak tersedia")
 jid=uuid.uuid4().hex;src=UP/f"{jid}_{Path(video.filename).name}"
 with src.open("wb") as f:
  while chunk:=await video.read(1024*1024): f.write(chunk)
 segs=transcribe(src);cs=candidates(segs,count);folder=OUT/jid;folder.mkdir(parents=True,exist_ok=True)
 for i,c in enumerate(cs,1):
  out=folder/f"clip-{i:02d}.mp4";render(src,c,out);c["id"]=i;c["file"]=f"/files/{jid}/{out.name}"
 (folder/"transcript.json").write_text(json.dumps(segs,ensure_ascii=False),encoding="utf8")
 return {"id":jid,"clips":cs,"transcript":f"/files/{jid}/transcript.json"}