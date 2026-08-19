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

export async function GET(request) {
  return NextResponse.json({ authenticated: valid(request.cookies.get("ixb_admin")?.value) });
}
