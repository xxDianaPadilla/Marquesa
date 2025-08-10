import FavoritesImage from "../images/RamoFlorFavoritos.png";
import FavoritesImage2 from "../images/ramoFavorito.png";
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FavoriteCards from "../components/FavoriteCards";

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

  const handleCardPress = (item) => {
    // Aquí puedes agregar la lógica para cuando se presiona una card
    console.log('Card pressed:', item);
    // Por ejemplo: navigation.navigate('ProductDetail', { product: item });
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
        <FavoriteCards
          data={favoritesData}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          onCardPress={handleCardPress}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    marginTop: 25,
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
    backgroundColor: '#FFFFFF',
    paddingBottom: isSmallDevice ? 90 : 100,
  },
});

export default FavoritesScreen;