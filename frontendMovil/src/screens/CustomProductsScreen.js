import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    ScrollView,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    SafeAreaView,
    StatusBar
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useCustomProductsByType } from "../hooks/useCustomProductsMaterials";
import MaterialCard from "../components/MaterialCard";
import CustomizationPanel from "../components/CustomizationPanel";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAlert } from "../hooks/useAlert";
import { 
    CustomAlert, 
    ConfirmationDialog, 
    ToastDialog 
} from "../components/CustomAlerts";

// Obtener dimensiones de la pantalla
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Constantes para diseño responsivo
const isSmallDevice = screenWidth < 375;
const isMediumDevice = screenWidth >= 375 && screenWidth < 414;
const horizontalPadding = isSmallDevice ? 12 : isMediumDevice ? 16 : 20;
const cardSpacing = isSmallDevice ? 8 : 12;

// Constantes para el bottom sheet
const BOTTOM_SHEET_MIN_HEIGHT = 120;
const CONTENT_PADDING_BOTTOM = BOTTOM_SHEET_MIN_HEIGHT + 20; 

export default function CustomProductsScreen({ route, navigation }) {
    // Obtener parámetros de la navegación
    const { productType, categories: availableCategories = [] } = route.params || {};

    // Safe Area Insets
    const insets = useSafeAreaInsets();
    const bottomInset = insets.bottom;

    // Contextos
    const { isAuthenticated, userInfo } = useAuth();
    const { addToCart } = useCart();

    // Hook de alertas personalizadas
    const {
        alertState,
        showConfirmation,
        hideConfirmation,
        showSuccessToast,
        showErrorToast,
        showError
    } = useAlert();

    // Estados locales
    const [activeCategory, setActiveCategory] = useState('todos');
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    // Hook para obtener datos del producto
    const { productData, loading, error, refetch } = useCustomProductsByType(productType);

    // Verificar si hay tipo de producto
    useEffect(() => {
        if (!productType) {
            navigation.goBack();
        }
    }, [productType, navigation]);

    // Función para volver atrás
    const handleGoBack = useCallback(() => {
        // Si hay productos seleccionados, mostrar confirmación
        if (selectedProducts.length > 0) {
            showConfirmation({
                title: "Confirmar salida",
                message: "¿Estás seguro de que quieres salir? Perderás tu personalización actual.",
                confirmText: "Salir",
                cancelText: "Cancelar",
                isDangerous: true,
                onConfirm: () => {
                    hideConfirmation();
                    navigation.goBack();
                },
                onCancel: hideConfirmation
            });
        } else {
            navigation.goBack();
        }
    }, [navigation, selectedProducts, showConfirmation, hideConfirmation]);

    // Función para refrescar datos
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            if (refetch) {
                await refetch();
            }
        } catch (error) {
            console.error('Error al refrescar:', error);
            showErrorToast('Error al actualizar los datos');
        } finally {
            setRefreshing(false);
        }
    }, [refetch, showErrorToast]);

    // Configuración de categorías dinámicas
    const getCategoriesForProduct = () => {
        const baseCategories = [{ id: 'todos', name: 'Todos' }];

        if (availableCategories.length > 0) {
            return [
                ...baseCategories,
                ...availableCategories.map((cat) => ({
                    id: cat.toLowerCase().replace(/\s+/g, '-'),
                    name: cat
                }))
            ];
        }

        return baseCategories;
    };

    const productCategories = getCategoriesForProduct();

    // Maneja el cambio de categoría
    const handleCategoryChange = (categoryId) => {
        setActiveCategory(categoryId);
    };

    // Maneja la adición de productos individuales al carrito 
    const handleAddToCart = async (product) => {
        if (!isAuthenticated) {
            showConfirmation({
                title: "Iniciar sesión",
                message: "Debes iniciar sesión para agregar productos al carrito",
                confirmText: "Iniciar sesión",
                cancelText: "Cancelar",
                onConfirm: () => {
                    hideConfirmation();
                    navigation.navigate('Login');
                },
                onCancel: hideConfirmation
            });
            return;
        }

        try {
            await addToCart({
                ...product,
                type: 'individual',
                productType: productType
            });
            showSuccessToast(`${product.name} se ha añadido al carrito`);
        } catch (error) {
            showErrorToast('No se pudo agregar el producto al carrito');
        }
    };

    // Maneja la personalización de productos 
    const handleCustomize = useCallback((product, isSelected) => {
        console.log(`Toggling product ${product.name}: ${isSelected}`);

        if (isSelected) {
            // Agregar producto a la selección
            setSelectedProducts(prev => {
                const existingProduct = prev.find(p => p._id === product._id);
                if (existingProduct) {
                    console.log('Product already selected');
                    return prev;
                }
                const newSelection = [...prev, product];
                console.log(`Added product. Total selected: ${newSelection.length}`);
                return newSelection;
            });
        } else {
            // Quitar producto de la selección
            setSelectedProducts(prev => {
                const newSelection = prev.filter(p => p._id !== product._id);
                console.log(`Removed product. Total selected: ${newSelection.length}`);
                return newSelection;
            });
        }
    }, []);

    // Maneja la eliminación de productos desde el panel
    const handleRemoveProduct = useCallback((productId) => {
        setSelectedProducts(prev => {
            const newSelection = prev.filter(p => p._id !== productId);
            console.log(`Removed product from panel. Total selected: ${newSelection.length}`);
            return newSelection;
        });
    }, []);

    // Maneja la finalización de la personalización
    const handleFinishCustomization = useCallback(async (customizationData) => {
        if (!isAuthenticated) {
            showConfirmation({
                title: "Iniciar sesión",
                message: "Debes iniciar sesión para completar tu personalización",
                confirmText: "Iniciar sesión",
                cancelText: "Cancelar",
                onConfirm: () => {
                    hideConfirmation();
                    navigation.navigate('Login');
                },
                onCancel: hideConfirmation
            });
            return;
        }

        try {
            const customizationOrder = {
                ...customizationData,
                type: 'customization',
                id: `custom-${Date.now()}`,
                timestamp: new Date().toISOString()
            };

            // Agregar al carrito usando el contexto
            await addToCart(customizationOrder);

            // Limpiar selección
            setSelectedProducts([]);

            showConfirmation({
                title: "¡Personalización completada!",
                message: "Tu producto personalizado ha sido agregado al carrito",
                confirmText: "Ver carrito",
                cancelText: "Continuar personalizando",
                onConfirm: () => {
                    hideConfirmation();
                    navigation.navigate('ShoppingCart');
                },
                onCancel: hideConfirmation
            });
        } catch (error) {
            console.error('Error al finalizar personalización:', error);
            showError('No se pudo completar tu personalización. Inténtalo de nuevo.');
        }
    }, [isAuthenticated, addToCart, navigation, showConfirmation, hideConfirmation, showError]);

    // Transformar datos de materiales
    const transformMaterialsToProducts = (materials) => {
        return materials.map(material => ({
            _id: material._id,
            name: material.name,
            description: `Stock disponible: ${material.stock}`,
            price: material.price,
            image: material.image,
            inStock: material.stock > 0,
            category: material.categoryToParticipate,
            stock: material.stock,
            productToPersonalize: material.productToPersonalize
        }));
    };

    // Memorizar productos filtrados para optimización
    const filteredProducts = useMemo(() => {
        if (!productData || !productData.categories) return [];

        return Object.entries(productData.categories).reduce((acc, [categoryName, materials]) => {
            const categoryId = categoryName.toLowerCase().replace(/\s+/g, '-');
            if (activeCategory === 'todos' || activeCategory === categoryId) {
                const transformedProducts = transformMaterialsToProducts(materials);
                return [...acc, ...transformedProducts];
            }
            return acc;
        }, []);
    }, [productData, activeCategory]);

    // Renderizar producto
    const renderMaterial = ({ item }) => (
        <View style={styles.materialWrapper}>
            <MaterialCard
                material={item}
                onCustomize={handleCustomize}
                onAddToCart={handleAddToCart}
                isSelected={selectedProducts.some(p => p._id === item._id)}
            />
        </View>
    );

    // Estados de loading y error
    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor="#fff" />
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#e91e63" />
                    <Text style={styles.loadingText}>Cargando productos...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centerContainer}>
                    <Icon name="error-outline" size={48} color="#e91e63" />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.buttonText}>Volver</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    if (!productData || Object.keys(productData.categories).length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centerContainer}>
                    <Icon name="inventory" size={48} color="#999" />
                    <Text style={styles.emptyTitle}>Sin materiales disponibles</Text>
                    <Text style={styles.emptyText}>
                        No hay materiales para personalizar este producto
                    </Text>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.buttonText}>Volver</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={handleGoBack}
                    style={styles.backButton}
                >
                    <Icon name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Personalizar</Text>
                    <Text style={styles.headerSubtitle}>{productType}</Text>
                </View>
            </View>

            {/* Información del producto */}
            <View style={styles.productInfo}>
                <Text style={styles.productDescription}>
                    Selecciona los materiales para crear tu producto único
                </Text>
                <View style={styles.infoTags}>
                    <View style={styles.infoTag}>
                        <Text style={styles.infoTagText}>
                            {productData.totalMaterials} materiales
                        </Text>
                    </View>
                    <View style={styles.infoTag}>
                        <Text style={styles.infoTagText}>
                            {Object.keys(productData.categories).length} categorías
                        </Text>
                    </View>
                    {selectedProducts.length > 0 && (
                        <View style={[styles.infoTag, styles.selectedTag]}>
                            <Text style={[styles.infoTagText, styles.selectedTagText]}>
                                {selectedProducts.length} seleccionados
                            </Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Categorías */}
            <View style={styles.categoriesSection}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoriesContainer}
                >
                    {productCategories.map((category) => (
                        <TouchableOpacity
                            key={category.id}
                            style={[
                                styles.categoryButton,
                                activeCategory === category.id && styles.categoryButtonActive
                            ]}
                            onPress={() => handleCategoryChange(category.id)}
                        >
                            <Text
                                style={[
                                    styles.categoryText,
                                    activeCategory === category.id && styles.categoryTextActive
                                ]}
                            >
                                {category.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Lista de materiales con padding bottom para el bottom sheet */}
            <View style={styles.materialsSection}>
                <FlatList
                    data={filteredProducts}
                    renderItem={renderMaterial}
                    keyExtractor={(item) => item._id}
                    numColumns={2}
                    contentContainerStyle={styles.materialsContainer}
                    columnWrapperStyle={styles.materialsRow}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#e91e63']}
                            tintColor="#e91e63"
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyMaterials}>
                            <Icon name="search-off" size={40} color="#ccc" />
                            <Text style={styles.emptyMaterialsText}>
                                No hay materiales en esta categoría
                            </Text>
                        </View>
                    }
                />
            </View>

            {/* Bottom Sheet - CustomizationPanel */}
            <CustomizationPanel
                selectedProducts={selectedProducts}
                onRemoveProduct={handleRemoveProduct}
                onFinishCustomization={handleFinishCustomization}
                productType={productType}
            />

            {/* Custom Alert Components */}
            <ConfirmationDialog
                visible={alertState.confirmation.visible}
                title={alertState.confirmation.title}
                message={alertState.confirmation.message}
                onConfirm={alertState.confirmation.onConfirm}
                onCancel={alertState.confirmation.onCancel}
                confirmText={alertState.confirmation.confirmText}
                cancelText={alertState.confirmation.cancelText}
                isDangerous={alertState.confirmation.isDangerous}
            />

            <CustomAlert
                visible={alertState.basicAlert.visible}
                title={alertState.basicAlert.title}
                message={alertState.basicAlert.message}
                onConfirm={alertState.basicAlert.onConfirm}
                onCancel={alertState.basicAlert.onCancel}
                confirmText={alertState.basicAlert.confirmText}
                cancelText={alertState.basicAlert.cancelText}
                showCancel={alertState.basicAlert.showCancel}
                type={alertState.basicAlert.type}
            />

            <ToastDialog
                visible={alertState.toast.visible}
                message={alertState.toast.message}
                type={alertState.toast.type}
                duration={alertState.toast.duration}
                onHide={() => {}}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },

    // Estados centralizados
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: horizontalPadding,
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
        marginTop: 12,
        fontFamily: 'Poppins-Regular',
    },
    errorText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginVertical: 16,
        fontFamily: 'Poppins-Regular',
    },
    emptyTitle: {
        fontSize: 18,
        fontFamily: 'Poppins-SemiBold',
        color: '#333',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
        fontFamily: 'Poppins-Regular',
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: horizontalPadding,
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        paddingTop: 60, 
    },
    backButton: {
        padding: 8,
        borderRadius: 8,
        marginRight: 16,
    },
    headerContent: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: 'Poppins-Bold',
        color: '#333',
    },
    headerSubtitle: {
        fontSize: 14,
        fontFamily: 'Poppins-Medium',
        color: '#e91e63',
        marginTop: 2,
    },

    // Información del producto
    productInfo: {
        paddingHorizontal: horizontalPadding,
        paddingVertical: 16,
        backgroundColor: '#fff',
    },
    productDescription: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: '#666',
        marginBottom: 12,
        lineHeight: 20,
    },
    infoTags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    infoTag: {
        backgroundColor: '#f8f9fa',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    selectedTag: {
        backgroundColor: '#e8f5e8',
        borderColor: '#c8e6c9',
    },
    infoTagText: {
        fontSize: 12,
        fontFamily: 'Poppins-Medium',
        color: '#666',
    },
    selectedTagText: {
        color: '#2e7d32',
    },

    // Categorías
    categoriesSection: {
        backgroundColor: '#fff',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    categoriesContainer: {
        paddingHorizontal: horizontalPadding,
        alignItems: 'center',
    },
    categoryButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#f8f9fa',
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    categoryButtonActive: {
        backgroundColor: '#e91e63',
        borderColor: '#e91e63',
    },
    categoryText: {
        fontSize: 13,
        fontFamily: 'Poppins-Medium',
        color: '#666',
    },
    categoryTextActive: {
        color: '#fff',
        fontFamily: 'Poppins-SemiBold',
    },
    materialsSection: {
        flex: 1,
        backgroundColor: '#fff',
    },
    materialsContainer: {
        paddingHorizontal: horizontalPadding,
        paddingTop: 16,
        paddingBottom: CONTENT_PADDING_BOTTOM,
    },
    materialsRow: {
        justifyContent: 'space-between',
        marginBottom: cardSpacing,
    },
    materialWrapper: {
        width: '48%',
    },
    emptyMaterials: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyMaterialsText: {
        fontSize: 14,
        color: '#999',
        marginTop: 12,
        fontFamily: 'Poppins-Regular',
    },

    // Botones
    button: {
        backgroundColor: '#e91e63',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
    },
});