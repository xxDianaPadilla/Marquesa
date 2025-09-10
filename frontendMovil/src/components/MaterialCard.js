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
    isSelected = false
}) {
    const [imageError, setImageError] = useState(false);

    // Manejar error de imagen
    const handleImageError = () => {
        setImageError(true);
    };

    // Manejar selección para personalización
    const handleCustomizePress = () => {
        if (material.stock === 0) {
            Alert.alert(
                "Sin stock",
                "Este material no está disponible en este momento"
            );
            return;
        }
        onCustomize(material, !isSelected);
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
            isSelected && styles.selectedCard,
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

                {/* Badge de selección */}
                {isSelected && (
                    <View style={styles.selectionBadge}>
                        <Icon name="check-circle" size={20} color="#fff" />
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

                {/* Botones de acción */}
                <View style={styles.buttonContainer}>
                    {/* Botón de personalizar */}
                    <TouchableOpacity
                        style={[
                            styles.customizeButton,
                            isSelected && styles.selectedButton,
                            material.stock === 0 && styles.disabledButton
                        ]}
                        onPress={handleCustomizePress}
                        disabled={material.stock === 0}
                        activeOpacity={0.8}
                    >
                        <Icon
                            name={isSelected ? "check" : "palette"}
                            size={16}
                            color={isSelected ? "#fff" : "#4A4170"}
                        />
                        <Text style={[
                            styles.customizeButtonText,
                            isSelected && styles.selectedButtonText,
                            material.stock === 0 && styles.disabledButtonText
                        ]}>
                            {isSelected ? "Seleccionado" : "Personalizar"}
                        </Text>
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
    selectionBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#4A4170',
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
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

    // Botones
    buttonContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    customizeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: '#4A4170',
    },
    selectedButton: {
        backgroundColor: '#4A4170',
        borderColor: '#4A4170',
    },
    disabledButton: {
        backgroundColor: '#f0f0f0',
        borderColor: '#ddd',
    },
    customizeButtonText: {
        fontSize: 10,
        fontFamily: 'Poppins-Medium',
        color: '#4A4170',
        marginLeft: 4,
    },
    selectedButtonText: {
        color: '#fff',
        fontFamily: 'Poppins-SemiBold',
    },
    disabledButtonText: {
        color: '#ccc',
    },
    cartButton: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: '#4A4170',
        justifyContent: 'center',
        alignItems: 'center',
    },
});