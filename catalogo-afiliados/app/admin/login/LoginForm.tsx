"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "No se pudo iniciar sesión.");
      router.replace("/admin");
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo iniciar sesión.");
    } finally {
      setLoading(false);
    }
  }

  return <main className="auth-card">
    <form className="stack" onSubmit={submit}>
      <div>
        <p className="eyebrow">Acceso privado</p>
        <h1>Catálogo</h1>
        <p className="lead">Gestiona los productos y sus enlaces regionales.</p>
      </div>
      <label className="field">
        <span>Contraseña</span>
        <input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required autoFocus />
      </label>
      {error && <div className="error" role="alert">{error}</div>}
      <button className="button" disabled={loading}>{loading ? "Entrando…" : "Entrar"}</button>
      <a className="admin-link" href="/">Volver al catálogo público</a>
    </form>
  </main>;
}
