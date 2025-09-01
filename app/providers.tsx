"use client"

import { SessionProvider } from "next-auth/react"
import { ReactNode } from "react"
import { LanguageProvider } from "@/lib/contexts/LanguageContext"

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <LanguageProvider>
        <div className="min-h-screen bg-background text-foreground">
          {children}
        </div>
      </LanguageProvider>
    </SessionProvider>
  )
}
