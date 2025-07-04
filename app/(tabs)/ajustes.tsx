import { useTheme } from '@/app/theme/themeContext';
import config from '@/lib/config';
import { getAjustesUsuario, getInfoUsuario } from '@/lib/utils';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';

import React, { useEffect, useState } from 'react';
const { height, width } = Dimensions.get('window');

import {
  Alert,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const isSmartwatch = width < 300;
export default function Ajustes() {
  const router = useRouter();

  // Estados para los ajustes
  const [loading, setLoading] = useState(true);
  const [autoTranslate, setAutoTranslate] = useState(true);
  const [saveHistory, setSaveHistory] = useState(true);
  const [vibration, setVibration] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const [usuario_id, setUsuario_id] = useState()
  const {theme, toggleTheme} = useTheme()

 
  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const user = await getInfoUsuario();
        if (user?.id) {
        console.log(user.id)
        setUsuario_id(user.id);
      }
      } catch (error) {
        console.error('Error al obtener usuario:', error);
      }
    };

    fetchUsuario();
  }, []);

   useEffect(() => {
   const initAjustes = async () => {
     const user = await getInfoUsuario();
     if (user?.id) {
       const ajustes = await getAjustesUsuario(user.id);
       console.log("Ajustes obtenidos:", ajustes);
       console.log(user.id)

       if (ajustes) {setDarkMode(ajustes.modo_oscuro === 1);
       }
     }
     setLoading(false)
   }
   initAjustes();
 }, []);


  const handleClearHistory = () => {
    Alert.alert(
      "Limpiar Historial",
      "¿Estás seguro de que quieres eliminar todo el historial de traducciones?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive", 
          onPress: async () => {
            try {
              await axios.post(
                config.BACKEND_URL_BASE + '/conversaciones/borrarhistorial', 
                { id_usuario: usuario_id }
              );
              Alert.alert("Historial eliminado", "Se ha limpiado todo el historial de traducciones");
            } catch (error) {
              Alert.alert("Error", "Hubo un problema al eliminar el historial" + error);
              console.error(error);
            }
          } 
        }
      ]
    );
  };

  useEffect(() => {
  const cargarTemaLocal = async () => {
    try {
      const valor = await AsyncStorage.getItem('modo_oscuro');
      if (valor !== null) {
        const booleano = valor === '1';
        setDarkMode(booleano);

        if (booleano) toggleTheme(); // si estaba activado, cambia el tema
      }
    } catch (error) {
      console.error('Error cargando modo oscuro local:', error);
    }
  };

  cargarTemaLocal();
}, []);

  const SettingItem = ({ 
    title, 
    subtitle, 
    value, 
    onValueChange, 
    type = 'switch' 
  }: {
    title: string;
    subtitle?: string;
    value?: boolean;
    onValueChange?: (value: boolean) => void;
    type?: 'switch' | 'button';
  }) => (
    <View style={[styles.settingItem, { backgroundColor: theme.background }]}>
      <View style={[styles.settingText]}>
        <Text style={[styles.settingTitle, {color:theme.text}]}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {type === 'switch' && (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={value ? '#f5dd4b' : '#f4f3f4'}
        />
      )}
    </View>
  );

  return (
    <View style={[styles.container, {backgroundColor: theme.background}]}>
      { isSmartwatch? (
        <>
        <View style={[styles.header, {backgroundColor: theme.background}]}>
        <TouchableOpacity style={[styles.backButton]} onPress={() => router.push('/menu')}>
          <Ionicons name="arrow-back" size={28} color={theme.tabIconDefault} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, {color:theme.text}]}>Ajustes</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
 
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Traducción</Text>
          
          <SettingItem
            title="Traducción automática"
            subtitle="Traduce automáticamente al detectar voz"
            value={autoTranslate}
            onValueChange={setAutoTranslate}
          />
          
          <SettingItem
            title="Modo sin conexión"
            subtitle="Usar traducciones básicas sin internet"
            value={offlineMode}
            onValueChange={setOfflineMode}
          />
        </View>


        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Historial</Text>
          
          <SettingItem
            title="Guardar historial"
            subtitle="Mantener registro de traducciones"
            value={saveHistory}
            onValueChange={setSaveHistory}
          />
          
          <Pressable style={[styles.settingItem, {backgroundColor:theme.background}]} onPress={handleClearHistory}>
            <View style={[styles.settingText]}>
              <Text style={[styles.settingTitle, { color: theme.text }]}>
                Limpiar historial
              </Text>
              <Text style={styles.settingSubtitle}>
                Eliminar todas las traducciones guardadas
              </Text>
            </View>
            <Ionicons name="trash-outline" size={24} color="#ff4444" />
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interfaz</Text>
          {!loading &&(
          <SettingItem
            title="Modo oscuro"
            subtitle="Cambiar a tema oscuro"
            value={darkMode}
            onValueChange={async (value) => {
              setDarkMode(value);             // (si lo necesitas localmente)
              toggleTheme();  
              const user = await getInfoUsuario();
              if(user?.id){

                try {
                  await AsyncStorage.setItem('modo_oscuro', value? '1' : '0')
                  await fetch(`${config.BACKEND_URL_BASE}/ajustes/modificarajuste`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        'usuario_id': user.id,
                        'modo_oscuro': value ? 1 : 0,
                      }),
                    });
                    } catch (error) {
                      console.error('Error actualizandoo modo oscuro en backend', error);
                    }
                  }}
                }                // cambia el tema visualmente
          />
              )}
          <SettingItem
            title="Vibración"
            subtitle="Vibrar al completar traducción"
            value={vibration}
            onValueChange={setVibration}
          />
        </View>


        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información</Text>
          
          <Pressable style={[styles.settingItem, {backgroundColor:theme.background}]}>
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, { color: theme.text }]}>Acerca de Spanglish</Text>
              <Text style={styles.settingSubtitle}>Versión 1.0.0</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </Pressable>
          
          <Pressable style= {[styles.settingItem, {backgroundColor:theme.background}]}>
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, { color: theme.text }]}>Política de privacidad</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </Pressable>
          
          <Pressable style={[styles.settingItem, {backgroundColor:theme.background}]}>
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, { color: theme.text }]}>Términos de uso</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </Pressable>
        </View>
      </ScrollView>
      </>

      ):(

      <>
      <View style={[styles.header, {backgroundColor: theme.background}]}>
        <TouchableOpacity style={[styles.backButton]} onPress={() => router.push('/menu')}>
          <Ionicons name="arrow-back" size={28} color={theme.tabIconDefault} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, {color:theme.text}]}>Ajustes</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Traducción</Text>
          
          <SettingItem
            title="Traducción automática"
            subtitle="Traduce automáticamente al detectar voz"
            value={autoTranslate}
            onValueChange={setAutoTranslate}
          />
          
          <SettingItem
            title="Modo sin conexión"
            subtitle="Usar traducciones básicas sin internet"
            value={offlineMode}
            onValueChange={setOfflineMode}
          />
        </View>


        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Historial</Text>
          
          <SettingItem
            title="Guardar historial"
            subtitle="Mantener registro de traducciones"
            value={saveHistory}
            onValueChange={setSaveHistory}
          />
          
          <Pressable style={[styles.settingItem, {backgroundColor:theme.background}]} onPress={handleClearHistory}>
            <View style={[styles.settingText]}>
              <Text style={[styles.settingTitle, { color: theme.text }]}>
                Limpiar historial
              </Text>
              <Text style={styles.settingSubtitle}>
                Eliminar todas las traducciones guardadas
              </Text>
            </View>
            <Ionicons name="trash-outline" size={24} color="#ff4444" />
          </Pressable>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interfaz</Text>
          
          <SettingItem
            title="Modo oscuro"
            subtitle="Cambiar a tema oscuro"
            value={darkMode}
            onValueChange={async (value) => {
              setDarkMode(value);             // (si lo necesitas localmente)
              toggleTheme();                  // cambia el tema visualmente
              
              try {
                await fetch(`${config.BACKEND_URL_BASE}/ajustes/modificarajuste`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
          'usuario_id': 3,
          'modo_oscuro': value ? 1 : 0,
        }),
      });
    } catch (error) {
      console.error('Error actualizandoo modo oscuro en backend', error);
    }
  }}
          />
          
          <SettingItem
            title="Vibración"
            subtitle="Vibrar al completar traducción"
            value={vibration}
            onValueChange={setVibration}
            />
        </View>


        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información</Text>
          
          <Pressable style={[styles.settingItem, {backgroundColor:theme.background}]}>
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, { color: theme.text }]}>Acerca de Spanglish</Text>
              <Text style={styles.settingSubtitle}>Versión 1.0.0</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </Pressable>
          
          <Pressable style= {[styles.settingItem, {backgroundColor:theme.background}]}>
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, { color: theme.text }]}>Política de privacidad</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </Pressable>
          
          <Pressable style={[styles.settingItem, {backgroundColor:theme.background}]}>
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, { color: theme.text }]}>Términos de uso</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </Pressable>
        </View>
      </ScrollView>
      </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:'#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: isSmartwatch? 10 : 50,
    paddingHorizontal: 20,
    paddingBottom:isSmartwatch? 5: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: isSmartwatch? 15:20,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 44,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: isSmartwatch? 20: 30,
  },
  sectionTitle: {
    fontSize: isSmartwatch? 12 : 16,
    fontWeight: '600',
    color: '#333',
    marginBottom:  isSmartwatch? 5: 15,
    paddingHorizontal: 5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingVertical: isSmartwatch? 10: 16,
    paddingHorizontal:isSmartwatch? 5: 20,
    marginBottom: 2,
    borderRadius: 12,
  },
  settingText: {
    flex: 1,
    color: '#444'
  },
  settingTitle: {
    fontSize:  isSmartwatch? 14: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: isSmartwatch? 12 : 14,
    color: '#666',
  },
});