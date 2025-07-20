"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function SimpleLoginPage() {
  const [email, setEmail] = useState("admin@test.com")
  const [password, setPassword] = useState("password")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      console.log("Intentando login con:", { email, password })
      
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()
      console.log("Respuesta del login:", data)

      if (response.ok && data.success) {
        setMessage("Login exitoso! Redirigiendo...")
        
        // Guardar usuario en localStorage inmediatamente
        if (data.user) {
          localStorage.setItem("user_session", JSON.stringify(data.user))
          console.log("Usuario guardado en localStorage:", data.user)
        }
        
        // Redirigir al dashboard simple
        setTimeout(() => {
          router.push("/simple-dashboard")
        }, 1000)
      } else {
        setMessage(data.message || "Error en el login")
      }
    } catch (error) {
      console.error("Error:", error)
      setMessage("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Login Simple</h1>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? "Cargando..." : "Iniciar Sesión"}
          </button>
        </form>
        
        {message && (
          <div className={`mt-4 p-3 rounded ${
            message.includes("exitoso") 
              ? "bg-green-100 text-green-700" 
              : "bg-red-100 text-red-700"
          }`}>
            {message}
          </div>
        )}
        
        <div className="mt-6 text-sm text-gray-600">
          <p><strong>Credenciales de prueba:</strong></p>
          <p>Email: admin@test.com</p>
          <p>Password: password</p>
        </div>
      </div>
    </div>
  )
}
