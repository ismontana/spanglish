"use client"

import { useTheme } from "@/app/theme/themeContext"
import { AuthGuard } from "@/components/auth-guard"
import FloatingLabelInput from "@/components/FloatingLabelInput"; // Importado
import { darkTheme } from "@/constants/theme"
import config from "@/lib/config"
import { Ionicons } from "@expo/vector-icons"
import axios from "axios"
import { useRouter } from "expo-router"
import * as SecureStore from "expo-secure-store"
import { useEffect, useRef, useState } from "react"
import {
  Alert,
  Animated,
  Dimensions,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"

const { width } = Dimensions.get("window")

function LoginScreenContent() {
  const router = useRouter()
  const { theme } = useTheme()

  const [correo, setCorreo] = useState("")
  const [contrasena, setContrasena] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Animaciones (simplificadas)
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current
  const scaleAnim = useRef(new Animated.Value(0.9)).current
  const buttonScaleAnim = useRef(new Animated.Value(1)).current
  const loadingRotateAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // Animación de entrada
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

    // Animación de loading
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
      loadingRotateAnim.setValue(0)
    }

    return () => rotateAnimation.stop()
  }, [isLoading])

  const handleLogin = async () => {
    if (!correo || !contrasena) {
      Alert.alert("Error", "Por favor completa todos los campos")
      return
    }

    setIsLoading(true)

    // Animación del botón
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

    try {
      const res = await axios.post(`${config.BACKEND_URL_BASE}/usuarios/login`, {
        correo,
        contrasena,
      })
      const { token, refreshToken, usuario } = res.data

      // Guardamos ambos tokens de forma segura
      await SecureStore.setItemAsync("userToken", token)
      await SecureStore.setItemAsync("refreshToken", refreshToken)
      
      Alert.alert("¡Bienvenido!", `Hola ${usuario.nombre}`)
      router.replace("/user")
    } catch (err) {
      Alert.alert("Error", "Correo o contraseña incorrectos")
    } finally {
      setIsLoading(false)
    }
  }

  const spin = loadingRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  })

  const backgroundImage =
    theme === darkTheme
      ? require("@/assets/images/back_oscuro.png")
      : require("@/assets/images/back_claro.png")

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ImageBackground source={backgroundImage} style={styles.backgroundImage} resizeMode="cover" />

      <TouchableOpacity style={styles.backButton} onPress={() => router.push("/menu")}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.cardContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
                backgroundColor: theme.secondary,
              },
            ]}
          >
            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.primary }]}>Bienvenido</Text>
              <Text style={[styles.subtitle, { color: theme.text2 }]}>Inicia sesión en tu cuenta</Text>
            </View>

            <View style={styles.form}>
              <FloatingLabelInput
                label="Correo electrónico"
                iconName="mail-outline"
                value={correo}
                onChangeText={setCorreo}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <FloatingLabelInput
                label="Contraseña"
                iconName="lock-closed-outline"
                value={contrasena}
                onChangeText={setContrasena}
                isPassword
              />

              <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
                <TouchableOpacity
                  style={[
                    styles.button,
                    { backgroundColor: theme.primary },
                    isLoading && styles.buttonLoading,
                  ]}
                  onPress={handleLogin}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <Animated.View style={{ transform: [{ rotate: spin }] }}>
                      <Ionicons name="refresh-outline" size={20} color={theme.white} />
                    </Animated.View>
                  ) : (
                    <Text style={[styles.buttonText, { color: theme.white }]}>Iniciar Sesión</Text>
                  )}
                </TouchableOpacity>
              </Animated.View>            
              <TouchableOpacity onPress={() => router.push("/register")} style={styles.linkContainer}>
                <Text style={[styles.linkText, { color: theme.text2 }]}>
                  ¿No tienes cuenta? <Text style={[styles.linkTextBold, { color: theme.primary }]}>Regístrate</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

export default function LoginScreen() {
  return (
    <AuthGuard reverse={true}>
      <LoginScreenContent />
    </AuthGuard>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  cardContainer: {
    width: width * 0.9,
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
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
  },
  form: {
    width: "100%",
  },
  button: {
    borderRadius: 15,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 10, // Ajustado
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  buttonLoading: {
    opacity: 0.8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  linkContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  linkText: {
    fontSize: 16,
  },
  linkTextBold: {
    fontWeight: "bold",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 2,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 25,
    padding: 12,
  },
})