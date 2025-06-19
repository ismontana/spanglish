"use client"

import config from "@/lib/config"
import { Ionicons } from "@expo/vector-icons"
import axios from "axios"
import { LinearGradient } from "expo-linear-gradient"
import { useLocalSearchParams, useRouter } from "expo-router"
import * as SecureStore from "expo-secure-store"
import { useCallback, useEffect, useRef, useState } from "react"
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

export default function AuthScreen() {
  const { nombre, correo, idioma, contrasena } = useLocalSearchParams<{
    nombre: string
    correo: string
    idioma: string
    contrasena: string
  }>()
  const router = useRouter()

  const [codigo, setCodigo] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(60)

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current
  const scaleAnim = useRef(new Animated.Value(0.9)).current
  const inputFocusAnim = useRef(new Animated.Value(0)).current
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
  }, [])

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>
    if (resendCooldown > 0) {
      timer = setInterval(() => setResendCooldown((prev) => prev - 1), 1000)
    }
    return () => clearInterval(timer)
  }, [resendCooldown])

  useEffect(() => {
    // Animación de loading
    const rotateAnimation = Animated.loop(
      Animated.timing(loadingRotateAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    )

    if (isVerifying) {
      rotateAnimation.start()
    } else {
      rotateAnimation.stop()
      loadingRotateAnim.setValue(0)
    }

    return () => rotateAnimation.stop()
  }, [isVerifying])

  const handleVerificar = async () => {
    if (!codigo || codigo.length !== 7) {
      Alert.alert("Error", "El código debe tener 7 dígitos.")
      return
    }

    setIsVerifying(true)

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
      // Paso 1: Confirmar registro
      await axios.post(`${config.BACKEND_URL_BASE}/usuarios/confirmar-registro`, {
        nombre,
        correo,
        idioma_preferido: idioma,
        contrasena,
        codigo,
      })

      // Paso 2: Login automático
      const loginRes = await axios.post(`${config.BACKEND_URL_BASE}/usuarios/login`, {
        correo,
        contrasena,
      })

      const { token } = loginRes.data
      await SecureStore.setItemAsync("userToken", token)

      router.replace("/(tabs)/user")
    } catch (err) {
      console.error("Error en confirmación o login:", err)
      Alert.alert("Error", "Código incorrecto, expirado o problema al iniciar sesión.")
    } finally {
      setIsVerifying(false)
    }
  }

  const handleReenviar = async () => {
    try {
      await axios.post(`${config.BACKEND_URL_BASE}/usuarios/pre-registro`, {
        nombre,
        correo,
        idioma_preferido: idioma,
        contrasena,
      })
      setResendCooldown(60)
      Alert.alert("Código reenviado", "Se ha enviado un nuevo código a tu correo")
    } catch (err: any) {
      console.error("Error reenviando código:", err)

      if (err.response?.status === 409) {
        Alert.alert("Email ya registrado", "Este correo ya está registrado. Te redirigiremos al login.", [
          {
            text: "OK",
            onPress: () => router.replace("/login"),
          },
        ])
      } else {
        Alert.alert("Error", err.response?.data?.error || "No se pudo reenviar el código")
      }
    }
  }

  const handleInputFocus = useCallback(() => {
    Animated.timing(inputFocusAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start()
  }, [])

  const handleInputBlur = useCallback(() => {
    Animated.timing(inputFocusAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start()
  }, [])

  const spin = loadingRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  })

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <LinearGradient
        colors={["#11998e", "#38ef7d"]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
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
            <View style={styles.iconContainer}>
              <Ionicons name="mail-outline" size={60} color="#fff" />
            </View>
            <Text style={styles.title}>Verifica tu correo</Text>
            <Text style={styles.subtitle}>
              Hemos enviado un código de 7 dígitos a{"\n"}
              <Text style={styles.email}>{correo}</Text>
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Code Input */}
            <Animated.View
              style={[
                styles.inputContainer,
                {
                  borderColor: inputFocusAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["rgba(255,255,255,0.3)", "#fff"],
                  }),
                  borderWidth: inputFocusAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 2],
                  }),
                },
              ]}
            >
              <Ionicons name="keypad-outline" size={20} color="rgba(255,255,255,0.8)" />
              <TextInput
                style={[styles.input, { fontSize: 18, letterSpacing: 2, textAlign: "center" }]}
                placeholder="Código de 7 dígitos"
                placeholderTextColor="rgba(255,255,255,0.6)"
                value={codigo}
                onChangeText={setCodigo}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                keyboardType="number-pad"
                maxLength={7}
              />
            </Animated.View>

            {/* Verify Button */}
            <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
              <TouchableOpacity
                style={[styles.button, isVerifying && styles.buttonLoading]}
                onPress={handleVerificar}
                disabled={isVerifying}
                activeOpacity={0.8}
              >
                {isVerifying ? (
                  <Animated.View style={{ transform: [{ rotate: spin }] }}>
                    <Ionicons name="refresh-outline" size={20} color="#11998e" />
                  </Animated.View>
                ) : (
                  <Text style={styles.buttonText}>Verificar Código</Text>
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* Resend Link */}
            <TouchableOpacity
              onPress={handleReenviar}
              disabled={resendCooldown > 0}
              style={styles.resendContainer}
              activeOpacity={0.7}
            >
              <Text style={[styles.resendText, resendCooldown > 0 && styles.resendTextDisabled]}>
                {resendCooldown > 0 ? `Reenviar en ${resendCooldown}s` : "¿No recibiste el código? Reenviar"}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </LinearGradient>
    </KeyboardAvoidingView>
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
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 25,
    padding: 12,
  },
  header: {
    alignItems: "center",
    marginBottom: 50,
  },
  iconContainer: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 50,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    lineHeight: 24,
  },
  email: {
    fontWeight: "bold",
    color: "#fff",
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
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  input: {
    flex: 1,
    marginLeft: 15,
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
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
    color: "#11998e",
    fontSize: 18,
    fontWeight: "bold",
  },
  resendContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  resendText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 16,
    textAlign: "center",
    textDecorationLine: "underline",
  },
  resendTextDisabled: {
    color: "rgba(255,255,255,0.5)",
    textDecorationLine: "none",
  },
})
