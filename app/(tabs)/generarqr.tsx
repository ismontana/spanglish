import config from '@/lib/config';
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Button, ActivityIndicator, Alert } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import * as SecureStore from 'expo-secure-store'; // Necesario para guardar los tokens
import { useNavigation } from '@react-navigation/native'; 
import { useRouter } from 'expo-router';
// Asumo que tienes un contexto de autenticación para manejar el login
// import { useAuth } from '../context/AuthContext'; 

// ¡IMPORTANTE! Usa la IP de tu máquina, no 'localhost'
const WEBSOCKET_URL = `${config.WS_URL}`; // Asegúrate que el puerto coincida con tu servidor

export default function GenerarQR({ onCancel }: { onCancel: () => void }) { // Añadimos prop para cancelar
  const router = useRouter()
  const [qrValue, setQrValue] = useState(null);
  const [error, setError] = useState(null);
  const ws = useRef<WebSocket | null>(null);
  const hasProcessedSuccess = useRef(false);
  const navigation = useNavigation();
  // const auth = useAuth(); // Ejemplo de cómo usarías tu contexto

    useEffect(() => {
    ws.current = new WebSocket(WEBSOCKET_URL);

    ws.current.onopen = () => {
      console.log('Dispositivo (generador): Conectado al servidor WebSocket.');
      setError(null);
    };

    ws.current.onmessage = async (e) => {
      const message = JSON.parse(e.data);
      
      if (message.type === 'session-id') {
        setQrValue(message.sessionId);
      }

      else if (message.type === 'jwt-transfer') {

        try {
          await SecureStore.setItemAsync('userToken', message.accessToken);
          await SecureStore.setItemAsync('refreshToken', message.refreshToken);
          
          console.log('¡Dispositivo Generador QR: Tokens de sesión recibidos!');
                    Alert.alert('Éxito', '¡Sesión iniciada correctamente en este dispositivo!', [
                        {
                            text: 'OK',
                            onPress: () => {
                                // Cierra el WebSocket una vez que los tokens se han guardado
                                // Y el usuario ha presionado OK, justo antes de la navegación.
                                if (ws.current && ws.current.readyState === WebSocket.OPEN) {
                                    ws.current.close();
                                }
                                router.replace("/user"); // Navega a la ruta de usuario
                            }
                        }
                    ]);

                } catch (storeError) {
                    console.error('Error al guardar tokens en SecureStore:', storeError);
                    Alert.alert('Error de Almacenamiento', 'No se pudieron guardar los datos de sesión de forma segura.');
                    console.error('Error al guardar datos de sesión.');
                    hasProcessedSuccess.current = false; // Permite reintentar si el error es grave
                    onCancel(); // Vuelve atrás si falla el almacenamiento
                    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
                        ws.current.close();
                    }
                }
            } else if (message.type === 'auth-error') {
                Alert.alert('Error de Autenticación', message.error || 'No se pudo autorizar la sesión.');
                onCancel();
                if (ws.current && ws.current.readyState === WebSocket.OPEN) {
                    ws.current.close();
                }
            }
            // El mensaje 'session-transferred' si viene del backend al generador QR, 
            // ya no es necesario manejarlo aquí si jwt-transfer ya maneja el éxito.
            // if (message.type === 'session-transferred') { ... } 
        };

    ws.current.onerror = (e) => {
            console.error('WebSocket error:', e);
            // Ignoramos el error 1005 que es un código de cierre y no un error de conexión
            if ((e as any).message && (e as any).message.includes("Code 1005 is reserved")) {
                console.warn("Error 1005 capturado, probablemente un cierre de conexión esperado.");
            } else {
                console.error('No se pudo conectar con el servidor. Inténtalo de nuevo.');
                Alert.alert('Error de Conexión', 'No se pudo conectar con el servidor. Inténtalo de nuevo.');
            }
        };

    ws.current.onclose = () => {
      console.log('Dispositivo (generador): Desconectado del servidor WebSocket.');
    };

    // Limpieza al desmontar el componente
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  if (error) {
    return (
        <View style={styles.container}>
            <Text style={styles.errorText}>{error}</Text>
            <Button title="Volver" onPress={onCancel} />
        </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar Sesión con QR</Text>
      <Text style={styles.subtitle}>Escanea este código desde un dispositivo donde ya hayas iniciado sesión.</Text>
      <View style={styles.qrContainer}>
        {qrValue ? (
          <QRCode value={qrValue} size={250} backgroundColor="white" color="black" />
        ) : (
          <ActivityIndicator size="large" color="#0077cc" />
        )}
      </View>
      <Text style={styles.info}>Este código es de un solo uso y expira en 2 minutos.</Text>
      <View style={styles.buttonContainer}>
        <Button title="Cancelar" onPress={onCancel} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: '#f5f5f5' },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
    subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 30 },
    qrContainer: { width: 280, height: 280, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', borderRadius: 12, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    info: { marginTop: 30, textAlign: 'center', color: '#555' },
    buttonContainer: { marginTop: 20, width: '60%' },
    errorText: { color: 'red', fontSize: 16, marginBottom: 20, textAlign: 'center' }
});
