import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
  ToastAndroid,
  Platform
} from 'react-native';

// Importación de contextos personalizados
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

// Importación de iconos y componentes
import Icon from 'react-native-vector-icons/MaterialIcons';
import backIcon from '../images/backIcon.png';
import ShoppingCartCards from '../components/ShoppingCartCards';
import { ConfirmationDialog } from '../components/CustomAlerts'; 
import { useAlert } from '../hooks/useAlert'; 

const ShoppingCart = ({ navigation, route }) => {
  // Extraer funciones y estados del contexto de autenticación
  const { isAuthenticated, user } = useAuth();
  
  // Extraer funciones y estados del contexto del carrito
  const {
    cart,
    cartItems,
    cartLoading,
    cartError,
    subtotal,
    cartTotal,
    updateItemQuantity,
    removeFromCart,
    getActiveCart,
    clearCartError,
    isCustomProduct,
    getCustomizationDetails,
    getCartStats,
    getProductImage
  } = useCart();

  // Estados locales para la UI del componente
  const [refreshing, setRefreshing] = useState(false); // Para controlar el refresh del ScrollView
  const [discountCode, setDiscountCode] = useState(''); // Código de descuento ingresado por el usuario
  const [applyingDiscount, setApplyingDiscount] = useState(false); // Estado de carga al aplicar descuento
  const [updatingItems, setUpdatingItems] = useState(new Set()); // Items que están siendo actualizados
  const [initialLoadComplete, setInitialLoadComplete] = useState(false); // Para controlar la doble carga

  // Hook personalizado para manejar alertas y confirmaciones
  const {
    alertState,
    showConfirmation,
    hideConfirmation,
    showErrorToast,
    showSuccessToast
  } = useAlert();

  // Función para mostrar mensajes toast multiplataforma
  const showToast = (message) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('Información', message);
    }
  };

  useEffect(() => {
    const handleNavigationRefresh = async () => {
      if (route.params?.refresh && isAuthenticated && user?.id && getActiveCart) {
        console.log('Refrescando carrito por navegación con parámetros:', route.params);
        
        // Forzar recarga inmediata
        await getActiveCart(true);
        
        // Limpiar parámetros de navegación para evitar recargas innecesarias
        if (navigation.setParams) {
          navigation.setParams({ refresh: undefined, timestamp: undefined });
        }
      }
    };

    handleNavigationRefresh();
  }, [route.params?.refresh, route.params?.timestamp, isAuthenticated, user?.id]);

  useEffect(() => {
    const performDoubleLoad = async () => {
      if (isAuthenticated && user?.id && getActiveCart) {
        console.log('Iniciando doble carga del carrito...');
        
        // Primera carga
        console.log('Primera carga del carrito');
        await getActiveCart(true);
        
        // Esperar un momento antes de la segunda carga
        setTimeout(async () => {
          console.log('Segunda carga del carrito (verificación de nuevos items)');
          await getActiveCart(true);
          setInitialLoadComplete(true);
          console.log('Doble carga completada');
        }, 1500); // Esperar 1.5 segundos antes de la segunda carga
      }
    };

    // Solo hacer la doble carga si no se ha completado aún
    if (!initialLoadComplete) {
      performDoubleLoad();
    }
  }, [isAuthenticated, user?.id, initialLoadComplete]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      console.log('📱 ShoppingCart recibió foco');
      
      if (isAuthenticated && user?.id && getActiveCart && initialLoadComplete) {
        console.log('🔄 Refrescando carrito por foco de pantalla');
        await getActiveCart(true);
      }
    });

    return unsubscribe;
  }, [navigation, isAuthenticated, user?.id, initialLoadComplete]);

  useEffect(() => {
    return () => {
      if (clearCartError) {
        clearCartError();
      }
    };
  }, []); // Array vacío porque es cleanup

  // Effect para logging y debugging - Ver estadísticas del carrito
  useEffect(() => {
    if (cartItems.length > 0 && getCartStats && isCustomProduct) {
      const stats = getCartStats();
      console.log('Estadísticas del carrito:', stats);
      console.log('Items del carrito:', cartItems.map(item => ({
        id: item.id,
        name: item.name,
        type: item.itemType,
        isCustom: isCustomProduct(item),
        price: item.price,
        quantity: item.quantity
      })));
    }
  }, [cartItems.length]);

  // Función para refrescar el carrito mediante pull-to-refresh
  const onRefresh = async () => {
    if (!isAuthenticated || !getActiveCart) return;

    console.log('Pull-to-refresh activado');
    setRefreshing(true);
    try {
      // Hacer doble refresh para asegurar datos actualizados
      await getActiveCart(true);
      
      // Segunda verificación después de un breve delay
      setTimeout(async () => {
        await getActiveCart(true);
        console.log('Pull-to-refresh completado con doble verificación');
      }, 800);
      
    } catch (error) {
      console.error('❌ Error al refrescar carrito:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Manejador para actualizar la cantidad de un producto en el carrito
  const handleUpdateQuantity = async (itemId, delta) => {
    try {
      if (!cartItems || !itemId || !updateItemQuantity) return;

      // Buscar el item actual en la lista de productos del carrito
      const currentItem = cartItems.find(item => item.id === itemId);

      if (!currentItem) {
        Alert.alert('Error', 'Producto no encontrado en el carrito');
        return;
      }

      // Calcular nueva cantidad con límites mínimos y máximos
      const newQuantity = Math.max(1, currentItem.quantity + delta);

      if (newQuantity > 99) {
        Alert.alert('Límite alcanzado', 'No puedes agregar más de 99 unidades');
        return;
      }

      if (newQuantity === currentItem.quantity) return;

      // Marcar item como "actualizándose" para mostrar indicador de carga
      setUpdatingItems(prev => new Set([...prev, itemId]));

      console.log(`Actualizando cantidad de ${isCustomProduct ? isCustomProduct(currentItem) ? 'producto personalizado' : 'producto' : 'producto'}: ${currentItem.name}`);

      // Llamar a la función del contexto para actualizar la cantidad
      const result = await updateItemQuantity(itemId, newQuantity);

      if (result && result.success) {
        showToast(`Cantidad actualizada: ${newQuantity}`);
        
        // Recargar carrito después de actualización exitosa
        setTimeout(() => {
          getActiveCart(true);
        }, 500);
      } else {
        Alert.alert('Error', result?.message || 'No se pudo actualizar la cantidad');
      }
    } catch (error) {
      console.error('Error al actualizar cantidad:', error);
      Alert.alert('Error', 'Error inesperado al actualizar cantidad');
    } finally {
      // Remover item del set de "actualizándose"
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  // Manejador para eliminar un producto del carrito con confirmación personalizada
  const handleRemoveItem = async (itemId, itemName, itemType) => {
    try {
      if (!removeFromCart) {
        showErrorToast('Función no disponible');
        return;
      }

      const productTypeText = itemType === 'custom' ? 'producto personalizado' : 'producto';

      // Mostrar diálogo de confirmación personalizado
      showConfirmation({
        title: 'Confirmar eliminación',
        message: `¿Estás seguro de que quieres eliminar este ${productTypeText} "${itemName}" del carrito?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        isDangerous: true, // Marcar como peligroso para usar color rojo
        onConfirm: async () => {
          hideConfirmation();
          
          // Marcar item como "actualizándose"
          setUpdatingItems(prev => new Set([...prev, itemId]));

          console.log(`Eliminando ${productTypeText}: ${itemName}`);

          // Llamar a la función del contexto para remover el item
          const result = await removeFromCart(itemId);

          if (result && result.success) {
            showSuccessToast(`${itemName} eliminado del carrito`);
            
            // Recargar carrito después de eliminación exitosa
            setTimeout(() => {
              getActiveCart(true);
            }, 500);
          } else {
            showErrorToast(result?.message || 'No se pudo eliminar el producto');
          }

          // Remover item del set de "actualizándose"
          setUpdatingItems(prev => {
            const newSet = new Set(prev);
            newSet.delete(itemId);
            return newSet;
          });
        },
        onCancel: () => {
          hideConfirmation();
        }
      });

    } catch (error) {
      console.error('Error al eliminar item:', error);
      showErrorToast('Error inesperado al eliminar producto');
    }
  };

  // Función para aplicar código de descuento (implementación placeholder)
  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      Alert.alert('Error', 'Por favor ingresa un código de descuento');
      return;
    }

    setApplyingDiscount(true);

    try {
      // TODO: Implementar lógica real para aplicar descuentos
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulación de carga
      showToast('Código de descuento aplicado');
      setDiscountCode('');
    } catch (error) {
      Alert.alert('Error', 'Código de descuento no válido');
    } finally {
      setApplyingDiscount(false);
    }
  };

  // Función para proceder al checkout
  const handleCheckout = () => {
    if (!cartItems || cartItems.length === 0) {
      Alert.alert('Carrito vacío', 'Agrega algunos productos antes de continuar');
      return;
    }

    // Obtener estadísticas del carrito si están disponibles
    if (getCartStats) {
      const stats = getCartStats();
      console.log('Procediendo al checkout con:', stats);

      // Navegar al checkout con datos y estadísticas
      navigation.navigate('Checkout', {
        cart: cart,
        cartItems: cartItems,
        total: cartTotal || subtotal,
        stats: stats
      });
    } else {
      // Navegar al checkout sin estadísticas
      navigation.navigate('Checkout', {
        cart: cart,
        cartItems: cartItems,
        total: cartTotal || subtotal
      });
    }
  };

  // Estado de carga inicial - Mostrar spinner mientras se determina el estado de autenticación
  if (!isAuthenticated && isAuthenticated !== false) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A4170" />
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </View>
    );
  }

  // Pantalla para usuarios no autenticados
  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        {/* Header con botón de retroceso */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate("Home")} style={styles.backButton}>
            <Image source={backIcon} style={{ width: 24, height: 24, resizeMode: 'contain' }} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tu carrito</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Estado vacío con botón de login */}
        <View style={styles.emptyStateContainer}>
          <Icon name="shopping-cart" size={80} color="#ccc" />
          <Text style={styles.emptyStateTitle}>Inicia sesión</Text>
          <Text style={styles.emptyStateText}>
            Debes iniciar sesión para ver tu carrito de compras
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginButtonText}>Iniciar sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Pantalla de error cuando hay problemas cargando el carrito
  if (cartError && !cartItems.length) {
    return (
      <View style={styles.container}>
        {/* Header con botón de retroceso */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate("Home")} style={styles.backButton}>
            <Image source={backIcon} style={{ width: 24, height: 24, resizeMode: 'contain' }} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tu carrito</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Estado de error con botón de reintentar */}
        <View style={styles.errorStateContainer}>
          <Icon name="error-outline" size={80} color="#e74c3c" />
          <Text style={styles.errorStateTitle}>Error al cargar carrito</Text>
          <Text style={styles.errorStateText}>{cartError}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => getActiveCart && getActiveCart(true)}
          >
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Pantalla principal del carrito de compras
  return (
    <View style={styles.container}>
      {/* Header con título y botón de navegación */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("Home")} style={styles.backButton}>
          <Image source={backIcon} style={{ width: 24, height: 24, resizeMode: 'contain' }} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tu carrito</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Banner de error (se muestra si hay errores pero el carrito tiene contenido) */}
      {cartError && (
        <View style={styles.errorBanner}>
          <Icon name="warning" size={16} color="#e74c3c" />
          <Text style={styles.errorBannerText}>{cartError}</Text>
          <TouchableOpacity onPress={() => clearCartError && clearCartError()}>
            <Icon name="close" size={16} color="#e74c3c" />
          </TouchableOpacity>
        </View>
      )}

      {/* ✅ NUEVO: Indicador de estado de carga doble */}
      {!initialLoadComplete && (
        <View style={styles.doubleLoadIndicator}>
          <ActivityIndicator size="small" color="#4A4170" />
          <Text style={styles.doubleLoadText}>Verificando nuevos elementos...</Text>
        </View>
      )}

      {/* ScrollView principal con RefreshControl */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4A4170']}
            tintColor="#4A4170"
            title="Actualizando carrito..."
          />
        }
      >
        {/* Indicador de carga inicial del carrito */}
        {cartLoading && cartItems.length === 0 && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4A4170" />
            <Text style={styles.loadingText}>Cargando carrito...</Text>
          </View>
        )}

        {/* Estado cuando el carrito está vacío */}
        {!cartLoading && cartItems.length === 0 && initialLoadComplete && (
          <View style={styles.emptyStateContainer}>
            <Icon name="shopping-cart" size={80} color="#ccc" />
            <Text style={styles.emptyStateTitle}>Tu carrito está vacío</Text>
            <Text style={styles.emptyStateText}>
              Agrega algunos productos para comenzar tu compra
            </Text>
            <TouchableOpacity
              style={styles.keepShoppingButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.keepShoppingText}>Seguir comprando</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Sección de estadísticas del carrito */}
        {cartItems.length > 0 && getCartStats && (
          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>
              {(() => {
                const stats = getCartStats();
                let text = `${stats.total} producto${stats.total !== 1 ? 's' : ''} en tu carrito`;
                if (stats.custom > 0) {
                  text += ` (${stats.custom} personalizado${stats.custom !== 1 ? 's' : ''})`;
                }
                return text;
              })()}
            </Text>
          </View>
        )}

        {/* Componente reutilizable que renderiza las tarjetas de productos del carrito */}
        <ShoppingCartCards
          cartItems={cartItems}
          updatingItems={updatingItems}
          isCustomProduct={isCustomProduct}
          getCustomizationDetails={getCustomizationDetails}
          getProductImage={getProductImage}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
        />

        {/* Sección que se muestra solo cuando hay productos en el carrito */}
        {cartItems.length > 0 && (
          <>
            {/* Botón para continuar comprando */}
            <TouchableOpacity
              style={styles.keepWorkingButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.keepWorkingText}>Seguir buscando</Text>
            </TouchableOpacity>

            {/* Contenedor de resumen de totales */}
            <View style={styles.totalContainer}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Sub Total</Text>
                <Text style={styles.totalValue}>${(subtotal || 0).toFixed(2)}</Text>
              </View>

              <View style={styles.totalSeparator} />

              <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, styles.totalBold]}>Total</Text>
                <Text style={[styles.totalValue, styles.totalBold]}>
                  ${(cartTotal || subtotal || 0).toFixed(2)}
                </Text>
              </View>
            </View>

            {/* Sección de código de descuento */}
            <Text style={styles.discountLabel}>Código de descuento</Text>
            <View style={styles.discountRow}>
              <TextInput
                placeholder="Introducir código"
                style={styles.discountInput}
                value={discountCode}
                onChangeText={setDiscountCode}
                editable={!applyingDiscount}
              />
              <TouchableOpacity
                style={[styles.applyButton, applyingDiscount && styles.buttonDisabled]}
                onPress={handleApplyDiscount}
                disabled={applyingDiscount}
              >
                {applyingDiscount ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.applyButtonText}>Aplicar</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Botón principal de completar compra */}
            <TouchableOpacity
              style={[styles.checkoutButton, cartLoading && styles.buttonDisabled]}
              onPress={handleCheckout}
              disabled={cartLoading}
            >
              {cartLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.checkoutButtonText}>Completar compra</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* Diálogo de confirmación personalizado para eliminar productos */}
      <ConfirmationDialog
        visible={alertState.confirmation.visible}
        title={alertState.confirmation.title}
        message={alertState.confirmation.message}
        onConfirm={alertState.confirmation.onConfirm}
        onCancel={alertState.confirmation.onCancel}
        confirmText={alertState.confirmation.confirmText}
        cancelText={alertState.confirmation.cancelText}
        isDangerous={alertState.confirmation.isDangerous}
      />
    </View>
  );
};

// Definición de estilos para todos los componentes
const styles = StyleSheet.create({
  // Contenedor principal de la pantalla
  container: {
    flex: 1,
    backgroundColor: '#ffffff'
  },
  // Header con título y navegación
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 25,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    zIndex: 1,
  },
  // Botón de retroceso en el header
  backButton: {
    padding: 4,
    marginTop: 15,
  },
  // Título del header
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 15,
  },
  // Banner de error que aparece encima del contenido
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    padding: 12,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  // Texto del banner de error
  errorBannerText: {
    flex: 1,
    fontSize: 12,
    color: '#e74c3c',
    marginLeft: 8,
    fontFamily: 'Poppins-Regular',
  },
  doubleLoadIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f4ff',
    padding: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4A4170',
  },
  doubleLoadText: {
    fontSize: 12,
    color: '#4A4170',
    marginLeft: 8,
    fontFamily: 'Poppins-Medium',
  },
  // Contenedor del ScrollView
  scrollContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  // Contenido interno del ScrollView
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  // Contenedor para indicadores de carga
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    minHeight: 200,
  },
  // Texto que acompaña los indicadores de carga
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    fontFamily: 'Poppins-Regular',
  },
  // Contenedor para estados vacíos
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    minHeight: 300,
  },
  // Título del estado vacío
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  // Texto descriptivo del estado vacío
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    marginHorizontal: 40,
    fontFamily: 'Poppins-Regular',
  },
  // Botón de iniciar sesión
  loginButton: {
    backgroundColor: '#4A4170',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 24,
  },
  // Texto del botón de iniciar sesión
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  // Contenedor para estados de error
  errorStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    minHeight: 300,
  },
  // Título del estado de error
  errorStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#e74c3c',
    marginTop: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  // Texto del estado de error
  errorStateText: {
    fontSize: 14,
    color: '#e74c3c',
    textAlign: 'center',
    marginTop: 8,
    marginHorizontal: 40,
    fontFamily: 'Poppins-Regular',
  },
  // Botón de reintentar
  retryButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 24,
  },
  // Texto del botón de reintentar
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  // Contenedor de estadísticas del carrito
  statsContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4A4170',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  // Texto de las estadísticas
  statsText: {
    fontSize: 14,
    color: '#4A4170',
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  // Botón "Seguir buscando"
  keepWorkingButton: {
    borderWidth: 1,
    borderColor: '#FDB4B7',
    borderRadius: 15,
    paddingVertical: 12,
    marginTop: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  // Texto del botón "Seguir buscando"
  keepWorkingText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  // Botón "Seguir comprando" (para carrito vacío)
  keepShoppingButton: {
    backgroundColor: '#4A4170',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 24,
  },
  // Texto del botón "Seguir comprando"
  keepShoppingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  // Contenedor del resumen de totales
  totalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(153,153,153,0.3)',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  // Fila individual de totales
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4
  },
  // Etiqueta de cada total
  totalLabel: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Poppins-Regular',
  },
  // Valor de cada total
  totalValue: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Poppins-Regular',
  },
  // Estilo para totales en negrita
  totalBold: {
    fontWeight: '700',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#4A4170',
  },
  // Separador entre subtotal y total
  totalSeparator: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(153,153,153,0.3)',
    marginVertical: 8,
  },
  // Etiqueta de código de descuento
  discountLabel: {
    marginTop: 20,
    fontSize: 16,
    color: '#333',
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
  },
  // Fila del código de descuento
  discountRow: {
    flexDirection: 'row',
    marginTop: 8
  },
  // Input para código de descuento
  discountInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(153,153,153,0.5)',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    fontFamily: 'Poppins-Regular',
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  // Botón para aplicar descuento
  applyButton: {
    backgroundColor: '#E8ACD2',
    borderRadius: 8,
    paddingHorizontal: 20,
    justifyContent: 'center',
    marginLeft: 8,
    minWidth: 80,
    height: 44,
  },
  // Texto del botón aplicar descuento
  applyButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
  },
  // Botón principal de checkout
  checkoutButton: {
    backgroundColor: '#FDB4B7',
    borderRadius: 15,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: -5,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    marginBottom: 90,
  },
  // Texto del botón de checkout
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  // Estilo para botones deshabilitados
  buttonDisabled: {
    opacity: 0.5,
  },
});

export default ShoppingCart;