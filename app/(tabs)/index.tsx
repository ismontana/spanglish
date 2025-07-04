import { useTheme } from '@/app/theme/themeContext';
import { GOOGLE_TRANSLATE_LANGUAGES } from '@/constants/languages';
import { darkTheme } from '@/constants/theme';
import config from '@/lib/config';
import { getInfoUsuario } from '@/lib/utils';
import { Ionicons } from '@expo/vector-icons';
import Voice from '@react-native-voice/voice';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, ImageBackground, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
const { height, width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const {theme, toggleTheme} = useTheme()
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [text, setText] = useState('');
  const [isdark, setDarkMode] = useState(false)
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [selectedLangTo, setSelectedLangTo] = useState('en');
  const [selectedLangFrom, setSelectedLangFrom] = useState('es');
  const [usuario_id, setUsuario_id] = useState<number | null>(null);
  
    // Refs para pasar datos dinámicos a los listeners sin causar re-renders.
    const langFromRef = useRef(selectedLangFrom);
    const langToRef = useRef(selectedLangTo);
    const usuarioIdRef = useRef(usuario_id);

    const finalTextRef = useRef<string>('');
    const isSmartwatch = width < 300;
    const isTablet = width > 600;


  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const user = await getInfoUsuario();
        if (user?.id) {
          setUsuario_id(user.id);
          setSelectedLangFrom(user.idioma_preferido || 'es')
        }
        
      } catch (error) {
        console.error('Error al obtener usuario:', error);
      }
    };

    fetchUsuario();
  }, []);

  const router = useRouter();
  
  const saveConversation = async (original: string, translated: string, from: string, to: string) => {
    if (!usuarioIdRef || !original || original.trim() === '' || !translated || translated.trim() === '') {
      console.warn('Faltan datos o están vacíos para guardar la conversación. Saltando:', { usuario_id, original, translated });
      return null;
    }
    try {
      const response = await axios.post(config.BACKEND_URL_BASE + '/conversaciones/add', {
        usuario_id: usuarioIdRef.current,
        texto_original: original,
        texto_traducido: translated,
        idioma_origen: from,
        idioma_destino: to,
      });
      console.log('Conversación guardada:', response.data);
      return response.data;
    } catch (error) {
      console.log('Error al guardar conversación:', error);
      return null;
    }
  };

  useEffect(() => { langFromRef.current = selectedLangFrom; }, [selectedLangFrom]);
  useEffect(() => { langToRef.current = selectedLangTo; }, [selectedLangTo]);
  useEffect(() => { usuarioIdRef.current = usuario_id; }, [usuario_id]);

  useEffect(() => {
        console.log('Registrando listeners de Voice UNA SOLA VEZ.');
        
        Voice.onSpeechStart = () => {
            setIsListening(true);
            console.log('onSpeechStart');
            setError('');
            setText('');
            setTranslatedText('');
    };

    Voice.onSpeechResults = (e) => {
      const finalText = e.value?.[0] ?? '';
      console.log('Resultado parcial:', finalText);
      if (finalText.trim() !== '') {
        setText(finalText);
        finalTextRef.current = finalText;
      }
    };
    
    Voice.onSpeechEnd = async () => {
      const textoFinal = finalTextRef.current.trim();
      if (textoFinal !== '') {
        console.log('Texto final reconocido:', textoFinal);
        await getTranslationFromBackend(textoFinal, langFromRef.current, langToRef.current);
      } else {
        console.log('No se reconoció texto final válido.');
      }
      setIsListening(false);
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
      console.error('codigo de error: ', e.error?.code, "mensaje:", e.error?.message        
      );
      setError(e.error?.message || 'Error en el reconocimiento de voz');
      setIsListening(false);
    };

    return () => {
            console.log('Destruyendo listeners de Voice.');
            Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const toggleListening = async () => {
      if (isListening) {
        try {          
          await Voice.stop();                
        } catch (error) {
          console.error('Error al detener micrófono manualmente:', error);
        }        
      } else {
        try{
        const options = {
                "android.speech.extra.PARTIAL_RESULTS": true,
            };
        console.log(`Iniciando micrófono en idioma: ${selectedLangFrom}...`);  
        setIsListening(true); 
        await Voice.start(selectedLangFrom, Platform.OS === 'android' ? options : undefined);  
      }catch (e) {
      console.error('Error al alternar micrófono: ', e);
      setError((e as Error).message || 'Error al alternar micrófono');
    }
      }
  };

  const getTranslationFromBackend = async (originalText: string, from: string, to: string) => {
    console.log("texto recibido: ", originalText, "mandandose a: ",config.BACKEND_URL_BASE)
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
        const translated = response.data.translatedText;
        setTranslatedText(translated);
        await saveConversation(originalText, translated, from, to);
      } else {
        console.warn('La respuesta de traducción no contiene translatedText.');
        setError('No se pudo obtener la traducción.');
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
    console.log('Idioma de origen seleccionado:', langFrom);
  };

  const _setSelectedLangTo = (langTo: string) => {
    setSelectedLangTo(langTo);
    console.log('Idioma de destino seleccionado:', langTo);
  };

  const toggleLanguage = () => {
    const tempFrom = selectedLangFrom;
    const tempTo = selectedLangTo;
    setSelectedLangFrom(tempTo);
    setSelectedLangTo(tempFrom);

    const tempText = text;
    setText(translatedText);
    setTranslatedText(tempText);

    console.log('Idiomas intercambiados - Origen:', tempTo, 'Destino:', tempFrom);
  };

  const backgroundImage = theme === darkTheme  
    ? require('@/assets/images/back_oscuro.png')  // imagen para modo oscuro
    : require('@/assets/images/back_claro.png');

  return (
    <View style={[styles.container,{backgroundColor: theme.background}]}>
      {isSmartwatch ? (
        <ImageBackground source={backgroundImage}
        style={styles.backgroundImage}
        resizeMode="cover">
          <Pressable style={styles.menuButton} onPress={() => router.push('/menu')}>
            <Ionicons name="menu" size={32} color={isSmartwatch? theme.menuIcon: theme.primary} />
          </Pressable>
          <Pressable style={[styles.micButton, {backgroundColor:theme.primary2}]} onPress={toggleListening}>
              <Ionicons
                name={isListening ? "mic-off" : "mic"}
                size={48}
                color={isListening ? "red" : theme.text}
              />
            </Pressable>
        </ImageBackground>
      ):(
      <ImageBackground
        source={backgroundImage}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <Pressable style={styles.menuButton} onPress={() => router.push('/menu')}>
          <Ionicons name="menu" size={32} color={theme.primary} />
        </Pressable>

        <View style={[styles.textDisplayContainer, {backgroundColor:theme.background}]}>
          <View style={[styles.containerTextTraduct, {backgroundColor:theme.secondary}]}>
            <View style={styles.optionsInCard}>
              <Dropdown
                data={GOOGLE_TRANSLATE_LANGUAGES}
                value={selectedLangTo}
                onChange={item => _setSelectedLangTo(item.value)}
                style={styles.dropdown}
                labelField="label"
                valueField="value"
                placeholder={selectedLangTo}
                itemContainerStyle={{ borderRadius: 15, backgroundColor: 'rgba(255, 255, 255, 1)' }}
                containerStyle={{ width: 150, maxHeight: 250, borderRadius: 10, backgroundColor: 'rgba(255, 255, 255, 1)' }}
              />
              <Pressable style={[styles.option, { borderRadius: 15, backgroundColor: 'rgba(255, 255, 255, 0.5)' }]} onPress={() => { }}>
                <Ionicons name="volume-high" size={24} color="#333" />
              </Pressable>
            </View>
            {isTranslating && <ActivityIndicator size="small" color="#fff" style={{ marginTop: 10 }} />}

            {translatedText && !isTranslating && (
              <>
                <Text style={[styles.translatedTextLabel, isSmartwatch && styles.textDisplayContainer]}>Traducido ({selectedLangTo}):</Text>
                <Text style={styles.translatedTextDisplay}>{translatedText}</Text>
              </>
            )}
          </View>

          <View style={styles.containerOptions}>
            <Pressable style={[styles.option, {backgroundColor: theme.background}]} onPress={() => toggleLanguage()}>
              <Ionicons name='repeat-outline' size={28} color={theme.text} />
            </Pressable>
            <Pressable style={[styles.micButton, {backgroundColor:theme.primary2}]} onPress={toggleListening}>
              <Ionicons
                name={isListening ? "mic-off" : "mic"}
                size={48}
                color={isListening ? "red" : theme.text}
              />
            </Pressable>
            <Pressable
  style={[styles.option, {backgroundColor: theme.background}]}
  onPress={async () => {
    const newValue = !isdark; // Inviertes el valor actual
    setDarkMode(newValue);      // Cambias el estado local
    toggleTheme();              // Cambias el tema visualmente

    try {
      await fetch(`${config.BACKEND_URL_BASE}/ajustes/modificarajuste`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          'usuario_id': 3,
          'modo_oscuro': newValue ? 1 : 0,
        }),
      });
    } catch (error) {
      console.error('Error actualizandoo modo oscuro en backend', error);
    }
  }}
>
  <Ionicons name='sunny-outline' size={28} color={theme.text} />
</Pressable>
          </View>

          <View style={[styles.containerText, {backgroundColor:theme.secondary}]}>
            <View style={styles.optionsInCard}>
              <Dropdown
                data={GOOGLE_TRANSLATE_LANGUAGES}
                value={selectedLangFrom}
                onChange={item => _setSelectedLangFrom(item.value)}
                style={styles.dropdown}
                labelField="label"
                valueField="value"
                placeholder={selectedLangFrom}
                itemContainerStyle={{ borderRadius: 15, backgroundColor: 'rgba(255, 255, 255, 0.5)' }}
                containerStyle={{ width: 150, maxHeight: 250, borderRadius: 10, backgroundColor: 'rgba(255, 255, 255, 1)' }}
              />
              <Pressable style={[styles.option, { borderRadius: 15, backgroundColor: 'rgba(255, 255, 255, 0.5)' }]} onPress={() => { }}>
                <Ionicons name="volume-high" size={24} color="#333" />
              </Pressable>
            </View>
            <Text style={[styles.recognizedText, {color:theme.text2}]}>
              {text || (isListening ? "Escuchando..." : "Presiona el micrófono para hablar")}
            </Text>
          </View>
        </View>
      </ImageBackground>
      )}
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