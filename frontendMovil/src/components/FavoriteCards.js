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
  favorites, 
  onToggleFavorite, 
  onCardPress 
}) => {
  const renderFavoriteItem = (item) => (
    <TouchableOpacity 
      key={item.id} 
      style={styles.favoriteItem}
      onPress={() => onCardPress && onCardPress(item)}
    >
      <View style={styles.imageContainer}>
        <Image source={item.image} style={styles.favoriteImage} />

        {/* Degradado inferior para el texto */}
        <View style={styles.textOverlay}>
          <Text style={styles.favoriteTitle}>{item.title}</Text>
        </View>

        {/* Corazón flotante */}
        <TouchableOpacity
          style={styles.heartIcon}
          onPress={() => onToggleFavorite(item.id)}
        >
          <Icon
            name={favorites[item.id] ? "favorite" : "favorite-border"}
            size={20}
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
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  favoriteTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  heartIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FavoriteCards;