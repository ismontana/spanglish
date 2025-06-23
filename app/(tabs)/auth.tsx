"use client"

import { useKeyboardAwareScroll } from "@/hooks/useKeyboardAwareScroll"
import config from "@/lib/config"
import { Ionicons } from "@expo/vector-icons"
import axios from "axios"
import { useLocalSearchParams, useRouter } from "expo-router"
import * as SecureStore from "expo-secure-store"
import { useCallback, useEffect, useRef, useState } from "react"
import {
  Alert,
  Animated,
  Dimensions, ImageBackground, KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
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
  const { scrollViewRef, registerInput, scrollToInput } = useKeyboardAwareScroll()

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
    scrollToInput("code")
  }, [scrollToInput])

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
    <View style={styles.container}>
      {/* Fondo fijo */}
      <ImageBackground
        source={require("@/assets/images/back_claro.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      {/* Back Button fijo */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Contenido scrollable */}
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="none" // Evitar que se cierre el teclado
        >
          {/* Tarjeta principal */}
          <Animated.View
            style={[
              styles.cardContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
              },
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Ionicons name="mail-outline" size={60} color="#0066CC" />
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
                      outputRange: ["rgba(0, 100, 200, 0.3)", "rgba(0, 100, 200, 0.6)"],
                    }),
                    borderWidth: inputFocusAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 2],
                    }),
                  },
                ]}
              >
                <Ionicons name="keypad-outline" size={20} color="rgba(0, 100, 200, 0.8)" />
                <TextInput
                  ref={(ref) => registerInput("code", ref)}
                  style={[styles.input, { letterSpacing: 2 }]}
                  placeholder="Código de 7 dígitos"
                  placeholderTextColor="rgba(0, 100, 200, 0.6)"
                  value={codigo}
                  onChangeText={setCodigo}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  keyboardType="number-pad"
                  maxLength={7}
                  textAlign="center"
                  blurOnSubmit={false}
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
                      <Ionicons name="refresh-outline" size={20} color="#fff" />
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
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    position: "absolute", // Fondo fijo
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
    paddingVertical: 100, // Cambiar de 50 a 100
    paddingHorizontal: 20,
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
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  iconContainer: {
    backgroundColor: "rgba(0, 100, 200, 0.1)",
    borderRadius: 50,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "rgba(0, 100, 200, 0.3)",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#0066CC",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(0, 100, 200, 0.8)",
    textAlign: "center",
    lineHeight: 24,
  },
  email: {
    fontWeight: "bold",
    color: "#0066CC",
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(240, 248, 255, 0.8)",
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "rgba(0, 100, 200, 0.3)",
  },
  input: {
    flex: 1,
    marginLeft: 15,
    fontSize: 18,
    color: "#0066CC",
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#0066CC",
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
    backgroundColor: "rgba(0, 102, 204, 0.8)",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  resendContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  resendText: {
    color: "rgba(0, 100, 200, 0.8)",
    fontSize: 16,
    textAlign: "center",
    textDecorationLine: "underline",
  },
  resendTextDisabled: {
    color: "rgba(0, 100, 200, 0.5)",
    textDecorationLine: "none",
  },
})
