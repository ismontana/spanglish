"use client"
import { useTheme } from '@/app/theme/themeContext';
import { darkTheme } from '@/constants/theme';
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import axios from "axios";
import config from "@/lib/config";
import { useRef, useEffect, useState } from "react";
import { getInfoUsuario } from "@/lib/utils"
import * as SecureStore from "expo-secure-store"
import {  Animated, Dimensions, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const { width, height } = Dimensions.get("window")
const isSmartwatch = width < 300;
const isTablet = width > 600;
const fadeAnim = useRef(new Animated.Value(1)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;
export default function MenuScreen() {
    type Usuario = { nombre: string; correo?: string; [key: string]: any }
    const [usuario, setUsuario] = useState<Usuario | null>(null)
    useEffect(() => {
        const fetchUsuario = async () => {
          const user = await getInfoUsuario()
          setUsuario(user)
        }

        fetchUsuario()
      }, [])
   
  const {theme, toggleTheme} = useTheme()
  const router = useRouter()

  const handleLogout = async () => {
      // Animación de salida
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(async () => {        
        await SecureStore.deleteItemAsync("userToken")        
        await SecureStore.deleteItemAsync("refreshToken")        
        router.push("/")
      })
      console.log(usuario?.nombre ,'usuario')
    }
      
  const MenuOption = ({
      icon,
      title,
      onPress,
      color,
    }: {
      icon: string
      title: string
      // SOLUCIÓN: Permite que onPress sea una función que devuelva una Promesa (como las funciones async)
      onPress: () => void | Promise<void>
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
            { isSmartwatch? (
              <></>
            ):(
              <Ionicons name="chevron-forward" size={20} color="#fff" />
            )
            }
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
      
      {/* Contenedor centrado */}
      <ScrollView style={styles.centeredContainerScroll}  contentContainerStyle={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {/* Tarjeta principal */}
        <View style={[styles.cardContainer,{backgroundColor:theme.background}]}>
          <View style={styles.optionsContainer}>

         {usuario?.id === undefined || usuario?.id === null ?  (
             <MenuOption
                                icon="qr-code-outline"
                                title="Iniciar Sesión"
                                onPress={() => router.push("/(tabs)/generarqr")}
                            />
           ) : (
               <MenuOption
                                  icon="log-out-outline"
                                  title="Cerrar sesión"
                                  onPress={handleLogout}
                              />
           )}

          <MenuOption
              icon="settings-outline"
              title="Ajustes"
              onPress={() => router.push("/ajustes")}
              color="#0066CC"
              />
          <MenuOption
              icon="home-outline"
              title="Volver"
              onPress={() => router.push("/")}
              color="#0066CC"
              />

          </View>
        </View>
      </ScrollView>
      
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
    width: width * 1
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  centeredContainerScroll: {
    flex: 1,
    paddingHorizontal: 20,
  },
  cardContainer: {
    width: isSmartwatch? width*0.72: width * 0.9,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: isSmartwatch? 20 : 30,
    padding: isSmartwatch? 5: 30,
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
    position:"absolute",
    top: isSmartwatch? 2: 50,
    left: isSmartwatch? 80: 20,
    zIndex: 2,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 25,
    padding: isSmartwatch? 4: 12,
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
    gap: isSmartwatch? 10:15,
  },
  option: {
    borderRadius: 15,
    height: isSmartwatch? 45 : 100,
    marginBottom: isSmartwatch? 0:8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation:4,
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

