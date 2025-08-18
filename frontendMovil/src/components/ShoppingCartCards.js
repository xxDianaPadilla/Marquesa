import React from 'react'; // Importamos react
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert,
    ToastAndroid,
    Platform
} from 'react-native'; // Importamos react native
import iconBasura from '../images/iconBasura.png'; // Importamos iconos de basura

// Componentes y cards para carrito de compras
const ShoppingCartCards = ({
    cartItems = [],
    updatingItems = new Set(),
    isCustomProduct,
    getCustomizationDetails,
    getProductImage,
    onUpdateQuantity,
    onRemoveItem
}) => {

    // Función para mostrar toast/mensaje
    const showToast = (message) => {
        if (Platform.OS === 'android') {
            ToastAndroid.show(message, ToastAndroid.SHORT);
        } else {
            Alert.alert('Información', message);
        }
    };

    // Componente para mostrar detalles de personalización
    const CustomizationDetails = ({ item }) => {
        const details = getCustomizationDetails(item);

        if (!details) return null;

        return (
            <View style={styles.customizationContainer}>
                <Text style={styles.customizationTitle}>🎨 Personalización:</Text>
                {details.extraComments && (
                    <Text style={styles.customizationText}>• {details.extraComments}</Text>
                )}
                {details.designDetails && (
                    <Text style={styles.customizationText}>• Diseño: {details.designDetails}</Text>
                )}
                {details.materialPreferences && (
                    <Text style={styles.customizationText}>• Material: {details.materialPreferences}</Text>
                )}
                {details.colorPreferences && (
                    <Text style={styles.customizationText}>• Color: {details.colorPreferences}</Text>
                )}
                {details.sizePreferences && (
                    <Text style={styles.customizationText}>• Tamaño: {details.sizePreferences}</Text>
                )}
            </View>
        );
    };

    // Componente para mostrar imagen o emoji personalizado
    const ProductImageOrEmoji = ({ item, isCustom }) => {
        if (isCustom) {
            return (
                <View style={styles.customProductContainer}>
                    <Text style={styles.customProductEmoji}>🎨</Text>
                    <Text style={styles.customProductLabel}>Personalizado</Text>
                </View>
            );
        }

        return (
            <Image
                source={{ uri: getProductImage(item) }}
                style={styles.itemImage}
            />
        );
    };

    // Manejador para actualizar cantidad
    const handleUpdateQuantity = (itemId, delta) => {
        if (onUpdateQuantity) {
            onUpdateQuantity(itemId, delta);
        }
    };

    // Manejador para remover item
    const handleRemoveItem = (itemId, itemName, itemType) => {
        if (onRemoveItem) {
            onRemoveItem(itemId, itemName, itemType);
        }
    };

    if (!cartItems || cartItems.length === 0) {
        return null;
    }

    // Diseño de cards
    return (
        <View style={styles.container}>
            {cartItems.map((item, index) => {
                const itemId = item.id;
                const isUpdating = updatingItems.has(itemId);
                const isCustom = isCustomProduct(item);

                return (
                    <View key={`${itemId}-${index}`} style={[
                        styles.cartItem,
                        isUpdating && styles.cartItemUpdating,
                        isCustom && styles.cartItemCustom
                    ]}>
                        {/* Overlay de loading */}
                        {isUpdating && (
                            <View style={styles.itemLoadingOverlay}>
                                <ActivityIndicator size="small" color="#4A4170" />
                            </View>
                        )}

                        {/* Imagen del producto o emoji personalizado */}
                        <ProductImageOrEmoji item={item} isCustom={isCustom} />

                        <View style={styles.itemDetails}>
                            <Text style={styles.itemName}>
                                {item.name || 'Producto sin nombre'}
                            </Text>

                            {/* Precio con indicador de tipo */}
                            <View style={styles.priceContainer}>
                                <Text style={styles.itemPrice}>
                                    ${item.price || 0}
                                </Text>
                                {isCustom && (
                                    <Text style={styles.customPriceLabel}>personalizado</Text>
                                )}
                            </View>

                            {/* Descripción para productos personalizados */}
                            {item.description && (
                                <Text style={styles.itemDescription} numberOfLines={2}>
                                    {item.description}
                                </Text>
                            )}

                            {/* Detalles de personalización */}
                            {isCustom && <CustomizationDetails item={item} />}

                        </View>

                        <View style={styles.rightSection}>
                            {/* Botón de eliminar */}
                            <TouchableOpacity
                                style={[styles.trashButton, isUpdating && styles.buttonDisabled]}
                                onPress={() => handleRemoveItem(itemId, item.name, item.itemType)}
                                disabled={isUpdating}
                            >
                                <Image source={iconBasura} style={styles.trashIcon} />
                            </TouchableOpacity>

                            {/* Subtotal del item */}
                            <Text style={styles.itemSubtotal}>
                                ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                            </Text>
                        </View>
                    </View>
                );
            })}
        </View>
    );
};

