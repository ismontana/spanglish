import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';

const { height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['deepskyblue', 'red']}
        style={StyleSheet.absoluteFill}
      />

      <TouchableOpacity style={styles.menuButton} onPress={() => router.push('/menu')}>
        <Ionicons name="menu" size={32} color="black" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.micButton}>
        <Ionicons name="mic" size={48} color="black" />
      </TouchableOpacity>
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