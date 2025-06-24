"use client"

import { useTheme } from "@/app/theme/themeContext"
import { LoginPage } from "@/components/login"
import { darkTheme } from "@/constants/theme"
import { getInfoUsuario } from "@/lib/utils"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import * as SecureStore from "expo-secure-store"
import { useEffect, useRef, useState } from "react"
import { Animated, Dimensions, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"

const { width, height } = Dimensions.get("window")

export default function UserPage() {
  const router = useRouter()
  type Usuario = { nombre: string; [key: string]: any }
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const {theme} = useTheme()
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
    color = "#0066CC",
    isLogout = false,
  }: {
    icon: string
    title: string
    onPress: () => void
    color?: string
    isLogout?: boolean
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
        <TouchableOpacity
          style={[styles.menuButton, { backgroundColor: theme.menu_blue }, isLogout && styles.logoutButton]}
          onPress={handlePress}
        >
          <View style={styles.menuButtonContent}>
            <View style={[styles.iconContainer, isLogout && styles.logoutIconContainer]}>
              <Ionicons name={icon as any} size={24} color="#fff" />
            </View>
            <Text style={styles.menuButtonText}>{title}</Text>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </View>
        </TouchableOpacity>
      </Animated.View>
    )
  }
  
  const backgroundImage = theme === darkTheme  
     ? require('@/assets/images/back_oscuro.png')  // imagen para modo oscuro
     : require('@/assets/images/back_claro.png');
  return (
    <ImageBackground
      source={backgroundImage}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      {/* ScrollView para manejar contenido largo */}
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Tarjeta principal */}
        <Animated.View
          style={[
            styles.cardContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
              backgroundColor:theme.background
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
              <View style={[styles.avatarCircle, {backgroundColor:theme.menu_blue}]}>
                <Ionicons name="person" size={60} color="#fff" />
              </View>
            </Animated.View>

            <Text style={[styles.userName, {color:theme.white_blue}]}>{usuario ? usuario.nombre : "Cargando usuario..."}</Text>
            <Text style={[styles.userEmail, {color:theme.white_blue}]}>
              {usuario ? usuario.correo || "Email no disponible" : "Cargando email..."}
            </Text>
          </View>

          {/* Menu Options */}
          <View style={styles.menuContainer}>
            <MenuButton
              icon="person-outline"
              title="Editar perfil"
              onPress={() => router.push("/edit-profile")}
              color="#0066CC"
            />

            <MenuButton icon="watch-outline" title="Configurar reloj" onPress={() => {}} color="#0066CC" />

            {/* Logout Button */}
            <MenuButton
              icon="log-out-outline"
              title="Cerrar sesión"
              onPress={handleLogout}
              color="#dc3545"
              isLogout={true}
            />
          </View>
        </Animated.View>
      </ScrollView>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80, // Padding para evitar que se corte
    paddingHorizontal: 20,
    minHeight: height, // Asegurar altura mínima
  },
  cardContainer: {
    width: width * 0.9,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 30,
    padding: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    minHeight: height * 0.7, // Altura mínima para asegurar que todo el contenido sea visible
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 2,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 25,
    padding: 12,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 30,
  },
  avatarContainer: {
    marginBottom: 20,
  },
  avatarCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#0066CC",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(0, 100, 200, 0.3)",
  },
  userName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0066CC",
    marginBottom: 8,
    textAlign: "center",
  },
  userEmail: {
    fontSize: 16,
    color: "rgba(0, 100, 200, 0.8)",
    textAlign: "center",
  },
  menuContainer: {
    width: "100%",
    gap: 15,
  },
  menuButton: {
    borderRadius: 15,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  logoutButton: {
    marginTop: 10,
  },
  menuButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  logoutIconContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  menuButtonText: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
})
