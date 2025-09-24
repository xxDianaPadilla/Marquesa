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

// Obtener las dimensiones de la pantalla para responsive design
const { width: screenWidth } = Dimensions.get('window');
// Determinar si es un dispositivo pequeño para ajustes específicos
const isSmallDevice = screenWidth < 375;

// Componente para mostrar tarjetas de productos favoritos en grid
// Props:
// - data: Array de productos favoritos
// - onToggleFavorite: Función para agregar/quitar de favoritos
// - onCardPress: Función al presionar una tarjeta (opcional)
// - isLoading: Boolean para deshabilitar interacciones durante carga (default: false)
const FavoriteCards = ({
  data,
  onToggleFavorite,
  onCardPress,
  isLoading = false
}) => {
  // Función para obtener la imagen del producto de forma segura
  // Maneja diferentes formatos de datos de imagen
  const getProductImage = (product) => {
    // Verificar si existe un array de imágenes
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      const firstImage = product.images[0];

      // Si la imagen es un objeto con propiedad 'image'
      if (typeof firstImage === 'object' && firstImage.image) {
        return { uri: firstImage.image };
      }

      // Si la imagen es directamente una string (URL)
      if (typeof firstImage === 'string') {
        return { uri: firstImage };
      }
    }

    // Verificar si existe una propiedad 'image' individual
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

    // Imagen por defecto si no hay imagen disponible
    return { uri: 'https://via.placeholder.com/150x150?text=Sin+Imagen' };
  };

  // Función para renderizar cada elemento favorito
  const renderFavoriteItem = (item) => (
    <TouchableOpacity
      key={item._id || item.id} // Usar _id o id como key única
      style={styles.favoriteItem}
      onPress={() => onCardPress && onCardPress(item)} // Ejecutar onCardPress si existe
      disabled={isLoading} // Deshabilitar si está cargando
    >
      {/* Contenedor de la imagen con elementos superpuestos */}
      <View style={styles.imageContainer}>
        {/* Imagen del producto */}
        <Image
          source={getProductImage(item)}
          style={styles.favoriteImage}
          resizeMode="cover"
        />

        {/* Overlay con degradado inferior para mostrar texto sobre la imagen */}
        <View style={styles.textOverlay}>
          {/* Nombre del producto - máximo 2 líneas */}
          <Text style={styles.favoriteTitle} numberOfLines={2}>
            {item.name || item.title || 'Producto sin nombre'}
          </Text>
          {/* Precio del producto - solo se muestra si existe */}
          {item.price && (
            <Text style={styles.favoritePrice}>
              ${item.price.toFixed(2)}
            </Text>
          )}
        </View>

        {/* Botón de corazón flotante para remover de favoritos */}
        <TouchableOpacity
          style={styles.heartIcon}
          onPress={() => onToggleFavorite(item)}
          disabled={isLoading}
          activeOpacity={0.7}
        >
          {/* Icono de corazón lleno */}
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
    // Grid principal de favoritos
    <View style={styles.favoritesGrid}>
      {data.map(renderFavoriteItem)}
    </View>
  );
};

const styles = StyleSheet.create({
  // Grid principal - disposición en filas con flexWrap
  favoritesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    justifyContent: 'space-between',
  },
  // Cada tarjeta de favorito - ocupa 48% del ancho para 2 columnas
  favoriteItem: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 23,
    overflow: 'hidden', // Para que la imagen respete el borderRadius
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6, // Sombra en Android
  },
  // Contenedor de la imagen con posicionamiento relativo para elementos superpuestos
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 150,
  },
  // Imagen del producto que ocupa todo el contenedor
  favoriteImage: {
    width: '100%',
    height: '100%',
  },
  // Overlay semitransparente en la parte inferior para el texto
  textOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo negro semitransparente
  },
  // Título del producto sobre la imagen
  favoriteTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 2,
    fontFamily: 'Poppins-SemiBold',
  },
  // Precio del producto con color rosa claro
  favoritePrice: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f5c7e6ff',
    fontFamily: 'Poppins-SemiBold',
  },
  // Botón de corazón flotante en la esquina superior derecha
  heartIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f099acff', // Fondo rosa para el corazón
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2, // Sombra en Android
  },
});

export default FavoriteCards;