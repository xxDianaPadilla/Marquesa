import React from 'react'; // Importa React para usar JSX
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';  // Componentes nativos de React Native
import Icon from 'react-native-vector-icons/MaterialIcons'; // Iconos de Material Design

const { width: screenWidth } = Dimensions.get('window'); // Obtiene el ancho de la pantalla
const cardWidth = (screenWidth - 48) / 2; // Calcula el ancho de cada tarjeta para un layout de 2 columnas

const ProductCard = ({
  product,
  onPress,
  onAddToCart,
  onToggleFavorite,
  isFavorite = false,
}) => {
  // Formatear precio
  const formatPrice = (price) => {
    return `$${price}`; // Devuelve el precio 
  };

  // Obtener primera imagen 
  const getProductImage = () => {
    // Prioridad 1: Array de imágenes
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      const firstImage = product.images[0];
      
      // Si es objeto con propiedad image
      if (typeof firstImage === 'object' && firstImage.image) {
        return firstImage.image;
      }

      // Si es string directamente
      if (typeof firstImage === 'string') {
        return firstImage;
      }
    }
    
    // Prioridad 2: Propiedad image directa
    if (product.image) {
      return product.image;
    }
    
    // Fallback: imagen placeholder
    return 'https://via.placeholder.com/300x240/f0f0f0/666666?text=Sin+Imagen';
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
            isFavorite && styles.favoriteButtonActive
          ]}
          onPress={() => onToggleFavorite && onToggleFavorite(product)}
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
            name="shopping-cart"
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
    elevation: 4, // Para Android
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
    height: cardWidth * 0.8, // Proporción 4:3 aproximadamente
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
  
  stockBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#ff9500',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  
  stockBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  
  noStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  noStockText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    backgroundColor: '#dc3545',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  
  content: {
    padding: 12,
    flex: 1,
  },
  
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    lineHeight: 18,
    minHeight: 36, // Para mantener consistencia en altura
    fontFamily: 'Poppins-SemiBold', // Poppins SemiBold para el nombre
  },
  
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 8,
    fontFamily: 'Poppins-Bold', // Poppins Bold para el precio
  },
  
  cartButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4A4170', // ligeramente más claro

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