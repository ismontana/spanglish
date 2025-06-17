import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"

export const LoginPage = () => {
    const router = useRouter()
    
    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.push('/menu')}>
                <Ionicons name="arrow-back" size={32} color="black" />
            </TouchableOpacity>
            <Text style={{ fontSize: 24, marginBottom: 20 }}>Pantalla de Login</Text>
            <TouchableOpacity
                onPress={() => console.log('Login button pressed')}
                style={{
                    backgroundColor: '#007BFF',
                    padding: 10,
                    borderRadius: 5,
                }}
            >
                <Text style={{ color: '#fff', fontSize: 18 }}>Iniciar Sesión</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        paddingTop: 40, 
        paddingHorizontal: 20 
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