"use client"

import { useTheme } from "@/app/theme/themeContext"
import { darkTheme } from "@/constants/theme"
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
  Dimensions,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"

const { width } = Dimensions.get("window")

export default function AuthScreen() {
  const { nombre, correo, idioma, contrasena } = useLocalSearchParams<{
    nombre: string
    correo: string
    idioma: string
    contrasena: string
  }>()
  const router = useRouter()
  const { theme } = useTheme()
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

  const backgroundImage =
    theme === darkTheme
      ? require("@/assets/images/back_oscuro.png")
      : require("@/assets/images/back_claro.png")

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ImageBackground source={backgroundImage} style={styles.backgroundImage} resizeMode="cover" />

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

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
          keyboardDismissMode="none"
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
              <View style={[styles.iconContainer, { backgroundColor: theme.background }]}>
                <Ionicons name="mail-outline" size={60} color={theme.primary} />
              </View>
              <Text style={[styles.title, { color: theme.primary }]}>Verifica tu correo</Text>
              <Text style={[styles.subtitle, { color: theme.text2 }]}>
                Hemos enviado un código de 7 dígitos a{"\n"}
                <Text style={[styles.email, { color: theme.primary }]}>{correo}</Text>
              </Text>
            </View>

            <View style={styles.form}>
              <Animated.View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: theme.background,
                    borderColor: inputFocusAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [theme.primary, theme.white_blue],
                    }),
                    borderWidth: inputFocusAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 2] }),
                  },
                ]}
              >
                <Ionicons name="keypad-outline" size={20} color={theme.primary} />
                <TextInput
                  ref={(ref) => registerInput("code", ref)}
                  style={[styles.input, { color: theme.text, letterSpacing: 2 }]}
                  placeholder="Código de 7 dígitos"
                  placeholderTextColor={theme.text2}
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

              <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
                <TouchableOpacity
                  style={[
                    styles.button,
                    { backgroundColor: theme.primary },
                    isVerifying && styles.buttonLoading,
                  ]}
                  onPress={handleVerificar}
                  disabled={isVerifying}
                  activeOpacity={0.8}
                >
                  {isVerifying ? (
                    <Animated.View style={{ transform: [{ rotate: spin }] }}>
                      <Ionicons name="refresh-outline" size={20} color={theme.white} />
                    </Animated.View>
                  ) : (
                    <Text style={[styles.buttonText, { color: theme.white }]}>Verificar Código</Text>
                  )}
                </TouchableOpacity>
              </Animated.View>

              <TouchableOpacity
                onPress={handleReenviar}
                disabled={resendCooldown > 0}
                style={styles.resendContainer}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.resendText,
                    { color: theme.text2 },
                    resendCooldown > 0 && styles.resendTextDisabled,
                  ]}
                >
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
    paddingVertical: 100,
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
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 2,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 25,
    padding: 12,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  iconContainer: {
    borderRadius: 50,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  email: {
    fontWeight: "bold",
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 30,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    marginLeft: 15,
    fontSize: 18,
    fontWeight: "bold",
  },
  button: {
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
    opacity: 0.8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  resendContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  resendText: {
    fontSize: 16,
    textAlign: "center",
    textDecorationLine: "underline",
  },
  resendTextDisabled: {
    opacity: 0.5,
    textDecorationLine: "none",
  },
})
