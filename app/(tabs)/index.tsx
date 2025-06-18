import { Ionicons } from '@expo/vector-icons';
import Voice from '@react-native-voice/voice';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, View, Text, Alert, ActivityIndicator } from 'react-native';
import { getInfoUsuario } from '@/lib/utils';

const { height, width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {

    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechResults = e => {
      console.log('onSpeechResults: ', e);
      setText(e.value?.[0] ?? '');
      const textoNuevo = e.value?.[0] ?? '';
      if (textoNuevo.trim() !== '') { 
      getTranslationFromBackend(textoNuevo);
    }
      
    };
    Voice.onSpeechError = e => {
      console.error('onSpeechError: ', e.error);
      setError(JSON.stringify(e.error));
      setIsListening(false);
    };


    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const onSpeechStart = (e: any) => {
    console.log('onSpeechStart: ', e);
    setIsListening(true);
    setError('');
    setText('');
    setTranslatedText('');
    setIsTranslating(false);
  };

  const getTranslationFromBackend = async (originalText: string) => {
    if (!originalText || originalText.trim() === '') {
      console.log('No hay texto original para traducir.');
      return;
    }
    setIsTranslating(true);
    setError('');
    console.log('este es el nuevo texto: ', originalText);

    try {      
      const response = await axios.post('http://10.0.2.2:4000/traduccion/traducir', { 
        text: originalText,
        sourceLang: 'es', 
        targetLang: 'en', 
      });

      if (response.data && response.data.translatedText) {
        setTranslatedText(response.data.translatedText);
      } else {
        throw new Error('Respuesta inesperada del servidor de traducción.');
      }
    } catch (err: any) { 
      console.error('Error al obtener traducción del backend:', err);
      setError('Error al traducir: ' + (axios.isAxiosError(err) && err.response ? JSON.stringify(err.response.data) : err.message));
      setTranslatedText(''); 
    } finally {
      setIsTranslating(false);
    }
  };

  const onSpeechEnd = (e: any) => {
    console.log('onSpeechEnd de aquiiii: ', e);
    setIsListening(false);
    console.log('trim', text);    
  };

  const startListening = async () => {
    try {
      await Voice.start('es-MX');
    } catch (e) {
      console.error('Error al llamar a Voice.start: ', e as Error); 
      setError(JSON.stringify((e as Error).message || e)); 
      setIsListening(false);
    }
  };

  const backTest = async () => {
    const textoPrueba = 'Si funciona esta cosa'
    setText(textoPrueba);
    setIsListening(false);
    setTranslatedText('');
    setError('');
    await getTranslationFromBackend(textoPrueba);
  
  }

  return (
    <View style={styles.container}>

      <LinearGradient
        colors={['deepskyblue', 'red']}
        style={StyleSheet.absoluteFill}
      />

      <Pressable style={styles.menuButton} onPress={() => router.push('/menu')}>
        <Ionicons name="menu" size={32} color="black" />
      </Pressable>
      <Pressable style={styles.micButton} onPress={startListening}>
        <Ionicons name="mic" size={48} color="black" />
      </Pressable>
      <View style={styles.textDisplayContainer}>
        <Text style={styles.recognizedTextTitle}>Detectado (ES):</Text>
        <Text style={styles.recognizedText}>
          {text || (isListening ? "Escuchando..." : "Presiona el micrófono para hablar")}
        </Text>
        {isTranslating && <ActivityIndicator size="small" color="#fff" style={{ marginTop: 10 }} />}
        {translatedText && !isTranslating && (
          <Text style={styles.translatedTextLabel}>Traducido (EN):</Text>
        )}
        {translatedText && !isTranslating && <Text style={styles.translatedTextDisplay}>{translatedText}</Text>}
        {error ? <Text style={styles.errorText}>Error: {error}</Text> : null}
      </View>      
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
    color: 'white',
    alignSelf: 'flex-start', 
  },
  recognizedText: { fontSize: 24, color: 'white', textAlign: 'center', marginTop: 10, minHeight: 60 },
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
    minHeight: 60
  },
  errorText: {
    color: 'yellow', 
    marginTop: 10,
    textAlign: 'center',
  },
}); 