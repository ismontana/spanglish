"use client"

import { AuthGuard } from "@/components/auth-guard"
import { GOOGLE_TRANSLATE_LANGUAGES, type Language } from "@/constants/languages"
import { useKeyboardAwareScroll } from "@/hooks/useKeyboardAwareScroll"
import config from "@/lib/config"
import { Ionicons } from "@expo/vector-icons"
import axios from "axios"
import { useRouter } from "expo-router"
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
import { Dropdown } from "react-native-element-dropdown"

const { width, height } = Dimensions.get("window")

function RegisterScreenContent() {
  const router = useRouter()
  const { scrollViewRef, registerInput, scrollToInput } = useKeyboardAwareScroll()

  const [nombre, setNombre] = useState("")
  const [correo, setCorreo] = useState("")
  const [idioma, setIdioma] = useState("es")
  const [contrasena, setContrasena] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current
  const scaleAnim = useRef(new Animated.Value(0.9)).current
  const buttonScaleAnim = useRef(new Animated.Value(1)).current
  const loadingRotateAnim = useRef(new Animated.Value(0)).current

  const nameFocusAnim = useRef(new Animated.Value(0)).current
  const emailFocusAnim = useRef(new Animated.Value(0)).current
  const languageFocusAnim = useRef(new Animated.Value(0)).current
  const passwordFocusAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
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

      // Manejar error específico de email duplicado
      if (err.response?.status === 409) {
        Alert.alert(
          "Email ya registrado",
          "Este correo electrónico ya está registrado. ¿Deseas iniciar sesión en su lugar?",
          [
            { text: "Cancelar", style: "cancel" },
            {
              text: "Iniciar Sesión",
              onPress: () => router.replace("/login"),
            },
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

  // Handlers de focus con scroll
  const handleNameFocus = useCallback(() => {
    Animated.timing(nameFocusAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start()
    scrollToInput("name")
  }, [scrollToInput])

  const handleNameBlur = useCallback(() => {
    Animated.timing(nameFocusAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start()
  }, [])

  const handleEmailFocus = useCallback(() => {
    Animated.timing(emailFocusAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start()
    scrollToInput("email")
  }, [scrollToInput])

  const handleEmailBlur = useCallback(() => {
    Animated.timing(emailFocusAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start()
  }, [])

  const handleLanguageFocus = useCallback(() => {
    Animated.timing(languageFocusAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start()
    scrollToInput("language")
  }, [scrollToInput])

  const handleLanguageBlur = useCallback(() => {
    Animated.timing(languageFocusAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start()
  }, [])

  const handlePasswordFocus = useCallback(() => {
    Animated.timing(passwordFocusAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start()
    scrollToInput("password")
  }, [scrollToInput])

  const handlePasswordBlur = useCallback(() => {
    Animated.timing(passwordFocusAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start()
  }, [])

  const spin = loadingRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  })

  const renderLanguageItem = (item: Language) => {
    return (
      <View style={styles.dropdownItem}>
        <Text style={styles.dropdownItemText}>{item.label}</Text>
        <Text style={styles.dropdownItemCode}>({item.value})</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Fondo fijo */}
      <ImageBackground
        source={require("@/assets/images/back_claro.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      {/* Back Button fijo */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.push("/menu")}>
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
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: 100,
            paddingHorizontal: 20,
          }}
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
            <View style={styles.header}>
              <Text style={styles.title}>Crear Cuenta</Text>
              <Text style={styles.subtitle}>Únete a nuestra comunidad</Text>
            </View>

            <View style={styles.form}>
              {/* Nombre */}
              <Animated.View
                style={[
                  styles.inputContainer,
                  {
                    borderColor: nameFocusAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["rgba(0, 100, 200, 0.3)", "rgba(0, 100, 200, 0.6)"],
                    }),
                    borderWidth: nameFocusAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 2],
                    }),
                  },
                ]}
              >
                <Ionicons name="person-outline" size={20} color="rgba(0, 100, 200, 0.8)" />
                <TextInput
                  ref={(ref) => registerInput("name", ref)}
                  style={styles.input}
                  placeholder="Nombre completo"
                  placeholderTextColor="rgba(0, 100, 200, 0.6)"
                  value={nombre}
                  onChangeText={setNombre}
                  onFocus={handleNameFocus}
                  onBlur={handleNameBlur}
                  autoCapitalize="words"
                  blurOnSubmit={false}
                />
              </Animated.View>

              {/* Correo */}
              <Animated.View
                style={[
                  styles.inputContainer,
                  {
                    borderColor: emailFocusAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["rgba(0, 100, 200, 0.3)", "rgba(0, 100, 200, 0.6)"],
                    }),
                    borderWidth: emailFocusAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 2],
                    }),
                  },
                ]}
              >
                <Ionicons name="mail-outline" size={20} color="rgba(0, 100, 200, 0.8)" />
                <TextInput
                  ref={(ref) => registerInput("email", ref)}
                  style={styles.input}
                  placeholder="Correo electrónico"
                  placeholderTextColor="rgba(0, 100, 200, 0.6)"
                  value={correo}
                  onChangeText={setCorreo}
                  onFocus={handleEmailFocus}
                  onBlur={handleEmailBlur}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  blurOnSubmit={false}
                />
              </Animated.View>

              {/* Dropdown de Idioma */}
              <Animated.View
                style={[
                  styles.inputContainer,
                  {
                    borderColor: languageFocusAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["rgba(0, 100, 200, 0.3)", "rgba(0, 100, 200, 0.6)"],
                    }),
                    borderWidth: languageFocusAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 2],
                    }),
                  },
                ]}
              >
                <Ionicons name="language-outline" size={20} color="rgba(0, 100, 200, 0.8)" />
                <View ref={(ref) => registerInput("language", ref as any)} style={styles.dropdown}>
                  <Dropdown
                    style={styles.dropdownStyle}
                    containerStyle={styles.dropdownContainer}
                    data={GOOGLE_TRANSLATE_LANGUAGES}
                    search
                    maxHeight={300}
                    labelField="label"
                    valueField="value"
                    placeholder="Selecciona tu idioma"
                    searchPlaceholder="Buscar idioma..."
                    value={idioma}
                    onFocus={handleLanguageFocus}
                    onBlur={handleLanguageBlur}
                    onChange={(item: Language) => {
                      setIdioma(item.value)
                    }}
                    renderItem={renderLanguageItem}
                    placeholderStyle={styles.dropdownPlaceholder}
                    selectedTextStyle={styles.dropdownSelectedText}
                    inputSearchStyle={styles.dropdownSearchInput}
                    iconStyle={styles.dropdownIcon}
                    renderRightIcon={() => <Ionicons name="chevron-down" size={20} color="rgba(0, 100, 200, 0.8)" />}
                  />
                </View>
              </Animated.View>

              {/* Contraseña */}
              <Animated.View
                style={[
                  styles.inputContainer,
                  {
                    borderColor: passwordFocusAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["rgba(0, 100, 200, 0.3)", "rgba(0, 100, 200, 0.6)"],
                    }),
                    borderWidth: passwordFocusAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 2],
                    }),
                  },
                ]}
              >
                <Ionicons name="lock-closed-outline" size={20} color="rgba(0, 100, 200, 0.8)" />
                <TextInput
                  ref={(ref) => registerInput("password", ref)}
                  style={styles.input}
                  placeholder="Contraseña"
                  placeholderTextColor="rgba(0, 100, 200, 0.6)"
                  value={contrasena}
                  onChangeText={setContrasena}
                  onFocus={handlePasswordFocus}
                  onBlur={handlePasswordBlur}
                  secureTextEntry={!showPassword}
                  blurOnSubmit={false}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="rgba(0, 100, 200, 0.8)"
                  />
                </TouchableOpacity>
              </Animated.View>

              <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
                <TouchableOpacity
                  style={[styles.button, isLoading && styles.buttonLoading]}
                  onPress={handleRegister}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <Animated.View style={{ transform: [{ rotate: spin }] }}>
                      <Ionicons name="refresh-outline" size={20} color="#fff" />
                    </Animated.View>
                  ) : (
                    <Text style={styles.buttonText}>Crear Cuenta</Text>
                  )}
                </TouchableOpacity>
              </Animated.View>

              <TouchableOpacity onPress={() => router.push("/login")} style={styles.linkContainer}>
                <Text style={styles.linkText}>
                  ¿Ya tienes cuenta? <Text style={styles.linkTextBold}>Inicia sesión</Text>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 100,
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
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#0066CC",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(0, 100, 200, 0.8)",
    textAlign: "center",
  },
  form: { width: "100%" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(240, 248, 255, 0.8)",
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(0, 100, 200, 0.3)",
  },
  input: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    color: "#0066CC",
  },
  dropdown: {
    flex: 1,
    marginLeft: 15,
  },
  dropdownStyle: {
    flex: 1,
  },
  dropdownContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dropdownPlaceholder: {
    fontSize: 16,
    color: "rgba(0, 100, 200, 0.6)",
  },
  dropdownSelectedText: {
    fontSize: 16,
    color: "#0066CC",
  },
  dropdownSearchInput: {
    fontSize: 16,
    color: "#333",
    borderColor: "#ddd",
  },
  dropdownIcon: {
    width: 20,
    height: 20,
  },
  dropdownItem: {
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  dropdownItemCode: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  eyeIcon: { padding: 5 },
  button: {
    backgroundColor: "#0066CC",
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
  buttonLoading: {
    backgroundColor: "rgba(0, 102, 204, 0.8)",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  linkContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  linkText: {
    color: "rgba(0, 100, 200, 0.8)",
    fontSize: 16,
  },
  linkTextBold: {
    fontWeight: "bold",
    color: "#0066CC",
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
})
