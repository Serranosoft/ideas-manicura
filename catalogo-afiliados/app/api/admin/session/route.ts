import { type NextRequest, NextResponse } from "next/server";
import { clearSessionCookie, hasSameOrigin, setSessionCookie, validatePassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  if (!hasSameOrigin(request)) return NextResponse.json({ error: "Origen no permitido." }, { status: 403 });
  try {
    const body = await request.json();
    if (!validatePassword(typeof body.password === "string" ? body.password : "")) {
      return NextResponse.json({ error: "Contraseña incorrecta." }, { status: 401 });
    }
    const response = NextResponse.json({ ok: true });
    setSessionCookie(response);
    return response;
  } catch (error) {
    console.error("admin_login_failed", error);
    return NextResponse.json({ error: "No se pudo iniciar sesión. Revisa la configuración." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!hasSameOrigin(request)) return NextResponse.json({ error: "Origen no permitido." }, { status: 403 });
  const response = NextResponse.json({ ok: true });
  clearSessionCookie(response);
  return response;
}
