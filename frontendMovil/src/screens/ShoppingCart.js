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
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import iconBasura from '../images/iconBasura.png';
import backIcon from '../images/backIcon.png';

const ShoppingCart = ({ navigation }) => {
  const { isAuthenticated, user } = useAuth();
  const {
    cart,
    cartLoading,
    cartError,
    updateItemQuantity,
    removeFromCart,
    getActiveCart,
    clearCartError
  } = useCart();

  const [refreshing, setRefreshing] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [applyingDiscount, setApplyingDiscount] = useState(false);
  const [updatingItems, setUpdatingItems] = useState(new Set());

  // Función para mostrar toast/mensaje
  const showToast = (message) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('Información', message);
    }
  };

  // Cargar carrito al montar el componente
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      getActiveCart();
    }
  }, [isAuthenticated, user?.id]);

  // Limpiar errores cuando cambie el componente
  useEffect(() => {
    return () => {
      clearCartError();
    };
  }, []);

  // Función para refrescar el carrito
  const onRefresh = async () => {
    if (!isAuthenticated) return;
    
    setRefreshing(true);
    try {
      await getActiveCart();
    } catch (error) {
      console.error('Error al refrescar carrito:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Actualizar cantidad con validación y feedback
  const handleUpdateQuantity = async (itemId, delta) => {
    try {
      if (!cart || !itemId) return;

      const currentItem = cart.items.find(item => 
        (item.itemId?._id || item.itemId) === itemId
      );
      
      if (!currentItem) {
        Alert.alert('Error', 'Producto no encontrado en el carrito');
        return;
      }

      const newQuantity = Math.max(1, currentItem.quantity + delta);
      
      // Verificar límite máximo
      if (newQuantity > 99) {
        Alert.alert('Límite alcanzado', 'No puedes agregar más de 99 unidades');
        return;
      }

      // Si es la misma cantidad, no hacer nada
      if (newQuantity === currentItem.quantity) return;

      // Marcar item como actualizándose
      setUpdatingItems(prev => new Set([...prev, itemId]));

      const result = await updateItemQuantity(itemId, newQuantity);

      if (result.success) {
        showToast(`Cantidad actualizada: ${newQuantity}`);
      } else {
        Alert.alert('Error', result.message || 'No se pudo actualizar la cantidad');
      }
    } catch (error) {
      console.error('Error al actualizar cantidad:', error);
      Alert.alert('Error', 'Error inesperado al actualizar cantidad');
    } finally {
      // Quitar marca de actualización
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  // Remover item con confirmación
  const handleRemoveItem = async (itemId, itemName) => {
    try {
      Alert.alert(
        'Confirmar eliminación',
        `¿Estás seguro de que quieres eliminar "${itemName}" del carrito?`,
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: async () => {
              // Marcar item como actualizándose
              setUpdatingItems(prev => new Set([...prev, itemId]));

              const result = await removeFromCart(itemId);

              if (result.success) {
                showToast(`${itemName} eliminado del carrito`);
              } else {
                Alert.alert('Error', result.message || 'No se pudo eliminar el producto');
              }

              // Quitar marca de actualización
              setUpdatingItems(prev => {
                const newSet = new Set(prev);
                newSet.delete(itemId);
                return newSet;
              });
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error al eliminar item:', error);
      Alert.alert('Error', 'Error inesperado al eliminar producto');
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
      // Por ahora es un placeholder
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showToast('Código de descuento aplicado'); // O mostrar error si no es válido
      setDiscountCode('');
    } catch (error) {
      Alert.alert('Error', 'Código de descuento no válido');
    } finally {
      setApplyingDiscount(false);
    }
  };

  // Proceder al checkout
  const handleCheckout = () => {
    if (!cart || !cart.items || cart.items.length === 0) {
      Alert.alert('Carrito vacío', 'Agrega algunos productos antes de continuar');
      return;
    }

    // Navegar a la pantalla de checkout
    navigation.navigate('Checkout', { 
      cart: cart,
      total: cart.total 
    });
  };

  // Función para obtener imagen del producto
  const getProductImage = (item) => {
    if (!item.itemId) return 'https://via.placeholder.com/80x80/f0f0f0/666666?text=Sin+Imagen';

    const product = item.itemId;
    
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      const firstImage = product.images[0];
      if (typeof firstImage === 'object' && firstImage.image) {
        return firstImage.image;
      }
      if (typeof firstImage === 'string') {
        return firstImage;
      }
    }

    if (product.image) {
      return product.image;
    }

    return 'https://via.placeholder.com/80x80/f0f0f0/666666?text=Sin+Imagen';
  };

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
  if (cartError && !cart) {
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
            onPress={() => getActiveCart()}
          >
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Calcular totales
  const subtotal = cart?.items?.reduce((sum, item) => sum + (item.subtotal || 0), 0) || 0;
  const envio = 10; // Costo fijo de envío
  const total = subtotal + envio;

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
          <TouchableOpacity onPress={clearCartError}>
            <Icon name="close" size={16} color="#e74c3c" />
          </TouchableOpacity>
        </View>
      )}

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
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
        {cartLoading && !cart && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4A4170" />
            <Text style={styles.loadingText}>Cargando carrito...</Text>
          </View>
        )}

        {/* Carrito vacío */}
        {!cartLoading && (!cart || !cart.items || cart.items.length === 0) && (
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

        {/* Items del carrito */}
        {cart && cart.items && cart.items.length > 0 && cart.items.map((item, index) => {
          const itemId = item.itemId?._id || item.itemId;
          const isUpdating = updatingItems.has(itemId);
          const product = item.itemId || {};

          return (
            <View key={`${itemId}-${index}`} style={[
              styles.cartItem,
              isUpdating && styles.cartItemUpdating
            ]}>
              {/* Overlay de loading */}
              {isUpdating && (
                <View style={styles.itemLoadingOverlay}>
                  <ActivityIndicator size="small" color="#4A4170" />
                </View>
              )}

              <Image 
                source={{ uri: getProductImage(item) }} 
                style={styles.itemImage} 
              />
              
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>
                  {product.name || 'Producto sin nombre'}
                </Text>
                <Text style={styles.itemPrice}>
                  ${product.price || item.subtotal / (item.quantity || 1) || 0}
                </Text>
              </View>

              <View style={styles.rightSection}>
                {/* Botón de eliminar */}
                <TouchableOpacity 
                  style={[styles.trashButton, isUpdating && styles.buttonDisabled]}
                  onPress={() => handleRemoveItem(itemId, product.name)}
                  disabled={isUpdating}
                >
                  <Image source={iconBasura} style={styles.trashIcon} />
                </TouchableOpacity>

                {/* Controles de cantidad */}
                <View style={styles.quantityContainer}>
                  <TouchableOpacity
                    style={[styles.quantityButton, isUpdating && styles.buttonDisabled]}
                    onPress={() => handleUpdateQuantity(itemId, -1)}
                    disabled={isUpdating || item.quantity <= 1}
                  >
                    <Text style={styles.quantityButtonText}>-</Text>
                  </TouchableOpacity>
                  
                  <Text style={styles.quantityText}>{item.quantity || 0}</Text>
                  
                  <TouchableOpacity
                    style={[styles.quantityButton, isUpdating && styles.buttonDisabled]}
                    onPress={() => handleUpdateQuantity(itemId, 1)}
                    disabled={isUpdating || item.quantity >= 99}
                  >
                    <Text style={styles.quantityButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}

        {/* Botón seguir comprando */}
        {cart && cart.items && cart.items.length > 0 && (
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
                <Text style={styles.totalValue}>${subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Envío</Text>
                <Text style={styles.totalValue}>${envio.toFixed(2)}</Text>
              </View>

              <View style={styles.totalSeparator} />

              <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, styles.totalBold]}>Total</Text>
                <Text style={[styles.totalValue, styles.totalBold]}>${total.toFixed(2)}</Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingVertical: 25,
  },
  backButton: { 
    padding: 4 
  },
  headerTitle: { 
    flex: 1, 
    textAlign: 'center', 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#333' 
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
  scrollContent: { 
    padding: 16 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
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
  cartItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    position: 'relative',
  },
  cartItemUpdating: {
    opacity: 0.7,
  },
  itemLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    zIndex: 10,
  },
  itemImage: { 
    width: 80,
    height: 80,
    borderRadius: 12, 
    resizeMode: 'cover' 
  },
  itemDetails: { 
    flex: 1, 
    marginLeft: 12, 
    marginRight: 8 
  },
  itemName: { 
    fontSize: 16, 
    fontWeight: '500', 
    color: '#333', 
    marginBottom: 4,
    fontFamily: 'Poppins-Medium',
  },
  itemPrice: { 
    fontSize: 13, 
    color: '#3C3550',
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FDB4B7',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 8,
  },
  quantityButton: { 
    paddingHorizontal: 6,
    opacity: 1,
  },
  quantityButtonText: { 
    fontSize: 16, 
    color: '#FDB4B7', 
    fontWeight: 'bold' 
  },
  quantityText: { 
    fontSize: 14, 
    marginHorizontal: 4,
    fontFamily: 'Poppins-Medium',
  },
  trashButton: { 
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center' 
  },
  trashIcon: { 
    width: 18,
    height: 18,
    tintColor: '#000'
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  keepWorkingButton: {
    borderWidth: 1,
    borderColor: '#FDB4B7',
    borderRadius: 15,
    paddingVertical: 10,
    marginTop: 10,
    alignItems: 'center',
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
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(153,153,153,0.5)',
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
  },
  totalSeparator: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(153,153,153,0.5)',
    marginVertical: 8,
  },
  discountLabel: { 
    marginTop: 16, 
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
    paddingHorizontal: 8,
    height: 40,
    fontFamily: 'Poppins-Regular',
  },
  applyButton: {
    backgroundColor: '#E8ACD2',
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    marginLeft: 8,
    minWidth: 80,
  },
  applyButtonText: { 
    color: '#fff', 
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  checkoutButton: {
    backgroundColor: '#FDB4B7',
    borderRadius: 15,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  checkoutButtonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
});

export default ShoppingCart;