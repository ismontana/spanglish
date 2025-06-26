"use client"

import { useTheme } from "@/app/theme/themeContext"
import { darkTheme } from "@/constants/theme"
import { Ionicons } from "@expo/vector-icons"
import { Camera, CameraView } from "expo-camera"
import { useRouter } from "expo-router"
import { useEffect, useRef, useState } from "react"
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native"

const { width } = Dimensions.get("window")
const SCANNER_SIZE = width * 0.7

export default function ConfigWatchScreen() {
  const router = useRouter()
  const { theme } = useTheme()
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const animatedValue = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync()
      setHasPermission(status === "granted")
    }
    getCameraPermissions()
  }, [])

  useEffect(() => {
    // Animación de la línea de escaneo
    const scanAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        }),
      ]),
    )
    scanAnimation.start()
    return () => scanAnimation.stop()
  }, [animatedValue])

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    // Aquí irá la lógica para manejar el QR escaneado
    alert(`Código de barras tipo ${type} y dato ${data} ha sido escaneado!`)
    // Por ahora, solo volvemos a la pantalla anterior
    router.back()
  }

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SCANNER_SIZE],
  })

  const backgroundImage =
    theme === darkTheme
      ? require("@/assets/images/back_oscuro.png")
      : require("@/assets/images/back_claro.png")

  if (hasPermission === null) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>Solicitando permiso de cámara...</Text>
      </View>
    )
  }
  if (hasPermission === false) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: theme.text, textAlign: "center", marginBottom: 20 }}>
          No tenemos acceso a la cámara. Por favor, habilítalo en los ajustes.
        </Text>
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={() => router.back()}>
          <Text style={[styles.buttonText, { color: theme.white }]}>Volver</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <CameraView
        onBarcodeScanned={handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Overlay y Marco del Escáner */}
      <View style={styles.overlay}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }} />
        <View style={styles.middleContainer}>
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }} />
          <View style={styles.scannerContainer}>
            <View style={[styles.scannerFrame, { borderColor: theme.primary }]} />
            <Animated.View style={[styles.scanLine, { transform: [{ translateY }] }]} />
          </View>
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }} />
        </View>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }}>
          <Text style={styles.infoText}>Apunta la cámara al código QR del reloj</Text>
        </View>
      </View>

      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
  },
  middleContainer: {
    flexDirection: "row",
    height: SCANNER_SIZE,
  },
  scannerContainer: {
    width: SCANNER_SIZE,
    height: SCANNER_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  scannerFrame: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 4,
    borderRadius: 20,
    borderColor: "#0066CC",
  },
  scanLine: {
    width: "100%",
    height: 2,
    backgroundColor: "#0066CC",
    shadowColor: "#0066CC",
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10,
  },
  infoText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginTop: 30,
    fontWeight: "bold",
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
  button: {
    borderRadius: 15,
    paddingVertical: 18,
    paddingHorizontal: 40,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
})
