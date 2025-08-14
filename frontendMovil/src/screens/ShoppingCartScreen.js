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
import iconBasura from '../images/iconBasura.png';
import backIcon from '../images/backIcon.png';

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
  }, [isAuthenticated, user?.id, getActiveCart]);

  // Limpiar errores cuando cambie el componente
  useEffect(() => {
    return () => {
      if (clearCartError) {
        clearCartError();
      }
    };
  }, [clearCartError]);

  // Log para debugging - Ver estadísticas del carrito
  useEffect(() => {
    if (cartItems.length > 0) {
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
  }, [cartItems, getCartStats, isCustomProduct]);

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

  // Actualizamos cantidad con mejor manejo de tipos
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

      console.log(`Actualizando cantidad de ${isCustomProduct(currentItem) ? 'producto personalizado' : 'producto'}: ${currentItem.name}`);

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

  // Removemos item con mejor manejo de tipos
  const handleRemoveItem = async (itemId, itemName, itemType) => {
    try {
      if (!removeFromCart) {
        Alert.alert('Error', 'Función no disponible');
        return;
      }

      const productTypeText = itemType === 'custom' ? 'producto personalizado' : 'producto';

      Alert.alert(
        'Confirmar eliminación',
        `¿Estás seguro de que quieres eliminar este ${productTypeText} "${itemName}" del carrito?`,
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: async () => {
              setUpdatingItems(prev => new Set([...prev, itemId]));

              console.log(`Eliminando ${productTypeText}: ${itemName}`);

              const result = await removeFromCart(itemId);

              if (result && result.success) {
                showToast(`${itemName} eliminado del carrito`);
              } else {
                Alert.alert('Error', result?.message || 'No se pudo eliminar el producto');
              }

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
    const stats = getCartStats();
    console.log('Procediendo al checkout con:', stats);

    navigation.navigate('Checkout', {
      cart: cart,
      cartItems: cartItems,
      total: cartTotal || subtotal,
      stats: stats
    });
  };

  //COMPONENTE PARA MOSTRAR DETALLES DE PERSONALIZACIÓN
  const CustomizationDetails = ({ item }) => {
    const details = getCustomizationDetails(item);

    if (!details) return null;

    return (
      <View style={styles.customizationContainer}>
        <Text style={styles.customizationTitle}>🎨 Personalización:</Text>
        {details.extraComments && (
          <Text style={styles.customizationText}>• {details.extraComments}</Text>
        )}
        {details.designDetails && (
          <Text style={styles.customizationText}>• Diseño: {details.designDetails}</Text>
        )}
        {details.materialPreferences && (
          <Text style={styles.customizationText}>• Material: {details.materialPreferences}</Text>
        )}
        {details.colorPreferences && (
          <Text style={styles.customizationText}>• Color: {details.colorPreferences}</Text>
        )}
        {details.sizePreferences && (
          <Text style={styles.customizationText}>• Tamaño: {details.sizePreferences}</Text>
        )}
      </View>
    );
  };

  //Componente para mostrar imagen o emoji personalizado
  const ProductImageOrEmoji = ({ item, isCustom }) => {
    if (isCustom) {
      return (
        <View style={styles.customProductContainer}>
          <Text style={styles.customProductEmoji}>🎨</Text>
          <Text style={styles.customProductLabel}>Personalizado</Text>
        </View>
      );
    }

    return (
      <Image
        source={{ uri: getProductImage(item) }}
        style={styles.itemImage}
      />
    );
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
        {cartItems.length > 0 && (
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

        {/* ITEMS DEL CARRITO */}
        {cartItems.map((item, index) => {
          const itemId = item.id;
          const isUpdating = updatingItems.has(itemId);
          const isCustom = isCustomProduct(item);

          return (
            <View key={`${itemId}-${index}`} style={[
              styles.cartItem,
              isUpdating && styles.cartItemUpdating,
              isCustom && styles.cartItemCustom 
            ]}>
              {/* Overlay de loading */}
              {isUpdating && (
                <View style={styles.itemLoadingOverlay}>
                  <ActivityIndicator size="small" color="#4A4170" />
                </View>
              )}

              {/* Mostramos emoji para productos personalizados o imagen normal */}
              <ProductImageOrEmoji item={item} isCustom={isCustom} />

              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>
                  {item.name || 'Producto sin nombre'}
                </Text>

                {/* PRECIO CON INDICADOR DE TIPO */}
                <View style={styles.priceContainer}>
                  <Text style={styles.itemPrice}>
                    ${item.price || 0}
                  </Text>
                </View>

                {/* DESCRIPCIÓN PARA PRODUCTOS PERSONALIZADOS */}
                {item.description && (
                  <Text style={styles.itemDescription} numberOfLines={2}>
                    {item.description}
                  </Text>
                )}

                {/* DETALLES DE PERSONALIZACIÓN */}
                {isCustom && <CustomizationDetails item={item} />}
              </View>

              <View style={styles.rightSection}>
                {/* Botón de eliminar */}
                <TouchableOpacity
                  style={[styles.trashButton, isUpdating && styles.buttonDisabled]}
                  onPress={() => handleRemoveItem(itemId, item.name, item.itemType)}
                  disabled={isUpdating}
                >
                  <Image source={iconBasura} style={styles.trashIcon} />
                </TouchableOpacity>

                {/* SUBTOTAL DEL ITEM */}
                <Text style={styles.itemSubtotal}>
                  ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                </Text>
              </View>
            </View>
          );
        })}

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
    </View>
  );
};

// ESTILOS CON SCROLL Y EMOJI PERSONALIZADO
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
  cartItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
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
  cartItemCustom: {
    borderLeftWidth: 4,
    borderLeftColor: '#E8ACD2',
    backgroundColor: '#fefefe',
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
  customProductContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E8ACD2',
    borderStyle: 'dashed',
  },
  customProductEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  customProductLabel: {
    fontSize: 8,
    color: '#E8ACD2',
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
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
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 13,
    color: '#3C3550',
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  customPriceLabel: {
    fontSize: 10,
    color: '#E8ACD2',
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    marginLeft: 6,
    fontStyle: 'italic',
  },
  itemDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    fontFamily: 'Poppins-Regular',
  },
  customizationContainer: {
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#E8ACD2',
  },
  customizationTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#E8ACD2',
    marginBottom: 4,
    fontFamily: 'Poppins-SemiBold',
  },
  customizationText: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
    fontFamily: 'Poppins-Regular',
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
    alignSelf: 'flex-start',
  },
  quantityButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    opacity: 1,
  },
  quantityButtonText: {
    fontSize: 16,
    color: '#FDB4B7',
    fontWeight: 'bold'
  },
  quantityText: {
    fontSize: 14,
    marginHorizontal: 12,
    fontFamily: 'Poppins-Medium',
    minWidth: 20,
    textAlign: 'center',
  },
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minHeight: 80,
  },
  trashButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center'
  },
  trashIcon: {
    width: 18,
    height: 18,
    tintColor: '#000'
  },
  itemSubtotal: {
    fontSize: 14,
    color: '#4A4170',
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    marginTop: 8,
    textAlign: 'right',
  },
  buttonDisabled: {
    opacity: 0.5,
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
});

export default ShoppingCart;