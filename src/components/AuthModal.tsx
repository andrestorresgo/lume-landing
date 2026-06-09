import * as React from "react"
import { useState, useCallback } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { supabase } from "../lib/supabaseClient"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleModeToggle = useCallback(() => {
    setMode(prev => prev === "login" ? "signup" : "login")
    setErrorMsg(null)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setLoading(true)

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: displayName || email.split("@")[0],
            },
          },
        })
        if (error) throw error
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message || "Ocurrió un error inesperado")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#fbf9f6] border border-[#78716C]/20 p-8 max-w-sm rounded-none text-[#1C1917] font-sans">
        <DialogHeader className="gap-2 mb-6">
          <DialogTitle className="font-heading text-2xl font-medium tracking-tight text-center">
            {mode === "login" ? "Inicia Sesión" : "Crea tu Cuenta"}
          </DialogTitle>
          <DialogDescription className="text-xs text-[#78716C] text-center font-light">
            {mode === "login" 
              ? "Accede para finalizar tu pedido de forma segura." 
              : "Regístrate para guardar tus pedidos y gestionar tu bolsa."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {errorMsg && (
            <div className="text-[11px] text-[#7C0A12] bg-[#7C0A12]/5 border border-[#7C0A12]/15 px-3 py-2 text-center font-medium">
              {errorMsg}
            </div>
          )}

          {mode === "signup" && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="displayName" className="text-[10px] uppercase tracking-widest font-semibold text-[#78716C]">
                Nombre Completo
              </label>
              <input
                id="displayName"
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-[#f5f3f0] border border-[#78716C]/20 px-3 py-2 text-xs outline-none focus:border-[#1C1917] transition-colors rounded-none"
                placeholder="Escribe tu nombre"
              />
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
              className="w-full bg-[#f5f3f0] border border-[#78716C]/20 px-3 py-2 text-xs outline-none focus:border-[#1C1917] transition-colors rounded-none"
              placeholder="tu@correo.com"
            />
          </div>

          <div className="flex flex-col gap-1.5 font-sans">
            <label htmlFor="password" className="text-[10px] uppercase tracking-widest font-semibold text-[#78716C]">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#f5f3f0] border border-[#78716C]/20 px-3 py-2 text-xs outline-none focus:border-[#1C1917] transition-colors rounded-none"
              placeholder="••••••••"
            />
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#1C1917] hover:bg-[#7C0A12] text-white py-5 text-[10px] uppercase tracking-wider font-semibold rounded-none mt-2 h-auto"
          >
            {loading ? "Procesando..." : mode === "login" ? "Ingresar" : "Registrarse"}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-[#78716C]/10 text-center">
          <button 
            type="button"
            onClick={handleModeToggle}
            className="text-[11px] text-[#78716C] hover:text-[#1C1917] transition-colors underline underline-offset-4 font-light"
          >
            {mode === "login" 
              ? "¿No tienes una cuenta? Regístrate aquí" 
              : "¿Ya tienes cuenta? Inicia sesión"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
