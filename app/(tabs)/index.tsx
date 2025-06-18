import config from '@/lib/config';
import { Ionicons } from '@expo/vector-icons';
import Voice from '@react-native-voice/voice';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';

const { height, width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  useEffect(() => {
    Voice.onSpeechStart = () => {
      console.log('onSpeechStart');
      setIsListening(true);
      setError('');
      setText('');
      setTranslatedText('');
      setIsTranslating(false);
    };

    Voice.onSpeechEnd = () => {
      console.log('onSpeechEnd');
      setIsListening(false);
    };

    Voice.onSpeechResults = (e) => {
      console.log('onSpeechResults: ', e);
      const textoNuevo = e.value?.[0] ?? '';
      setText(textoNuevo);
      if (textoNuevo.trim() !== '') {
        getTranslationFromBackend(textoNuevo);
      }
    };

    Voice.onSpeechError = (e) => {
      console.error('onSpeechError: ', e.error);
      setError(e.error?.message || 'Error en el reconocimiento de voz');
      setIsListening(false);
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const toggleListening = async () => {
    try {
      if (isListening) {
        console.log('Deteniendo micrófono manualmente...');
        await Voice.stop();
      } else {
        console.log('Iniciando micrófono...');
        // Limpiar timeout previo si existe
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        await Voice.start('es-MX');
      }
    } catch (e) {
      console.error('Error al alternar micrófono: ', e);
      setError((e as Error).message || 'Error al alternar micrófono');
      setIsListening(false);
    }
  };

  const getTranslationFromBackend = async (originalText: string) => {
    if (!originalText || originalText.trim() === '') return;

    setIsTranslating(true);
    setError('');

    try {
      const response = await axios.post(config.BACKEND_URL_BASE + '/traduccion/', {
        text: originalText,
        sourceLang: 'es',
        targetLang: 'en',
      });

      if (response.data?.translatedText) {
        setTranslatedText(response.data.translatedText);
        
        // Configurar timeout para detener el micrófono después de 2 segundos
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        
        timeoutRef.current = setTimeout(async () => {
          if (isListening) {
            try {
              await Voice.stop();
              console.log('Micrófono detenido automáticamente después de traducción');
            } catch (e) {
              console.error('Error al detener micrófono automáticamente:', e);
            }
          }
        }, 2000);
      }
    } catch (err) {
      console.error('Error al traducir:', err);
      setError('Error al traducir: ' + (err as Error).message);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['deepskyblue', 'red']}
        style={StyleSheet.absoluteFill}
      />

      <Pressable style={styles.menuButton} onPress={() => router.push('/menu')}>
        <Ionicons name="menu" size={32} color="black" />
      </Pressable>

      <Pressable style={styles.micButton} onPress={toggleListening}>
        <Ionicons 
          name={isListening ? "mic-off" : "mic"} 
          size={48} 
          color={isListening ? "red" : "black"} 
        />
      </Pressable>

      <View style={styles.textDisplayContainer}>
        <Text style={styles.recognizedTextTitle}>Detectado (ES):</Text>
        <Text style={styles.recognizedText}>
          {text || (isListening ? "Escuchando..." : "Presiona el micrófono para hablar")}
        </Text>

        {isTranslating && <ActivityIndicator size="small" color="#fff" style={{ marginTop: 10 }} />}

        {translatedText && !isTranslating && (
          <>
            <Text style={styles.translatedTextLabel}>Traducido (EN):</Text>
            <Text style={styles.translatedTextDisplay}>{translatedText}</Text>
          </>
        )}

        {error ? <Text style={styles.errorText}>Error: {error}</Text> : null}
      </View>
    </View>
  );
}

// ... (los estilos se mantienen igual)
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  micButton: {
    position: 'absolute',
    top: height / 2 - 50,
    alignSelf: 'center',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'lightgray',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'gray',
  },
  menuButton: {
    position: 'absolute',
    top: 40,
    left: 20,
  },
  textDisplayContainer: { 
    position: 'absolute',
    top: height * 0.2,
    alignItems: 'center',
    paddingHorizontal: 20,
    width: width * 0.8, 
  },
  recognizedTextTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    alignSelf: 'flex-start', 
  },
  recognizedText: { 
    fontSize: 24, 
    textAlign: 'center', 
    marginTop: 10, 
    minHeight: 60 
  },
  translatedTextLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'lightgreen',
    marginTop: 20,
    alignSelf: 'flex-start',
  },
  translatedTextDisplay: { 
    fontSize: 24,
    color: 'black', 
    textAlign: 'center',
    marginTop: 10,
    minHeight: 60,
    padding: 10,
    borderRadius: 10,
  },
  errorText: {
    color: 'yellow', 
    marginTop: 10,
    textAlign: 'center',
  },
});