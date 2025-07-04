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

function EditProfileScreenContent() {
  const router = useRouter()
  const { theme } = useTheme()

  const [nombre, setNombre] = useState("")
  const [idiomaPreferido, setIdiomaPreferido] = useState("es")
  const [contrasenaActual, setContrasenaActual] = useState("")
  const [contrasenaNueva, setContrasenaNueva] = useState("")
  const [confirmarContrasena, setConfirmarContrasena] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current
  const scaleAnim = useRef(new Animated.Value(0.9)).current
  const buttonScaleAnim = useRef(new Animated.Value(1)).current
  const loadingRotateAnim = useRef(new Animated.Value(0)).current
  const backButtonOpacity = useRef(new Animated.Value(1)).current

  useEffect(() => {
    cargarUsuario()
  }, [])

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

  async function cargarUsuario() {
    setIsLoading(true)
    try {
      const token = await SecureStore.getItemAsync("userToken")
      if (!token) {
        router.replace("/login")
        return
      }
      const response = await axios.post(
        `${config.BACKEND_URL_BASE}/usuarios/obtenerusuario`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
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

  async function guardarCambios() {
    if (!nombre.trim() || /\d/.test(nombre)) {
      Alert.alert("Error", "El nombre no puede estar vacío y no debe contener números")
      return
    }
    if (!GOOGLE_TRANSLATE_LANGUAGES.some((lang) => lang.value === idiomaPreferido)) {
      Alert.alert("Error", "Por favor selecciona un idioma válido de la lista")
      return
    }
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
    Animated.sequence([
      Animated.timing(buttonScaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(buttonScaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start()

    try {
      const token = await SecureStore.getItemAsync("userToken")
      if (!token) {
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
        { headers: { Authorization: `Bearer ${token}` } },
      )
      Alert.alert("¡Éxito!", "Perfil actualizado correctamente", [{ text: "OK", onPress: () => router.back() }])
    } catch (error: any) {
      console.error("Error al actualizar perfil:", error)
      Alert.alert("Error", error.response?.data?.error || "No se pudo actualizar el perfil")
    } finally {
      setIsLoading(false)
    }
  }

  const handleScroll = (event: any) => {
    const scrollY = event.nativeEvent.contentOffset.y
    Animated.timing(backButtonOpacity, {
      toValue: scrollY > 50 ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start()
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

  if (isLoading && !nombre) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ImageBackground source={backgroundImage} style={styles.backgroundImage} resizeMode="cover" />
        <View style={styles.loadingContainer}>
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Ionicons name="refresh-outline" size={40} color={theme.white} />
          </Animated.View>
          <Text style={[styles.loadingText, { color: theme.white }]}>Cargando perfil...</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ImageBackground source={backgroundImage} style={styles.backgroundImage} resizeMode="cover" />

      <Animated.View style={[styles.backButton, { opacity: backButtonOpacity }]}>
        <TouchableOpacity
          style={[styles.backButtonTouchable, { backgroundColor: theme.secondary, borderColor: theme.primary }]}
          onPress={() => router.push("/menu")}
        >
          <Ionicons name="arrow-back" size={24} color={theme.primary} />
        </TouchableOpacity>
      </Animated.View>

      <KeyboardAvoidingView style={styles.keyboardContainer} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          onScroll={handleScroll}
          scrollEventThrottle={16}
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
              <View style={[styles.avatarCircle, { backgroundColor: theme.primary }]}>
                <Ionicons name="person" size={50} color={theme.white} />
              </View>
              <Text style={[styles.title, { color: theme.primary }]}>Editar Perfil</Text>
              <Text style={[styles.subtitle, { color: theme.text2 }]}>Actualiza tu información personal</Text>
            </View>

            <View style={styles.form}>
              <Text style={[styles.sectionTitle, { color: theme.primary }]}>Información Personal</Text>
              <FloatingLabelInput label="Nombre completo" iconName="person-outline" value={nombre} onChangeText={setNombre} autoCapitalize="words" />

              <FloatingLabelDropdown
                label="Idioma preferido"
                iconName="language-outline"
                data={GOOGLE_TRANSLATE_LANGUAGES}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                value={idiomaPreferido}
                onChange={(item: Language) => setIdiomaPreferido(item.value)}
                renderItem={renderLanguageItem}
                renderRightIcon={() => <Ionicons name="chevron-down" size={20} color={theme.primary} />}
              />

              <Text style={[styles.sectionTitle, { color: theme.primary }]}>Cambiar Contraseña (Opcional)</Text>
              <Text style={[styles.sectionSubtitle, { color: theme.text2 }]}>
                Deja en blanco si no quieres cambiar tu contraseña
              </Text>

              <FloatingLabelInput
                label="Contraseña actual"
                iconName="lock-closed-outline"
                value={contrasenaActual}
                onChangeText={setContrasenaActual}
                isPassword
              />
              <FloatingLabelInput
                label="Nueva contraseña"
                iconName="key-outline"
                value={contrasenaNueva}
                onChangeText={setContrasenaNueva}
                isPassword
              />
              <FloatingLabelInput
                label="Confirmar nueva contraseña"
                iconName="checkmark-circle-outline"
                value={confirmarContrasena}
                onChangeText={setConfirmarContrasena}
                isPassword
              />

              <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: theme.primary }, isLoading && styles.buttonLoading]}
                  onPress={guardarCambios}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <Animated.View style={{ transform: [{ rotate: spin }] }}>
                      <Ionicons name="refresh-outline" size={20} color={theme.white} />
                    </Animated.View>
                  ) : (
                    <>
                      <Ionicons name="save-outline" size={20} color={theme.white} />
                      <Text style={[styles.buttonText, { color: theme.white }]}>Guardar Cambios</Text>
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
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { fontSize: 16, marginTop: 20 },
  header: { alignItems: "center", marginBottom: 20 },
  avatarCircle: {
    borderRadius: 50,
    padding: 20,
    borderWidth: 2,
    borderColor: "rgba(0, 100, 200, 0.3)",
    marginBottom: 20,
  },
  title: { fontSize: 32, fontWeight: "bold", marginBottom: 8 },
  subtitle: { fontSize: 16, textAlign: "center" },
  form: { width: "100%" },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 8, marginTop: 10 },
  sectionSubtitle: { fontSize: 14, marginBottom: 15, fontStyle: "italic" },
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
  buttonLoading: { opacity: 0.8 },
  buttonText: { fontSize: 18, fontWeight: "bold", marginLeft: 8 },
  backButton: { position: "absolute", top: 50, left: 20, zIndex: 10 },
  backButtonTouchable: {
    borderRadius: 25,
    padding: 12,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
})
