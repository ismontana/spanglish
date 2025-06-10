import { Ionicons } from '@expo/vector-icons';
import Voice from '@react-native-voice/voice';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, View } from 'react-native';

const { height, width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const router = useRouter();

useEffect(() => {
    Voice.onSpeechResults = e => {
      setText(e.value?.[0] ?? '');
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

    const startListening = async () => {
    try {
      setIsListening(true);
      await Voice.start('es-MX');
    } catch (e) {
      console.error(e);
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

      <Pressable style={styles.micButton}>
        <Ionicons name="mic" size={48} color="black" />
      </Pressable>
        <h1>{text}</h1>
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
});