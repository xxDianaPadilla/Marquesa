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

// Importación de contextos y hooks
import { useAuth } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

// Importación de componentes personalizados
import FavoriteCards from '../components/FavoriteCards';
import { ConfirmationDialog } from '../components/CustomAlerts'; 

// Configuración responsiva basada en el tamaño de pantalla
const { width: screenWidth } = Dimensions.get('window');
const isSmallDevice = screenWidth < 375;      // Dispositivos pequeños (iPhone SE, etc.)
const isMediumDevice = screenWidth >= 375 && screenWidth < 414; // Dispositivos medianos
const horizontalPadding = isSmallDevice ? 16 : isMediumDevice ? 20 : 24; // Padding adaptativo

/**
 * Pantalla de favoritos que muestra los productos guardados por el usuario
 * Maneja diferentes estados: autenticación, carga, error, vacío y con contenido
 * Incluye funcionalidades de refresh, eliminación con confirmación y navegación
 * @param {object} navigation - Objeto de navegación de React Navigation
 */
const FavoritesScreen = ({ navigation }) => {
  // Destructuring del contexto de autenticación con todas las funciones relacionadas a favoritos
  const {
    favorites,              // Array de productos favoritos del usuario
    favoritesLoading,       // Estado de carga de favoritos
    favoritesError,         // Error al cargar favoritos si existe
    removeFromFavorites,    // Función para remover producto de favoritos
    getFavorites,           // Función para obtener favoritos del servidor
    clearFavoritesError,    // Función para limpiar errores de favoritos
    isAuthenticated,        // Estado de autenticación del usuario
    userInfo               // Información del usuario autenticado
  } = useAuth();

  // Estados locales del componente
  const [localLoading, setLocalLoading] = useState(false); // Loading local para operaciones específicas
  const [refreshing, setRefreshing] = useState(false);     // Estado de refresh pull-to-refresh
  
  // Estado para controlar el diálogo de confirmación de eliminación
  const [confirmationDialog, setConfirmationDialog] = useState({
    visible: false,  // Controla si el diálogo está visible
    product: null   // Producto que se va a eliminar
  });

  /**
   * Hook que se ejecuta cada vez que la pantalla gana foco
   * Útil para actualizar favoritos cuando el usuario regresa de otras pantallas
   */
  useFocusEffect(
    useCallback(() => {
      // Solo cargar favoritos si el usuario está autenticado y tiene información
      if (isAuthenticated && userInfo) {
        console.log('FavoritesScreen - Cargando favoritos...');
        getFavorites();
      }
    }, [isAuthenticated, userInfo]) // Dependencias del callback
  );

  /**
   * Effect para limpiar errores previos cuando el componente se monta
   * Asegura que no se muestren errores de sesiones anteriores
   */
  useEffect(() => {
    clearFavoritesError();
  }, []);

  /**
   * Función para manejar el refresh pull-to-refresh
   * Permite al usuario actualizar manualmente la lista de favoritos
   */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await getFavorites();
    } catch (error) {
      console.error('Error al refrescar favoritos:', error);
    } finally {
      setRefreshing(false); // Siempre se ejecuta, incluso si hay error
    }
  }, [getFavorites]);

  /**
   * Muestra el diálogo de confirmación antes de eliminar un favorito
   * @param {object} product - Producto que se desea eliminar de favoritos
   */
  const handleRemoveFavorite = (product) => {
    setConfirmationDialog({
      visible: true,
      product
    });
  };

  /**
   * Confirma y ejecuta la eliminación del producto de favoritos
   * Maneja el loading local y posibles errores durante la eliminación
   */
  const confirmRemoveFavorite = async () => {
    const { product } = confirmationDialog;
    
    // Cerrar el diálogo inmediatamente para mejor UX
    setConfirmationDialog({
      visible: false,
      product: null
    });

    if (!product) return; // Verificación de seguridad

    setLocalLoading(true); // Mostrar loading durante la operación
    try {
      const result = await removeFromFavorites(product._id);
      if (result.success) {
        console.log('Producto removido de favoritos');
      } else {
        // En caso de error del servidor, mostrar alerta
        // Nota: Se podría usar el sistema de CustomAlert aquí también
        Alert.alert('Error', result.message || 'No se pudo remover el producto de favoritos');
      }
    } catch (error) {
      console.error('Error al remover favorito:', error);
      // Error de conexión o inesperado
      Alert.alert('Error', 'Error de conexión. Intenta nuevamente.');
    } finally {
      setLocalLoading(false); // Ocultar loading sin importar el resultado
    }
  };

  /**
   * Cancela la eliminación y cierra el diálogo de confirmación
   */
  const cancelRemoveFavorite = () => {
    setConfirmationDialog({
      visible: false,
      product: null
    });
  };

  /**
   * Navega a la pantalla de detalle del producto seleccionado
   * @param {object} product - Producto del cual ver el detalle
   */
  const handleProductPress = (product) => {
    navigation.navigate('ProductDetail', { productId: product._id });
  };

  /**
   * Renderizado condicional: Usuario no autenticado
   * Muestra mensaje invitando a iniciar sesión
   */
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />

        {/* Header estándar */}
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

        {/* Separador visual decorativo */}
        <View style={styles.pinkSeparator} />

        {/* Contenido para usuario no autenticado */}
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

  /**
   * Renderizado condicional: Estado de carga inicial
   * Se muestra mientras se obtienen los favoritos del servidor
   */
  if (favoritesLoading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />

        {/* Header estándar */}
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

        {/* Indicador de carga centrado */}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f5c7e6ff" />
          <Text style={styles.loadingText}>Cargando favoritos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  /**
   * Renderizado condicional: Estado de error
   * Se muestra cuando hay problemas al cargar los favoritos
   */
  if (favoritesError) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />

        {/* Header estándar */}
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

        {/* Contenido de error con opción de reintentar */}
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={64} color="#ff6b6b" />
          <Text style={styles.errorTitle}>Error al cargar favoritos</Text>
          <Text style={styles.errorMessage}>{favoritesError}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              clearFavoritesError(); // Limpiar error antes de reintentar
              getFavorites();        // Volver a intentar cargar
            }}
          >
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  /**
   * Renderizado principal: Pantalla de favoritos con contenido
   * Maneja tanto el estado vacío como el estado con favoritos
   */
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header con contador de favoritos y botón de refresh */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Favoritos 
        </Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={onRefresh}
          disabled={refreshing} // Deshabilitado durante refresh
        >
          <Icon
            name="refresh"
            size={24}
            color={refreshing ? "#ccc" : "#333"} // Color dinámico según estado
          />
        </TouchableOpacity>
      </View>

      <View style={styles.pinkSeparator} />

      {/* Contenido principal con renderizado condicional */}
      {favorites.length === 0 ? (
        // Estado vacío: No hay favoritos
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#f5c7e6ff']}      // Android
              tintColor="#f5c7e6ff"      // iOS
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
        // Estado con contenido: Mostrar favoritos
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
          {/* Componente que renderiza la lista de favoritos */}
          <FavoriteCards
            data={favorites}
            onToggleFavorite={handleRemoveFavorite}  // Callback para eliminar
            onCardPress={handleProductPress}        // Callback para ver detalle
            isLoading={localLoading}               // Estado de loading local
          />
        </ScrollView>
      )}

      {/* Overlay de loading para operaciones locales */}
      {localLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#f5c7e6ff" />
        </View>
      )}

      {/* Diálogo de confirmación para eliminar favoritos */}
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
        isDangerous={true} // Estilo de acción peligrosa
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Contenedor principal - ocupa toda la pantalla
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  
  // Header con navegación y título
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    marginTop: 30, // Espaciado para área segura
  },
  
  // Separador decorativo color rosa
  pinkSeparator: {
    height: 2,
    backgroundColor: '#FDB4B7',
    marginBottom: 8,
  },
  
  // Botón de retroceso con área de toque ampliada
  backButton: {
    padding: 8,
  },
  
  // Botón de refresh con área de toque ampliada
  refreshButton: {
    padding: 8,
  },
  
  // Título del header
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Poppins-SemiBold',
  },
  
  // Espacio derecho para balance visual
  headerRight: {
    width: 40,
  },
  
  // Contenido principal con padding inferior adaptativo
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingBottom: isSmallDevice ? 90 : 100, // Espaciado para tab bar
  },

  // Estilos para estados de carga, error y vacío
  
  // Contenedor centrado para estado de carga inicial
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  
  // Texto que acompaña al indicador de carga
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  
  // Overlay de loading para operaciones específicas
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparente
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000, // Asegura que esté por encima de todo
  },
  
  // Contenedor centrado para estado de error
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  
  // Título del mensaje de error
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  
  // Mensaje descriptivo del error
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  
  // Botón para reintentar después de un error
  retryButton: {
    backgroundColor: '#f5c7e6ff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  
  // Texto del botón de reintentar
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  
  // Contenedor centrado para estados vacíos
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
    paddingHorizontal: 32,
  },
  
  // Título para estados vacíos
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginTop: 24,
    marginBottom: 12,
  },
  
  // Mensaje descriptivo para estados vacíos
  emptyMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24, // Mejor legibilidad
  },
  
  // Botón de acción principal en estados vacíos
  shopButton: {
    backgroundColor: '#f5c7e6ff',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
  },
  
  // Texto del botón de acción principal
  shopButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },

  // Estilos para navegación inferior (si se necesita en el futuro)
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: isSmallDevice ? 12 : 16, // Padding adaptativo
    paddingHorizontal: horizontalPadding,     // Padding responsivo
    justifyContent: 'space-around',
    
    // Sombra para elevación
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8, // Android
    minHeight: isSmallDevice ? 70 : 80, // Altura mínima adaptativa
  },
  
  // Items de navegación inferior
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: isSmallDevice ? 6 : 8,
    minWidth: isSmallDevice ? 40 : 44,   // Tamaño mínimo adaptativo
    minHeight: isSmallDevice ? 40 : 44,
    borderRadius: isSmallDevice ? 20 : 22, // Border radius adaptativo
  },
  
  // Iconos de navegación
  navIcon: {
    width: isSmallDevice ? 20 : 24,    // Tamaño adaptativo
    height: isSmallDevice ? 20 : 24,
    resizeMode: 'contain',
  },
});

export default FavoritesScreen;