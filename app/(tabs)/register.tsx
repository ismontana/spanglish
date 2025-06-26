"use client"

import { useTheme } from "@/app/theme/themeContext"
import { AuthGuard } from "@/components/auth-guard"
import FloatingLabelDropdown from "@/components/FloatingLabelDropdown"
import FloatingLabelInput from "@/components/FloatingLabelInput"
import { GOOGLE_TRANSLATE_LANGUAGES, type Language } from "@/constants/languages"
import { darkTheme } from "@/constants/theme"
import config from "@/lib/config"
import { Ionicons } from "@expo/vector-icons"
import axios from "axios"
import { useRouter } from "expo-router"
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

function RegisterScreenContent() {
  const router = useRouter()
  const { theme } = useTheme()

  const [nombre, setNombre] = useState("")
  const [correo, setCorreo] = useState("")
  const [idioma, setIdioma] = useState("es")
  const [contrasena, setContrasena] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current
  const scaleAnim = useRef(new Animated.Value(0.9)).current
  const buttonScaleAnim = useRef(new Animated.Value(1)).current
  const loadingRotateAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
    ]).start()

    const rotateAnimation = Animated.loop(
      Animated.timing(loadingRotateAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
    )
    if (isLoading) rotateAnimation.start()
    else {
      rotateAnimation.stop()
      loadingRotateAnim.setValue(0)
    }
    return () => rotateAnimation.stop()
  }, [isLoading])

  const handleRegister = async () => {
    const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!nombre || !correo || !contrasena) {
      Alert.alert("Error", "Por favor completa todos los campos obligatorios")
      return
    }
    if (!nameRegex.test(nombre)) {
      Alert.alert("Error", "El nombre solo puede contener letras y espacios")
      return
    }
    if (!emailRegex.test(correo)) {
      Alert.alert("Error", "El correo electrónico no tiene un formato válido")
      return
    }
    if (contrasena.length < 8) {
      Alert.alert("Error", "La contraseña debe tener al menos 8 caracteres")
      return
    }
    const isValidLanguage = GOOGLE_TRANSLATE_LANGUAGES.some((lang) => lang.value === idioma)
    if (!isValidLanguage) {
      Alert.alert("Error", "Por favor selecciona un idioma válido de la lista")
      return
    }

    setIsLoading(true)
    Animated.sequence([
      Animated.timing(buttonScaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(buttonScaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start()

    try {
      await axios.post(`${config.BACKEND_URL_BASE}/usuarios/pre-registro`, {
        nombre,
        correo,
        idioma_preferido: idioma,
        contrasena,
      })
      router.replace({
        pathname: "/(tabs)/auth",
        params: { nombre, correo, idioma, contrasena },
      })
    } catch (err: any) {
      console.error("Error en pre-registro:", err)
      if (err.response?.status === 409) {
        Alert.alert(
          "Email ya registrado",
          "Este correo electrónico ya está registrado. ¿Deseas iniciar sesión en su lugar?",
          [
            { text: "Cancelar", style: "cancel" },
            { text: "Iniciar Sesión", onPress: () => router.replace("/login") },
          ],
        )
      } else if (err.response?.status === 500) {
        Alert.alert("Error del servidor", "Hubo un problema al enviar el código. Intenta nuevamente.")
      } else {
        Alert.alert("Error", err.response?.data?.error || "No se pudo iniciar el registro")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const spin = loadingRotateAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] })

  const renderLanguageItem = (item: Language) => (
    <View style={[styles.dropdownItem, { backgroundColor: theme.secondary }]}>
      <Text style={[styles.dropdownItemText, { color: theme.text }]}>{item.label}</Text>
      <Text style={[styles.dropdownItemCode, { color: theme.text2 }]}>({item.value})</Text>
    </View>
  )

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

      <KeyboardAvoidingView style={styles.keyboardContainer} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
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
              <Text style={[styles.title, { color: theme.primary }]}>Crear Cuenta</Text>
              <Text style={[styles.subtitle, { color: theme.text2 }]}>Únete a nuestra comunidad</Text>
            </View>

            <View style={styles.form}>
              <FloatingLabelInput
                label="Nombre completo"
                iconName="person-outline"
                value={nombre}
                onChangeText={setNombre}
                autoCapitalize="words"
              />
              <FloatingLabelInput
                label="Correo electrónico"
                iconName="mail-outline"
                value={correo}
                onChangeText={setCorreo}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <FloatingLabelDropdown
                label="Idioma preferido"
                iconName="language-outline"
                data={GOOGLE_TRANSLATE_LANGUAGES}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                searchPlaceholder="Buscar idioma..."
                value={idioma}
                onChange={(item: Language) => setIdioma(item.value)}
                renderItem={renderLanguageItem}
                renderRightIcon={() => <Ionicons name="chevron-down" size={20} color={theme.primary} />}
              />

              <FloatingLabelInput label="Contraseña" iconName="lock-closed-outline" value={contrasena} onChangeText={setContrasena} isPassword />

              <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: theme.primary }, isLoading && styles.buttonLoading]}
                  onPress={handleRegister}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <Animated.View style={{ transform: [{ rotate: spin }] }}>
                      <Ionicons name="refresh-outline" size={20} color={theme.white} />
                    </Animated.View>
                  ) : (
                    <Text style={[styles.buttonText, { color: theme.white }]}>Crear Cuenta</Text>
                  )}
                </TouchableOpacity>
              </Animated.View>

              <TouchableOpacity onPress={() => router.push("/login")} style={styles.linkContainer}>
                <Text style={[styles.linkText, { color: theme.text2 }]}>
                  ¿Ya tienes cuenta? <Text style={[styles.linkTextBold, { color: theme.primary }]}>Inicia sesión</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

export default function RegisterScreen() {
  return (
    <AuthGuard reverse={true}>
      <RegisterScreenContent />
    </AuthGuard>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundImage: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  keyboardContainer: { flex: 1 },
  scrollContent: {
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  header: { alignItems: "center", marginBottom: 30 },
  title: { fontSize: 32, fontWeight: "bold", marginBottom: 8 },
  subtitle: { fontSize: 16, textAlign: "center" },
  form: { width: "100%" },
  dropdownItem: {
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dropdownItemText: { fontSize: 16, flex: 1 },
  dropdownItemCode: { fontSize: 14, fontWeight: "500" },
  button: {
    borderRadius: 15,
    paddingVertical: 18,
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  buttonLoading: { opacity: 0.8 },
  buttonText: { fontSize: 18, fontWeight: "bold" },
  linkContainer: { alignItems: "center", marginTop: 10 },
  linkText: { fontSize: 16 },
  linkTextBold: { fontWeight: "bold" },
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
