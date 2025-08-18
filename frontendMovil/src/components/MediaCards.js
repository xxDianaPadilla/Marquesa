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

// Obtener dimensiones de la pantalla para cálculos responsive
const { width } = Dimensions.get('window');

// Constantes para el layout responsive de las tarjetas
const HORIZONTAL_PADDING = 20; // Padding lateral del contenedor padre
const CARD_GAP = 12; // Espacio entre tarjetas
// Calcular ancho de cada tarjeta para mostrar 2 por fila
const cardWidth = (width - (HORIZONTAL_PADDING * 2) - CARD_GAP) / 2;

// Componente para mostrar tarjetas de contenido multimedia (videos y artículos)
// Props:
// - item: Objeto con datos del contenido multimedia
// - index: Índice de la tarjeta en la lista
// - navigation: Objeto de navegación de React Navigation
const MediaCards = ({ item, index, navigation }) => {
    // Estado para manejar errores de carga de imagen
    const [imageError, setImageError] = useState(false);
    // Estado para manejar el like (actualmente solo visual)
    const [isLiked, setIsLiked] = useState(false);

    // Función para manejar el clic en la tarjeta - navega al detalle
    const handleCardPress = () => {
        try {
            // Validar que el item tenga un ID válido
            if (!item.id) {
                console.error("Item ID no disponible:", item);
                return;
            }

            // Limpiar y convertir el ID a string
            const itemId = String(item.id).trim();
            console.log("Navegando a MediaDetailScreen con ID:", itemId);

            // Navegar a la pantalla de detalle con parámetros
            navigation.navigate('MediaDetailScreen', {
                itemId: itemId,
                item: item,
                fromMediaScreen: true // Flag para identificar origen
            });
        } catch (error) {
            console.error("Error en navegación:", error);
        }
    };

    // Función para manejar el botón de like (funcionalidad futura)
    const handleLikePress = () => {
        setIsLiked(!isLiked);
        console.log("Like clicked for item:", item.id);
    };

    // Función para manejar errores de carga de imagen
    const handleImageError = () => {
        setImageError(true);
        console.warn("Error loading image for item:", item.id, "URL:", item.image);
    };

    // Función para determinar qué imagen mostrar (thumbnail para videos, image para artículos)
    const getDisplayImage = () => {
        if (item.isVideo && item.thumbnail) {
            return { uri: item.thumbnail };
        }
        return item.image ? { uri: item.image } : null;
    };

    // Función para determinar el tipo de contenido y sus propiedades
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

    // Función para asignar colores según la categoría del contenido
    const getCategoryColor = (category) => {
        const colors = {
            'Blog': '#06B6D4',           // Cyan
            'Tips': '#10B981',           // Emerald
            'Datos Curiosos': '#F59E0B', // Amber
            'Video': '#EF4444',          // Red
            'General': '#6B7280'         // Gray (default)
        };
        return colors[category] || colors['General'];
    };

    // Obtener configuración del tipo de contenido
    const contentType = getContentType();
    // Obtener color de la categoría
    const categoryColor = getCategoryColor(item.category);

    // Calcular si el índice es par para el layout de 2 columnas
    const isEvenIndex = index % 2 === 0;

    return (
        <TouchableOpacity
            style={[
                styles.cardContainer,
                {
                    width: cardWidth, // Ancho dinámico calculado
                    marginRight: isEvenIndex ? CARD_GAP : 0, // Margen derecho solo en elementos pares
                }
            ]}
            onPress={handleCardPress}
            activeOpacity={0.8}
        >
            {/* Contenedor de la imagen con overlays */}
            <View style={styles.imageContainer}>
                {/* Mostrar imagen o placeholder en caso de error */}
                {!imageError && getDisplayImage() ? (
                    <Image
                        source={getDisplayImage()}
                        style={styles.cardImage}
                        onError={handleImageError}
                        resizeMode="cover"
                    />
                ) : (
                    // Placeholder cuando no hay imagen disponible
                    <View style={styles.placeholderContainer}>
                        <View style={styles.placeholderIcon}>
                            <Text style={styles.placeholderText}>📷</Text>
                        </View>
                        <Text style={styles.placeholderLabel}>Imagen no disponible</Text>
                    </View>
                )}

                {/* Overlay semitransparente con icono de acción central */}
                <View style={styles.overlay}>
                    <View style={styles.actionIconContainer}>
                        {item.isVideo ? (
                            // Icono de play para videos
                            <Image source={playIcon} style={styles.playIcon} />
                        ) : (
                            // Icono de lectura para artículos
                            <Text style={styles.readIcon}>👁</Text>
                        )}
                    </View>
                </View>

                {/* Badge de categoría en la esquina superior izquierda */}
                <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
                    <Text style={styles.categoryText}>{item.category}</Text>
                </View>

                {/* Badge de duración solo para videos */}
                {item.isVideo && item.duration && (
                    <View style={styles.durationBadge}>
                        <Text style={styles.durationText}>{item.duration}</Text>
                    </View>
                )}
            </View>

            {/* Contenedor del contenido de texto */}
            <View style={styles.contentContainer}>
                {/* Fecha con icono de calendario */}
                <View style={styles.dateContainer}>
                    <Image source={calendarIcon} style={styles.calendarIcon} />
                    <Text style={styles.dateText} numberOfLines={1}>
                        {item.date}
                    </Text>
                </View>

                {/* Título del contenido - máximo 2 líneas */}
                <Text style={styles.title} numberOfLines={2}>
                    {item.title}
                </Text>

                {/* Descripción del contenido - máximo 3 líneas con truncamiento */}
                {item.content && (
                    <Text style={styles.description} numberOfLines={3}>
                        {item.content.length > 80 ? `${item.content.substring(0, 80)}...` : item.content}
                    </Text>
                )}

                {/* Contenedor de botones de acción */}
                <View style={styles.actionsContainer}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={handleCardPress}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.actionText}>{contentType.actionShort}</Text>
                    </TouchableOpacity>
                </View>

                {/* Estadísticas (views y likes) - solo se muestran si > 0 */}
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
    // Contenedor principal de cada tarjeta
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
        elevation: 4, // Sombra en Android
        overflow: 'hidden', // Para que los elementos respeten el borderRadius
        // width se define dinámicamente en el componente
    },
    // Contenedor de la imagen con posición relativa para overlays
    imageContainer: {
        position: 'relative',
        height: 140,
        backgroundColor: '#f3f4f6', // Color de fondo mientras carga
    },
    // Imagen principal que ocupa todo el contenedor
    cardImage: {
        width: '100%',
        height: '100%',
    },
    // Contenedor del placeholder cuando no hay imagen
    placeholderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
    },
    // Icono del placeholder
    placeholderIcon: {
        marginBottom: 8,
    },
    // Emoji del placeholder (cámara)
    placeholderText: {
        fontSize: 32,
        opacity: 0.5,
    },
    // Texto del placeholder
    placeholderLabel: {
        fontSize: 10,
        color: '#6b7280',
        fontFamily: 'Poppins-Regular',
    },
    // Overlay semitransparente sobre la imagen
    overlay: {
        ...StyleSheet.absoluteFillObject, // Ocupa toda la imagen
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0.8,
    },
    // Contenedor del icono de acción en el centro
    actionIconContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 20,
        padding: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Icono de play para videos
    playIcon: {
        width: 16,
        height: 16,
        resizeMode: 'contain',
    },
    // Icono de lectura para artículos
    readIcon: {
        fontSize: 16,
    },
    // Badge de categoría en la esquina superior izquierda
    categoryBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: '#6b7280', // Color por defecto
    },
    // Texto del badge de categoría
    categoryText: {
        color: '#ffffff',
        fontSize: 10,
        fontWeight: '600',
        fontFamily: 'Poppins-SemiBold',
    },
    // Badge de duración en la esquina inferior derecha (solo videos)
    durationBadge: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: 6,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    // Texto de la duración del video
    durationText: {
        color: '#ffffff',
        fontSize: 10,
        fontWeight: '500',
        fontFamily: 'Poppins-Regular',
    },
    // Contenedor del contenido de texto
    contentContainer: {
        padding: 12,
        flex: 1,
    },
    // Contenedor de la fecha con icono
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    // Icono de calendario
    calendarIcon: {
        width: 12,
        height: 12,
        marginRight: 4,
        resizeMode: 'contain',
    },
    // Texto de la fecha
    dateText: {
        fontSize: 10,
        color: '#6b7280',
        flex: 1,
        fontFamily: 'Poppins-Regular',
    },
    // Título principal del contenido
    title: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1f2937',
        lineHeight: 18,
        marginBottom: 6,
        minHeight: 36, // Altura mínima para consistencia
        fontFamily: 'Poppins-SemiBold',
    },
    // Descripción del contenido
    description: {
        fontSize: 11,
        color: '#6b7280',
        lineHeight: 16,
        marginBottom: 10,
        minHeight: 48, // Altura mínima para consistencia
        fontFamily: 'Poppins-Regular',
    },
    // Contenedor de botones de acción
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    // Botón de acción principal (Ver/Leer)
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fce7f3', // Fondo rosa claro
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        flex: 1,
        marginRight: 8,
        justifyContent: 'center',
    },
    // Texto del botón de acción
    actionText: {
        fontSize: 11,
        color: '#be185d', // Rosa oscuro
        fontWeight: '600',
        fontFamily: 'Poppins-SemiBold',
    },
    // Contenedor de estadísticas (views y likes)
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6', // Línea separadora sutil
    },
    // Cada elemento de estadística
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    // Icono de las estadísticas (emoji)
    statIcon: {
        fontSize: 12,
        marginRight: 4,
    },
    // Texto numérico de las estadísticas
    statText: {
        fontSize: 11,
        color: '#6b7280',
        fontFamily: 'Poppins-Regular',
    },
});

export default MediaCards;