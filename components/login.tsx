"use client"

import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useEffect, useRef } from "react"
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native"

const { width, height } = Dimensions.get("window")

export const LoginPage = () => {
  const router = useRouter()

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current
  const scaleAnim = useRef(new Animated.Value(0.9)).current
  const buttonScaleAnim1 = useRef(new Animated.Value(1)).current
  const buttonScaleAnim2 = useRef(new Animated.Value(1)).current

  useEffect(() => {
    // Animación de entrada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  const handleLoginPress = () => {
    Animated.sequence([
      Animated.timing(buttonScaleAnim1, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScaleAnim1, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start()
    router.push("/login")
  }

  const handleRegisterPress = () => {
    Animated.sequence([
      Animated.timing(buttonScaleAnim2, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScaleAnim2, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start()
    router.push("/register")
  }

  return (
    <LinearGradient
      colors={["#667eea", "#764ba2", "#f093fb"]}
      style={styles.container}
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
        {/* Logo/Icon */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Ionicons name="person-circle-outline" size={80} color="#fff" />
          </View>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>¡Bienvenido!</Text>
          <Text style={styles.subtitle}>Accede a tu cuenta o crea una nueva para comenzar</Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <Animated.View style={{ transform: [{ scale: buttonScaleAnim1 }] }}>
            <TouchableOpacity
              style={[styles.button, styles.loginButton]}
              onPress={handleLoginPress}
              activeOpacity={0.8}
            >
              <Ionicons name="log-in-outline" size={24} color="#667eea" />
              <Text style={[styles.buttonText, styles.loginButtonText]}>Iniciar Sesión</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ transform: [{ scale: buttonScaleAnim2 }] }}>
            <TouchableOpacity
              style={[styles.button, styles.registerButton]}
              onPress={handleRegisterPress}
              activeOpacity={0.8}
            >
              <Ionicons name="person-add-outline" size={24} color="#fff" />
              <Text style={[styles.buttonText, styles.registerButtonText]}>Crear Cuenta</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Al continuar, aceptas nuestros términos y condiciones</Text>
        </View>
      </Animated.View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  logoContainer: {
    marginBottom: 40,
  },
  logoCircle: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 60,
    padding: 20,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  header: {
    alignItems: "center",
    marginBottom: 50,
  },
  title: {
    fontSize: 36,
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
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: "100%",
    gap: 16,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  loginButton: {
    backgroundColor: "#fff",
  },
  registerButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 12,
  },
  loginButtonText: {
    color: "#667eea",
  },
  registerButtonText: {
    color: "#fff",
  },
  footer: {
    marginTop: 40,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    lineHeight: 18,
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
