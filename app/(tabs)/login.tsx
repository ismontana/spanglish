"use client"

import { AuthGuard } from "@/components/auth-guard"
import config from "@/lib/config"
import { Ionicons } from "@expo/vector-icons"
import axios from "axios"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import * as SecureStore from "expo-secure-store"
import { useEffect, useRef, useState } from "react"
import {
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"

const { width, height } = Dimensions.get("window")

function LoginScreenContent() {
  const router = useRouter()

  const [correo, setCorreo] = useState("")
  const [contrasena, setContrasena] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current
  const scaleAnim = useRef(new Animated.Value(0.9)).current
  const emailFocusAnim = useRef(new Animated.Value(0)).current
  const passwordFocusAnim = useRef(new Animated.Value(0)).current
  const buttonScaleAnim = useRef(new Animated.Value(1)).current
  const loadingRotateAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // Solo iniciar animaciones si no está verificando autenticación y no está autenticado
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
      const { token, usuario } = res.data
      await SecureStore.setItemAsync("userToken", token)

      Alert.alert("¡Bienvenido!", `Hola ${usuario.nombre}`)
      // Usar replace para evitar que puedan volver atrás
      router.replace("/user")
    } catch (err) {
      Alert.alert("Error", "Correo o contraseña incorrectos")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailFocus = () => {
    Animated.timing(emailFocusAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start()
  }

  const handleEmailBlur = () => {
    Animated.timing(emailFocusAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start()
  }

  const handlePasswordFocus = () => {
    Animated.timing(passwordFocusAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start()
  }

  const handlePasswordBlur = () => {
    Animated.timing(passwordFocusAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start()
  }

  const spin = loadingRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  })

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        style={styles.gradient}
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
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Bienvenido</Text>
            <Text style={styles.subtitle}>Inicia sesión en tu cuenta</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Email Input */}
            <Animated.View
              style={[
                styles.inputContainer,
                {
                  borderColor: emailFocusAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["rgba(255,255,255,0.3)", "#fff"],
                  }),
                  borderWidth: emailFocusAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 2],
                  }),
                },
              ]}
            >
              <Ionicons name="mail-outline" size={20} color="rgba(255,255,255,0.8)" />
              <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                placeholderTextColor="rgba(255,255,255,0.6)"
                keyboardType="email-address"
                autoCapitalize="none"
                value={correo}
                onChangeText={setCorreo}
                onFocus={handleEmailFocus}
                onBlur={handleEmailBlur}
              />
            </Animated.View>

            {/* Password Input */}
            <Animated.View
              style={[
                styles.inputContainer,
                {
                  borderColor: passwordFocusAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["rgba(255,255,255,0.3)", "#fff"],
                  }),
                  borderWidth: passwordFocusAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 2],
                  }),
                },
              ]}
            >
              <Ionicons name="lock-closed-outline" size={20} color="rgba(255,255,255,0.8)" />
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                placeholderTextColor="rgba(255,255,255,0.6)"
                secureTextEntry={!showPassword}
                value={contrasena}
                onChangeText={setContrasena}
                onFocus={handlePasswordFocus}
                onBlur={handlePasswordBlur}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="rgba(255,255,255,0.8)"
                />
              </TouchableOpacity>
            </Animated.View>

            {/* Login Button */}
            <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonLoading]}
                onPress={handleLogin}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <Animated.View style={{ transform: [{ rotate: spin }] }}>
                    <Ionicons name="refresh-outline" size={20} color="#667eea" />
                  </Animated.View>
                ) : (
                  <Text style={styles.buttonText}>Iniciar Sesión</Text>
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* Register Link */}
            <TouchableOpacity onPress={() => router.push("/register")} style={styles.linkContainer}>
              <Text style={styles.linkText}>
                ¿No tienes cuenta? <Text style={styles.linkTextBold}>Regístrate</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </LinearGradient>
    </KeyboardAvoidingView>
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
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
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
  header: {
    alignItems: "center",
    marginBottom: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  input: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    color: "#fff",
  },
  eyeIcon: {
    padding: 5,
  },
  button: {
    backgroundColor: "#fff",
    borderRadius: 15,
    paddingVertical: 18,
    alignItems: "center",
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
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  buttonText: {
    color: "#667eea",
    fontSize: 18,
    fontWeight: "bold",
  },
  linkContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  linkText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 16,
  },
  linkTextBold: {
    fontWeight: "bold",
    color: "#fff",
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
})