// Configuración de estilos
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    cartItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        position: 'relative',
    },
    cartItemUpdating: {
        opacity: 0.7,
    },
    cartItemCustom: {
        borderLeftWidth: 4,
        borderLeftColor: '#E8ACD2',
        backgroundColor: '#fefefe',
    },
    itemLoadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 16,
        zIndex: 10,
    },
    itemImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
        resizeMode: 'cover'
    },
    customProductContainer: {
        width: 80,
        height: 80,
        borderRadius: 12,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E8ACD2',
        borderStyle: 'dashed',
    },
    customProductEmoji: {
        fontSize: 32,
        marginBottom: 4,
    },
    customProductLabel: {
        fontSize: 8,
        color: '#E8ACD2',
        fontWeight: '600',
        fontFamily: 'Poppins-SemiBold',
        textAlign: 'center',
    },
    itemDetails: {
        flex: 1,
        marginLeft: 12,
        marginRight: 8
    },
    itemName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginBottom: 4,
        fontFamily: 'Poppins-Medium',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    itemPrice: {
        fontSize: 13,
        color: '#3C3550',
        fontWeight: '500',
        fontFamily: 'Poppins-Medium',
    },
    customPriceLabel: {
        fontSize: 10,
        color: '#E8ACD2',
        fontWeight: '500',
        fontFamily: 'Poppins-Medium',
        marginLeft: 6,
        fontStyle: 'italic',
    },
    itemDescription: {
        fontSize: 12,
        color: '#666',
        marginBottom: 8,
        fontFamily: 'Poppins-Regular',
    },
    customizationContainer: {
        backgroundColor: '#f8f9fa',
        padding: 8,
        borderRadius: 6,
        marginBottom: 8,
        borderLeftWidth: 2,
        borderLeftColor: '#E8ACD2',
    },
    customizationTitle: {
        fontSize: 11,
        fontWeight: '600',
        color: '#E8ACD2',
        marginBottom: 4,
        fontFamily: 'Poppins-SemiBold',
    },
    customizationText: {
        fontSize: 10,
        color: '#666',
        marginBottom: 2,
        fontFamily: 'Poppins-Regular',
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FDB4B7',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginTop: 8,
        alignSelf: 'flex-start',
    },
    quantityButton: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        opacity: 1,
    },
    quantityButtonText: {
        fontSize: 16,
        color: '#FDB4B7',
        fontWeight: 'bold'
    },
    quantityText: {
        fontSize: 14,
        marginHorizontal: 12,
        fontFamily: 'Poppins-Medium',
        minWidth: 20,
        textAlign: 'center',
    },
    rightSection: {
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        minHeight: 80,
    },
    trashButton: {
        padding: 4,
        justifyContent: 'center',
        alignItems: 'center'
    },
    trashIcon: {
        width: 18,
        height: 18,
        tintColor: '#000'
    },
    itemSubtotal: {
        fontSize: 14,
        color: '#4A4170',
        fontWeight: '600',
        fontFamily: 'Poppins-SemiBold',
        marginTop: 8,
        textAlign: 'right',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
});

export default ShoppingCartCards;