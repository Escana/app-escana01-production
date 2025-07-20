"use client"

import { Suspense, useState, useEffect } from "react"
import ClientsTable from "./clients-table"
import { Loader2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ClientsPage() {
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Verificar la conexión a Supabase al cargar
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch("/api/health-check", {
          method: "GET",
          cache: "no-store",
        })

        if (!response.ok) {
          throw new Error(`Error de conexión: ${response.status}`)
        }

        setIsLoading(false)
      } catch (err) {
        console.error("Error verificando conexión:", err)
        setError(err instanceof Error ? err : new Error("Error desconocido"))
        setIsLoading(false)
      }
    }

    checkConnection()
  }, [])

  if (error) {
    return (
      <div className="min-h-screen bg-[#1A1B1C] flex items-center justify-center">
        <div className="bg-[#27272A] p-6 rounded-lg max-w-md text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Error de conexión</h2>
          <p className="text-gray-400 mb-4">{error.message}</p>
          <Button onClick={() => window.location.reload()} className="bg-[#3B82F6] hover:bg-[#2563EB]">
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#1A1B1C] min-h-screen">
      <Suspense
        fallback={
          <div className="min-h-screen bg-[#1A1B1C] flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-[#3B82F6] animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Cargando clientes...</p>
            </div>
          </div>
        }
      >
        <ClientsTable />
      </Suspense>
    </div>
  )
}

