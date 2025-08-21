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

// Obtener dimensiones de la pantalla
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Constantes para diseño responsivo
const isSmallDevice = screenWidth < 375;
const isMediumDevice = screenWidth >= 375 && screenWidth < 414;

// Configuración de espaciado responsivo
const horizontalPadding = isSmallDevice ? 16 : isMediumDevice ? 20 : 24;
const elementGap = isSmallDevice ? 8 : isMediumDevice ? 10 : 12;

export default function HomeScreen({ navigation }) {
    // Contexto de autenticación - obtiene datos del usuario, favoritos y estado de autenticación
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

    // Contexto del carrito de compras - maneja todas las operaciones del carrito
    const {
        addToCart,
        cartError,
        cartItemsCount,
        cartItems,
        updating,
        clearCartError
    } = useCart();

    // Hook personalizado para obtener productos de la API
    const { productos, loading, refetch } = useFetchProducts();

    // Estados locales del componente
    const [selectedCategory, setSelectedCategory] = useState('Todo'); // Categoría seleccionada actualmente
    const [refreshing, setRefreshing] = useState(false); // Estado de pull-to-refresh
    const [addingToCart, setAddingToCart] = useState(null); // ID del producto que se está agregando al carrito

    // Estados para el modal de filtros de precio
    const [showPriceFilter, setShowPriceFilter] = useState(false); // Mostrar/ocultar modal
    const [priceRange, setPriceRange] = useState({ min: 0, max: 100 }); // Rango de precios actual

    // Lista de categorías disponibles
    const categories = ['Todo', 'Naturales', 'Secas', 'Tarjetas', 'Cuadros', 'Giftboxes'];

    // Función para mostrar mensajes toast según la plataforma
    const showToast = (message) => {
        if (Platform.OS === 'android') {
            ToastAndroid.show(message, ToastAndroid.SHORT);
        } else {
            Alert.alert('Información', message);
        }
    };

    // Efecto para cargar favoritos cuando el usuario está autenticado
    useEffect(() => {
        if (isAuthenticated && userInfo) {
            console.log('Usuario autenticado, cargando favoritos...');
            getFavorites();
        } else {
            console.log('Usuario no autenticado, limpiando favoritos');
        }
    }, [isAuthenticated, userInfo]);

    // Efecto para monitorear cambios en el estado de favoritos
    useEffect(() => {
        console.log('Estado de favoritos actualizado:', {
            favoritesCount: favorites.length,
            isAuthenticated,
            favoritesLoading,
            hasError: !!favoritesError
        });
    }, [favorites, isAuthenticated, favoritesLoading, favoritesError]);

    // Efecto para limpiar errores del carrito al desmontar el componente
    useEffect(() => {
        return () => {
            if (clearCartError) {
                clearCartError();
            }
        };
    }, [clearCartError]);

    // Función para refrescar toda la pantalla (pull-to-refresh)
    const onRefresh = async () => {
        setRefreshing(true);
        try {
            // Refrescar productos desde la API
            if (refetch) {
                await refetch();
            }

            // Refrescar favoritos si el usuario está autenticado
            if (isAuthenticated) {
                await refreshFavorites();
            }
        } catch (error) {
            console.error('Error al refrescar:', error);
        } finally {
            setRefreshing(false);
        }
    };

    // Navegación a la pantalla de perfil
    const handleProfilePress = () => {
        navigation.navigate('Profile');
    };

    // Navegación a la pantalla de detalle del producto
    const handleProductPress = (product) => {
        console.log('Navegando a ProductDetail con producto:', product._id);
        navigation.navigate('ProductDetail', {
            productId: product._id,
            product: product
        });
    };

    // Función principal para agregar productos al carrito
    const handleAddToCart = async (product, quantity = 1, itemType = 'product') => {
        try {
            // Verificar si el usuario está autenticado
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

            // Validar que el producto es válido
            if (!product || !product._id) {
                Alert.alert('Error', 'Producto inválido');
                return;
            }

            // Verificar disponibilidad en stock
            if (product.stock === 0) {
                Alert.alert(
                    "Sin stock",
                    "Este producto no está disponible en este momento"
                );
                return;
            }

            // Mostrar estado de carga para este producto específico
            setAddingToCart(product._id);

            console.log('🛒 Agregando producto al carrito:', {
                productId: product._id,
                productName: product.name,
                price: product.price,
                quantity,
                itemType
            });

            // Llamar a la función del contexto para agregar al carrito
            const result = await addToCart(product._id, quantity, itemType);

            // Manejar resultado exitoso
            if (result.success) {
                showToast(`${product.name} agregado al carrito`);
                console.log('Producto agregado exitosamente:', result);
            } else {
                // Manejar errores específicos
                Alert.alert(
                    'Error al agregar al carrito',
                    result.message || 'No se pudo agregar el producto al carrito'
                );
                console.error('Error al agregar producto:', result.message);
            }

        } catch (error) {
            // Manejar errores inesperados
            console.error('Error inesperado al agregar al carrito:', error);
            Alert.alert(
                'Error inesperado',
                'Ocurrió un error inesperado. Inténtalo nuevamente.'
            );
        } finally {
            // Limpiar estado de carga
            setAddingToCart(null);
        }
    };

    // Aplicar filtros de precio desde el modal
    const handleApplyPriceFilter = (minPrice, maxPrice) => {
        setPriceRange({ min: minPrice, max: maxPrice });
        console.log('Filtros de precio aplicados:', { minPrice, maxPrice });
    };

    // Filtrar productos según categoría seleccionada y rango de precios
    const filteredProducts = productos.filter(product => {
        // Verificar coincidencia con la categoría
        const matchesCategory = selectedCategory === 'Todo' ||
            product.category?.toLowerCase().includes(selectedCategory.toLowerCase());

        // Verificar si el precio está dentro del rango
        const matchesPrice = product.price >= priceRange.min && product.price <= priceRange.max;

        return matchesCategory && matchesPrice;
    });

    // Renderizar cada producto en la lista (FlatList)
    const renderProduct = ({ item, index }) => (
        <View style={[styles.cardWrapper, { marginRight: index % 2 === 0 ? elementGap : 0 }]}>
            <ProductCard
                product={item}
                onPress={handleProductPress}
                onAddToCart={handleAddToCart}
                navigation={navigation}
                // Pasar estado de carga para deshabilitar botón mientras se agrega
                isAddingToCart={addingToCart === item._id || updating}
            />
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header con botón de perfil */}
            <View style={styles.header}>
                {/* Espaciador para centrar el botón de perfil */}
                <View style={styles.headerSpacer} />

                {/* Botón de perfil */}
                <TouchableOpacity
                    style={styles.profileButton}
                    onPress={handleProfilePress}
                >
                    <Image source={perfilIcon} style={styles.icon} />
                </TouchableOpacity>
            </View>

            <View style={styles.titleContainer}>
                {isAuthenticated && userInfo?.name ? (
                    // Título personalizado cuando el usuario está autenticado
                    <>
                        <Text style={styles.greetingText}>¡Hola, {userInfo.name}!</Text>
                        <Text style={styles.mainTitle}>Descubre formas de</Text>
                        <Text style={styles.mainTitle}>sorprender</Text>
                    </>
                ) : (
                    // Título por defecto cuando no está autenticado
                    <>
                        <Text style={styles.mainTitle}>Descubre formas de</Text>
                        <Text style={styles.mainTitle}>sorprender</Text>
                    </>
                )}
            </View>

            {/* Contenedor de búsqueda y filtros */}
            <View style={styles.searchWrapper}>
                {/* Botón para abrir filtros de precio */}
                <TouchableOpacity
                    style={styles.filterIconButton}
                    onPress={() => setShowPriceFilter(true)}
                >
                    <Icon name="tune" size={isSmallDevice ? 18 : 20} color="#999" />
                </TouchableOpacity>

                {/* Barra de búsqueda (navegación a pantalla de búsqueda) */}
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

            {/* Scroll horizontal de categorías */}
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
                                // Aplicar estilo activo si está seleccionada
                                selectedCategory === category && styles.categoryButtonActive,
                                // Remover margen del último elemento
                                index === categories.length - 1 && styles.lastCategoryButton
                            ]}
                            onPress={() => setSelectedCategory(category)}
                            activeOpacity={0.7}
                        >
                            <Text
                                style={[
                                    styles.categoryText,
                                    // Cambiar color de texto si está activa
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

            {/* Indicador visual de filtros aplicados */}
            {(priceRange.min > 0 || priceRange.max < 100) && (
                <View style={styles.filterIndicatorContainer}>
                    <View style={styles.filterChip}>
                        <Icon name="filter-list" size={16} color="#4A4170" />
                        <Text style={styles.filterChipText}>
                            Precio: ${priceRange.min} - ${priceRange.max}
                        </Text>
                        {/* Botón para limpiar filtros */}
                        <TouchableOpacity
                            onPress={() => setPriceRange({ min: 0, max: 100 })}
                            style={styles.filterChipClose}
                        >
                            <Icon name="close" size={14} color="#666" />
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Banner de error del carrito */}
            {cartError && (
                <View style={styles.errorContainer}>
                    <Icon name="error-outline" size={16} color="#e74c3c" />
                    <Text style={styles.errorText}>{cartError}</Text>
                    {/* Botón para cerrar el error */}
                    <TouchableOpacity
                        onPress={clearCartError}
                        style={styles.closeButton}
                    >
                        <Icon name="close" size={16} color="#e74c3c" />
                    </TouchableOpacity>
                </View>
            )}

            {/* Banner de error de favoritos */}
            {isAuthenticated && favoritesError && (
                <View style={styles.errorContainer}>
                    <Icon name="error-outline" size={16} color="#e74c3c" />
                    <Text style={styles.errorText}>{favoritesError}</Text>
                    {/* Botón para reintentar cargar favoritos */}
                    <TouchableOpacity
                        onPress={() => getFavorites()}
                        style={styles.retryButton}
                    >
                        <Text style={styles.retryButtonText}>Reintentar</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Banner de carga cuando se actualiza el carrito */}
            {updating && (
                <View style={styles.loadingBanner}>
                    <Icon name="shopping-cart" size={16} color="#4A4170" />
                    <Text style={styles.loadingBannerText}>Actualizando carrito...</Text>
                </View>
            )}

            {/* Lista principal de productos */}
            <FlatList
                data={filteredProducts}
                renderItem={renderProduct}
                keyExtractor={(item) => item._id}
                numColumns={2} // Mostrar 2 columnas
                contentContainerStyle={styles.productsContainer}
                showsVerticalScrollIndicator={false}
                columnWrapperStyle={styles.row}
                // Optimizaciones de rendimiento
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={10}
                removeClippedSubviews={true}
                // Pull-to-refresh
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#4A4170']}
                        tintColor="#4A4170"
                    />
                }
                // Optimización de layout para mejor rendimiento
                getItemLayout={(data, index) => ({
                    length: 200,
                    offset: 200 * Math.floor(index / 2),
                    index,
                })}
                // Componente cuando no hay productos
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

            {/* Barra de navegación inferior */}
            <View style={styles.bottomNav}>
                {/* Botón Home (activo) */}
                <TouchableOpacity style={styles.navItem}>
                    <Icon name="home" size={isSmallDevice ? 20 : 24} color="#4A4170" />
                </TouchableOpacity>

                {/* Botón Favoritos con badge */}
                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => navigation.navigate('Favorites')}
                >
                    <Image source={favoritesIcon} style={styles.navIcon} />
                    {/* Badge con número de favoritos */}
                    {isAuthenticated && favorites.length > 0 && (
                        <View style={styles.favoriteBadge}>
                            <Text style={styles.favoriteBadgeText}>
                                {favorites.length > 99 ? '99+' : favorites.length}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>

                {/* Botón Chat */}
                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => navigation.navigate('Chat')}
                >
                    <Icon name="chat" size={isSmallDevice ? 20 : 24} color="#ccc" />
                </TouchableOpacity>

                {/* Botón Carrito con badge */}
                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => navigation.navigate('Cart')}
                >
                    <Icon name="shopping-cart" size={isSmallDevice ? 20 : 24} color="#ccc" />
                    {/* Badge con número de items en el carrito */}
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
    // Contenedor principal de la pantalla
    container: {
        flex: 1,
        backgroundColor: "#ffffff",
        paddingTop: isSmallDevice ? 45 : 50, // Espaciado superior responsivo
    },

    // Estilos del header
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

    // Estilos del título principal
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

    greetingText: {
        fontSize: isSmallDevice ? 16 : isMediumDevice ? 18 : 20,
        fontFamily: 'Poppins-SemiBold',
        color: '#4A4170',
        marginBottom: isSmallDevice ? 4 : 6,
        lineHeight: isSmallDevice ? 20 : isMediumDevice ? 22 : 24,
    },

    // Estilos de la sección de búsqueda y filtros
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

    // Estilos de las categorías
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

    // Estilos de los indicadores de filtros
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

    // Estilos de los contenedores de error
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

    // Banner de estado de carga del carrito
    loadingBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e8f4f8',
        margin: horizontalPadding,
        padding: 12,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#4A4170',
    },
    loadingBannerText: {
        fontSize: 12,
        color: '#4A4170',
        marginLeft: 8,
        fontFamily: 'Poppins-Regular',
    },

    // Estilos de estados de carga y vacío
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

    // Estilos de la lista de productos
    productsContainer: {
        paddingHorizontal: horizontalPadding,
        paddingTop: 5,
        paddingBottom: isSmallDevice ? 90 : 100, // Espacio para la navegación inferior
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

    // Estilos de la navegación inferior
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

    // Estilos de los badges (contadores)
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