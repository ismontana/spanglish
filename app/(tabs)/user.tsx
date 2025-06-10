import { getInfoUsuario } from '@/lib/utils';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function UserPage() {
  const router = useRouter();
  type Usuario = { nombre: string; [key: string]: any };
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    const fetchUsuario = async () => {
        const user = await getInfoUsuario();
        setUsuario(user);
    };

    fetchUsuario();
    }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.push('/menu')}>
        <Ionicons name="arrow-back" size={32} color="black" />
      </TouchableOpacity>
      <Text style={styles.text}>
        {usuario ? `Usuario: ${usuario.nombre}` : 'Cargando usuario...'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40, paddingHorizontal: 20 },
  text: { fontSize: 24, textAlign: 'center' },
  backButton: { marginBottom: 20 },
});