"use client"

import { useTheme } from "@/app/theme/themeContext"
import { darkTheme } from "@/constants/theme"
import { Ionicons } from "@expo/vector-icons"
import { Camera, CameraView } from "expo-camera"
import { useRouter } from "expo-router"
import { useEffect, useRef, useState } from "react"
import {
    Alert,
    Animated,
    Dimensions,
    ImageBackground,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native"
import * as SecureStore from 'expo-secure-store'; // Necesitamos SecureStore para obtener el token
import config from "@/lib/config"

const WEBSOCKET_URL =`${config.WS_URL}`;

const { width } = Dimensions.get("window")
const CARD_WIDTH = width * 0.9
const SCANNER_SIZE = CARD_WIDTH * 0.7 // Hacer el escaner relativo al tamaño de la tarjeta

export default function ConfigWatchScreen() {
  const router = useRouter()
  const { theme } = useTheme()
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [scanned, setScanned] = useState(false)

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current
  const scanAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // Solicitar permisos de cámara al cargar la pantalla
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync()
      setHasPermission(status === "granted")
    }
    getCameraPermissions()

    // Animaciones de entrada de la tarjeta
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start()

    // Animación de la línea de escaneo
    const scanAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, { toValue: 1, duration: 2500, useNativeDriver: false }),
        Animated.timing(scanAnim, { toValue: 0, duration: 2500, useNativeDriver: false }),
      ]),
    )
    scanAnimation.start()
    return () => scanAnimation.stop()
  }, [])

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned) return
    setScanned(true)
    Alert.alert(
      "QR Escaneado",
      `Se ha detectado un código QR. ¿Deseas vincular este dispositivo?`,
      [
        { text: "Cancelar", onPress: () => setScanned(false), style: "cancel" },
        { text: "Vincular", onPress: () => authorizeDevice(data) },
      ]
    );
  };  

  const authorizeDevice = async (sessionId: string) => {
        try {
            // Obtenemos el refreshToken guardado de forma segura
            const refreshToken = await SecureStore.getItemAsync('refreshToken');

            if (!refreshToken) {
                Alert.alert('Error', 'No se encontró tu sesión. Por favor, inicia sesión de nuevo en este dispositivo.');
                router.back();
                return;
            }
            
            // Conectamos al WebSocket para enviar la autorización
            const transferWs = new WebSocket(WEBSOCKET_URL);

            transferWs.onopen = () => {
                const payload = {
                    type: 'jwt-auth',
                    sessionId: sessionId,
                    refreshToken: refreshToken, // ¡Enviamos el refreshToken!
                };
                transferWs.send(JSON.stringify(payload));
            };

            transferWs.onmessage = (e) => {
                const message = JSON.parse(e.data);
                if (message.type === 'auth-success') {
                    Alert.alert('Éxito', 'El otro dispositivo ha iniciado sesión correctamente.');
                    // Actualizamos el refreshToken en este dispositivo para mantener la sesión activa
                    if (message.newRefreshToken) {
                        SecureStore.setItemAsync('refreshToken', message.newRefreshToken);
                    }
                } else if (message.type === 'auth-error'){
                  console.log(message);
                    Alert.alert('Error', message.error || 'No se pudo autorizar el dispositivo. FF');
                }
                transferWs.close();
                router.back(); // Volvemos a la pantalla anterior
            };

            transferWs.onerror = (e) => {
                Alert.alert('Error de Conexión', 'No se pudo comunicar con el servidor para la autorización.');
                router.back();
            };

        } catch (error) {
            console.error("Error al autorizar:", error);
            Alert.alert('Error', 'Ocurrió un problema al intentar autorizar el dispositivo.');
            router.back();
        }
    };

  const translateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SCANNER_SIZE],
  })

  const backgroundImage =
    theme === darkTheme
      ? require("@/assets/images/back_oscuro.png")
      : require("@/assets/images/back_claro.png")

  // Vistas para el estado de permisos
  if (hasPermission === null) {
    return (
      <View style={[styles.permissionContainer, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>Solicitando permiso de cámara...</Text>
      </View>
    )
  }
  if (hasPermission === false) {
    return (
      <View style={[styles.permissionContainer, { backgroundColor: theme.background }]}>
        <Text style={[styles.permissionText, { color: theme.text }]}>
          No se ha concedido permiso para usar la cámara.
        </Text>
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={() => router.back()}>
          <Text style={[styles.buttonText, { color: theme.white }]}>Volver</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ImageBackground source={backgroundImage} style={styles.backgroundImage} resizeMode="cover" />

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Animated.View
          style={[
            styles.cardContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              backgroundColor: theme.secondary,
            },
          ]}
        >
          {/* Header de la tarjeta */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.primary }]}>Vincular Reloj</Text>
            <Text style={[styles.subtitle, { color: theme.text2 }]}>Escanea el código QR de tu dispositivo</Text>
          </View>

          {/* Contenedor del Escáner */}
          <View style={styles.scannerWrapper}>
            <CameraView
              onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.scannerMarker}>
              <Animated.View style={[styles.scanLine, { transform: [{ translateY }] }]} />
            </View>
          </View>

          {/* Instrucciones */}
          <View style={styles.instructionsContainer}>
            <Ionicons name="help-circle-outline" size={24} color={theme.primary} />
            <Text style={[styles.instructionsText, { color: theme.text }]}>
              Asegúrate de que el código QR esté bien iluminado y centrado en el recuadro para una correcta lectura.
            </Text>
          </View>

        </Animated.View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
    paddingHorizontal: 20,
  },
  cardContainer: {
    width: CARD_WIDTH,
    borderRadius: 30,
    padding: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
    textAlign: "center",
  },
  scannerWrapper: {
    width: SCANNER_SIZE,
    height: SCANNER_SIZE,
    borderRadius: 20,
    overflow: "hidden", // Muy importante para que la cámara no se salga del recuadro
    position: "relative",
    backgroundColor: "#000",
  },
  scannerMarker: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 20,
  },
  scanLine: {
    width: "100%",
    height: 3,
    backgroundColor: 'white',
    shadowColor: "white",
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
  },
  instructionsContainer: {
    marginTop: 30,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  instructionsText: {
    flex: 1,
    fontSize: 14,
    textAlign: 'left',
    lineHeight: 20,
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
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  permissionText: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
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
