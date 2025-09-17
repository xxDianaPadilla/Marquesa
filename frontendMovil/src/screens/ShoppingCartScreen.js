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
  Platform,
  KeyboardAvoidingView
} from 'react-native';

// Importación de contextos personalizados
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

// Importación de iconos y componentes
import Icon from 'react-native-vector-icons/MaterialIcons';
import backIcon from '../images/backIcon.png';
import ShoppingCartCards from '../components/ShoppingCartCards';
import { ConfirmationDialog, ToastDialog } from '../components/CustomAlerts';
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
  const [refreshing, setRefreshing] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [applyingDiscount, setApplyingDiscount] = useState(false);
  const [updatingItems, setUpdatingItems] = useState(new Set());
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountError, setDiscountError] = useState(null);
  const [discountSuccess, setDiscountSuccess] = useState('');

  // Hook personalizado para manejar alertas y confirmaciones
  const {
    alertState,
    showConfirmation,
    hideConfirmation,
    showErrorToast,
    showSuccessToast,
    hideToast
  } = useAlert();

  // Función para mostrar mensajes toast multiplataforma
  const showToast = (message, type = 'info') => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      // Para iOS usar el toast personalizado
      if (type === 'error') {
        showErrorToast(message);
      } else {
        showSuccessToast(message);
      }
    }
  };

  const validatePromotionalCode = async (code) => {
    try {
      const response = await fetch(`https://marquesa.onrender.com/api/clients/${user.id}/validateCode`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: code.trim().toUpperCase() })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return {
          valid: true,
          discountData: data.discountData
        };
      } else {
        return {
          valid: false,
          message: data.message || 'Código promocional no válido'
        };
      }
    } catch (error) {
      console.error('Error validando código:', error);
      return {
        valid: false,
        message: 'Error al validar el código. Inténtalo nuevamente.'
      };
    }
  };

  const calculateDiscountAmount = (discountPercentage, subtotal) => {
    const percentage = parseFloat(discountPercentage.replace(/[^0-9.]/g, ''));
    const discountAmount = (subtotal * percentage) / 100;

    console.log('Debug cálculo descuento:');
    console.log('- Percentage string:', discountPercentage);
    console.log('- Percentage number:', percentage);
    console.log('- Subtotal:', subtotal);
    console.log('- Discount amount:', discountAmount);

    return discountAmount;
  };

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      setDiscountError('Por favor ingresa un código de descuento');
      showErrorToast('Por favor ingresa un código de descuento');
      return;
    }

    if (!user?.id) {
      setDiscountError('Error: Usuario no identificado');
      showErrorToast('Error: Usuario no identificado');
      return;
    }

    if (applyingDiscount) return;

    setApplyingDiscount(true);
    setDiscountError(null);
    setDiscountSuccess('');

    try {
      // Validar el código con el backend
      const validation = await validatePromotionalCode(discountCode);

      if (validation.valid) {
        const { discountData } = validation;

        // Calcular el monto del descuento
        const calculatedDiscountAmount = calculateDiscountAmount(discountData.discount, subtotal);

        // Actualizar estados locales
        setAppliedDiscount({
          ...discountData,
          amount: calculatedDiscountAmount
        });
        setDiscountAmount(calculatedDiscountAmount);

        // Mensajes de éxito
        const successMessage = `¡Código aplicado! ${discountData.name} - ${discountData.discount}`;
        setDiscountSuccess(successMessage);
        showSuccessToast(`¡Descuento aplicado! Ahorras $${calculatedDiscountAmount.toFixed(2)}`);

        // Limpiar input y mensaje después de un tiempo
        setTimeout(() => {
          setDiscountCode('');
          setDiscountSuccess('');
        }, 3000);

        console.log('Descuento aplicado:', {
          code: discountCode,
          amount: calculatedDiscountAmount,
          discountData: discountData
        });

      } else {
        setDiscountError(validation.message);
        showErrorToast(validation.message);
        setAppliedDiscount(null);
        setDiscountAmount(0);
      }
    } catch (error) {
      console.error('Error aplicando descuento:', error);
      const errorMessage = 'Error al aplicar el código. Inténtalo nuevamente.';
      setDiscountError(errorMessage);
      showErrorToast(errorMessage);
      setAppliedDiscount(null);
      setDiscountAmount(0);
    } finally {
      setApplyingDiscount(false);
    }
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setDiscountAmount(0);
    setDiscountCode('');
    setDiscountError(null);
    setDiscountSuccess('');
    showSuccessToast('Descuento removido');
  };

  const subtotalWithDiscount = Math.max(0, (subtotal || 0) - discountAmount);
  const finalTotal = subtotalWithDiscount;

  useEffect(() => {
    const handleNavigationRefresh = async () => {
      if (route.params?.refresh && isAuthenticated && user?.id && getActiveCart) {
        console.log('Refrescando carrito por navegación con parámetros:', route.params);

        await getActiveCart(true);

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

        await getActiveCart(true);

        setTimeout(async () => {
          console.log('Segunda carga del carrito (verificación de nuevos items)');
          await getActiveCart(true);
          setInitialLoadComplete(true);
          console.log('Doble carga completada');
        }, 1500);
      }
    };

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
    if (cartItems.length === 0 && appliedDiscount) {
      setAppliedDiscount(null);
      setDiscountAmount(0);
      setDiscountCode('');
      setDiscountError(null);
      setDiscountSuccess('');
    }
  }, [cartItems.length, appliedDiscount]);

  useEffect(() => {
    return () => {
      if (clearCartError) {
        clearCartError();
      }
    };
  }, []);

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

  const onRefresh = async () => {
    if (!isAuthenticated || !getActiveCart) return;

    console.log('Pull-to-refresh activado');
    setRefreshing(true);
    try {
      await getActiveCart(true);

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

  const handleUpdateQuantity = async (itemId, delta) => {
    try {
      if (!cartItems || !itemId || !updateItemQuantity) return;

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

      setUpdatingItems(prev => new Set([...prev, itemId]));

      console.log(`Actualizando cantidad de ${isCustomProduct ? isCustomProduct(currentItem) ? 'producto personalizado' : 'producto' : 'producto'}: ${currentItem.name}`);

      const result = await updateItemQuantity(itemId, newQuantity);

      if (result && result.success) {
        showToast(`Cantidad actualizada: ${newQuantity}`);

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
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (itemId, itemName, itemType) => {
    try {
      if (!removeFromCart) {
        showErrorToast('Función no disponible');
        return;
      }

      const productTypeText = itemType === 'custom' ? 'producto personalizado' : 'producto';

      showConfirmation({
        title: 'Confirmar eliminación',
        message: `¿Estás seguro de que quieres eliminar este ${productTypeText} "${itemName}" del carrito?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        isDangerous: true,
        onConfirm: async () => {
          hideConfirmation();

          setUpdatingItems(prev => new Set([...prev, itemId]));

          console.log(`Eliminando ${productTypeText}: ${itemName}`);

          const result = await removeFromCart(itemId);

          if (result && result.success) {
            showSuccessToast(`${itemName} eliminado del carrito`);

            setTimeout(() => {
              getActiveCart(true);
            }, 500);
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

  const handleCheckout = () => {
    if (!cartItems || cartItems.length === 0) {
      Alert.alert('Carrito vacío', 'Agrega algunos productos antes de continuar');
      return;
    }

    // Preparar datos con descuento aplicado
    const checkoutData = {
      cart: cart,
      cartItems: cartItems,
      originalSubtotal: subtotal,
      subtotal: subtotalWithDiscount,
      total: finalTotal,
      discountApplied: !!appliedDiscount,
      discountAmount: discountAmount,
      discountInfo: appliedDiscount,
    };

    if (getCartStats) {
      const stats = getCartStats();
      console.log('Procediendo al proceso de pago con descuento:', {
        ...checkoutData,
        stats: stats
      });

      navigation.navigate('PaymentProcess', {
        ...checkoutData,
        stats: stats
      });
    } else {
      console.log('Procediendo al checkout con descuento:', checkoutData);
      navigation.navigate('PaymentProcess', checkoutData);
    }
  };

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

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate("Home")} style={styles.backButton}>
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

  if (cartError && !cartItems.length) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate("Home")} style={styles.backButton}>
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate("Home")} style={styles.backButton}>
            <Image source={backIcon} style={{ width: 24, height: 24, resizeMode: 'contain' }} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tu carrito</Text>
          <View style={{ width: 24 }} />
        </View>

        {cartError && (
          <View style={styles.errorBanner}>
            <Icon name="warning" size={16} color="#e74c3c" />
            <Text style={styles.errorBannerText}>{cartError}</Text>
            <TouchableOpacity onPress={() => clearCartError && clearCartError()}>
              <Icon name="close" size={16} color="#e74c3c" />
            </TouchableOpacity>
          </View>
        )}

        {/* BANNER DE DESCUENTO APLICADO */}
        {appliedDiscount && (
          <View style={styles.discountBanner}>
            <View style={styles.discountBannerContent}>
              <Icon name="check-circle" size={16} color="#10b981" />
              <View style={styles.discountBannerText}>
                <Text style={styles.discountBannerTitle}>
                  Descuento activo: {appliedDiscount.name}
                </Text>
                <Text style={styles.discountBannerSubtitle}>
                  Ahorras ${discountAmount.toFixed(2)}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleRemoveDiscount}>
              <Icon name="close" size={16} color="#10b981" />
            </TouchableOpacity>
          </View>
        )}

        {!initialLoadComplete && (
          <View style={styles.doubleLoadIndicator}>
            <ActivityIndicator size="small" color="#4A4170" />
            <Text style={styles.doubleLoadText}>Verificando nuevos elementos...</Text>
          </View>
        )}

        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={[
            styles.scrollContent,
            cartItems.length > 0 && { paddingBottom: 120 }
          ]}
          showsVerticalScrollIndicator={true}
          scrollEventThrottle={16}
          keyboardShouldPersistTaps="handled"
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
          {cartLoading && cartItems.length === 0 && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4A4170" />
              <Text style={styles.loadingText}>Cargando carrito...</Text>
            </View>
          )}

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

          <ShoppingCartCards
            cartItems={cartItems}
            updatingItems={updatingItems}
            isCustomProduct={isCustomProduct}
            getCustomizationDetails={getCustomizationDetails}
            getProductImage={getProductImage}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
          />

          {cartItems.length > 0 && (
            <>
              <TouchableOpacity
                style={styles.keepWorkingButton}
                onPress={() => navigation.navigate('Home')}
              >
                <Text style={styles.keepWorkingText}>Seguir buscando</Text>
              </TouchableOpacity>

              {/* CONTENEDOR DE TOTALES ACTUALIZADO */}
              <View style={styles.totalContainer}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Sub Total</Text>
                  <Text style={styles.totalValue}>${(subtotal || 0).toFixed(2)}</Text>
                </View>

                {appliedDiscount && discountAmount > 0 && (
                  <>
                    <View style={styles.discountRow}>
                      <View style={styles.discountInfo}>
                        <Text style={styles.discountLabel}>{appliedDiscount.name}</Text>
                        <Text style={styles.discountCode}>Código: {appliedDiscount.code}</Text>
                      </View>
                      <Text style={styles.discountValue}>-${discountAmount.toFixed(2)}</Text>
                    </View>
                  </>
                )}

                <View style={styles.totalSeparator} />

                <View style={styles.totalRow}>
                  <Text style={[styles.totalLabel, styles.totalBold]}>Total</Text>
                  <Text style={[styles.totalValue, styles.totalBold]}>
                    ${finalTotal.toFixed(2)}
                  </Text>
                </View>
              </View>

              {/* SECCIÓN DE CÓDIGO DE DESCUENTO MEJORADA */}
              {!appliedDiscount && (
                <>
                  <Text style={styles.discountInputLabel}>Código de descuento</Text>
                  <View style={styles.discountRow}>
                    <TextInput
                      placeholder="Introducir código"
                      style={styles.discountInput}
                      value={discountCode}
                      onChangeText={(text) => {
                        setDiscountCode(text);
                        if (discountError) setDiscountError(null);
                      }}
                      editable={!applyingDiscount}
                      returnKeyType="done"
                      blurOnSubmit={true}
                      maxLength={20}
                    />
                    <TouchableOpacity
                      style={[styles.applyButton, (applyingDiscount || !discountCode.trim()) && styles.buttonDisabled]}
                      onPress={handleApplyDiscount}
                      disabled={applyingDiscount || !discountCode.trim()}
                    >
                      {applyingDiscount ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={styles.applyButtonText}>Aplicar</Text>
                      )}
                    </TouchableOpacity>
                  </View>

                  {/* Mensajes de error y éxito */}
                  {discountError && (
                    <View style={styles.discountErrorContainer}>
                      <Text style={styles.discountErrorText}>⚠️ {discountError}</Text>
                    </View>
                  )}

                  {discountSuccess && (
                    <View style={styles.discountSuccessContainer}>
                      <Text style={styles.discountSuccessText}>✅ {discountSuccess}</Text>
                    </View>
                  )}

                  {/* Hint sobre códigos */}
                  <View style={styles.discountHint}>
                    <Text style={styles.discountHintText}>
                      Usa los códigos que has ganado en la ruleta de descuentos
                    </Text>
                  </View>
                </>
              )}

              <TouchableOpacity
                style={[styles.checkoutButton, cartLoading && styles.buttonDisabled]}
                onPress={handleCheckout}
                disabled={cartLoading}
              >
                {cartLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.checkoutButtonText}>
                    Completar compra - ${finalTotal.toFixed(2)}
                  </Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </ScrollView>

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

        <ToastDialog
          visible={alertState.toast.visible}
          message={alertState.toast.message}
          type={alertState.toast.type}
          duration={alertState.toast.duration}
          onHide={hideToast}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

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
  discountBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0fdf4',
    padding: 12,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  discountBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  discountBannerText: {
    marginLeft: 8,
    flex: 1,
  },
  discountBannerTitle: {
    fontSize: 12,
    color: '#15803d',
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  discountBannerSubtitle: {
    fontSize: 10,
    color: '#16a34a',
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
  scrollContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
    flexGrow: 1,
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
  discountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  discountInfo: {
    flex: 1,
  },
  discountLabel: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  discountCode: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'Poppins-Regular',
  },
  discountValue: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
  },
  discountInputLabel: {
    marginTop: 20,
    fontSize: 16,
    color: '#333',
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
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
    fontSize: 14,
    color: '#333',
    marginRight: 8,
  },
  applyButton: {
    backgroundColor: '#E8ACD2',
    borderRadius: 8,
    paddingHorizontal: 20,
    justifyContent: 'center',
    minWidth: 80,
    height: 44,
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
  },
  discountErrorContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#fef2f2',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  discountErrorText: {
    color: '#ef4444',
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
  },
  discountSuccessContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f0fdf4',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  discountSuccessText: {
    color: '#10b981',
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
  },
  discountHint: {
    marginTop: 8,
    marginBottom: 8,
  },
  discountHintText: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
  },
  checkoutButton: {
    backgroundColor: '#FDB4B7',
    borderRadius: 15,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    marginBottom: 20,
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