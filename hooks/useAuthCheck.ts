"use client"

import { getInfoUsuario } from "@/lib/utils"
import { useRouter } from "expo-router"
import { useEffect, useState } from "react"

export function useAuthCheck() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const usuario = await getInfoUsuario()

        if (usuario) {
          setIsAuthenticated(true)
          // Si está autenticado, redirigir a user sin permitir volver atrás
          router.replace("/user")
        } else {
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error("Error checking authentication:", error)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthentication()
  }, [router])

  return { isAuthenticated, isLoading }
}
