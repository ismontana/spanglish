"use client"

import type React from "react"

import { getInfoUsuario } from "@/lib/utils"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { Animated, ImageBackground, StyleSheet, Text, View } from "react-native"

interface AuthGuardProps {
  children: React.ReactNode
  redirectTo?: string
  reverse?: boolean // Si true, redirige cuando SÍ está autenticado
}

export function AuthGuard({ children, redirectTo = "/user", reverse = false }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [shouldRender, setShouldRender] = useState(false)
  const router = useRouter()
  const loadingRotateAnim = new Animated.Value(0)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const usuario = await getInfoUsuario()
        const isAuthenticated = !!usuario

        if (reverse) {
          // Si reverse=true, redirigir cuando SÍ está autenticado (para login/register)
          if (isAuthenticated) {
            router.replace({ pathname: redirectTo } as any)
            return
          } else {
            setShouldRender(true)
          }
        } else {
          // Comportamiento normal: redirigir cuando NO está autenticado
          if (!isAuthenticated) {
            router.replace("/login")
            return
          } else {
            setShouldRender(true)
          }
        }
      } catch (error) {
        console.error("Error checking auth:", error)
        if (!reverse) {
          router.replace("/login")
        } else {
          setShouldRender(true)
        }
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, redirectTo, reverse])

  useEffect(() => {
    const rotateAnimation = Animated.loop(
      Animated.timing(loadingRotateAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    )

    if (isLoading) {
      rotateAnimation.start()
    } else {
      rotateAnimation.stop()
    }

    return () => rotateAnimation.stop()
  }, [isLoading])

  const spin = loadingRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  })

  if (isLoading) {
    return (
      <ImageBackground
        source={require("@/assets/images/back_claro.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.loadingContainer}>
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Ionicons name="refresh-outline" size={40} color="#fff" />
          </Animated.View>
          <Text style={styles.loadingText}>Verificando sesión...</Text>
        </View>
      </ImageBackground>
    )
  }

  if (!shouldRender) {
    return null
  }

  return <>{children}</>
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 20,
  },
})
