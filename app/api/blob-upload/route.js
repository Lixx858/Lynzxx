import { handleUpload } from "@vercel/blob/client";
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

export async function POST(request) {
  if (!valid(request.cookies.get("ixb_admin")?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ["image/jpeg", "image/png", "image/webp"],
        addRandomSuffix: true,
        maximumSizeInBytes: 8 * 1024 * 1024,
      }),
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
