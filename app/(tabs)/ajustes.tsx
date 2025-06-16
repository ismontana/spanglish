import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function Ajustes() {
  const router = useRouter();
  
  // Estados para los ajustes
  const [autoTranslate, setAutoTranslate] = useState(true);
  const [saveHistory, setSaveHistory] = useState(true);
  const [vibration, setVibration] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);

  const handleClearHistory = () => {
    Alert.alert(
      "Limpiar Historial",
      "¿Estás seguro de que quieres eliminar todo el historial de traducciones?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: () => {
          // Aquí iría la lógica para limpiar el historial
          Alert.alert("Historial eliminado", "Se ha limpiado todo el historial de traducciones");
        }}
      ]
    );
  };

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
    <View style={styles.settingItem}>
      <View style={styles.settingText}>
        <Text style={styles.settingTitle}>{title}</Text>
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/menu')}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ajustes</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Sección de Traducción */}
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

        {/* Sección de Historial */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Historial</Text>
          
          <SettingItem
            title="Guardar historial"
            subtitle="Mantener registro de traducciones"
            value={saveHistory}
            onValueChange={setSaveHistory}
          />
          
          <TouchableOpacity style={styles.settingItem} onPress={handleClearHistory}>
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, { color: '#ff4444' }]}>
                Limpiar historial
              </Text>
              <Text style={styles.settingSubtitle}>
                Eliminar todas las traducciones guardadas
              </Text>
            </View>
            <Ionicons name="trash-outline" size={24} color="#ff4444" />
          </TouchableOpacity>
        </View>

        {/* Sección de Interfaz */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interfaz</Text>
          
          <SettingItem
            title="Modo oscuro"
            subtitle="Cambiar a tema oscuro"
            value={darkMode}
            onValueChange={setDarkMode}
          />
          
          <SettingItem
            title="Vibración"
            subtitle="Vibrar al completar traducción"
            value={vibration}
            onValueChange={setVibration}
          />
        </View>

        {/* Sección de Información */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Acerca de Spanglish</Text>
              <Text style={styles.settingSubtitle}>Versión 1.0.0</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Política de privacidad</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Términos de uso</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
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
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 2,
    borderRadius: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
  },
});