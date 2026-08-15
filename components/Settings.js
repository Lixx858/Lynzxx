"use client";
import{useEffect,useState}from"react";
import Link from"next/link";
export default function Settings(){
 const[k,setK]=useState(""),[show,setShow]=useState(false),[msg,setMsg]=useState(""),[saved,setSaved]=useState(false),[model,setModel]=useState("gemini-2.0-flash"),[worker,setWorker]=useState(false);
 useEffect(()=>{try{const x=sessionStorage.getItem("clipforge_gemini_key")||"";setK(x);setSaved(!!x);setModel(sessionStorage.getItem("clipforge_gemini_model")||"gemini-2.0-flash")}catch{}fetch("/api/settings").then(r=>r.json()).then(x=>setWorker(x.workerConfigured))},[]);
 function save(){if(!k.trim()){sessionStorage.removeItem("clipforge_gemini_key");setSaved(false);return setMsg("Gemini API key dihapus.")}sessionStorage.setItem("clipforge_gemini_key",k.trim());sessionStorage.setItem("clipforge_gemini_model",model);setSaved(true);setMsg("✓ Gemini API key tersimpan di sesi browser.")}
 async function test(){setMsg("Testing Gemini...");const r=await fetch("/api/ai/test",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({apiKey:k.trim(),model})});const d=await r.json();setMsg(d.ok?"✓ Gemini berhasil terhubung.":"✕ "+(d.error||"Key tidak valid."))}
 function clear(){setK("");sessionStorage.removeItem("clipforge_gemini_key");sessionStorage.removeItem("clipforge_gemini_model");setSaved(false);setMsg("Gemini API key dihapus.")}
 return <div className="shell"><aside><div className="brand">✦ ClipForge</div><Link className="nav" href="/">⌂ Dashboard</Link><Link className="nav active" href="/settings">⚙ Settings</Link></aside><main><small>SETTINGS</small><h1>Gemini <span>Configuration</span></h1><p className="muted">Gunakan Google Gemini untuk analisis AI.</p>
 <section className="card"><div className="head"><div><h2>Google Gemini API</h2><p className="muted">Gunakan API key Gemini milikmu sendiri.</p></div><b className={saved?"good":"pill"}>{saved?"Key siap":"Belum diisi"}</b></div>
 <label>Gemini API Key</label><div className="key"><input type={show?"text":"password"} value={k} onChange={e=>{setK(e.target.value);setSaved(false)}} placeholder="AIza..."/><button onClick={()=>setShow(!show)}>{show?"Hide":"Show"}</button></div>
 <p className="help">Key disimpan sementara di sessionStorage. Jangan membagikannya.</p>
 <label>Model</label><select value={model} onChange={e=>setModel(e.target.value)}><option value="gemini-2.0-flash">gemini-2.0-flash</option><option value="gemini-2.0-flash-lite">gemini-2.0-flash-lite</option></select>
 <div className="buttons"><button className="primary" onClick={save}>Simpan di Sesi</button><button onClick={test}>Test Connection</button><button onClick={clear}>Hapus</button></div>{msg&&<div className="notice">{msg}</div>}</section>
 <section className="card"><h2>Dapatkan Gemini API Key</h2><p className="muted">Buat API key dari Google AI Studio. Ketersediaan free tier, kuota, dan model dapat berubah menurut akun/region.</p><a className="linkbtn" href="https://aistudio.google.com/app/apikey" target="_blank">Buka Google AI Studio ↗</a></section>
 <section className="card"><h2>Video Worker</h2><p className="muted">Status worker: <b>{worker?"Terhubung":"Belum terhubung"}</b></p><p className="help">Worker tetap diperlukan untuk mengambil link video dan membuat transcript dengan Whisper + FFmpeg.</p></section>
 </main></div>
}