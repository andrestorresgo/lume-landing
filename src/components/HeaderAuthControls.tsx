import * as React from "react"
import { useEffect, useState, useCallback } from "react"
import { supabase } from "../lib/supabaseClient"
import type { User } from "@supabase/supabase-js"
import AuthModal from "./AuthModal"

interface HeaderAuthControlsProps {
  buttonClass?: string;
  textColor?: string;
  hoverColor?: string;
}

export default function HeaderAuthControls({ 
  buttonClass = "text-[#FBF9F6] border-[#FBF9F6]/20 hover:bg-[#FBF9F6]/10 focus:ring-[#FBF9F6]/20",
  textColor = "text-[#FBF9F6]",
  hoverColor = "hover:text-[#ff827a]"
}: HeaderAuthControlsProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  const handleOpenLogin = useCallback(() => {
    setIsModalOpen(true)
  }, [])

  if (user) {
    const displayName = user.user_metadata?.display_name || user.email?.split("@")[0] || "Usuario"
    return (
      <div className={`flex items-center gap-3 text-[10px] uppercase tracking-widest font-semibold ${textColor}`}>
        <span className="opacity-75 font-normal normal-case">Hola, {displayName}</span>
        <span className="opacity-30">|</span>
        <button 
          onClick={handleSignOut}
          className={`cursor-pointer transition-colors duration-200 underline underline-offset-4 ${hoverColor}`}
        >
          Salir
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleOpenLogin}
        className={`cursor-pointer text-[10px] uppercase tracking-widest font-semibold hover:underline underline-offset-4 transition-colors duration-200 ${textColor} ${hoverColor}`}
      >
        Ingresar
      </button>
      <AuthModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => {}} 
      />
    </div>
  )
}
