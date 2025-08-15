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
    Alert,
    RefreshControl,
    ToastAndroid,
    Platform
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import perfilIcon from "../images/perfilIcon.png";
import favoritesIcon from "../images/favoritesIcon.png";
import ProductCard from "../components/Products/ProductCard";
import useFetchProducts from "../hooks/useFetchProducts";
import Icon from 'react-native-vector-icons/MaterialIcons';
import PriceFilterModal from '../components/PriceFilterModal';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const isSmallDevice = screenWidth < 375;
const isMediumDevice = screenWidth >= 375 && screenWidth < 414;

const horizontalPadding = isSmallDevice ? 16 : isMediumDevice ? 20 : 24;
const elementGap = isSmallDevice ? 8 : isMediumDevice ? 10 : 12;

export default function HomeScreen({ navigation }) {
    const {
        user,
        userInfo,
        isAuthenticated,
        getFavorites,
        favorites,
        favoritesLoading,
        favoritesError,
        refreshFavorites
    } = useAuth();

    // USAMOS EL CONTEXTO DEL CARRITO
    const {
        addToCart,
        cartLoading,
        cartError,
        cartItemsCount,
        isInCart,
        getItemQuantity,
        clearCartError
    } = useCart();

    const { productos, loading, refetch } = useFetchProducts();
    const [selectedCategory, setSelectedCategory] = useState('Todo');
    const [refreshing, setRefreshing] = useState(false);
    const [addingToCart, setAddingToCart] = useState(null);

    const [showPriceFilter, setShowPriceFilter] = useState(false);
    const [priceRange, setPriceRange] = useState({ min: 0, max: 100 });

    const categories = ['Todo', 'Naturales', 'Secas', 'Tarjetas', 'Cuadros', 'Giftboxes'];

    // Función para mostrar toast/mensaje
    const showToast = (message) => {
        if (Platform.OS === 'android') {
            ToastAndroid.show(message, ToastAndroid.SHORT);
        } else {
            Alert.alert('Información', message);
        }
    };

    // Cargar favoritos cuando el usuario esté autenticado
    useEffect(() => {
        if (isAuthenticated && userInfo) {
            console.log('Usuario autenticado, cargando favoritos...');
            getFavorites();
        } else {
            console.log('Usuario no autenticado, limpiando favoritos');
        }
    }, [isAuthenticated, userInfo]);

    // Escuchar cambios en el estado de autenticación
    useEffect(() => {
        console.log('Estado de favoritos actualizado:', {
            favoritesCount: favorites.length,
            isAuthenticated,
            favoritesLoading,
            hasError: !!favoritesError
        });
    }, [favorites, isAuthenticated, favoritesLoading, favoritesError]);

    // Limpiar errores del carrito cuando se monte el componente
    useEffect(() => {
        return () => {
            clearCartError();
        };
    }, []);

    // Función para refrescar toda la pantalla
    const onRefresh = async () => {
        setRefreshing(true);
        try {
            // Refrescar productos
            if (refetch) {
                await refetch();
            }

            // Refrescar favoritos si está autenticado
            if (isAuthenticated) {
                await refreshFavorites();
            }
        } catch (error) {
            console.error('Error al refrescar:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const handleProfilePress = () => {
        navigation.navigate('Profile');
    };

    const handleProductPress = (product) => {
        console.log('Navegando a ProductDetail con producto:', product._id);
        navigation.navigate('ProductDetail', {
            productId: product._id,
            product: product
        });
    };

    // FUNCIÓN PARA AGREGAR AL CARRITO
    const handleAddToCart = async (product, quantity = 1, itemType = 'product') => {
        try {
            // Verificar autenticación
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

            // Validar producto
            if (!product || !product._id) {
                Alert.alert('Error', 'Producto inválido');
                return;
            }

            // Verificar stock
            if (product.stock === 0) {
                Alert.alert(
                    "Sin stock",
                    "Este producto no está disponible en este momento"
                );
                return;
            }

            // Marcar producto como añadiéndose
            setAddingToCart(product._id);

            console.log('🛒 Agregando producto al carrito:', {
                productId: product._id,
                productName: product.name,
                price: product.price,
                quantity,
                itemType
            });

            // Llamar a la función del contexto
            const result = await addToCart(product, quantity, itemType);

            if (result.success) {
                // Mostrar mensaje de éxito
                showToast(`${product.name} agregado al carrito`);

                console.log('Producto agregado exitosamente:', result);
            } else {
                // Mostrar error específico
                Alert.alert(
                    'Error al agregar al carrito',
                    result.message || 'No se pudo agregar el producto al carrito'
                );
                console.error('Error al agregar producto:', result.message);
            }

        } catch (error) {
            console.error('Error inesperado al agregar al carrito:', error);
            Alert.alert(
                'Error inesperado',
                'Ocurrió un error inesperado. Inténtalo nuevamente.'
            );
        } finally {
            // Quitar marca de loading
            setAddingToCart(null);
        }
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
                navigation={navigation}
                // Props adicionales para mostrar estado del carrito
                isAddingToCart={addingToCart === item._id}
                cartQuantity={getItemQuantity(item._id)}
            />
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header solo con botón de perfil */}
            <View style={styles.header}>
                <View style={styles.headerSpacer} />

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

            {/* Indicador de filtros aplicados */}
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

            {/* INDICADOR DE ERROR DEL CARRITO */}
            {cartError && (
                <View style={styles.errorContainer}>
                    <Icon name="error-outline" size={16} color="#e74c3c" />
                    <Text style={styles.errorText}>{cartError}</Text>
                    <TouchableOpacity
                        onPress={clearCartError}
                        style={styles.closeButton}
                    >
                        <Icon name="close" size={16} color="#e74c3c" />
                    </TouchableOpacity>
                </View>
            )}

            {/* Indicador de estado de favoritos */}
            {isAuthenticated && favoritesError && (
                <View style={styles.errorContainer}>
                    <Icon name="error-outline" size={16} color="#e74c3c" />
                    <Text style={styles.errorText}>{favoritesError}</Text>
                    <TouchableOpacity
                        onPress={() => getFavorites()}
                        style={styles.retryButton}
                    >
                        <Text style={styles.retryButtonText}>Reintentar</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Lista de productos */}
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
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#4A4170']}
                        tintColor="#4A4170"
                    />
                }
                getItemLayout={(data, index) => ({
                    length: 200,
                    offset: 200 * Math.floor(index / 2),
                    index,
                })}
                ListEmptyComponent={
                    loading ? (
                        <View style={styles.loadingContainer}>
                            <Text style={styles.loadingText}>Cargando productos...</Text>
                        </View>
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Icon name="inventory" size={48} color="#ccc" />
                            <Text style={styles.emptyText}>No se encontraron productos</Text>
                        </View>
                    )
                }
            />

            {/* Modal de filtro de precios */}
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
                    {/* Indicador de cantidad de favoritos */}
                    {isAuthenticated && favorites.length > 0 && (
                        <View style={styles.favoriteBadge}>
                            <Text style={styles.favoriteBadgeText}>
                                {favorites.length > 99 ? '99+' : favorites.length}
                            </Text>
                        </View>
                    )}
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
                    {/* BADGE DEL CARRITO */}
                    {isAuthenticated && cartItemsCount > 0 && (
                        <View style={styles.cartBadge}>
                            <Text style={styles.cartBadgeText}>
                                {cartItemsCount > 99 ? '99+' : cartItemsCount}
                            </Text>
                        </View>
                    )}
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: horizontalPadding,
        marginBottom: isSmallDevice ? 16 : 20,
    },
    headerSpacer: {
        width: isSmallDevice ? 28 : 30,
        height: isSmallDevice ? 28 : 30,
    },
    profileButton: {
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
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffebee',
        margin: horizontalPadding,
        padding: 12,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#e74c3c',
    },
    errorText: {
        flex: 1,
        fontSize: 12,
        color: '#e74c3c',
        marginLeft: 8,
        fontFamily: 'Poppins-Regular',
    },
    retryButton: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        backgroundColor: '#e74c3c',
        borderRadius: 4,
        marginLeft: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 12,
        fontFamily: 'Poppins-Medium',
    },
    closeButton: {
        padding: 4,
        marginLeft: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    loadingText: {
        fontSize: 14,
        color: '#666',
        fontFamily: 'Poppins-Regular',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 14,
        color: '#999',
        marginTop: 12,
        fontFamily: 'Poppins-Regular',
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
        position: 'relative',
    },
    navIcon: {
        width: isSmallDevice ? 20 : 24,
        height: isSmallDevice ? 20 : 24,
        resizeMode: 'contain',
    },
    favoriteBadge: {
        position: 'absolute',
        top: -2,
        right: -2,
        backgroundColor: '#ff6b8a',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    favoriteBadgeText: {
        fontSize: 10,
        color: '#fff',
        fontFamily: 'Poppins-Bold',
        textAlign: 'center',
    },
    cartBadge: {
        position: 'absolute',
        top: -2,
        right: -2,
        backgroundColor: '#4A4170',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    cartBadgeText: {
        fontSize: 10,
        color: '#fff',
        fontFamily: 'Poppins-Bold',
        textAlign: 'center',
    },
});