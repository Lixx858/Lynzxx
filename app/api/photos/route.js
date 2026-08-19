import { list, del } from "@vercel/blob";
import { NextResponse } from "next/server";
import { createHmac } from "crypto";

function valid(token) {
  if (!token || !process.env.SESSION_SECRET) return false;
  const [value, sig] = token.split(".");
  if (!value || !sig) return false;
  const expected = createHmac("sha256", process.env.SESSION_SECRET).update(value).digest("hex");
  if (sig !== expected) return false;
  try {
    const data = JSON.parse(Buffer.from(value, "base64url").toString());
    return data.u === process.env.ADMIN_USERNAME && Date.now() - data.t < 1000 * 60 * 60 * 24 * 7;
  } catch { return false; }
}

export async function GET() {
  try {
    const gallery = await list({ prefix: "gallery/", limit: 100 });
    const structure = await list({ prefix: "structure/", limit: 100 });
    return NextResponse.json({
      photos: gallery.blobs.map(b => ({ url:b.url, pathname:b.pathname })).reverse(),
      structurePhotos: structure.blobs.map(b => ({ url:b.url, pathname:b.pathname })).reverse()
    });
  } catch {
    return NextResponse.json({ photos: [], structurePhotos: [], error: "Vercel Blob belum terhubung." });
  }
}

export async function DELETE(request) {
  if (!valid(request.cookies.get("ixb_admin")?.value)) return NextResponse.json({ error:"Unauthorized" }, {status:401});
  const { url } = await request.json();
  if (!url) return NextResponse.json({error:"Invalid URL"}, {status:400});
  try { await del(url); return NextResponse.json({ok:true}); }
  catch (error) { return NextResponse.json({error:error.message},{status:500}); }
}
