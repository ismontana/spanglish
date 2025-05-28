import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

// Datos de ejemplo para el historial
const historialData = [
  {
    id: '1',
    originalText: 'Hello, how are you?',
    translatedText: 'Hola, ¿cómo estás?',
    fromLanguage: 'EN',
    toLanguage: 'ES',
    timestamp: new Date('2025-01-15T10:30:00'),
    isFavorite: true,
  },
  {
    id: '2',
    originalText: 'Me gusta mucho esta aplicación',
    translatedText: 'I really like this application',
    fromLanguage: 'ES',
    toLanguage: 'EN',
    timestamp: new Date('2025-01-15T09:15:00'),
    isFavorite: false,
  },
  {
    id: '3',
    originalText: 'Where is the nearest restaurant?',
    translatedText: '¿Dónde está el restaurante más cercano?',
    fromLanguage: 'EN',
    toLanguage: 'ES',
    timestamp: new Date('2025-01-14T18:45:00'),
    isFavorite: false,
  },
  {
    id: '4',
    originalText: 'Gracias por tu ayuda',
    translatedText: 'Thank you for your help',
    fromLanguage: 'ES',
    toLanguage: 'EN',
    timestamp: new Date('2025-01-14T16:20:00'),
    isFavorite: true,
  },
  {
    id: '5',
    originalText: 'What time is it?',
    translatedText: '¿Qué hora es?',
    fromLanguage: 'EN',
    toLanguage: 'ES',
    timestamp: new Date('2025-01-13T14:10:00'),
    isFavorite: false,
  },
];

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
  const [searchText, setSearchText] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [historial, setHistorial] = useState<HistorialItem[]>(historialData);

  // Filtrar historial basado en búsqueda y favoritos
  const filteredHistorial = historial.filter(item => {
    const matchesSearch = 
      item.originalText.toLowerCase().includes(searchText.toLowerCase()) ||
      item.translatedText.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesFavorites = showFavoritesOnly ? item.isFavorite : true;
    
    return matchesSearch && matchesFavorites;
  });

  const toggleFavorite = (id: string) => {
    setHistorial(prev => 
      prev.map(item => 
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      )
    );
  };

  const deleteItem = (id: string) => {
    Alert.alert(
      "Eliminar traducción",
      "¿Estás seguro de que quieres eliminar esta traducción?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: () => {
          setHistorial(prev => prev.filter(item => item.id !== id));
        }}
      ]
    );
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace unos minutos';
    if (diffInHours < 24) return `Hace ${diffInHours}h`;
    if (diffInHours < 48) return 'Ayer';
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `Hace ${diffInDays} días`;
  };

  const renderHistorialItem = ({ item }: { item: HistorialItem }) => (
    <View style={styles.historialItem}>
      <View style={styles.languageIndicator}>
        <Text style={styles.languageText}>{item.fromLanguage}</Text>
        <Ionicons name="arrow-forward" size={16} color="#666" />
        <Text style={styles.languageText}>{item.toLanguage}</Text>
      </View>
      
      <View style={styles.translationContent}>
        <Text style={styles.originalText}>{item.originalText}</Text>
        <Text style={styles.translatedText}>{item.translatedText}</Text>
      </View>
      
      <View style={styles.itemFooter}>
        <Text style={styles.timestamp}>{formatTime(item.timestamp)}</Text>
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => toggleFavorite(item.id)}
          >
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => deleteItem(item.id)}
          >
            <Ionicons name="trash-outline" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Historial</Text>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
        >
        </TouchableOpacity>
      </View>

      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar traducciones..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#999"
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Lista de historial */}
      {filteredHistorial.length > 0 ? (
        <FlatList
          data={filteredHistorial}
          renderItem={renderHistorialItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>
            {showFavoritesOnly ? 'No hay favoritos' : 'No hay traducciones'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {showFavoritesOnly 
              ? 'Marca traducciones como favoritas para verlas aquí'
              : searchText 
                ? 'No se encontraron resultados para tu búsqueda'
                : 'Tus traducciones aparecerán aquí'
            }
          </Text>
        </View>
      )}
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
  filterButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  list: {
    flex: 1,
    marginTop: 15,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  historialItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  languageIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  languageText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    backgroundColor: '#f0f2f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  translationContent: {
    marginBottom: 12,
  },
  originalText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    lineHeight: 22,
  },
  translatedText: {
    fontSize: 16,
    color: '#0066cc',
    fontWeight: '500',
    lineHeight: 22,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
});