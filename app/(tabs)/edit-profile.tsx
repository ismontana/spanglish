"use client"

import { AuthGuard } from "@/components/auth-guard"
import { GOOGLE_TRANSLATE_LANGUAGES, type Language } from "@/constants/languages"
import { useKeyboardAwareScroll } from "@/hooks/useKeyboardAwareScroll"
import config from "@/lib/config"
import { Ionicons } from "@expo/vector-icons"
import axios from "axios"
import { useRouter } from "expo-router"
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
import { Dropdown } from "react-native-element-dropdown"

const { width, height } = Dimensions.get("window")

function EditProfileScreenContent() {
  const router = useRouter()
  const { scrollViewRef, registerInput, scrollToInput } = useKeyboardAwareScroll()

  // Estados para los datos del usuario
  const [nombre, setNombre] = useState("")
  const [idiomaPreferido, setIdiomaPreferido] = useState("es")
  const [contrasenaActual, setContrasenaActual] = useState("")
  const [contrasenaNueva, setContrasenaNueva] = useState("")
  const [confirmarContrasena, setConfirmarContrasena] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current
  const scaleAnim = useRef(new Animated.Value(0.9)).current
  const buttonScaleAnim = useRef(new Animated.Value(1)).current
  const loadingRotateAnim = useRef(new Animated.Value(0)).current
  const backButtonOpacity = useRef(new Animated.Value(1)).current

  const nameFocusAnim = useRef(new Animated.Value(0)).current
  const languageFocusAnim = useRef(new Animated.Value(0)).current
  const currentPasswordFocusAnim = useRef(new Animated.Value(0)).current
  const newPasswordFocusAnim = useRef(new Animated.Value(0)).current
  const confirmPasswordFocusAnim = useRef(new Animated.Value(0)).current

  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    cargarUsuario()
  }, [])

  // Configurar animaciones
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

  // Función para cargar datos del usuario
  async function cargarUsuario() {
    setIsLoading(true)
    try {
      const token = await SecureStore.getItemAsync("userToken")
      if (!token) {
        Alert.alert("Error", "No hay sesión activa")
        router.replace("/login")
        return
      }

      const response = await axios.post(
        `${config.BACKEND_URL_BASE}/usuarios/obtenerusuario`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      const usuario = response.data.usuario
      setNombre(usuario.nombre || "")
      setIdiomaPreferido(usuario.idioma_preferido || "es")
    } catch (error) {
      console.error("Error al cargar usuario:", error)
      Alert.alert("Error", "No se pudo cargar la información del usuario")
    } finally {
      setIsLoading(false)
    }
  }

  // Función para guardar cambios
  async function guardarCambios() {
    if (!nombre.trim()) {
      Alert.alert("Error", "El nombre no puede estar vacío")
      return
    }

    if (/\d/.test(nombre)) {
      Alert.alert("Error", "El nombre no debe contener números")
      return
    }

    // Validar idioma
    const isValidLanguage = GOOGLE_TRANSLATE_LANGUAGES.some((lang) => lang.value === idiomaPreferido)
    if (!isValidLanguage) {
      Alert.alert("Error", "Por favor selecciona un idioma válido de la lista")
      return
    }

    // Validar contraseñas si se quiere cambiar
    if (contrasenaNueva || confirmarContrasena || contrasenaActual) {
      if (!contrasenaActual || !contrasenaNueva || !confirmarContrasena) {
        Alert.alert("Error", "Debes completar todos los campos de contraseña")
        return
      }

      if (contrasenaNueva.length < 8) {
        Alert.alert("Error", "La nueva contraseña debe tener al menos 8 caracteres")
        return
      }

      if (contrasenaNueva !== confirmarContrasena) {
        Alert.alert("Error", "Las nuevas contraseñas no coinciden")
        return
      }
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
      const token = await SecureStore.getItemAsync("userToken")
      if (!token) {
        Alert.alert("Error", "No hay sesión activa")
        router.replace("/login")
        return
      }

      await axios.post(
        `${config.BACKEND_URL_BASE}/usuarios/actualizar`,
        {
          nombre,
          idioma_preferido: idiomaPreferido,
          contrasena_actual: contrasenaActual || undefined,
          contrasena_nueva: contrasenaNueva || undefined,
          confirmar_contrasena: confirmarContrasena || undefined,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      Alert.alert("¡Éxito!", "Perfil actualizado correctamente", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ])
    } catch (error: any) {
      console.error("Error al actualizar perfil:", error)
      Alert.alert("Error", error.response?.data?.error || "No se pudo actualizar el perfil")
    } finally {
      setIsLoading(false)
    }
  }

  const handleScroll = (event: any) => {
    const scrollY = event.nativeEvent.contentOffset.y

    if (scrollY > 50) {
      // Ocultar botón cuando se hace scroll down
      Animated.timing(backButtonOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start()
    } else {
      // Mostrar botón cuando se hace scroll up o está arriba
      Animated.timing(backButtonOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start()
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

  const handleCurrentPasswordFocus = useCallback(() => {
    Animated.timing(currentPasswordFocusAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start()
    scrollToInput("currentPassword")
  }, [scrollToInput])

  const handleCurrentPasswordBlur = useCallback(() => {
    Animated.timing(currentPasswordFocusAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start()
  }, [])

  const handleNewPasswordFocus = useCallback(() => {
    Animated.timing(newPasswordFocusAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start()
    scrollToInput("newPassword")
  }, [scrollToInput])

  const handleNewPasswordBlur = useCallback(() => {
    Animated.timing(newPasswordFocusAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start()
  }, [])

  const handleConfirmPasswordFocus = useCallback(() => {
    Animated.timing(confirmPasswordFocusAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start()
    scrollToInput("confirmPassword")
  }, [scrollToInput])

  const handleConfirmPasswordBlur = useCallback(() => {
    Animated.timing(confirmPasswordFocusAnim, {
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

  // Pantalla de carga inicial
  if (isLoading && !nombre) {
    return (
      <View style={styles.container}>
        <ImageBackground
          source={require("@/assets/images/back_claro.png")}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
        <View style={styles.loadingContainer}>
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Ionicons name="refresh-outline" size={40} color="#fff" />
          </Animated.View>
          <Text style={styles.loadingText}>Cargando perfil...</Text>
        </View>
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

      {/* Back Button con animación y color azul - fijo */}
      <Animated.View
        style={[
          styles.backButton,
          {
            opacity: backButtonOpacity,
          },
        ]}
      >
        <TouchableOpacity style={styles.backButtonTouchable} onPress={() => router.push("/menu")}>
          <Ionicons name="arrow-back" size={24} color="#0066CC" />
        </TouchableOpacity>
      </Animated.View>

      {/* Contenido scrollable */}
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          onScroll={handleScroll}
          scrollEventThrottle={16}
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
              <View style={styles.avatarContainer}>
                <View style={styles.avatarCircle}>
                  <Ionicons name="person" size={50} color="#fff" />
                </View>
              </View>
              <Text style={styles.title}>Editar Perfil</Text>
              <Text style={styles.subtitle}>Actualiza tu información personal</Text>
            </View>

            <View style={styles.form}>
              {/* Nombre */}
              <Text style={styles.sectionTitle}>Información Personal</Text>
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

              {/* Idioma */}
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
                    value={idiomaPreferido}
                    onFocus={handleLanguageFocus}
                    onBlur={handleLanguageBlur}
                    onChange={(item: Language) => {
                      setIdiomaPreferido(item.value)
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

              {/* Cambiar Contraseña */}
              <Text style={styles.sectionTitle}>Cambiar Contraseña (Opcional)</Text>
              <Text style={styles.sectionSubtitle}>Deja en blanco si no quieres cambiar tu contraseña</Text>

              {/* Contraseña Actual */}
              <Animated.View
                style={[
                  styles.inputContainer,
                  {
                    borderColor: currentPasswordFocusAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["rgba(0, 100, 200, 0.3)", "rgba(0, 100, 200, 0.6)"],
                    }),
                    borderWidth: currentPasswordFocusAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 2],
                    }),
                  },
                ]}
              >
                <Ionicons name="lock-closed-outline" size={20} color="rgba(0, 100, 200, 0.8)" />
                <TextInput
                  ref={(ref) => registerInput("currentPassword", ref)}
                  style={styles.input}
                  placeholder="Contraseña actual"
                  placeholderTextColor="rgba(0, 100, 200, 0.6)"
                  value={contrasenaActual}
                  onChangeText={setContrasenaActual}
                  onFocus={handleCurrentPasswordFocus}
                  onBlur={handleCurrentPasswordBlur}
                  secureTextEntry={!showCurrentPassword}
                  blurOnSubmit={false}
                />
                <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)} style={styles.eyeIcon}>
                  <Ionicons
                    name={showCurrentPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="rgba(0, 100, 200, 0.8)"
                  />
                </TouchableOpacity>
              </Animated.View>

              {/* Nueva Contraseña */}
              <Animated.View
                style={[
                  styles.inputContainer,
                  {
                    borderColor: newPasswordFocusAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["rgba(0, 100, 200, 0.3)", "rgba(0, 100, 200, 0.6)"],
                    }),
                    borderWidth: newPasswordFocusAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 2],
                    }),
                  },
                ]}
              >
                <Ionicons name="key-outline" size={20} color="rgba(0, 100, 200, 0.8)" />
                <TextInput
                  ref={(ref) => registerInput("newPassword", ref)}
                  style={styles.input}
                  placeholder="Nueva contraseña"
                  placeholderTextColor="rgba(0, 100, 200, 0.6)"
                  value={contrasenaNueva}
                  onChangeText={setContrasenaNueva}
                  onFocus={handleNewPasswordFocus}
                  onBlur={handleNewPasswordBlur}
                  secureTextEntry={!showNewPassword}
                  blurOnSubmit={false}
                />
                <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)} style={styles.eyeIcon}>
                  <Ionicons
                    name={showNewPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="rgba(0, 100, 200, 0.8)"
                  />
                </TouchableOpacity>
              </Animated.View>

              {/* Confirmar Nueva Contraseña */}
              <Animated.View
                style={[
                  styles.inputContainer,
                  {
                    borderColor: confirmPasswordFocusAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["rgba(0, 100, 200, 0.3)", "rgba(0, 100, 200, 0.6)"],
                    }),
                    borderWidth: confirmPasswordFocusAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 2],
                    }),
                  },
                ]}
              >
                <Ionicons name="checkmark-circle-outline" size={20} color="rgba(0, 100, 200, 0.8)" />
                <TextInput
                  ref={(ref) => registerInput("confirmPassword", ref)}
                  style={styles.input}
                  placeholder="Confirmar nueva contraseña"
                  placeholderTextColor="rgba(0, 100, 200, 0.6)"
                  value={confirmarContrasena}
                  onChangeText={setConfirmarContrasena}
                  onFocus={handleConfirmPasswordFocus}
                  onBlur={handleConfirmPasswordBlur}
                  secureTextEntry={!showConfirmPassword}
                  blurOnSubmit={false}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                  <Ionicons
                    name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="rgba(0, 100, 200, 0.8)"
                  />
                </TouchableOpacity>
              </Animated.View>

              {/* Botón Guardar */}
              <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
                <TouchableOpacity
                  style={[styles.button, isLoading && styles.buttonLoading]}
                  onPress={guardarCambios}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <Animated.View style={{ transform: [{ rotate: spin }] }}>
                      <Ionicons name="refresh-outline" size={20} color="#fff" />
                    </Animated.View>
                  ) : (
                    <>
                      <Ionicons name="save-outline" size={20} color="#fff" />
                      <Text style={styles.buttonText}>Guardar Cambios</Text>
                    </>
                  )}
                </TouchableOpacity>
              </Animated.View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

export default function EditProfileScreen() {
  return (
    <AuthGuard>
      <EditProfileScreenContent />
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
    marginBottom: 30,
  },
  avatarContainer: {
    marginBottom: 20,
  },
  avatarCircle: {
    backgroundColor: "#0066CC",
    borderRadius: 50,
    padding: 20,
    borderWidth: 2,
    borderColor: "rgba(0, 100, 200, 0.3)",
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0066CC",
    marginBottom: 8,
    marginTop: 20,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "rgba(0, 100, 200, 0.7)",
    marginBottom: 15,
    fontStyle: "italic",
  },
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
    justifyContent: "center",
    flexDirection: "row",
    marginBottom: 20,
    marginTop: 20,
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
    marginLeft: 8,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
  },
  backButtonTouchable: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 25,
    padding: 12,
    borderWidth: 2,
    borderColor: "rgba(0, 100, 200, 0.3)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
})
