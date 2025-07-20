import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { cookies } from "next/headers"

// Almacenamiento temporal en memoria para testing
let tempSession: any = null

export async function GET() {
  try {
    console.log("[Session API] Obteniendo sesión...")
    
    // Primero intentar JWT
    let sessionData = await getSession()
    
    // Si no funciona JWT, usar sesión temporal
    if (!sessionData && tempSession) {
      console.log("[Session API] Usando sesión temporal")
      sessionData = tempSession
    }
    
    if (!sessionData) {
      console.log("[Session API] No hay sesión activa")
      return NextResponse.json({ data: null })
    }
    
    console.log("[Session API] Sesión encontrada:", {
      email: sessionData.email,
      role: sessionData.role,
      name: sessionData.name
    })
    
    return NextResponse.json({ data: sessionData })
  } catch (error) {
    console.error("[Session API] Error:", error)
    return NextResponse.json({ data: null })
  }
}

// Endpoint para establecer sesión temporal (solo para testing)
export async function POST(request: Request) {
  try {
    const userData = await request.json()
    tempSession = userData
    console.log("[Session API] Sesión temporal establecida para:", userData.email)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Session API] Error estableciendo sesión temporal:", error)
    return NextResponse.json({ error: "Error" }, { status: 500 })
  }
}

