"use client"

import { useTheme } from "@/app/theme/themeContext"
import { darkTheme } from "@/constants/theme"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useEffect, useRef } from "react"
import { Animated, Dimensions, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native"

const { width } = Dimensions.get("window")

export const LoginPage = () => {
  const router = useRouter()
  const { theme } = useTheme()

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current
  const scaleAnim = useRef(new Animated.Value(0.9)).current
  const buttonScaleAnim1 = useRef(new Animated.Value(1)).current
  const buttonScaleAnim2 = useRef(new Animated.Value(1)).current
  const avatarScaleAnim = useRef(new Animated.Value(1)).current

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

  const handlePressAnimation = (anim: Animated.Value, callback: () => void) => {
    Animated.sequence([
      Animated.timing(anim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(anim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(callback)
  }

  const backgroundImage =
    theme === darkTheme
      ? require("@/assets/images/back_oscuro.png")
      : require("@/assets/images/back_claro.png")

  return (
    <ImageBackground source={backgroundImage} style={styles.backgroundImage} resizeMode="cover">
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Contenedor centrado */}
      <View style={styles.centeredContainer}>
        {/* Tarjeta principal */}
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
          {/* Logo/Icon */}
          

          {/* Header */}
          <View style={styles.profileHeader}>
                      <Animated.View
                        style={[
                          styles.avatarContainer,
                          {
                            transform: [{ scale: avatarScaleAnim }],
                          },
                        ]}
                      >
                        <View style={[styles.avatarCircle, {backgroundColor:theme.menu_blue}]}>
                          <Ionicons name="person" size={60} color="#fff" />
                        </View>
                      </Animated.View>
        
                    </View>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.primary }]}>¡Bienvenido!</Text>
            <Text style={[styles.subtitle, { color: theme.text2 }]}>
              Accede a tu cuenta o crea una nueva para comenzar
            </Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <Animated.View style={{ transform: [{ scale: buttonScaleAnim1 }] }}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.primary }]}
                onPress={() => handlePressAnimation(buttonScaleAnim1, () => router.push("/login"))}
                activeOpacity={0.8}
              >
                <Ionicons name="log-in-outline" size={24} color={theme.white} />
                <Text style={[styles.buttonText, { color: theme.white }]}>Iniciar Sesión</Text>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View style={{ transform: [{ scale: buttonScaleAnim2 }] }}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.primary }]}
                onPress={() => handlePressAnimation(buttonScaleAnim2, () => router.push("/register"))}
                activeOpacity={0.8}
              >
                <Ionicons name="person-add-outline" size={24} color={theme.white} />
                <Text style={[styles.buttonText, { color: theme.white }]}>Crear Cuenta</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.text2 }]}>
              Al continuar, aceptas nuestros términos y condiciones
            </Text>
          </View>
        </Animated.View>
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  cardContainer: {
    alignSelf: "center",
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
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  logoCircle: {
    borderRadius: 60,
    padding: 20,
    borderWidth: 3,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 10,
  },
  avatarContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 0,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
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
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 12,
  },
  footer: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
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
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
})
