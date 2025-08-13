import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../context/AuthContext';

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = (screenWidth - 48) / 2;

const ProductCard = ({
  product,
  onPress,
  onAddToCart,
  navigation, // Recibimos navigation como prop
}) => {
  // Obtener funciones de favoritos del contexto
  const {
    toggleFavorite,
    isFavorite: checkIsFavorite,
    favoritesLoading,
    isAuthenticated,
  } = useAuth();

  // Verificar si el producto está en favoritos usando el ID del producto
  const isFavorite = checkIsFavorite(product._id);

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

        // Mostrar mensaje de éxito opcional
        const action = result.isAdded ? 'agregado a' : 'removido de';
        console.log(`Producto ${action} favoritos`);

        // Opcional: Mostrar toast o mensaje breve
        // Toast.show(`Producto ${action} favoritos`, Toast.SHORT);
      }
    } catch (error) {
      console.error('Error al cambiar favorito:', error);
      Alert.alert('Error', 'Error de conexión. Intenta nuevamente.');
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress && onPress(product)}
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

        {/* Stock info si está disponible */}
        {product.stock !== undefined && product.stock <= 5 && product.stock > 0 && (
          <Text style={styles.stockWarning}>
            Solo {product.stock} disponibles
          </Text>
        )}

        {/* Botón de carrito */}
        <TouchableOpacity
          style={[
            styles.cartButton,
            product.stock === 0 && styles.cartButtonDisabled
          ]}
          onPress={() => onAddToCart && onAddToCart(product)}
          disabled={product.stock === 0}
          activeOpacity={0.8}
        >
          <Icon
            name={product.stock === 0 ? "block" : "shopping-cart"}
            size={16}
            color="#fff"
          />
        </TouchableOpacity>
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
    backgroundColor: '#ff6b8a',
  },

  favoriteButtonLoading: {
    opacity: 0.7,
  },

  favoriteIndicator: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  content: {
    padding: 12,
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

  stockWarning: {
    fontSize: 12,
    color: '#e74c3c',
    marginBottom: 8,
    fontFamily: 'Poppins-Medium',
  },

  cartButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
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

  cartButtonDisabled: {
    backgroundColor: '#ccc',
  },
});

export default ProductCard;