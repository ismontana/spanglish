import { useTheme } from '@/app/theme/themeContext';
import config from '@/lib/config';
import { getInfoUsuario } from '@/lib/utils';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions
} from 'react-native';

interface HistorialItem {
  id: string;
  originalText: string;
  translatedText: string;
  fromLanguage: string;
  toLanguage: string;
  timestamp: Date;
  isFavorite: boolean;
}

export default function Historial() {
  const router = useRouter();
  const [isdark, setDarkMode] = useState(false);
  const { theme } = useTheme();
  const [searchText, setSearchText] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [historial, setHistorial] = useState<HistorialItem[]>([]);
  const [userId, setUserId] = useState<number | null>(null);

  // 📏 Detectar tamaño de pantalla
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 300; // smartwatch o pantallas muy pequeñas

  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const user = await getInfoUsuario();
        if (user?.id) {
          setUserId(user.id);
        }
      } catch (error) {
        console.error('Error al obtener usuario:', error);
      }
    };

    fetchUsuario();
  }, []);

  useEffect(() => {
    const fetchHistorial = async () => {
      if (!userId) return;
      try {
        const response = await axios.post(config.BACKEND_URL_BASE + '/conversaciones/gethistorial', {
          id_usuario: userId
        });

        if (response.data.error === 'No se encontraron conversaciones') return;

        const data = response.data.map((item: any) => ({
          id: item.id.toString(),
          originalText: item.texto_original,
          translatedText: item.texto_traducido,
          fromLanguage: item.idioma_origen,
          toLanguage: item.idioma_destino,
          timestamp: new Date(item.fecha || new Date()),
          isFavorite: item.isFavorite || false
        }));

        setHistorial(data);
      } catch (error) {
        console.error('Error al obtener historial:', error);
      }
    };

    fetchHistorial();
  }, [userId]);

  const filteredHistorial = historial.filter(item => {
    const matchesSearch =
      item.originalText.toLowerCase().includes(searchText.toLowerCase()) ||
      item.translatedText.toLowerCase().includes(searchText.toLowerCase());

    const matchesFavorites = showFavoritesOnly ? item.isFavorite : true;

    return matchesSearch && matchesFavorites;
  });

  const deleteItem = (id: string) => {
    setHistorial(prev => prev.filter(item => item.id !== id));
    axios.post(config.BACKEND_URL_BASE + '/conversaciones/borrarconversacion', {
      id_conversacion: id
    }).then(() => console.log('Traducción eliminada correctamente'));
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'Hace unos minutos';
    if (diffInHours < 24) return `Hace ${diffInHours}h`;
    if (diffInHours < 48) return 'Ayer';
    return `Hace ${Math.floor(diffInHours / 24)} días`;
  };

  const renderHistorialItem = ({ item }: { item: HistorialItem }) => (
    <View style={[styles.historialItem, isSmallScreen && styles.historialItemSmall]}>
      <View style={styles.languageIndicator}>
        <Text style={[styles.languageText, isSmallScreen && styles.languageTextSmall]}>{item.fromLanguage}</Text>
        <Ionicons name="arrow-forward" size={isSmallScreen ? 12 : 16} color="#666" />
        <Text style={[styles.languageText, isSmallScreen && styles.languageTextSmall]}>{item.toLanguage}</Text>
      </View>

      <View style={styles.translationContent}>
        <Text 
          style={[styles.originalText, {color: theme.text}, isSmallScreen && styles.textSmall]} 
          numberOfLines={2}
        >
          {item.originalText}
        </Text>
        <Text 
          style={[styles.translatedText, {color: theme.text}, isSmallScreen && styles.textSmall]} 
          numberOfLines={2}
        >
          {item.translatedText}
        </Text>
      </View>

      <View style={styles.itemFooter}>
        <Text style={[styles.timestamp, isSmallScreen && styles.timestampSmall]}>{formatTime(item.timestamp)}</Text>
        <Pressable onPress={() => deleteItem(item.id)} style={styles.actionButton}>
          <Ionicons name="trash-outline" size={isSmallScreen ? 16 : 20} color="#666" />
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, {backgroundColor: theme.background}]}>
      {/* Header */}
      <View style={[styles.header, isSmallScreen && styles.headerSmall]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/menu')}>
          <Ionicons name="arrow-back" size={isSmallScreen ? 20 : 28} color={theme.text} />
        </TouchableOpacity>
        {!isSmallScreen && <Text style={[styles.headerTitle, {color: theme.text}]}>Historial</Text>}
        <Pressable onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}>
          <Ionicons 
            name={showFavoritesOnly ? "star" : "star-outline"} 
            size={isSmallScreen ? 18 : 24} 
            color={showFavoritesOnly ? "#FFD700" : "#666"} 
          />
        </Pressable>
      </View>

      {/* Buscador */}
      {!isSmallScreen && (
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar traducciones..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor={theme.text2}
          />
        </View>
      )}

      {/* Lista */}
      {filteredHistorial.length > 0 ? (
        <FlatList
          data={filteredHistorial}
          renderItem={renderHistorialItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={isSmallScreen ? 40 : 64} color="#ccc" />
          <Text style={[styles.emptyTitle, isSmallScreen && styles.textSmall]}>
            {showFavoritesOnly ? 'No hay favoritos' : 'No hay traducciones'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20
  },
  headerSmall: {
    paddingTop: 20,
    paddingHorizontal: 10,
    paddingBottom: 10
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: '600' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16 },
  listContent: { paddingHorizontal: 10, paddingBottom: 20 },
  historialItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e1e5e9'
  },
  historialItemSmall: {
    padding: 8
  },
  languageIndicator: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  languageText: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginHorizontal: 4
  },
  languageTextSmall: {
    fontSize: 10,
    paddingHorizontal: 4,
    paddingVertical: 2
  },
  translationContent: { marginBottom: 8 },
  originalText: { fontSize: 16, marginBottom: 4, lineHeight: 20 },
  translatedText: { fontSize: 16, fontWeight: '500', lineHeight: 20 },
  textSmall: { fontSize: 12, lineHeight: 16 },
  itemFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timestamp: { fontSize: 12 },
  timestampSmall: { fontSize: 10 },
  actionButton: { padding: 4 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginTop: 8 }
});
