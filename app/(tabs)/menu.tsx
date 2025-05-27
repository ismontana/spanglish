import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function MenuScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={32} color="black" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.option} onPress={() => router.push('/ajustes')}>
        <Ionicons name="settings-outline" size={32} color="black" />
        <Text style={styles.optionText}>Ajustes</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.option} onPress={() => router.push('/historial')}>
        <Ionicons name="bookmark-outline" size={32} color="black" />
        <Text style={styles.optionText}>Historial</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.option} onPress={() => router.push('/acerca')}>
        <Ionicons name="help-circle-outline" size={32} color="black" />
        <Text style={styles.optionText}>Acerca de</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 20,
    backgroundColor: 'white',
  },
  backButton: {
    marginBottom: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  optionText: {
    fontSize: 20,
    marginLeft: 12,
  },
});