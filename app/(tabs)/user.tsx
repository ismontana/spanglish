"use client"

import { LoginPage } from "@/components/login"
import { getInfoUsuario } from "@/lib/utils"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import * as SecureStore from "expo-secure-store"
import { useEffect, useRef, useState } from "react"
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native"

const { width, height } = Dimensions.get("window")

export default function UserPage() {
  const router = useRouter()
  type Usuario = { nombre: string; [key: string]: any }
  const [usuario, setUsuario] = useState<Usuario | null>(null)

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current
  const scaleAnim = useRef(new Animated.Value(0.9)).current
  const avatarScaleAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const fetchUsuario = async () => {
      const user = await getInfoUsuario()
      setUsuario(user)
    }

    fetchUsuario()
  }, [])

  useEffect(() => {
    if (usuario) {
      // Animaciones de entrada cuando se carga el usuario
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start()

      // Animación del avatar con delay
      setTimeout(() => {
        Animated.spring(avatarScaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }).start()
      }, 300)
    }
  }, [usuario])

  const handleLogout = async () => {
    // Animación de salida
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(async () => {
      await SecureStore.deleteItemAsync("userToken")
      router.replace("/login")
    })
  }

  if (!usuario || Object.keys(usuario).length === 0) {
    return <LoginPage />
  }

  const MenuButton = ({
    icon,
    title,
    onPress,
    color = "#667eea",
    textColor = "#333",
  }: {
    icon: string
    title: string
    onPress: () => void
    color?: string
    textColor?: string
  }) => {
    const buttonScaleAnim = useRef(new Animated.Value(1)).current

    const handlePress = () => {
      Animated.sequence([
        Animated.timing(buttonScaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(buttonScaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start()
      onPress()
    }

    return (
      <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
        <TouchableOpacity style={[styles.menuButton, { backgroundColor: color }]} onPress={handlePress}>
          <View style={styles.menuButtonContent}>
            <View style={styles.iconContainer}>
              <Ionicons name={icon as any} size={24} color="#fff" />
            </View>
            <Text style={[styles.menuButtonText, { color: textColor }]}>{title}</Text>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
          </View>
        </TouchableOpacity>
      </Animated.View>
    )
  }

  return (
    <LinearGradient
      colors={["#667eea", "#764ba2"]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.push("/menu")}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          },
        ]}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Animated.View
            style={[
              styles.avatarContainer,
              {
                transform: [{ scale: avatarScaleAnim }],
              },
            ]}
          >
            <LinearGradient colors={["rgba(255,255,255,0.3)", "rgba(255,255,255,0.1)"]} style={styles.avatarGradient}>
              <Ionicons name="person" size={60} color="#fff" />
            </LinearGradient>
          </Animated.View>

          <Text style={styles.userName}>{usuario ? usuario.nombre : "Cargando usuario..."}</Text>
          <Text style={styles.userEmail}>
            {usuario ? usuario.correo || "Email no disponible" : "Cargando email..."}
          </Text>
        </View>

        {/* Menu Options */}
        <View style={styles.menuContainer}>
          <MenuButton
            icon="person-outline"
            title="Editar perfil"
            onPress={() => {}}
            color="rgba(255,255,255,0.2)"
            textColor="#fff"
          />

          <MenuButton
            icon="watch-outline"
            title="Configurar reloj"
            onPress={() => {}}
            color="rgba(255,255,255,0.2)"
            textColor="#fff"
          />

          {/* Logout Button */}
          <MenuButton
            icon="log-out-outline"
            title="Cerrar sesión"
            onPress={handleLogout}
            color="rgba(220, 53, 69, 0.9)"
            textColor="#fff"
          />
        </View>
      </Animated.View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 100,
    paddingHorizontal: 30,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 25,
    padding: 12,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 40,
  },
  avatarContainer: {
    marginBottom: 20,
  },
  avatarGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.3)",
  },
  userName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
    textAlign: "center",
  },
  userEmail: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
  },
  menuContainer: {
    flex: 1,
    gap: 12,
  },
  menuButton: {
    borderRadius: 15,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  menuButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
  },
})
