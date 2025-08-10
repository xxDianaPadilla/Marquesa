import FavoritesImage from "../images/RamoFlorFavoritos.png";
import FavoritesImage2 from "../images/ramoFavorito.png";
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import favoritesIcon from "../images/favoritesIcon.png";
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width: screenWidth } = Dimensions.get('window');
const isSmallDevice = screenWidth < 375;
const isMediumDevice = screenWidth >= 375 && screenWidth < 414;
const horizontalPadding = isSmallDevice ? 16 : isMediumDevice ? 20 : 24;

const FavoritesScreen = ({ navigation }) => {
  const [favorites, setFavorites] = React.useState({
    1: true,
    2: true,
  });

  const toggleFavorite = (id) => {
    setFavorites(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const favoritesData = [
    {
      id: 1,
      title: 'Ramo flores',
      image: FavoritesImage2,
    },
    {
      id: 2,
      title: 'Tarjeta rosa',
      image: FavoritesImage,
    },
  ];

  const renderFavoriteItem = (item) => (
    <TouchableOpacity key={item.id} style={styles.favoriteItem}>
      <View style={styles.imageContainer}>
        <Image source={item.image} style={styles.favoriteImage} />

        {/* Degradado inferior para el texto */}
        <View style={styles.textOverlay}>
          <Text style={styles.favoriteTitle}>{item.title}</Text>
        </View>

        {/* Corazón flotante */}
        <TouchableOpacity
          style={styles.heartIcon}
          onPress={() => toggleFavorite(item.id)}
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Favoritos</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.pinkSeparator} />

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.favoritesGrid}>
          {favoritesData.map(renderFavoriteItem)}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Home')}
        >
          <Icon name="home" size={isSmallDevice ? 20 : 24} color="#ccc" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Image source={favoritesIcon} style={styles.navIcon} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Chat')}
        >
          <Icon name="chat" size={isSmallDevice ? 20 : 24} color="#ccc" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Cart')}
        >
          <Icon name="shopping-cart" size={isSmallDevice ? 20 : 24} color="#ccc" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  pinkSeparator: {
    height: 2,
    backgroundColor: '#FDB4B7',
    marginBottom: 8,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    paddingBottom: isSmallDevice ? 90 : 100,
  },
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
    overflow: 'hidden', // para que la imagen y overlays respeten bordes
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
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: isSmallDevice ? 12 : 16,
    paddingHorizontal: horizontalPadding,
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
    minHeight: isSmallDevice ? 70 : 80,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: isSmallDevice ? 6 : 8,
    minWidth: isSmallDevice ? 40 : 44,
    minHeight: isSmallDevice ? 40 : 44,
    borderRadius: isSmallDevice ? 20 : 22,
  },
  navIcon: {
    width: isSmallDevice ? 20 : 24,
    height: isSmallDevice ? 20 : 24,
    resizeMode: 'contain',
  },
});

export default FavoritesScreen;
