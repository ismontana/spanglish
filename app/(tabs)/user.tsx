import { LoginPage } from '@/components/login';
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

    if (!usuario || Object.keys(usuario).length === 0) {
        return (
            <LoginPage />
        );
    }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.push('/menu')}>
        <Ionicons name="arrow-back" size={32} color="black" />
      </TouchableOpacity>
      <View style={{ alignItems: 'center', marginBottom: 20 }}>
        <Ionicons name="person-circle-outline" size={100} color="black" />
      </View>
      <Text style={styles.text}>
        {usuario ? `${usuario.nombre}` : 'Cargando usuario...'}
      </Text>
      <Text style={styles.emailText}>
        {usuario ? usuario.correo || 'Email no disponible' : 'Cargando email...'}
      </Text>
      <TouchableOpacity onPress={() => {}} style={styles.button}>
        <Ionicons name="person-outline" size={24} color="black" />
        <Text style={styles.optionText}>
            Editar perfil
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => {}} style={styles.button}>
        <Ionicons name="watch-outline" size={24} color="black" />
        <Text style={styles.optionText}>
            Configurar reloj
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => {}} style={styles.buttonLogOut}>
        <Ionicons name="log-out-outline" size={24} color="black" />
        <Text style={styles.optionText}>
            Cerrar sesión
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        paddingTop: 40, 
        paddingHorizontal: 20 
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 15,
      backgroundColor: '#dee3f9',
      borderRadius: 8,
      marginVertical: 5
    },
    optionText: {
      fontSize: 16,
      marginLeft: 12,
    },
    buttonLogOut: {
        flexDirection: 'row',
      alignItems: 'center',
      padding: 15,
      backgroundColor: '#d4563b',
      borderRadius: 8,
      marginVertical: 5
    },
    emailText: {
        fontSize: 15,
        color: '#666',
        textAlign: 'center',
        marginVertical: 10
    },
    text: { 
        fontSize: 26,
        fontWeight: 'bold',
        textAlign: 'center' 
    },
    backButton: { 
        marginBottom: 20
    },
});