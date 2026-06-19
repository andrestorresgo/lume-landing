import * as React from "react";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Verify that this user is actually an admin before redirecting
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("is_admin")
        .eq("id", data.user?.id)
        .maybeSingle();

      if (profileError || !profile?.is_admin) {
        // Sign out if they aren't admin to clear state
        await supabase.auth.signOut();
        throw new Error("Acceso denegado: El usuario no tiene rol de administrador.");
      }

      // Success! Cookies are written automatically by client-side listener.
      // Redirect to admin products page
      window.location.href = "/admin/products";
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Credenciales incorrectas o permisos insuficientes.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm bg-[#FBF9F6] border border-[#78716C]/20 p-8 rounded-none text-[#1C1917] font-sans shadow-lg">
      <div className="flex flex-col gap-2 mb-8 text-center">
        <h1 className="font-heading text-3xl tracking-tighter text-[#1C1917] font-medium">
          LUMÉ
        </h1>
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#78716C] font-semibold">
          Administración
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {errorMsg && (
          <div className="text-[11px] text-[#7C0A12] bg-[#7C0A12]/5 border border-[#7C0A12]/15 px-3 py-2 text-center font-medium">
            {errorMsg}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-[10px] uppercase tracking-widest font-semibold text-[#78716C]">
            Correo Electrónico
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="w-full bg-[#f5f3f0] border border-[#78716C]/20 px-3 py-2 text-xs outline-none focus:border-[#1C1917] transition-colors rounded-none"
            placeholder="admin@lume.com"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-[10px] uppercase tracking-widest font-semibold text-[#78716C]">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="w-full bg-[#f5f3f0] border border-[#78716C]/20 px-3 py-2 text-xs outline-none focus:border-[#1C1917] transition-colors rounded-none"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#1C1917] hover:bg-[#7C0A12] text-white py-3.5 text-[10px] uppercase tracking-wider font-semibold rounded-none mt-2 transition-all duration-300 disabled:opacity-50 cursor-pointer h-auto"
        >
          {loading ? "Verificando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
}
