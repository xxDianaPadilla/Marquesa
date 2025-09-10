import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Dimensions,
    Alert,
    TextInput,
    Image,
    Animated,
    PanResponder,
    Keyboard
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Obtener dimensiones de la pantalla
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Constantes para el bottom sheet
const BOTTOM_SHEET_MIN_HEIGHT = 140; 
const BOTTOM_SHEET_MAX_HEIGHT = screenHeight * 0.75; 
const BOTTOM_SHEET_SNAP_THRESHOLD = 50; 

export default function CustomizationPanel({
    selectedProducts = [],
    onRemoveProduct,
    onFinishCustomization,
    productType = ''
}) {
    const [comments, setComments] = useState('');
    const [showComments, setShowComments] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    
    // Obtener insets para detectar la barra de navegación
    const insets = useSafeAreaInsets();
    const bottomInset = insets.bottom; 

    // Animaciones
    const translateY = useRef(new Animated.Value(BOTTOM_SHEET_MAX_HEIGHT - BOTTOM_SHEET_MIN_HEIGHT)).current;
    const [isExpanded, setIsExpanded] = useState(false);

    // Configurar listeners del teclado
    useEffect(() => {
        const keyboardDidShow = Keyboard.addListener('keyboardDidShow', (e) => {
            setKeyboardHeight(e.endCoordinates.height);
            // Expandir automáticamente cuando aparece el teclado
            if (!isExpanded) {
                expandBottomSheet();
            }
        });

        const keyboardDidHide = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardHeight(0);
        });

        return () => {
            keyboardDidShow.remove();
            keyboardDidHide.remove();
        };
    }, [isExpanded]);

    // Configurar PanResponder para gestos
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return Math.abs(gestureState.dy) > 5;
            },
            onPanResponderMove: (_, gestureState) => {
                const newTranslateY = Math.max(
                    0,
                    Math.min(
                        BOTTOM_SHEET_MAX_HEIGHT - BOTTOM_SHEET_MIN_HEIGHT,
                        (BOTTOM_SHEET_MAX_HEIGHT - BOTTOM_SHEET_MIN_HEIGHT) + gestureState.dy
                    )
                );
                translateY.setValue(newTranslateY);
            },
            onPanResponderRelease: (_, gestureState) => {
                const { dy, vy } = gestureState;
                
                if (Math.abs(vy) > 0.5) {
                    // Basado en velocidad
                    if (vy > 0) {
                        collapseBottomSheet();
                    } else {
                        expandBottomSheet();
                    }
                } else {
                    // Basado en posición
                    if (dy > BOTTOM_SHEET_SNAP_THRESHOLD) {
                        collapseBottomSheet();
                    } else if (dy < -BOTTOM_SHEET_SNAP_THRESHOLD) {
                        expandBottomSheet();
                    } else {
                        // Volver a la posición anterior
                        if (isExpanded) {
                            expandBottomSheet();
                        } else {
                            collapseBottomSheet();
                        }
                    }
                }
            },
        })
    ).current;

    // Funciones para expandir/colapsar
    const expandBottomSheet = () => {
        setIsExpanded(true);
        Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
        }).start();
    };

    const collapseBottomSheet = () => {
        setIsExpanded(false);
        Animated.spring(translateY, {
            toValue: BOTTOM_SHEET_MAX_HEIGHT - BOTTOM_SHEET_MIN_HEIGHT,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
        }).start();
    };

    // Calcular precio total
    const totalPrice = useMemo(() => {
        return selectedProducts.reduce((total, product) => {
            return total + (product.price || 0);
        }, 0);
    }, [selectedProducts]);

    // Agrupar productos por categoría
    const groupedProducts = useMemo(() => {
        return selectedProducts.reduce((acc, product) => {
            const category = product.category || 'Sin categoría';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(product);
            return acc;
        }, {});
    }, [selectedProducts]);

    // Manejar eliminación de producto
    const handleRemoveProduct = (productId) => {
        Alert.alert(
            "Remover producto",
            "¿Estás seguro de que quieres remover este producto de tu personalización?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Remover",
                    style: "destructive",
                    onPress: () => onRemoveProduct(productId)
                }
            ]
        );
    };

    // Manejar finalización de personalización
    const handleFinishCustomization = () => {
        if (selectedProducts.length === 0) {
            Alert.alert(
                "Sin productos",
                "Debes seleccionar al menos un producto para personalizar"
            );
            return;
        }

        const customizationData = {
            selectedProducts,
            productType,
            totalPrice,
            comments: comments.trim(),
            timestamp: new Date().toISOString()
        };

        Alert.alert(
            "Finalizar personalización",
            `¿Confirmas tu personalización de ${productType}?\n\nTotal: $${totalPrice.toFixed(2)} USD\nProductos: ${selectedProducts.length}`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Confirmar",
                    onPress: () => onFinishCustomization(customizationData)
                }
            ]
        );
    };

    // Limpiar toda la selección
    const handleClearAll = () => {
        if (selectedProducts.length === 0) return;

        Alert.alert(
            "Limpiar selección",
            "¿Estás seguro de que quieres remover todos los productos seleccionados?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Limpiar todo",
                    style: "destructive",
                    onPress: () => {
                        selectedProducts.forEach(product => {
                            onRemoveProduct(product._id);
                        });
                    }
                }
            ]
        );
    };

    return (
        <>
            {/* Fondo blanco que se extiende hasta la barra de navegación */}
            <View style={[styles.backgroundExtension, { height: bottomInset }]} />
            
            <Animated.View 
                style={[
                    styles.container,
                    {
                        transform: [{ translateY }],
                        paddingBottom: keyboardHeight + bottomInset, 
                    }
                ]}
            >
                {/* Handle para arrastrar */}
                <View style={styles.handleContainer} {...panResponder.panHandlers}>
                    <View style={styles.handle} />
                    
                    {/* Header compacto */}
                    <View style={styles.compactHeader}>
                        <View style={styles.headerLeft}>
                            <Icon name="palette" size={16} color="#4A4170" />
                            <Text style={styles.compactTitle}>Personalización</Text>
                            {selectedProducts.length > 0 && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{selectedProducts.length}</Text>
                                </View>
                            )}
                        </View>
                        
                        <View style={styles.headerRight}>
                            {selectedProducts.length > 0 && (
                                <Text style={styles.compactPrice}>
                                    ${totalPrice.toFixed(2)}
                                </Text>
                            )}
                            <TouchableOpacity
                                onPress={isExpanded ? collapseBottomSheet : expandBottomSheet}
                                style={styles.expandButton}
                            >
                                <Icon 
                                    name={isExpanded ? "keyboard-arrow-down" : "keyboard-arrow-up"} 
                                    size={20} 
                                    color="#666" 
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Vista previa - Solo visible cuando está colapsado */}
                {!isExpanded && (
                    <View style={styles.previewContent}>
                        {/* Header de productos seleccionados */}
                        <View style={styles.previewHeader}>
                            <Text style={styles.previewTitle}>Productos seleccionados</Text>
                            {selectedProducts.length > 0 && (
                                <TouchableOpacity
                                    onPress={handleClearAll}
                                    style={styles.clearButtonSmall}
                                >
                                    <Icon name="clear-all" size={16} color="#e74c3c" />
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Vista previa de productos o estado vacío */}
                        {selectedProducts.length === 0 ? (
                            <View style={styles.emptyPreview}>
                                <Icon name="shopping-basket" size={20} color="#ccc" />
                                <Text style={styles.emptyPreviewText}>
                                    Selecciona materiales para personalizar
                                </Text>
                            </View>
                        ) : (
                            <View style={styles.productsPreview}>
                                <ScrollView 
                                    horizontal 
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.productsPreviewContainer}
                                >
                                    {selectedProducts.slice(0, 4).map((product, index) => (
                                        <View key={product._id} style={styles.previewProductItem}>
                                            {product.image ? (
                                                <Image
                                                    source={{ uri: product.image }}
                                                    style={styles.previewProductImage}
                                                    resizeMode="cover"
                                                />
                                            ) : (
                                                <View style={styles.previewProductImagePlaceholder}>
                                                    <Icon name="image" size={12} color="#ccc" />
                                                </View>
                                            )}
                                            <Text style={styles.previewProductName} numberOfLines={1}>
                                                {product.name}
                                            </Text>
                                        </View>
                                    ))}
                                    {selectedProducts.length > 4 && (
                                        <View style={styles.moreProductsIndicator}>
                                            <Text style={styles.moreProductsText}>
                                                +{selectedProducts.length - 4}
                                            </Text>
                                        </View>
                                    )}
                                </ScrollView>
                            </View>
                        )}
                    </View>
                )}

                {/* Contenido expandible completo */}
                {isExpanded && (
                    <View style={styles.expandedContent}>
                        {/* Header expandido */}
                        <View style={styles.expandedHeader}>
                            <View style={styles.headerTitle}>
                                <Text style={styles.title}>Productos seleccionados</Text>
                            </View>
                            {selectedProducts.length > 0 && (
                                <TouchableOpacity
                                    onPress={handleClearAll}
                                    style={styles.clearButton}
                                >
                                    <Icon name="clear-all" size={18} color="#e74c3c" />
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Información del producto */}
                        <View style={styles.productTypeContainer}>
                            <Text style={styles.productTypeText}>{productType}</Text>
                            <Text style={styles.productCount}>
                                {selectedProducts.length} {selectedProducts.length === 1 ? 'producto' : 'productos'}
                            </Text>
                        </View>

                        {/* Lista de productos seleccionados */}
                        <ScrollView 
                            style={styles.productsList}
                            showsVerticalScrollIndicator={false}
                            nestedScrollEnabled={true}
                        >
                            {selectedProducts.length === 0 ? (
                                <View style={styles.emptyState}>
                                    <Icon name="shopping-basket" size={32} color="#ccc" />
                                    <Text style={styles.emptyText}>
                                        No has seleccionado productos aún
                                    </Text>
                                    <Text style={styles.emptySubtext}>
                                        Selecciona materiales para personalizar tu {productType.toLowerCase()}
                                    </Text>
                                </View>
                            ) : (
                                <>
                                    {Object.entries(groupedProducts).map(([category, products]) => (
                                        <View key={category} style={styles.categorySection}>
                                            <Text style={styles.categoryTitle}>{category}</Text>
                                            {products.map((product) => (
                                                <View key={product._id} style={styles.productItem}>
                                                    {/* Imagen del producto */}
                                                    <View style={styles.productImageContainer}>
                                                        {product.image ? (
                                                            <Image
                                                                source={{ uri: product.image }}
                                                                style={styles.productImage}
                                                                resizeMode="cover"
                                                            />
                                                        ) : (
                                                            <View style={styles.productImagePlaceholder}>
                                                                <Icon name="image" size={16} color="#ccc" />
                                                            </View>
                                                        )}
                                                    </View>

                                                    {/* Información del producto */}
                                                    <View style={styles.productInfo}>
                                                        <Text style={styles.productName} numberOfLines={2}>
                                                            {product.name}
                                                        </Text>
                                                        <Text style={styles.productPrice}>
                                                            ${product.price?.toFixed(2) || '0.00'}
                                                        </Text>
                                                    </View>

                                                    {/* Botón de eliminar */}
                                                    <TouchableOpacity
                                                        onPress={() => handleRemoveProduct(product._id)}
                                                        style={styles.removeButton}
                                                    >
                                                        <Icon name="close" size={16} color="#e74c3c" />
                                                    </TouchableOpacity>
                                                </View>
                                            ))}
                                        </View>
                                    ))}
                                </>
                            )}
                        </ScrollView>

                        {/* Resumen y botón de finalizar */}
                        {selectedProducts.length > 0 && (
                            <View style={styles.summary}>
                                {/* Total */}
                                <View style={styles.totalContainer}>
                                    <Text style={styles.totalLabel}>Total estimado:</Text>
                                    <Text style={styles.totalPrice}>${totalPrice.toFixed(2)} USD</Text>
                                </View>

                                {/* Nota sobre el precio */}
                                <Text style={styles.priceNote}>
                                    * El precio final puede variar según las especificaciones
                                </Text>

                                {/* Botón de finalizar */}
                                <TouchableOpacity
                                    style={styles.finishButton}
                                    onPress={handleFinishCustomization}
                                    activeOpacity={0.8}
                                >
                                    <Icon name="check-circle" size={20} color="#fff" />
                                    <Text style={styles.finishButtonText}>
                                        Finalizar personalización
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}
            </Animated.View>
        </>
    );
}

const styles = StyleSheet.create({
    // Fondo que se extiende hasta la barra de navegación
    backgroundExtension: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
    },

    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: BOTTOM_SHEET_MAX_HEIGHT,
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 10,
    },

    // Handle y header compacto
    handleContainer: {
        paddingTop: 8,
        paddingBottom: 12,
        alignItems: 'center',
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: '#ddd',
        borderRadius: 2,
        marginBottom: 12,
    },
    compactHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 16,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    compactTitle: {
        fontSize: 14,
        fontFamily: 'Poppins-SemiBold',
        color: '#333',
        marginLeft: 8,
    },
    badge: {
        backgroundColor: '#e91e63',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },
    badgeText: {
        fontSize: 10,
        fontFamily: 'Poppins-Bold',
        color: '#fff',
    },
    compactPrice: {
        fontSize: 13,
        fontFamily: 'Poppins-Bold',
        color: '#27ae60',
        marginRight: 8,
    },
    expandButton: {
        padding: 4,
    },

    // Vista previa 
    previewContent: {
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    previewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 55,
    },
    previewTitle: {
        fontSize: 12,
        fontFamily: 'Poppins-SemiBold',
        color: '#333',
        marginTop: -5,
    },
    clearButtonSmall: {
        padding: 2,
        borderRadius: 4,
        backgroundColor: '#ffebee',
        marginTop: -5,
    },
    emptyPreview: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    emptyPreviewText: {
        fontSize: 11,
        fontFamily: 'Poppins-Regular',
        color: '#999',
        marginLeft: 8,
        flex: 1,
    },
    productsPreview: {
        height: 60,
    },
    productsPreviewContainer: {
        alignItems: 'center',
    },
    previewProductItem: {
        width: 40,
        alignItems: 'center',
        marginRight: 12,
    },
    previewProductImage: {
        width: 32,
        height: 32,
        borderRadius: 6,
        marginBottom: 4,
    },
    previewProductImagePlaceholder: {
        width: 32,
        height: 32,
        borderRadius: 6,
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    previewProductName: {
        fontSize: 8,
        fontFamily: 'Poppins-Medium',
        color: '#333',
        textAlign: 'center',
    },
    moreProductsIndicator: {
        width: 32,
        height: 32,
        borderRadius: 6,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    moreProductsText: {
        fontSize: 10,
        fontFamily: 'Poppins-SemiBold',
        color: '#666',
    },

    // Contenido expandido
    expandedContent: {
        flex: 1,
        paddingHorizontal: 16,
    },

    // Header expandido
    expandedHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerTitle: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    title: {
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
        color: '#333',
        marginLeft: 8,
    },
    clearButton: {
        padding: 4,
        borderRadius: 4,
        backgroundColor: '#ffebee',
    },

    // Información del producto
    productTypeContainer: {
        backgroundColor: '#f8f9fa',
        padding: 10,
        borderRadius: 8,
        marginBottom: 12,
    },
    productTypeText: {
        fontSize: 13,
        fontFamily: 'Poppins-SemiBold',
        color: '#4A4170',
        marginBottom: 2,
    },
    productCount: {
        fontSize: 10,
        fontFamily: 'Poppins-Regular',
        color: '#666',
    },

    // Lista de productos
    productsList: {
        flex: 1,
        maxHeight: 250,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 30,
    },
    emptyText: {
        fontSize: 12,
        fontFamily: 'Poppins-Medium',
        color: '#999',
        marginTop: 8,
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: 10,
        fontFamily: 'Poppins-Regular',
        color: '#ccc',
        marginTop: 4,
        textAlign: 'center',
        lineHeight: 14,
    },

    // Secciones de categoría
    categorySection: {
        marginBottom: 12,
    },
    categoryTitle: {
        fontSize: 11,
        fontFamily: 'Poppins-SemiBold',
        color: '#4A4170',
        marginBottom: 6,
        paddingHorizontal: 4,
    },

    // Items de producto
    productItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        padding: 8,
        borderRadius: 8,
        marginBottom: 6,
    },
    productImageContainer: {
        width: 32,
        height: 32,
        borderRadius: 6,
        overflow: 'hidden',
        marginRight: 8,
        backgroundColor: '#e0e0e0',
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    productImagePlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        fontSize: 11,
        fontFamily: 'Poppins-Medium',
        color: '#333',
        marginBottom: 2,
        lineHeight: 13,
    },
    productPrice: {
        fontSize: 10,
        fontFamily: 'Poppins-SemiBold',
        color: '#27ae60',
    },
    removeButton: {
        padding: 6,
        borderRadius: 4,
        backgroundColor: '#ffebee',
    },

    // Sección de comentarios
    commentsSection: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    commentsToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    commentsToggleText: {
        flex: 1,
        fontSize: 11,
        fontFamily: 'Poppins-Medium',
        color: '#666',
        marginLeft: 8,
    },
    commentsInput: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 10,
        fontSize: 11,
        fontFamily: 'Poppins-Regular',
        color: '#333',
        minHeight: 60,
        maxHeight: 100,
        marginTop: 8,
    },

    // Resumen
    summary: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    totalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    totalLabel: {
        fontSize: 12,
        fontFamily: 'Poppins-SemiBold',
        color: '#333',
    },
    totalPrice: {
        fontSize: 14,
        fontFamily: 'Poppins-Bold',
        color: '#27ae60',
    },
    priceNote: {
        fontSize: 9,
        fontFamily: 'Poppins-Regular',
        color: '#999',
        fontStyle: 'italic',
        marginBottom: 12,
        textAlign: 'center',
    },
    finishButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4A4170',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        shadowColor: '#4A4170',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    finishButtonText: {
        fontSize: 12,
        fontFamily: 'Poppins-SemiBold',
        color: '#fff',
        marginLeft: 8,
    },
});