"use client"

import React from "react";
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  Camera, 
  ClipboardList, 
  Crown, 
  BarChart3, 
  AlertCircle, 
  Ban, 
  Settings, 
  User, 
  LayoutDashboard,
  LogOut,
  CheckCircle
} from "lucide-react"
import { getCurrentUser, ROLES, logout } from "@/lib/auth-client"
import type { User as UserType } from "@/lib/auth-client"

export default function SimpleDashboard() {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  // Evitar hydration mismatch con doble useEffect
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    async function loadUser() {
      if (!mounted) return
      
      try {
        console.log("[Dashboard] Cargando usuario...")
        
        // Añadir delay para evitar hydration race conditions
        await new Promise(resolve => setTimeout(resolve, 100))
        
        const user = await getCurrentUser()
        
        if (!user) {
          console.log("[Dashboard] No hay usuario, redirigiendo...")
          setTimeout(() => router.push("/login"), 100)
          return
        }
        
        console.log("[Dashboard] Usuario cargado:", user.email)
        console.log("[Dashboard] Rol del usuario:", user.role)
        console.log("[Dashboard] Usuario completo:", user)
        setCurrentUser(user)
      } catch (error) {
        console.error("[Dashboard] Error cargando usuario:", error)
        setTimeout(() => router.push("/login"), 100)
      } finally {
        setIsLoading(false)
      }
    }

    if (mounted) {
      loadUser()
    }
  }, [mounted, router])

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/login")
    } catch (error) {
      console.error("Error en logout:", error)
    }
  }

  function renderButton(icon: JSX.Element, label: string) {
    return (
      <div className="flex cursor-pointer select-none items-center justify-center rounded-sm outline-none">
        {icon}
        <span>{label}</span>
      </div>
    )
  }

  // No renderizar hasta que esté montado (evita hydration mismatch)
  if (!mounted) {
    return null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Redirigiendo al login...</p>
        </div>
      </div>
    )
  }

  const menuItems = [
    {
      title: "Escanear Documento",
      description: "Escanear cédulas y documentos",
      icon: Camera,
      href: "/scan",
      color: "bg-blue-500 hover:bg-blue-600",
      roles: [ROLES.ADMIN, ROLES.SUPERADMIN, ROLES.GUARDIA]
    },
    {
      title: "Gestión de Clientes",
      description: "Ver y gestionar clientes",
      icon: ClipboardList,
      href: "/clients",
      color: "bg-green-500 hover:bg-green-600",
      roles: [ROLES.ADMIN, ROLES.SUPERADMIN, ROLES.GUARDIA]
    },
    {
      title: "Estadísticas",
      description: "Ver estadísticas y reportes",
      icon: BarChart3,
      href: "/stats",
      color: "bg-purple-500 hover:bg-purple-600",
      roles: [ROLES.ADMIN, ROLES.SUPERADMIN]
    },
    {
      title: "Panel de Administración",
      description: "Gestión completa del sistema",
      icon: Crown,
      href: "/admin-dashboard",
      color: "bg-yellow-500 hover:bg-yellow-600",
      roles: [ROLES.SUPERADMIN]
    },
    {
      title: "Empleados",
      description: "Gestionar empleados",
      icon: User,
      href: "/employees",
      color: "bg-indigo-500 hover:bg-indigo-600",
      roles: [ROLES.ADMIN, ROLES.SUPERADMIN]
    },
    {
      title: "Incidentes",
      description: "Gestionar incidentes",
      icon: AlertCircle,
      href: "/incidents",
      color: "bg-red-500 hover:bg-red-600",
      roles: [ROLES.ADMIN, ROLES.SUPERADMIN, ROLES.GUARDIA]
    }
  ]

  console.log("[Dashboard] Filtrando menú para rol:", currentUser.role)
  console.log("[Dashboard] ROLES disponibles:", ROLES)
  
  const availableItems = menuItems.filter(item => {
    const hasAccess = item.roles.includes(currentUser.role as any)
    console.log(`[Dashboard] ${item.title}: ${hasAccess ? 'ACCESO' : 'SIN ACCESO'} (roles: ${item.roles.join(', ')})`)
    return hasAccess
  })
  
  console.log("[Dashboard] Items disponibles:", availableItems.length)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100" suppressHydrationWarning>
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <LayoutDashboard className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">
                Sistema de Escaneado
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm text-gray-600">
                  {currentUser.name || currentUser.email}
                </span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {currentUser.role}
                </span>
              </div>
              
              {renderButton(<LogOut className="h-4 w-4" />, "Salir")}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Bienvenido, {currentUser.name || currentUser.email}!
          </h2>
          <p className="text-gray-600">
            Selecciona una opción para comenzar
          </p>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group block"
              >
                <div className={`${item.color} text-white rounded-lg p-6 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200`}>
                  <div className="flex items-center mb-4">
                    <Icon className="h-8 w-8 mr-3" />
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                  </div>
                  <p className="text-white/90 text-sm">
                    {item.description}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Status Card */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Estado del Sistema</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600"></div>
              <div className="text-sm text-gray-600">Login Funcionando</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600"></div>
              <div className="text-sm text-gray-600">Dashboard Cargado</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600"></div>
              <div className="text-sm text-gray-600">Datos Mock Activos</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
