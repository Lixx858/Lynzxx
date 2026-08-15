import {askGemini} from "../../../../lib/gemini";
export async function POST(req){
  try{
    const {apiKey,model}=await req.json();
    const x=await askGemini([{role:"user",parts:[{text:"Reply exactly CONNECTION_OK"}]}],apiKey,model);
    return Response.json({ok:x.trim()==="CONNECTION_OK",response:x.trim()});
  }catch(e){
    return Response.json({ok:false,error:e.message},{status:400});
  }
}