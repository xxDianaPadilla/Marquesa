import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width: screenWidth } = Dimensions.get('window');
const isSmallDevice = screenWidth < 375;

const FavoriteCards = ({
  data,
  onToggleFavorite,
  onCardPress,
  isLoading = false
}) => {
  // Función para obtener la imagen del producto
  const getProductImage = (product) => {
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      const firstImage = product.images[0];

      if (typeof firstImage === 'object' && firstImage.image) {
        return { uri: firstImage.image };
      }

      if (typeof firstImage === 'string') {
        return { uri: firstImage };
      }
    }

    if (product.image) {
      // Si es un objeto con uri, devolverlo tal como está
      if (typeof product.image === 'object' && product.image.uri) {
        return product.image;
      }
      // Si es una string, convertirlo a objeto con uri
      if (typeof product.image === 'string') {
        return { uri: product.image };
      }
    }

    return { uri: 'https://via.placeholder.com/150x150?text=Sin+Imagen' };
  };

  const renderFavoriteItem = (item) => (
    <TouchableOpacity
      key={item._id || item.id}
      style={styles.favoriteItem}
      onPress={() => onCardPress && onCardPress(item)}
      disabled={isLoading}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={getProductImage(item)} 
          style={styles.favoriteImage}
          resizeMode="cover"
        />

        {/* Degradado inferior para el texto */}
        <View style={styles.textOverlay}>
          <Text style={styles.favoriteTitle} numberOfLines={2}>
            {item.name || item.title || 'Producto sin nombre'}
          </Text>
          {item.price && (
            <Text style={styles.favoritePrice}>
              ${item.price.toFixed(2)}
            </Text>
          )}
        </View>

        {/* Corazón flotante para remover */}
        <TouchableOpacity
          style={styles.heartIcon}
          onPress={() => onToggleFavorite(item)}
          disabled={isLoading}
          activeOpacity={0.7}
        >
          <Icon
            name="favorite"
            size={18}
            color="#fff"
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.favoritesGrid}>
      {data.map(renderFavoriteItem)}
    </View>
  );
};

const styles = StyleSheet.create({
  favoritesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    justifyContent: 'space-between',
  },
  favoriteItem: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 23,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 150,
  },
  favoriteImage: {
    width: '100%',
    height: '100%',
  },
  textOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  favoriteTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 2,
  },
  favoritePrice: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f5c7e6ff',
  },
  heartIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ff6b8a',
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
});

export default FavoriteCards;