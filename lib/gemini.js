export async function askGemini(contents, apiKey, model){
  const key = apiKey || process.env.GEMINI_API_KEY;
  const chosenModel = model || process.env.GEMINI_MODEL || "gemini-3.6-flash";
  if(!key) throw new Error("Gemini API key belum diisi.");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(chosenModel)}:generateContent?key=${encodeURIComponent(key)}`;
  const r = await fetch(url,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({contents}),
    cache:"no-store"
  });
  const text = await r.text();
  if(!r.ok) throw new Error(`Gemini ${r.status}: ${text.slice(0,500)}`);
  const data = JSON.parse(text);
  return data.candidates?.[0]?.content?.parts?.map(p=>p.text||"").join("") || "";
}