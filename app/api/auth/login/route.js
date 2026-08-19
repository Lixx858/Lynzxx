import { NextResponse } from "next/server";
import { createHmac } from "crypto";

function sign(value) {
  return createHmac("sha256", process.env.SESSION_SECRET || "missing-secret").update(value).digest("hex");
}

export async function POST(request) {
  const { username, password } = await request.json();
  const expectedUser = process.env.ADMIN_USERNAME;
  const expectedPass = process.env.ADMIN_PASSWORD;
  if (!expectedUser || !expectedPass || !process.env.SESSION_SECRET) {
    return NextResponse.json({ error: "Admin belum dikonfigurasi di Environment Variables." }, { status: 503 });
  }
  if (username !== expectedUser || password !== expectedPass) {
    return NextResponse.json({ error: "Username atau password salah." }, { status: 401 });
  }
  const value = Buffer.from(JSON.stringify({ u: username, t: Date.now() })).toString("base64url");
  const token = `${value}.${sign(value)}`;
  const res = NextResponse.json({ ok: true });
  res.cookies.set("ixb_admin", token, {
    httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7
  });
  return res;
}
