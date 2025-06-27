"use client"
import { useTheme } from '@/app/theme/themeContext';
import { darkTheme } from '@/constants/theme';
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useRef } from "react";
import { Animated, Dimensions, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const { width, height } = Dimensions.get("window")
const isSmartwatch = width < 300;
  const isTablet = width > 600;
export default function MenuScreen() {
   
  const {theme, toggleTheme} = useTheme()
  const router = useRouter()
      
  const MenuOption = ({
    icon,
    title,
    onPress,
    color,

  }: {
    icon: string
    title: string
    onPress: () => void
    color?: string

  }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current

    const handlePress = () => {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start()
      onPress()
    }
   ;

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity style={[styles.option, { backgroundColor: theme.menu_blue }]} onPress={handlePress}>
          <View style={styles.optionContent}>
            <View style={styles.iconContainer}>
              <Ionicons name={icon as any} size={24} color="#fff" />
            </View>
            <Text style={[styles.optionText, {color: theme.white}]}>{title}</Text>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </View>
        </TouchableOpacity>
      </Animated.View>
    )
  }
  const backgroundImage = theme === darkTheme  
        ? require('@/assets/images/back_oscuro.png')  // imagen para modo oscuro
        : require('@/assets/images/back_claro.png')
        
  return (
    <View style={[styles.container,{backgroundColor: theme.background}]}>
    { isSmartwatch ?(
    <ImageBackground
      source={backgroundImage}
      style={styles.backgroundImage}
      resizeMode="cover"
      >
      <TouchableOpacity style={styles.backButton} onPress={() => router.push("/")}>
      <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
      
      {/* Contenedor centrado */}
      <View style={styles.centeredContainer}>
      {/* Tarjeta principal */}
        <View style={[styles.cardContainer,{backgroundColor:theme.background}]}>
          <View style={styles.optionsContainer}>

          <MenuOption
              icon="qr-code-outline"
              title="GenerarQR"
              onPress={() => router.push("/(tabs)/generarqr")}
              />

          <MenuOption
              icon="settings-outline"
              title="Ajustes"
              onPress={() => router.push("/ajustes")}
              color="#0066CC"
              />

          </View>
        </View>
      </View>
      
      </ImageBackground>
    ):(

      
      <ImageBackground
      source={backgroundImage}
      style={styles.backgroundImage}
      resizeMode="cover"
      >
      <TouchableOpacity style={styles.backButton} onPress={() => router.push("/")}>
      <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
      
      {/* Contenedor centrado */}
      <View style={styles.centeredContainer}>
      {/* Tarjeta principal */}
      <View style={[styles.cardContainer,{backgroundColor:theme.background}]}>
      <View style={styles.header}>
            <Text style={[styles.title,{color:theme.white_blue}]}>Menú Principal</Text>
            <Text style={[styles.subtitle, {color:theme.white_blue}]}>Selecciona una opción</Text>
          </View>

<View style={styles.optionsContainer}>
            <MenuOption
              icon="settings-outline"
              title="Ajustes"
              onPress={() => router.push("/ajustes")}
              color="#0066CC"
              />

            <MenuOption
              icon="bookmark-outline"
              title="Historial"
              onPress={() => router.push("/historial")}
              color="#0066CC"
              />

            <MenuOption icon="person-outline" title="Mi perfil" onPress={() => router.push("/user")} color="#0066CC" />
          </View>
        </View>
        </View>
      
      </ImageBackground>
    )
  }
   </View>
  )
}


const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  cardContainer: {
    width: width * 0.9,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 30,
    padding: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 2,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 25,
    padding: 12,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#0066CC",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(0, 100, 200, 0.8)",
    textAlign: "center",
  },
  menu_element:{
    width:50,
    height:50,
    backgroundColor: "#111"
  },
  optionsContainer: {
    gap: 15,
  },
  option: {
    borderRadius: 15,
    height: isSmartwatch? 50 : 100,
    marginBottom: isSmartwatch? 0:8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
    justifyContent: "center"
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    padding:isSmartwatch? 1: 20,
  },
  iconContainer: {
    width:isSmartwatch? 30: 50,
    height: isSmartwatch? 30: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  optionText: {
    flex: 1,
    fontSize:isSmartwatch? 13: 18,
    fontWeight: "700",
    color: "#fff",
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: 'rgba(28, 28, 28, 0.8)',
  },
})
function setUsuario_id(id: any) {
  throw new Error('Function not implemented.');
}

