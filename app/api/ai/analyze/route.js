import {askGemini} from "../../../../lib/gemini";
export async function POST(req){
  try{
    const b=await req.json();
    const key=String(b.apiKey||"");
    const model=String(b.model||"gemini-2.0-flash");
    const t=String(b.transcript||"").slice(0,120000);
    if(!t.trim()) return Response.json({error:"Transcript kosong."},{status:400});
    const n=Math.min(Math.max(Number(b.count||10),1),30);
    const prompt=`Analyze this timestamped transcript and return ONLY valid JSON, without markdown:
{"clips":[{"start":number,"end":number,"score":number,"title":string,"hook":string,"reason":string,"caption":string,"hashtags":string[]}]}
Find up to ${n} strong, self-contained short-form moments. Prioritize strong hooks, curiosity, emotion, useful insight, surprising statements and punchlines. Score from 0 to 100. Do not guarantee virality.
TRANSCRIPT:
${t}`;
    let x=await askGemini([{role:"user",parts:[{text:prompt}]}],key,model);
    x=x.replace(/^```json\s*/i,"").replace(/^```\s*/i,"").replace(/```$/,"").trim();
    return Response.json(JSON.parse(x));
  }catch(e){
    return Response.json({error:e.message},{status:500});
  }
}