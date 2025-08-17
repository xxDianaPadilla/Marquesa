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
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import Icon from 'react-native-vector-icons/MaterialIcons';
import backIcon from '../images/backIcon.png';
import ShoppingCartCards from '../components/ShoppingCartCards';
import { ConfirmationDialog } from '../components/CustomAlerts'; 
import { useAlert } from '../hooks/useAlert'; 

const ShoppingCart = ({ navigation }) => {
  const { isAuthenticated, user } = useAuth();
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

  const [refreshing, setRefreshing] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [applyingDiscount, setApplyingDiscount] = useState(false);
  const [updatingItems, setUpdatingItems] = useState(new Set());

  // Hook para alertas personalizadas
  const {
    alertState,
    showConfirmation,
    hideConfirmation,
    showErrorToast,
    showSuccessToast
  } = useAlert();

  // Función para mostrar toast/mensaje
  const showToast = (message) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('Información', message);
    }
  };

  // ✅ CORREGIDO: Cargar carrito al montar el componente - CON ARRAY DE DEPENDENCIAS
  useEffect(() => {
    if (isAuthenticated && user?.id && getActiveCart) {
      getActiveCart();
    }
  }, [isAuthenticated, user?.id]); // ✅ Dependencias específicas y estables

  // ✅ CORREGIDO: Limpiar errores cuando cambie el componente - CON ARRAY DE DEPENDENCIAS
  useEffect(() => {
    return () => {
      if (clearCartError) {
        clearCartError();
      }
    };
  }, []); // ✅ Array vacío porque es cleanup

  // Log para debugging - Ver estadísticas del carrito
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
  }, [cartItems.length]); // ✅ Solo depende de la longitud del array

  // Función para refrescar el carrito
  const onRefresh = async () => {
    if (!isAuthenticated || !getActiveCart) return;

    setRefreshing(true);
    try {
      await getActiveCart(true);
    } catch (error) {
      console.error('Error al refrescar carrito:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Manejador para actualizar cantidad - Se pasa al componente ShoppingCartCards
  const handleUpdateQuantity = async (itemId, delta) => {
    try {
      if (!cartItems || !itemId || !updateItemQuantity) return;

      // Buscamos el item en cartItems transformados
      const currentItem = cartItems.find(item => item.id === itemId);

      if (!currentItem) {
        Alert.alert('Error', 'Producto no encontrado en el carrito');
        return;
      }

      const newQuantity = Math.max(1, currentItem.quantity + delta);

      if (newQuantity > 99) {
        Alert.alert('Límite alcanzado', 'No puedes agregar más de 99 unidades');
        return;
      }

      if (newQuantity === currentItem.quantity) return;

      // Marcar item como actualizándose
      setUpdatingItems(prev => new Set([...prev, itemId]));

      console.log(`Actualizando cantidad de ${isCustomProduct ? isCustomProduct(currentItem) ? 'producto personalizado' : 'producto' : 'producto'}: ${currentItem.name}`);

      const result = await updateItemQuantity(itemId, newQuantity);

      if (result && result.success) {
        showToast(`Cantidad actualizada: ${newQuantity}`);
      } else {
        Alert.alert('Error', result?.message || 'No se pudo actualizar la cantidad');
      }
    } catch (error) {
      console.error('Error al actualizar cantidad:', error);
      Alert.alert('Error', 'Error inesperado al actualizar cantidad');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  // Manejador para remover item - MODIFICADO PARA USAR ALERTA PERSONALIZADA
  const handleRemoveItem = async (itemId, itemName, itemType) => {
    try {
      if (!removeFromCart) {
        showErrorToast('Función no disponible');
        return;
      }

      const productTypeText = itemType === 'custom' ? 'producto personalizado' : 'producto';

      // Usar ConfirmationDialog personalizado en lugar de Alert.alert
      showConfirmation({
        title: 'Confirmar eliminación',
        message: `¿Estás seguro de que quieres eliminar este ${productTypeText} "${itemName}" del carrito?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        isDangerous: true, // Marcar como peligroso para que use color rojo
        onConfirm: async () => {
          hideConfirmation();
          
          setUpdatingItems(prev => new Set([...prev, itemId]));

          console.log(`Eliminando ${productTypeText}: ${itemName}`);

          const result = await removeFromCart(itemId);

          if (result && result.success) {
            showSuccessToast(`${itemName} eliminado del carrito`);
          } else {
            showErrorToast(result?.message || 'No se pudo eliminar el producto');
          }

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

  // Aplicar código de descuento (placeholder)
  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      Alert.alert('Error', 'Por favor ingresa un código de descuento');
      return;
    }

    setApplyingDiscount(true);

    try {
      // Aquí implementarías la lógica para aplicar descuentos
      await new Promise(resolve => setTimeout(resolve, 1000));
      showToast('Código de descuento aplicado');
      setDiscountCode('');
    } catch (error) {
      Alert.alert('Error', 'Código de descuento no válido');
    } finally {
      setApplyingDiscount(false);
    }
  };

  // Proceder al checkout
  const handleCheckout = () => {
    if (!cartItems || cartItems.length === 0) {
      Alert.alert('Carrito vacío', 'Agrega algunos productos antes de continuar');
      return;
    }

    // Mostramos estadísticas antes del checkout
    if (getCartStats) {
      const stats = getCartStats();
      console.log('Procediendo al checkout con:', stats);

      navigation.navigate('Checkout', {
        cart: cart,
        cartItems: cartItems,
        total: cartTotal || subtotal,
        stats: stats
      });
    } else {
      navigation.navigate('Checkout', {
        cart: cart,
        cartItems: cartItems,
        total: cartTotal || subtotal
      });
    }
  };

  // Verificar que los contextos estén disponibles
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

  // Si no está autenticado
  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Image source={backIcon} style={{ width: 24, height: 24, resizeMode: 'contain' }} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tu carrito</Text>
          <View style={{ width: 24 }} />
        </View>

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

  // Si hay error y no hay datos del carrito
  if (cartError && !cartItems.length) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Image source={backIcon} style={{ width: 24, height: 24, resizeMode: 'contain' }} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tu carrito</Text>
          <View style={{ width: 24 }} />
        </View>

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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Image source={backIcon} style={{ width: 24, height: 24, resizeMode: 'contain' }} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tu carrito</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Indicador de error */}
      {cartError && (
        <View style={styles.errorBanner}>
          <Icon name="warning" size={16} color="#e74c3c" />
          <Text style={styles.errorBannerText}>{cartError}</Text>
          <TouchableOpacity onPress={() => clearCartError && clearCartError()}>
            <Icon name="close" size={16} color="#e74c3c" />
          </TouchableOpacity>
        </View>
      )}

      {/* SCROLL VIEW MEJORADO */}
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
          />
        }
      >
        {/* Loading inicial */}
        {cartLoading && cartItems.length === 0 && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4A4170" />
            <Text style={styles.loadingText}>Cargando carrito...</Text>
          </View>
        )}

        {/* Carrito vacío */}
        {!cartLoading && cartItems.length === 0 && (
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

        {/* ESTADÍSTICAS DEL CARRITO */}
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

        {/* COMPONENTE REUTILIZABLE PARA ITEMS DEL CARRITO */}
        <ShoppingCartCards
          cartItems={cartItems}
          updatingItems={updatingItems}
          isCustomProduct={isCustomProduct}
          getCustomizationDetails={getCustomizationDetails}
          getProductImage={getProductImage}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
        />

        {/* Botón seguir comprando y totales */}
        {cartItems.length > 0 && (
          <>
            <TouchableOpacity
              style={styles.keepWorkingButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.keepWorkingText}>Seguir buscando</Text>
            </TouchableOpacity>

            {/* Resumen de totales */}
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

            {/* Código de descuento */}
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

            {/* Botón de compra */}
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

      {/* COMPONENTE DE CONFIRMACIÓN PERSONALIZADO */}
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

// ESTILOS (mantener los mismos)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff'
  },
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
  backButton: {
    padding: 4,
    marginTop: 15,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 15,
  },
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
  errorBannerText: {
    flex: 1,
    fontSize: 12,
    color: '#e74c3c',
    marginLeft: 8,
    fontFamily: 'Poppins-Regular',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    minHeight: 200,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    fontFamily: 'Poppins-Regular',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    minHeight: 300,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    marginHorizontal: 40,
    fontFamily: 'Poppins-Regular',
  },
  loginButton: {
    backgroundColor: '#4A4170',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 24,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  errorStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    minHeight: 300,
  },
  errorStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#e74c3c',
    marginTop: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  errorStateText: {
    fontSize: 14,
    color: '#e74c3c',
    textAlign: 'center',
    marginTop: 8,
    marginHorizontal: 40,
    fontFamily: 'Poppins-Regular',
  },
  retryButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 24,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
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
  statsText: {
    fontSize: 14,
    color: '#4A4170',
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  keepWorkingButton: {
    borderWidth: 1,
    borderColor: '#FDB4B7',
    borderRadius: 15,
    paddingVertical: 12,
    marginTop: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  keepWorkingText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  keepShoppingButton: {
    backgroundColor: '#4A4170',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 24,
  },
  keepShoppingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
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
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4
  },
  totalLabel: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Poppins-Regular',
  },
  totalValue: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Poppins-Regular',
  },
  totalBold: {
    fontWeight: '700',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#4A4170',
  },
  totalSeparator: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(153,153,153,0.3)',
    marginVertical: 8,
  },
  discountLabel: {
    marginTop: 20,
    fontSize: 16,
    color: '#333',
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
  },
  discountRow: {
    flexDirection: 'row',
    marginTop: 8
  },
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
  applyButton: {
    backgroundColor: '#E8ACD2',
    borderRadius: 8,
    paddingHorizontal: 20,
    justifyContent: 'center',
    marginLeft: 8,
    minWidth: 80,
    height: 44,
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
  },
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
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

export default ShoppingCart;