import config from '@/lib/config';
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Button, ActivityIndicator, Alert } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import * as SecureStore from 'expo-secure-store'; // Necesario para guardar los tokens
import { useNavigation } from '@react-navigation/native'; 
import { useRouter } from 'expo-router';
import axios from "axios"
import { getInfoUsuario } from '@/lib/utils';
const WEBSOCKET_URL = `${config.WS_URL}`; // Asegúrate que el puerto coincida con tu servidor

export default function GenerarQR() { // Añadimos prop para cancelar
  

  const onCancel = () => {
       if (ws.current && ws.current.readyState === WebSocket.OPEN) {        
        console.log("estado2 de ws: " , ws.current.readyState);
        ws.current.close();
       }
       router.replace("/menu");
       }
  const router = useRouter()
  const [qrValue, setQrValue] = useState(null);
  const [error, setError] = useState(null);
  const ws = useRef<WebSocket | null>(null);
  const hasProcessedSuccess = useRef(false);
  const usuarioId = getInfoUsuario

    useEffect(() => {
    ws.current = new WebSocket(WEBSOCKET_URL);

    ws.current.onopen = () => {
      console.log('Dispositivo (generador): Conectado al servidor WebSocket.');
      usuarioId
    };

    ws.current.onmessage = async (e) => {
      console.log("oa");
      
      const message = JSON.parse(e.data);

      console.log("este es el valor de la sesion ws: ", message)
      if (message.type === 'session-id') {
        console.log("este es el valor de la sesion ws en el reloj: ", message.sessionId)
        setQrValue(message.sessionId);
      }

      if (message.type === 'jwt-transfer') {

        try {
          await SecureStore.setItemAsync('userToken', message.accessToken);
          await SecureStore.setItemAsync('refreshToken', message.refreshToken);
          
          console.log('¡Dispositivo Generador QR: Tokens de sesión recibidos!');
                    Alert.alert('Éxito', '¡Sesión iniciada correctamente en este dispositivo!', [
                        {
                            text: 'OK',
                            onPress: () => {
                              onCancel();
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
                        console.log("se cerró");                        
                    }
                }
            } else if (message.type === 'auth-error') {
                Alert.alert('Error de Autenticación', message.error || 'No se pudo autorizar la sesión.');
                onCancel();
                if (ws.current && ws.current.readyState === WebSocket.OPEN) {
                    ws.current.close();
                }
            }
        };

    ws.current.onerror = (e) => {
            console.error('WebSocket error:', e);
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
            <Button title="Volver" onPress={() => onCancel()} />
        </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar Sesión con QR</Text>
      <Text style={styles.subtitle}>Escanea este código desde un dispositivo donde ya hayas iniciado sesión.</Text>
      <View style={styles.qrContainer}>
        {qrValue ? (
          <QRCode value={qrValue} size={50} backgroundColor="white" color="black" />
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
    title: { fontSize: 12, fontWeight: 'bold', marginBottom: 3, textAlign: 'center' },
    subtitle: { fontSize: 8, color: '#666', textAlign: 'center', marginBottom:6},
    qrContainer: { width: 60, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', borderRadius: 12, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    info: { fontSize: 8,marginTop: 6, textAlign: 'center', color: '#555' },
    buttonContainer: { marginTop: 1, width:'60%', height: '27%' },
    errorText: { color: 'red', fontSize: 16, marginBottom: 20, textAlign: 'center' }
});
