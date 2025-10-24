import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
    Dimensions,
    Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Obtener dimensiones de la pantalla
const { width: screenWidth } = Dimensions.get('window');

// Constantes para diseño responsivo
const isSmallDevice = screenWidth < 375;
const isMediumDevice = screenWidth >= 375 && screenWidth < 414;

export default function MaterialCard({
    material,
    onCustomize,
    onAddToCart,
    isSelected = false,
    quantity = 0, // Cantidad actual del material
    onIncrement, // Funcion para incrementar cantidad
    onDecrement // Funcion para decrementar cantidad
}) {
    const [imageError, setImageError] = useState(false);

    // Manejar error de imagen
    const handleImageError = () => {
        setImageError(true);
    };

    // Manejar incremento de cantidad
    const handleIncrement = () => {
        if (material.stock === 0) {
            Alert.alert(
                "Sin stock",
                "Este material no está disponible en este momento"
            );
            return;
        }
        
        // Validar limite de 50 unidades
        if (quantity >= 50) {
            Alert.alert(
                "Límite alcanzado",
                "No puedes agregar más de 50 unidades de este material"
            );
            return;
        }
        
        if (onIncrement) {
            onIncrement(material);
        }
    };

    // Manejar decremento de cantidad
    const handleDecrement = () => {
        if (onDecrement) {
            onDecrement(material);
        }
    };

    // Manejar agregar al carrito
    const handleAddToCartPress = () => {
        if (material.stock === 0) {
            Alert.alert(
                "Sin stock",
                "Este material no está disponible en este momento"
            );
            return;
        }
        onAddToCart(material);
    };

    // Determinar el color del precio según el stock
    const getPriceColor = () => {
        if (material.stock === 0) return '#e74c3c';
        if (material.stock < 5) return '#f39c12';
        return '#27ae60';
    };

    return (
        <View style={[
            styles.card,
            quantity > 0 && styles.selectedCard,
            material.stock === 0 && styles.outOfStockCard
        ]}>
            {/* Imagen del material */}
            <View style={styles.imageContainer}>
                {!imageError && material.image ? (
                    <Image
                        source={{ uri: material.image }}
                        style={styles.materialImage}
                        onError={handleImageError}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.placeholderImage}>
                        <Icon name="image" size={32} color="#ccc" />
                    </View>
                )}

                {/* Badge de cantidad seleccionada */}
                {quantity > 0 && (
                    <View style={styles.quantityBadge}>
                        <Text style={styles.quantityBadgeText}>x{quantity}</Text>
                    </View>
                )}

                {/* Badge de sin stock */}
                {material.stock === 0 && (
                    <View style={styles.outOfStockBadge}>
                        <Text style={styles.outOfStockText}>Sin stock</Text>
                    </View>
                )}

                {/* Badge de stock bajo */}
                {material.stock > 0 && material.stock < 5 && (
                    <View style={styles.lowStockBadge}>
                        <Text style={styles.lowStockText}>¡Últimas {material.stock}!</Text>
                    </View>
                )}
            </View>

            {/* Contenido de la card */}
            <View style={styles.cardContent}>
                {/* Nombre del material */}
                <Text
                    style={styles.materialName}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                >
                    {material.name}
                </Text>

                {/* Descripción */}
                <Text
                    style={styles.materialDescription}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                >
                    {material.description || `Stock disponible: ${material.stock}`}
                </Text>

                {/* Información adicional */}
                <View style={styles.infoContainer}>
                    {/* Stock */}
                    <View style={styles.stockInfo}>
                        <Icon
                            name="inventory"
                            size={12}
                            color={material.stock > 5 ? '#27ae60' : material.stock > 0 ? '#f39c12' : '#e74c3c'}
                        />
                        <Text style={[
                            styles.stockText,
                            { color: material.stock > 5 ? '#27ae60' : material.stock > 0 ? '#f39c12' : '#e74c3c' }
                        ]}>
                            {material.stock} disponibles
                        </Text>
                    </View>

                    {/* Categoría */}
                    {material.category && (
                        <Text style={styles.categoryText}>
                            {material.category}
                        </Text>
                    )}
                </View>

                {/* Precio */}
                <View style={styles.priceContainer}>
                    <Text style={[styles.priceText, { color: getPriceColor() }]}>
                        ${material.price?.toFixed(2) || '0.00'}
                    </Text>
                    <Text style={styles.currencyText}>USD</Text>
                </View>

                {/* Botones de cantidad + y - */}
                <View style={styles.quantityContainer}>
                    {/* Boton decrementar */}
                    <TouchableOpacity
                        style={[
                            styles.quantityButton,
                            quantity === 0 && styles.disabledButton
                        ]}
                        onPress={handleDecrement}
                        disabled={quantity === 0 || material.stock === 0}
                        activeOpacity={0.7}
                    >
                        <Icon
                            name="remove"
                            size={18}
                            color={quantity === 0 ? "#ccc" : "#4A4170"}
                        />
                    </TouchableOpacity>

                    {/* Mostrar cantidad actual */}
                    <View style={styles.quantityDisplay}>
                        <Text style={styles.quantityText}>{quantity}</Text>
                    </View>

                    {/* Boton incrementar */}
                    <TouchableOpacity
                        style={[
                            styles.quantityButton,
                            (material.stock === 0 || quantity >= 50) && styles.disabledButton
                        ]}
                        onPress={handleIncrement}
                        disabled={material.stock === 0 || quantity >= 50}
                        activeOpacity={0.7}
                    >
                        <Icon
                            name="add"
                            size={18}
                            color={(material.stock === 0 || quantity >= 50) ? "#ccc" : "#4A4170"}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginBottom: 12,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedCard: {
        borderColor: '#4A4170',
        shadowColor: '#4A4170',
        shadowOpacity: 0.3,
        elevation: 6,
    },
    outOfStockCard: {
        opacity: 0.6,
    },

    // Imagen
    imageContainer: {
        height: isSmallDevice ? 100 : 120,
        position: 'relative',
        backgroundColor: '#f8f9fa',
    },
    materialImage: {
        width: '100%',
        height: '100%',
    },
    placeholderImage: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
    },

    // Badges
    quantityBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#4A4170',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#fff',
    },
    quantityBadgeText: {
        fontSize: 11,
        fontFamily: 'Poppins-Bold',
        color: '#fff',
    },
    outOfStockBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: '#e74c3c',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    outOfStockText: {
        fontSize: 9,
        fontFamily: 'Poppins-Bold',
        color: '#fff',
    },
    lowStockBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: '#f39c12',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    lowStockText: {
        fontSize: 9,
        fontFamily: 'Poppins-Bold',
        color: '#fff',
    },

    // Contenido
    cardContent: {
        padding: 12,
    },
    materialName: {
        fontSize: isSmallDevice ? 13 : 14,
        fontFamily: 'Poppins-SemiBold',
        color: '#333',
        marginBottom: 4,
        lineHeight: isSmallDevice ? 16 : 18,
    },
    materialDescription: {
        fontSize: isSmallDevice ? 10 : 11,
        fontFamily: 'Poppins-Regular',
        color: '#666',
        marginBottom: 8,
        lineHeight: isSmallDevice ? 12 : 14,
    },

    // Información
    infoContainer: {
        marginBottom: 8,
    },
    stockInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    stockText: {
        fontSize: 10,
        fontFamily: 'Poppins-Medium',
        marginLeft: 4,
    },
    categoryText: {
        fontSize: 9,
        fontFamily: 'Poppins-Regular',
        color: '#999',
        fontStyle: 'italic',
    },

    // Precio
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 12,
    },
    priceText: {
        fontSize: isSmallDevice ? 16 : 18,
        fontFamily: 'Poppins-Bold',
        marginRight: 4,
    },
    currencyText: {
        fontSize: 10,
        fontFamily: 'Poppins-Regular',
        color: '#999',
    },

    // Botones de cantidad
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 4,
    },
    quantityButton: {
        width: 32,
        height: 32,
        borderRadius: 6,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#4A4170',
    },
    disabledButton: {
        backgroundColor: '#f0f0f0',
        borderColor: '#ddd',
    },
    quantityDisplay: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quantityText: {
        fontSize: 14,
        fontFamily: 'Poppins-Bold',
        color: '#4A4170',
    },
});