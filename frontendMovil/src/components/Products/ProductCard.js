import React from 'react'; // Importando React
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native'; // Importando react native
import Icon from 'react-native-vector-icons/MaterialIcons'; // Importando iconos
import { useAuth } from '../../context/AuthContext'; // Importamos contexto global
import { useCart } from '../../context/CartContext'; // Importamos contexto de carrito de compras

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = (screenWidth - 48) / 2;

const ProductCard = ({
  product,
  onPress,
  onAddToCart,
  navigation,
  isAddingToCart = false,
  isRemovingFromCart = false,
  productInCart = false,
}) => {
  // Obtener funciones de favoritos del contexto
  const {
    toggleFavorite,
    isFavorite: checkIsFavorite,
    favoritesLoading,
    isAuthenticated,
  } = useAuth();

  // Obtener funciones del carrito
  const {
    isInCart,
    getItemQuantity,
    cartLoading,
  } = useCart();

  // Verificar si el producto está en favoritos usando el ID del producto
  const isFavorite = checkIsFavorite(product._id);

  // Verificar si el producto está en el carrito
  const productIsInCart = productInCart || isInCart(product._id);
  const cartQuantity = getItemQuantity(product._id);

  // Formatear precio
  const formatPrice = (price) => {
    return `$${price}`;
  };

  // Obtener primera imagen 
  const getProductImage = () => {
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

    return 'https://via.placeholder.com/300x240/f0f0f0/666666?text=Sin+Imagen';
  };

  // Manejar toggle de favorito
  const handleToggleFavorite = async () => {
    try {
      // Verificar autenticación
      if (!isAuthenticated) {
        Alert.alert(
          "Iniciar sesión",
          "Debes iniciar sesión para agregar productos a favoritos",
          [
            { text: "Cancelar", style: "cancel" },
            {
              text: "Iniciar sesión", onPress: () => {
                if (navigation) {
                  navigation.navigate('Login');
                }
              }
            }
          ]
        );
        return;
      }

      console.log('Haciendo toggle de favorito para producto:', {
        id: product._id,
        name: product.name,
        currentlyFavorite: isFavorite
      });

      // Pasar el objeto producto completo, no solo el ID
      const result = await toggleFavorite(product);

      if (!result.success) {
        console.error('Error al cambiar favorito:', result.message);
        Alert.alert('Error', result.message || 'No se pudo actualizar favoritos');
      } else {
        console.log('Toggle favorito exitoso:', result);
      }
    } catch (error) {
      console.error('Error al cambiar favorito:', error);
      Alert.alert('Error', 'Error de conexión. Intenta nuevamente.');
    }
  };

  // MANEJAR AGREGAR/REMOVER DEL CARRITO CON VALIDACIONES MEJORADAS
  const handleCartAction = async () => {
    try {
      if (!isAuthenticated) {
        Alert.alert(
          "Iniciar sesión",
          "Debes iniciar sesión para gestionar el carrito",
          [
            { text: "Cancelar", style: "cancel" },
            {
              text: "Iniciar sesión", onPress: () => {
                if (navigation) {
                  navigation.navigate('Login');
                }
              }
            }
          ]
        );
        return;
      }

      // Verificar stock solo si no está en el carrito
      if (!productIsInCart && product.stock === 0) {
        Alert.alert(
          "Sin stock",
          "Este producto no está disponible en este momento",
          [{ text: "OK", style: "cancel" }]
        );
        return;
      }

      // LLAMAR LA FUNCIÓN DESDE EL HOMESCREEN (que maneja tanto agregar como remover)
      if (onAddToCart) {
        await onAddToCart(product, 1, 'product');
      }
    } catch (error) {
      console.error('Error al gestionar carrito desde ProductCard:', error);
      Alert.alert('Error', 'Error inesperado. Inténtalo nuevamente.');
    }
  };

  // Determinar el ícono del botón de carrito
  const getCartIcon = () => {
    if (product.stock === 0) {
      return "block";
    }
    if (isAddingToCart) {
      return "hourglass-empty";
    }
    if (isRemovingFromCart) {
      return "remove-shopping-cart";
    }
    if (productIsInCart) {
      return "remove-shopping-cart"; // Icono para remover cuando está en el carrito
    }
    return "add-shopping-cart";
  };

  // Determinar el color del botón de carrito
  const getCartButtonStyle = () => {
    if (product.stock === 0) {
      return styles.cartButtonDisabled;
    }
    if (isAddingToCart) {
      return styles.cartButtonLoading;
    }
    if (isRemovingFromCart) {
      return styles.cartButtonRemoving;
    }
    if (productIsInCart) {
      return styles.cartButtonRemove; // Estilo para remover (rojo)
    }
    return styles.cartButton;
  };

  // Determinar el texto del botón de acción (para debugging)
  const getActionText = () => {
    if (product.stock === 0) return "Sin stock";
    if (isAddingToCart) return "Agregando...";
    if (isRemovingFromCart) return "Removiendo...";
    if (productIsInCart) return "Remover";
    return "Agregar";
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        console.log('ProductCard clicked:', product._id);
        onPress && onPress(product);
      }}
      activeOpacity={0.8}
    >
      {/* Contenedor de imagen */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: getProductImage() }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Botón de favorito */}
        <TouchableOpacity
          style={[
            styles.favoriteButton,
            isFavorite && styles.favoriteButtonActive,
            favoritesLoading && styles.favoriteButtonLoading
          ]}
          onPress={handleToggleFavorite}
          disabled={favoritesLoading}
          activeOpacity={0.7}
        >
          <Icon
            name={isFavorite ? 'favorite' : 'favorite-border'}
            size={18}
            color={isFavorite ? '#fff' : '#666'}
          />
        </TouchableOpacity>

        {/* Indicador de stock bajo */}
        {product.stock !== undefined && product.stock <= 5 && product.stock > 0 && (
          <View style={styles.stockBadge}>
            <Text style={styles.stockBadgeText}>
              ¡Últimas {product.stock}!
            </Text>
          </View>
        )}

        {/* Indicador de sin stock */}
        {product.stock === 0 && (
          <View style={styles.outOfStockBadge}>
            <Text style={styles.outOfStockText}>Sin stock</Text>
          </View>
        )}

        {/* OVERLAY DE LOADING CUANDO SE ESTÁ AGREGANDO/REMOVIENDO DEL CARRITO */}
        {(isAddingToCart || isRemovingFromCart) && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color="#4A4170" />
            <Text style={styles.loadingOverlayText}>
              {isAddingToCart ? "Agregando..." : "Removiendo..."}
            </Text>
          </View>
        )}
      </View>

      {/* Contenido de información */}
      <View style={styles.content}>
        {/* Nombre del producto */}
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>

        {/* Precio */}
        <Text style={styles.price}>
          {formatPrice(product.price)}
        </Text>

        {/* Información adicional */}
        <View style={styles.bottomRow}>
          {/* CONTENEDOR IZQUIERDO PARA EL INDICADOR DE CARRITO */}
          <View style={styles.leftSection}>
            {/* Indicador si está en carrito */}
            {productIsInCart && cartQuantity > 0 && (
              <View style={styles.cartIndicator}>
                <Icon name="shopping-cart" size={12} color="#4A4170" />
                <Text style={styles.cartIndicatorText}>{cartQuantity}</Text>
              </View>
            )}
          </View>

          {/* BOTÓN DE CARRITO SIEMPRE A LA DERECHA */}
          <TouchableOpacity
            style={getCartButtonStyle()}
            onPress={handleCartAction}
            disabled={product.stock === 0 || isAddingToCart || isRemovingFromCart}
            activeOpacity={0.8}
          >
            {(isAddingToCart || isRemovingFromCart) ? (
              <ActivityIndicator size={16} color="#fff" />
            ) : (
              <Icon
                name={getCartIcon()}
                size={16}
                color="#fff"
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: cardWidth,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
  },

  imageContainer: {
    position: 'relative',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },

  image: {
    width: '100%',
    height: cardWidth * 0.8,
    backgroundColor: '#f5f5f5',
  },

  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },

  favoriteButtonActive: {
    backgroundColor: '#f099acff',
  },

  favoriteButtonLoading: {
    opacity: 0.7,
  },

  stockBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#f39c12',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  stockBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },

  outOfStockBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  outOfStockText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },

  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },

  loadingOverlayText: {
    fontSize: 12,
    color: '#4A4170',
    marginTop: 8,
    fontFamily: 'Poppins-Medium',
  },

  // Indicador visual cuando está en el carrito
  inCartIndicator: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },

  content: {
    padding: 8,
    flex: 1,
    position: 'relative',
  },

  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    lineHeight: 18,
    minHeight: 36,
    fontFamily: 'Poppins-SemiBold',
  },

  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 8,
    fontFamily: 'Poppins-Bold',
  },

  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },

  leftSection: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },

  cartIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f4fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  cartIndicatorText: {
    fontSize: 12,
    color: '#4A4170',
    fontWeight: 'bold',
    marginLeft: 4,
    fontFamily: 'Poppins-Bold',
  },

  cartButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4A4170',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },

  cartButtonActive: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2ecc71',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },

  cartButtonDisabled: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },

  cartButtonLoading: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4A4170',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },

  // Estilo para el botón cuando se está removiendo
  cartButtonRemoving: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e67e22',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },

  // Estilo para el botón cuando el producto está en el carrito (remover)
  cartButtonRemove: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4A4170',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default ProductCard;