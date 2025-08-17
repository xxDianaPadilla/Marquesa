import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
    Dimensions,
    Platform
} from "react-native";
import playIcon from "../images/playIcon.png";
import calendarIcon from "../images/calendarIcon.png";

const { width } = Dimensions.get('window');
// Calculamos el ancho considerando padding lateral y gap entre cards
const HORIZONTAL_PADDING = 20; 
const CARD_GAP = 12;
const cardWidth = (width - (HORIZONTAL_PADDING * 2) - CARD_GAP) / 2;

const MediaCards = ({ item, index, navigation }) => {
    const [imageError, setImageError] = useState(false);
    const [isLiked, setIsLiked] = useState(false);

    // Función para manejar el clic en la tarjeta
    const handleCardPress = () => {
        try {
            if (!item.id) {
                console.error("Item ID no disponible:", item);
                return;
            }

            const itemId = String(item.id).trim();
            console.log("Navegando a MediaDetailScreen con ID:", itemId);

            navigation.navigate('MediaDetailScreen', {
                itemId: itemId,
                item: item,
                fromMediaScreen: true
            });
        } catch (error) {
            console.error("Error en navegación:", error);
        }
    };

    // Función para manejar el botón de like
    const handleLikePress = () => {
        setIsLiked(!isLiked);
        console.log("Like clicked for item:", item.id);
    };

    // Función para manejar errores de imagen
    const handleImageError = () => {
        setImageError(true);
        console.warn("Error loading image for item:", item.id, "URL:", item.image);
    };

    // Función para obtener la imagen a mostrar
    const getDisplayImage = () => {
        if (item.isVideo && item.thumbnail) {
            return { uri: item.thumbnail };
        }
        return item.image ? { uri: item.image } : null;
    };

    // Función para determinar el tipo de contenido
    const getContentType = () => {
        if (item.isVideo) {
            return {
                action: 'Ver Video',
                actionShort: 'Ver',
                icon: 'play'
            };
        }
        return {
            action: 'Leer Artículo',
            actionShort: 'Leer',
            icon: 'read'
        };
    };

    // Función para obtener el color de la categoría
    const getCategoryColor = (category) => {
        const colors = {
            'Blog': '#06B6D4',
            'Tips': '#10B981',
            'Datos Curiosos': '#F59E0B',
            'Video': '#EF4444',
            'General': '#6B7280'
        };
        return colors[category] || colors['General'];
    };

    const contentType = getContentType();
    const categoryColor = getCategoryColor(item.category);

    // Mejorado: Simplificamos el cálculo de márgenes
    const isEvenIndex = index % 2 === 0;

    return (
        <TouchableOpacity
            style={[
                styles.cardContainer,
                {
                    width: cardWidth,
                    marginRight: isEvenIndex ? CARD_GAP : 0,
                }
            ]}
            onPress={handleCardPress}
            activeOpacity={0.8}
        >
            {/* Imagen Container */}
            <View style={styles.imageContainer}>
                {!imageError && getDisplayImage() ? (
                    <Image
                        source={getDisplayImage()}
                        style={styles.cardImage}
                        onError={handleImageError}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.placeholderContainer}>
                        <View style={styles.placeholderIcon}>
                            <Text style={styles.placeholderText}>📷</Text>
                        </View>
                        <Text style={styles.placeholderLabel}>Imagen no disponible</Text>
                    </View>
                )}

                {/* Overlay de play/acción */}
                <View style={styles.overlay}>
                    <View style={styles.actionIconContainer}>
                        {item.isVideo ? (
                            <Image source={playIcon} style={styles.playIcon} />
                        ) : (
                            <Text style={styles.readIcon}>👁</Text>
                        )}
                    </View>
                </View>

                {/* Badge de categoría */}
                <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
                    <Text style={styles.categoryText}>{item.category}</Text>
                </View>

                {/* Duración del video */}
                {item.isVideo && item.duration && (
                    <View style={styles.durationBadge}>
                        <Text style={styles.durationText}>{item.duration}</Text>
                    </View>
                )}
            </View>

            {/* Contenido de la tarjeta */}
            <View style={styles.contentContainer}>
                {/* Fecha */}
                <View style={styles.dateContainer}>
                    <Image source={calendarIcon} style={styles.calendarIcon} />
                    <Text style={styles.dateText} numberOfLines={1}>
                        {item.date}
                    </Text>
                </View>

                {/* Título */}
                <Text style={styles.title} numberOfLines={2}>
                    {item.title}
                </Text>

                {/* Descripción */}
                {item.content && (
                    <Text style={styles.description} numberOfLines={3}>
                        {item.content.length > 80 ? `${item.content.substring(0, 80)}...` : item.content}
                    </Text>
                )}

                {/* Botones de acción */}
                <View style={styles.actionsContainer}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={handleCardPress}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.actionText}>{contentType.actionShort}</Text>
                    </TouchableOpacity>
                </View>

                {/* Estadísticas */}
                <View style={styles.statsContainer}>
                    {item.views > 0 && (
                        <View style={styles.statItem}>
                            <Text style={styles.statIcon}>👀</Text>
                            <Text style={styles.statText}>{item.views}</Text>
                        </View>
                    )}
                    {item.likes > 0 && (
                        <View style={styles.statItem}>
                            <Text style={styles.statIcon}>❤️</Text>
                            <Text style={styles.statText}>{item.likes}</Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
        overflow: 'hidden',
        // Removimos width de aquí porque se define dinámicamente
    },
    imageContainer: {
        position: 'relative',
        height: 140,
        backgroundColor: '#f3f4f6',
    },
    cardImage: {
        width: '100%',
        height: '100%',
    },
    placeholderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
    },
    placeholderIcon: {
        marginBottom: 8,
    },
    placeholderText: {
        fontSize: 32,
        opacity: 0.5,
    },
    placeholderLabel: {
        fontSize: 10,
        color: '#6b7280',
        fontFamily: 'Poppins-Regular',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0.8,
    },
    actionIconContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 20,
        padding: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    playIcon: {
        width: 16,
        height: 16,
        resizeMode: 'contain',
    },
    readIcon: {
        fontSize: 16,
    },
    categoryBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: '#6b7280',
    },
    categoryText: {
        color: '#ffffff',
        fontSize: 10,
        fontWeight: '600',
        fontFamily: 'Poppins-SemiBold',
    },
    durationBadge: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: 6,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    durationText: {
        color: '#ffffff',
        fontSize: 10,
        fontWeight: '500',
        fontFamily: 'Poppins-Regular',
    },
    contentContainer: {
        padding: 12,
        flex: 1,
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    calendarIcon: {
        width: 12,
        height: 12,
        marginRight: 4,
        resizeMode: 'contain',
    },
    dateText: {
        fontSize: 10,
        color: '#6b7280',
        flex: 1,
        fontFamily: 'Poppins-Regular',
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1f2937',
        lineHeight: 18,
        marginBottom: 6,
        minHeight: 36,
        fontFamily: 'Poppins-SemiBold',
    },
    description: {
        fontSize: 11,
        color: '#6b7280',
        lineHeight: 16,
        marginBottom: 10,
        minHeight: 48,
        fontFamily: 'Poppins-Regular',
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fce7f3',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        flex: 1,
        marginRight: 8,
        justifyContent: 'center',
    },
    actionText: {
        fontSize: 11,
        color: '#be185d',
        fontWeight: '600',
        fontFamily: 'Poppins-SemiBold',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statIcon: {
        fontSize: 12,
        marginRight: 4,
    },
    statText: {
        fontSize: 11,
        color: '#6b7280',
        fontFamily: 'Poppins-Regular',
    },
});

export default MediaCards;