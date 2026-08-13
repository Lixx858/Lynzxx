const JSZip = require("jszip");

const MAX_INPUT = 3 * 1024 * 1024; // base64 payload input limit for this app
const MAX_TOTAL_FILES = 100;
const MAX_FILE_SIZE = 2 * 1024 * 1024;
const blocked = /(^|\/)(\.env|\.vercel|node_modules)(\/|$)|(^|\/)(package-lock\.json|pnpm-lock\.yaml|yarn\.lock)$/i;

function cleanName(s){
  return String(s||"felix-project").toLowerCase().replace(/[^a-z0-9-]/g,"-").replace(/-+/g,"-").replace(/^-|-$/g,"").slice(0,50) || "felix-project";
}
function safePath(s){
  s=String(s).replace(/\\/g,"/");
  const parts=s.split("/").filter(x=>x && x!=="." && x!=="..");
  return parts.join("/");
}
function json(res,status,obj){res.status(status).setHeader("Content-Type","application/json");return res.end(JSON.stringify(obj))}
function b64(buf){return Buffer.from(buf).toString("base64")}
function clientIp(req){return (req.headers["x-forwarded-for"]||"unknown").split(",")[0].trim()}
const hits=new Map();
function allowed(ip){
  const now=Date.now(), old=hits.get(ip)||[];
  const fresh=old.filter(t=>now-t<60*60*1000);
  if(fresh.length>=5){hits.set(ip,fresh);return false}
  fresh.push(now);hits.set(ip,fresh);return true;
}

module.exports = async (req,res)=>{
  if(req.method!=="POST") return json(res,405,{error:"Method Not Allowed"});
  if(!process.env.VERCEL_TOKEN) return json(res,500,{error:"VERCEL_TOKEN belum dipasang di Environment Variables FelixDeploy."});
  if(!allowed(clientIp(req))) return json(res,429,{error:"Batas deployment tercapai. Coba lagi nanti."});

  try{
    const body=typeof req.body==="string"?JSON.parse(req.body):req.body;
    if(!body?.data || !body?.filename) return json(res,400,{error:"Berkas tidak ditemukan."});
    const raw=Buffer.from(body.data,"base64");
    if(raw.length>MAX_INPUT) return json(res,413,{error:"Berkas terlalu besar. Maksimum 3 MB untuk versi ini."});
    const name=cleanName(body.name);
    const filename=String(body.filename);

    let files=[];
    if(/\.zip$/i.test(filename)){
      const zip=await JSZip.loadAsync(raw);
      const entries=Object.values(zip.files).filter(x=>!x.dir);
      if(entries.length>MAX_TOTAL_FILES) return json(res,413,{error:"ZIP berisi terlalu banyak file."});
      for(const entry of entries){
        const path=safePath(entry.name);
        if(!path || blocked.test(path)) continue;
        if(path.startsWith("__MACOSX/")) continue;
        const data=await entry.async("nodebuffer");
        if(data.length>MAX_FILE_SIZE) return json(res,413,{error:`File terlalu besar: ${path}`});
        files.push({file:path,data:b64(data),encoding:"base64"});
      }
      // Normalize common single-folder ZIPs so index.html lands at deployment root.
      if(!files.some(x=>x.file.toLowerCase()==="index.html")){
        const idx=files.findIndex(x=>/\/index\.html?$/i.test(x.file));
        if(idx>=0){
          const prefix=files[idx].file.replace(/[^/]+$/,"");
          files=files.map(x=>x.file.startsWith(prefix)?{...x,file:x.file.slice(prefix.length)}:x).filter(x=>x.file);
        }
      }
    }else{
      if(!/\.html?$/i.test(filename)) return json(res,400,{error:"Format harus HTML atau ZIP."});
      files=[{file:"index.html",data:b64(raw),encoding:"base64"}];
    }

    if(!files.length) return json(res,400,{error:"Tidak ada file yang dapat dideploy."});
    if(!files.some(x=>x.file.toLowerCase()==="index.html")) return json(res,400,{error:"ZIP harus memiliki index.html."});

    const response=await fetch("https://api.vercel.com/v13/deployments",{
      method:"POST",
      headers:{
        "Authorization":`Bearer ${process.env.VERCEL_TOKEN}`,
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        name,
        files,
        projectSettings:{framework:null}
      })
    });
    const data=await response.json();
    if(!response.ok) return json(res,response.status,{error:data?.error?.message||data?.message||"Vercel API menolak deployment."});
    const url=data.url ? `https://${data.url}` : null;
    return json(res,200,{ok:true,url,id:data.id,name:data.name});
  }catch(e){
    console.error(e);
    return json(res,500,{error:"Server gagal memproses deployment."});
  }
};
