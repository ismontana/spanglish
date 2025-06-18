import config from '@/lib/config';
import { Ionicons } from '@expo/vector-icons';
import Voice from '@react-native-voice/voice';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

const { height, width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [selectedLangTo, setSelectedLangTo] = useState('en'); // Cambiado a 'en' para que el destino sea inglés por defecto si lo deseas
  const [selectedLangFrom, setSelectedLangFrom] = useState('es'); // Cambiado a 'es' para que el origen sea español por defecto

  const router = useRouter();

  const langs = [
    { label: 'Español', value: 'es' },
    { label: 'Inglés', value: 'en' },
    { label: 'Francés', value: 'fr' },
    { label: 'Alemán', value: 'de' },
    { label: 'Italiano', value: 'it' },
    { label: 'Portugués', value: 'pt' },
    { label: 'Japonés', value: 'ja' },
    { label: 'Árabe', value: 'ar' },
    { label: 'Ruso', value: 'ru' },
    { label: 'Coreano', value: 'ko' },
    { label: 'Hindi', value: 'hi' },
  ];

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  // Este useEffect ahora depende de selectedLangFrom para reconfigurar Voice
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
        getTranslationFromBackend(textoNuevo, selectedLangFrom, selectedLangTo);
      }
    };

    Voice.onSpeechError = (e) => {
      if (e.error?.code === 'SpeechRecognitionNotAllowed') {
        Alert.alert(
          'Permiso denegado',
          'Por favor, habilita el reconocimiento de voz en la configuración de tu dispositivo.'
        );
        return;
      }
      if (e.error?.code === 'SpeechRecognitionUnavailable') {
        Alert.alert(
          'Reconocimiento no disponible',
          'El reconocimiento de voz no está disponible en este dispositivo.'
        );
        return; 
      }
      if (e.error?.code == "recognition_failed") {
        Alert.alert(
          'Error de reconocimiento',
          'Hubo un problema al procesar tu voz. Por favor, inténtalo de nuevo.'
        );
        return;
      }
      console.error('onSpeechError chido: ', e.error?.code);
      setError(e.error?.message || 'Error en el reconocimiento de voz');
      setIsListening(false);
    };

    // Al limpiar, también destruimos y removemos los listeners
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, [selectedLangFrom, selectedLangTo]); // Añadir selectedLangFrom y selectedLangTo como dependencias

  const toggleListening = async () => {
    try {
      if (isListening) {
        console.log('Deteniendo micrófono manualmente...');
        await Voice.stop();
      } else {
        console.log(`Iniciando micrófono en idioma: ${selectedLangFrom}...`);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        // ¡Importante! Aquí usamos selectedLangFrom
        await Voice.start(selectedLangFrom); 
      }
    } catch (e) {
      console.error('Error al alternar micrófono: ', e);
      setError((e as Error).message || 'Error al alternar micrófono');
      setIsListening(false);
    }
  };

  const getTranslationFromBackend = async (originalText: string, from: string, to: string) => {
    if (!originalText || originalText.trim() === '') return;

    setIsTranslating(true);
    setError('');

    try {
      const response = await axios.post(config.BACKEND_URL_BASE + '/traduccion/', {
        text: originalText,
        sourceLang: from,
        targetLang: to,
      });
      console.log("mandado: ", originalText, " de ", from, " a ", to);

      if (response.data?.translatedText) {
        setTranslatedText(response.data.translatedText);
        
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

  const _setSelectedLangFrom = (langFrom: string) => {
    setSelectedLangFrom(langFrom);
    console.log('Idioma de origen seleccionado:', langFrom); // Usar langFrom directamente
  };

  const _setSelectedLangTo = (langTo: string) => {
    setSelectedLangTo(langTo);
    console.log('Idioma de destino seleccionado:', langTo); // Usar langTo directamente
  };

  return (
    <View style={styles.container}>
      <ImageBackground
      source={require('@/assets/images/background_claro.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >

      <Pressable style={styles.menuButton} onPress={() => router.push('/menu')}>
        <Ionicons name="menu" size={32} color="black" />
      </Pressable>


      <View style={styles.textDisplayContainer}>

        <View style={styles.containerTextTraduct}>
          <View style={styles.optionsInCard}>
            <Dropdown 
              data={langs}
              value={selectedLangTo}
              onChange={item => _setSelectedLangTo(item.value)}
              style={styles.dropdown}
              labelField="label"
              valueField="value"
              placeholder={selectedLangTo}
              itemContainerStyle={{ borderRadius: 15, backgroundColor: 'rgba(255, 255, 255, 0.5)' }}
              containerStyle={{ width: 150, maxHeight: 250, borderRadius: 10, backgroundColor: 'rgba(255, 255, 255, 1)'}}
            />
            <Pressable style={[styles.option, { borderRadius: 15, backgroundColor: 'rgba(255, 255, 255, 0.5)' }]} onPress={() => {}}>
              <Ionicons name="volume-high" size={24} color="#333" />
            </Pressable>
          </View>
          {isTranslating && <ActivityIndicator size="small" color="#fff" style={{ marginTop: 10 }} />}

          {translatedText && !isTranslating && (
            <>
              <Text style={styles.translatedTextLabel}>Traducido ({selectedLangTo}):</Text>
              <Text style={styles.translatedTextDisplay}>{translatedText}</Text>
            </>
          )}
        </View>

      <View style={styles.containerOptions}>
        <Pressable style={styles.option} onPress={() => {}}>
          <Ionicons name='repeat-outline' size={28} color="#333" />
        </Pressable>
        <Pressable style={styles.micButton} onPress={toggleListening}>
          <Ionicons 
            name={isListening ? "mic-off" : "mic"} 
            size={48} 
            color={isListening ? "red" : "black"} 
          />
        </Pressable>
        <Pressable style={styles.option} onPress={() => {}}>
          <Ionicons name='camera-outline' size={28} color="#333" />
        </Pressable>
        
      </View>
        <View style={styles.linea}></View>
      
      <View style={styles.containerText}>
          <View style={styles.optionsInCard}>
            <Dropdown 
              data={langs}
              value={selectedLangFrom}
              onChange={item => _setSelectedLangFrom(item.value)}
              style={styles.dropdown}
              labelField="label"
              valueField="value"
              placeholder={selectedLangFrom}
              itemContainerStyle={{ borderRadius: 15, backgroundColor: 'rgba(255, 255, 255, 0.5)' }}
              containerStyle={{ width: 150, maxHeight: 250, borderRadius: 10, backgroundColor: 'rgba(255, 255, 255, 1)'}}
            />
            <Pressable style={[styles.option, { borderRadius: 15, backgroundColor: 'rgba(255, 255, 255, 0.5)' }]} onPress={() => {}}>
              <Ionicons name="volume-high" size={24} color="#333" />
            </Pressable>
          </View>
          <Text style={styles.recognizedText}>
            {text || (isListening ? "Escuchando..." : "Presiona el micrófono para hablar")}
          </Text>
      </View>
      </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: 'rgba(28, 28, 28, 0.8)',
  },
  dropdown: { 
    width: 120,
    borderRadius: 15, 
    backgroundColor: 'rgba(255, 255, 255, 0.5)', 
    padding: 10
  },
  optionsInCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  containerOptions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  option: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
  },
  linea: {
    position: 'absolute',
    top: height * 0.37,
    zIndex: -1,
    left: width * 0.1,
    right: width * 0.1,
    width: '80%',
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 20
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerText: {
    width: width * 0.8,
    minHeight: 250,
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(222, 243, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  containerTextTraduct: {
    width: width * 0.8,
    // transform: [{ rotate: '180deg' }],
    minHeight: 250,
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(218, 242, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  micButton: {
    alignSelf: 'center',
    width: 100,
    height: 100,
    margin: 20,
    borderRadius: 50,
    backgroundColor: 'rgb(170, 237, 255)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
    borderColor: 'blue',
  },
  menuButton: {
    position: 'absolute',
    top: 40,
    left: 20,
  },
  textDisplayContainer: { 
    position: 'absolute',
    top: height * 0.1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 40,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    alignItems: 'center',
    paddingHorizontal: 20,
    width: width * 0.9, 
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
    color: 'black',
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