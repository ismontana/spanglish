import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Acerca() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.push('/menu')}>
        <Ionicons name="arrow-back" size={32} color="black" />
      </TouchableOpacity>
      <Text style={styles.text}>Pantalla Acerca de</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40, paddingHorizontal: 20 },
  text: { fontSize: 24, textAlign: 'center' },
  backButton: { marginBottom: 20 },
});