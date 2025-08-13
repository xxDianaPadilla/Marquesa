import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import FavoriteCards from '../components/FavoriteCards';
import { ConfirmationDialog } from '../components/CustomAlerts'; 

const { width: screenWidth } = Dimensions.get('window');
const isSmallDevice = screenWidth < 375;
const isMediumDevice = screenWidth >= 375 && screenWidth < 414;
const horizontalPadding = isSmallDevice ? 16 : isMediumDevice ? 20 : 24;

const FavoritesScreen = ({ navigation }) => {
  const {
    favorites,
    favoritesLoading,
    favoritesError,
    removeFromFavorites,
    getFavorites,
    clearFavoritesError,
    isAuthenticated,
    userInfo
  } = useAuth();

  const [localLoading, setLocalLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Estado para el dialog de confirmación
  const [confirmationDialog, setConfirmationDialog] = useState({
    visible: false,
    product: null
  });

  // Cargar favoritos cuando la pantalla gana foco
  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated && userInfo) {
        console.log('FavoritesScreen - Cargando favoritos...');
        getFavorites();
      }
    }, [isAuthenticated, userInfo])
  );

  // Limpiar errores cuando el componente se monta
  useEffect(() => {
    clearFavoritesError();
  }, []);

  // Función para refrescar favoritos
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await getFavorites();
    } catch (error) {
      console.error('Error al refrescar favoritos:', error);
    } finally {
      setRefreshing(false);
    }
  }, [getFavorites]);

  // Función para mostrar confirmación de remover favorito
  const handleRemoveFavorite = (product) => {
    setConfirmationDialog({
      visible: true,
      product
    });
  };

  // Función para confirmar la eliminación
  const confirmRemoveFavorite = async () => {
    const { product } = confirmationDialog;
    
    // Cerrar el dialog
    setConfirmationDialog({
      visible: false,
      product: null
    });

    if (!product) return;

    setLocalLoading(true);
    try {
      const result = await removeFromFavorites(product._id);
      if (result.success) {
        console.log('Producto removido de favoritos');
      } else {
        // Aquí podrías usar otro CustomAlert para mostrar errores si quisieras
        Alert.alert('Error', result.message || 'No se pudo remover el producto de favoritos');
      }
    } catch (error) {
      console.error('Error al remover favorito:', error);
      // Aquí podrías usar otro CustomAlert para mostrar errores si quisieras
      Alert.alert('Error', 'Error de conexión. Intenta nuevamente.');
    } finally {
      setLocalLoading(false);
    }
  };

  // Función para cancelar la eliminación
  const cancelRemoveFavorite = () => {
    setConfirmationDialog({
      visible: false,
      product: null
    });
  };

  // Función para navegar al detalle del producto
  const handleProductPress = (product) => {
    navigation.navigate('ProductDetail', { productId: product._id });
  };

  // Verificar si el usuario está autenticado
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Favoritos</Text>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.pinkSeparator} />

        <View style={styles.emptyContainer}>
          <Icon name="account-circle" size={80} color="#ddd" />
          <Text style={styles.emptyTitle}>Inicia sesión</Text>
          <Text style={styles.emptyMessage}>
            Debes iniciar sesión para ver tus productos favoritos
          </Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.shopButtonText}>Iniciar sesión</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Renderizar estado de carga
  if (favoritesLoading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Favoritos</Text>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.pinkSeparator} />

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f5c7e6ff" />
          <Text style={styles.loadingText}>Cargando favoritos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Renderizar estado de error
  if (favoritesError) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Favoritos</Text>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.pinkSeparator} />

        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={64} color="#ff6b6b" />
          <Text style={styles.errorTitle}>Error al cargar favoritos</Text>
          <Text style={styles.errorMessage}>{favoritesError}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              clearFavoritesError();
              getFavorites();
            }}
          >
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Favoritos {favorites.length > 0 && `(${favorites.length})`}
        </Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={onRefresh}
          disabled={refreshing}
        >
          <Icon
            name="refresh"
            size={24}
            color={refreshing ? "#ccc" : "#333"}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.pinkSeparator} />

      {/* Content */}
      {favorites.length === 0 ? (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#f5c7e6ff']}
              tintColor="#f5c7e6ff"
            />
          }
        >
          <View style={styles.emptyContainer}>
            <Icon name="favorite-border" size={80} color="#ddd" />
            <Text style={styles.emptyTitle}>No tienes favoritos</Text>
            <Text style={styles.emptyMessage}>
              Cuando agregues productos a tus favoritos, aparecerán aquí
            </Text>
            <TouchableOpacity
              style={styles.shopButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.shopButtonText}>Explorar productos</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#f5c7e6ff']}
              tintColor="#f5c7e6ff"
            />
          }
        >
          {/* Usando el componente FavoriteCards */}
          <FavoriteCards
            data={favorites}
            onToggleFavorite={handleRemoveFavorite}
            onCardPress={handleProductPress}
            isLoading={localLoading}
          />
        </ScrollView>
      )}

      {/* Loading overlay */}
      {localLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#f5c7e6ff" />
        </View>
      )}

      {/* Dialog de confirmación para remover favorito */}
      <ConfirmationDialog
        visible={confirmationDialog.visible}
        title="Remover de favoritos"
        message={
          confirmationDialog.product 
            ? `¿Estás seguro de que deseas remover "${confirmationDialog.product.name}" de tus favoritos?`
            : ''
        }
        onConfirm={confirmRemoveFavorite}
        onCancel={cancelRemoveFavorite}
        confirmText="Remover"
        cancelText="Cancelar"
        isDangerous={true}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    marginTop: 25,
  },
  pinkSeparator: {
    height: 2,
    backgroundColor: '#FDB4B7',
    marginBottom: 8,
  },
  backButton: {
    padding: 8,
  },
  refreshButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingBottom: isSmallDevice ? 90 : 100,
  },

  // Estados de carga, error y vacío
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#f5c7e6ff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginTop: 24,
    marginBottom: 12,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  shopButton: {
    backgroundColor: '#f5c7e6ff',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
  },
  shopButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },

  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: isSmallDevice ? 12 : 16,
    paddingHorizontal: horizontalPadding,
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
    minHeight: isSmallDevice ? 70 : 80,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: isSmallDevice ? 6 : 8,
    minWidth: isSmallDevice ? 40 : 44,
    minHeight: isSmallDevice ? 40 : 44,
    borderRadius: isSmallDevice ? 20 : 22,
  },
  navIcon: {
    width: isSmallDevice ? 20 : 24,
    height: isSmallDevice ? 20 : 24,
    resizeMode: 'contain',
  },
});

export default FavoritesScreen;