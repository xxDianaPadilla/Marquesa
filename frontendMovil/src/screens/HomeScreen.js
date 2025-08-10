import React, { useState, useEffect } from "react";
import {
    View,
    TouchableOpacity,
    Image,
    StyleSheet,
    Text,
    FlatList,
    Dimensions,
    ScrollView,
    Alert
} from "react-native";
import { useAuth } from "../context/AuthContext";
import perfilIcon from "../images/perfilIcon.png";
import favoritesIcon from "../images/favoritesIcon.png";
import ProductCard from "../components/Products/ProductCard";
import useFetchProducts from "../hooks/useFetchProducts";
import Icon from 'react-native-vector-icons/MaterialIcons';
import PriceFilterModal from '../components/PriceFilterModal';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const isSmallDevice = screenWidth < 375;
const isMediumDevice = screenWidth >= 375 && screenWidth < 414;
const isLargeDevice = screenWidth >= 414;

const horizontalPadding = isSmallDevice ? 16 : isMediumDevice ? 20 : 24;
const elementGap = isSmallDevice ? 8 : isMediumDevice ? 10 : 12;

export default function HomeScreen({ navigation }) {
    const { user, userInfo, isAuthenticated, getFavorites } = useAuth();
    const { productos, loading } = useFetchProducts();
    const [selectedCategory, setSelectedCategory] = useState('Todo');
    
    const [showPriceFilter, setShowPriceFilter] = useState(false);
    const [priceRange, setPriceRange] = useState({ min: 0, max: 100 });

    const categories = ['Todo', 'Naturales', 'Secas', 'Tarjetas', 'Cuadros', 'Giftboxes'];

    // Cargar favoritos cuando el usuario esté autenticado
    useEffect(() => {
        if (isAuthenticated && userInfo) {
            getFavorites();
        }
    }, [isAuthenticated, userInfo]);

    const handleProfilePress = () => {
        navigation.navigate('Profile');
    };

    const handleProductPress = (product) => {
        navigation.navigate('ProductDetail', { productId: product._id });
    };

    const handleAddToCart = (product) => {
    if (!isAuthenticated) {
        Alert.alert(
            "Iniciar sesión",
            "Debes iniciar sesión para agregar productos al carrito",
            [
                { text: "Cancelar", style: "cancel" },
                { text: "Iniciar sesión", onPress: () => navigation.navigate('Login') }
            ]
        );
        return;
    }
    console.log('Agregar al carrito:', product);
    // Aquí iría la lógica del carrito
};

    const handleApplyPriceFilter = (minPrice, maxPrice) => {
        setPriceRange({ min: minPrice, max: maxPrice });
        console.log('Filtros de precio aplicados:', { minPrice, maxPrice });
    };

    const filteredProducts = productos.filter(product => {
        const matchesCategory = selectedCategory === 'Todo' ||
            product.category?.toLowerCase().includes(selectedCategory.toLowerCase());
        
        const matchesPrice = product.price >= priceRange.min && product.price <= priceRange.max;
        
        return matchesCategory && matchesPrice;
    });

   const renderProduct = ({ item, index }) => (
    <View style={[styles.cardWrapper, { marginRight: index % 2 === 0 ? elementGap : 0 }]}>
        <ProductCard
            product={item}
            onPress={handleProductPress}
            onAddToCart={handleAddToCart}
            navigation={navigation} // ← Pasar navigation como prop
        />
    </View>
);


    return (
        <View style={styles.container}>
            {/* Header con botones de perfil y favoritos */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={() => navigation.navigate('Favorites')}
                >
                    <Image source={favoritesIcon} style={styles.icon} />
                </TouchableOpacity>
                
                <TouchableOpacity
                    style={styles.profileButton}
                    onPress={handleProfilePress}
                >
                    <Image source={perfilIcon} style={styles.icon} />
                </TouchableOpacity>
            </View>

            <View style={styles.titleContainer}>
                <Text style={styles.mainTitle}>Descubre formas de</Text>
                <Text style={styles.mainTitle}>sorprender</Text>
            </View>

            <View style={styles.searchWrapper}>
                <TouchableOpacity 
                    style={styles.filterIconButton}
                    onPress={() => setShowPriceFilter(true)}
                >
                    <Icon name="tune" size={isSmallDevice ? 18 : 20} color="#999" />
                </TouchableOpacity>
                
                <View style={styles.searchContainer}>
                    <TouchableOpacity
                        style={styles.searchTouchable}
                        onPress={() => navigation.navigate('Search')}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.searchPlaceholder}>¿Qué estás buscando?</Text>
                        <View style={styles.searchButton}>
                            <Icon name="search" size={isSmallDevice ? 18 : 20} color="#fff" />
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.categoryScrollContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryContainer}
                    style={styles.categoryScrollView}
                    bounces={true}
                    decelerationRate="fast"
                    snapToAlignment="start"
                    snapToInterval={undefined}
                >
                    {categories.map((category, index) => (
                        <TouchableOpacity
                            key={category}
                            style={[
                                styles.categoryButton,
                                selectedCategory === category && styles.categoryButtonActive,
                                index === categories.length - 1 && styles.lastCategoryButton
                            ]}
                            onPress={() => setSelectedCategory(category)}
                            activeOpacity={0.7}
                        >
                            <Text
                                style={[
                                    styles.categoryText,
                                    selectedCategory === category && styles.categoryTextActive
                                ]}
                                numberOfLines={1}
                                adjustsFontSizeToFit={isSmallDevice}
                                minimumFontScale={0.85}
                            >
                                {category}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {(priceRange.min > 0 || priceRange.max < 100) && (
                <View style={styles.filterIndicatorContainer}>
                    <View style={styles.filterChip}>
                        <Icon name="filter-list" size={16} color="#4A4170" />
                        <Text style={styles.filterChipText}>
                            Precio: ${priceRange.min} - ${priceRange.max}
                        </Text>
                        <TouchableOpacity 
                            onPress={() => setPriceRange({ min: 0, max: 100 })}
                            style={styles.filterChipClose}
                        >
                            <Icon name="close" size={14} color="#666" />
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            <FlatList
                data={filteredProducts}
                renderItem={renderProduct}
                keyExtractor={(item) => item._id}
                numColumns={2}
                contentContainerStyle={styles.productsContainer}
                showsVerticalScrollIndicator={false}
                columnWrapperStyle={styles.row}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={10}
                removeClippedSubviews={true}
                getItemLayout={(data, index) => ({
                    length: 200,
                    offset: 200 * Math.floor(index / 2),
                    index,
                })}
            />

            <PriceFilterModal
                visible={showPriceFilter}
                onClose={() => setShowPriceFilter(false)}
                onApplyFilter={handleApplyPriceFilter}
                minPrice={0}
                maxPrice={100}
                currentMinPrice={priceRange.min}
                currentMaxPrice={priceRange.max}
            />

            {/* Bottom Navigation */}
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem}>
                    <Icon name="home" size={isSmallDevice ? 20 : 24} color="#4A4170" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => navigation.navigate('Favorites')}
                >
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ffffff",
        paddingTop: isSmallDevice ? 45 : 50,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between', // Cambiado para distribuir botones
        alignItems: 'center',
        paddingHorizontal: horizontalPadding,
        marginBottom: isSmallDevice ? 16 : 20,
    },
    profileButton: {
        width: isSmallDevice ? 28 : 30,
        height: isSmallDevice ? 28 : 30,
    },
    favoriteButton: {
        width: isSmallDevice ? 28 : 30,
        height: isSmallDevice ? 28 : 30,
    },
    icon: {
        width: "100%",
        height: "100%",
        resizeMode: "contain",
    },
    titleContainer: {
        paddingHorizontal: horizontalPadding,
        marginBottom: isSmallDevice ? 24 : 30,
    },
    mainTitle: {
        fontSize: isSmallDevice ? 24 : isMediumDevice ? 26 : 28,
        fontFamily: 'Poppins-Bold',
        color: '#333',
        lineHeight: isSmallDevice ? 28 : isMediumDevice ? 30 : 34,
    },
    searchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: horizontalPadding,
        marginBottom: isSmallDevice ? 16 : 20,
        gap: elementGap,
    },
    filterIconButton: {
        width: isSmallDevice ? 45 : 50,
        height: isSmallDevice ? 45 : 50,
        borderRadius: isSmallDevice ? 12 : 15,
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#f5c7e6ff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    searchContainer: {
        flex: 1,
        position: 'relative',
        backgroundColor: '#fff',
        borderRadius: 25,
        maxWidth: screenWidth - (horizontalPadding * 2) - (isSmallDevice ? 45 : 50) - elementGap,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    searchTouchable: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
    },
    searchPlaceholder: {
        flex: 1,
        fontSize: isSmallDevice ? 12 : 14,
        fontFamily: 'Poppins-Regular',
        color: '#999',
        paddingVertical: isSmallDevice ? 12 : 15,
        paddingLeft: isSmallDevice ? 12 : 15,
        paddingRight: isSmallDevice ? 45 : 50,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 25,
        backgroundColor: '#fff',
    },
    searchButton: {
        position: 'absolute',
        right: 1,
        top: 1,
        bottom: 1,
        width: isSmallDevice ? 45 : 50,
        height: isSmallDevice ? 43 : 50,
        backgroundColor: '#f5c7e6ff',
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 23,
        borderTopRightRadius: 23,
        borderBottomRightRadius: 23,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    categoryScrollContainer: {
        marginBottom: isSmallDevice ? 10 : 12,
        height: isSmallDevice ? 50 : 55,
    },
    categoryScrollView: {
        flexGrow: 0,
        overflow: 'visible',
    },
    categoryContainer: {
        paddingHorizontal: horizontalPadding,
        paddingRight: horizontalPadding + 20,
        alignItems: 'center',
        minHeight: isSmallDevice ? 45 : 50,
    },
    categoryButton: {
        paddingHorizontal: isSmallDevice ? 14 : isMediumDevice ? 16 : 18,
        paddingVertical: isSmallDevice ? 10 : 12,
        borderRadius: isSmallDevice ? 18 : 20,
        backgroundColor: '#fff',
        marginRight: isSmallDevice ? 8 : elementGap,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
        minWidth: isSmallDevice ? 60 : 70,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    lastCategoryButton: {
        marginRight: 0,
    },
    categoryButtonActive: {
        backgroundColor: '#4A4170',
        shadowColor: '#4A4170',
        shadowOpacity: 0.3,
        elevation: 4,
    },
    categoryText: {
        fontSize: isSmallDevice ? 12 : isMediumDevice ? 13 : 14,
        fontFamily: 'Poppins-Medium',
        color: '#1b1b1bff',
        textAlign: 'center',
        lineHeight: isSmallDevice ? 14 : isMediumDevice ? 15 : 16,
    },
    categoryTextActive: {
        color: '#FFFFFF',
        fontFamily: 'Poppins-SemiBold',
    },
    filterIndicatorContainer: {
        paddingHorizontal: horizontalPadding,
        paddingVertical: 8,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    filterChipText: {
        fontSize: 12,
        fontFamily: 'Poppins-Medium',
        color: '#4A4170',
        marginHorizontal: 6,
    },
    filterChipClose: {
        marginLeft: 4,
        padding: 2,
    },
    productsContainer: {
        paddingHorizontal: horizontalPadding,
        paddingTop: 5,
        paddingBottom: isSmallDevice ? 90 : 100,
    },
    row: {
        justifyContent: 'space-between',
        marginBottom: isSmallDevice ? 12 : 16,
        paddingHorizontal: 2,
    },
    cardWrapper: {
        width: (screenWidth - (horizontalPadding * 2) - elementGap - 4) / 2,
        minHeight: isSmallDevice ? 180 : 200,
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
        shadowOffset: {
            width: 0,
            height: -3,
        },
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