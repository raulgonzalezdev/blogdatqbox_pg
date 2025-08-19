"use client";
import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    
    try {
      const r = await fetch("/api/v1/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      
      if (!r.ok) throw new Error("Error");
      
      setMsg("¡Gracias por suscribirte!");
      setEmail("");
    } catch {
      setMsg("No se pudo suscribir");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card mt-8 flex flex-col md:flex-row gap-3 items-start md:items-end">
      <div>
        <h3 className="text-xl font-semibold">Suscríbete al newsletter</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
          Recibe novedades y artículos seleccionados.
        </p>
      </div>
      <div className="flex-1" />
      <div className="flex gap-2 w-full md:w-auto">
        <input
          type="email"
          required
          placeholder="tu@email.com"
          className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 w-full md:w-64 bg-transparent"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <button className="btn" disabled={loading}>
          {loading ? "Enviando..." : "Unirme"}
        </button>
      </div>
      {msg && <p className="text-sm">{msg}</p>}
    </form>
  );
}
