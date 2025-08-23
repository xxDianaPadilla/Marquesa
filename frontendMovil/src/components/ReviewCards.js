import React from "react"; // Importando React
import {
    View,
    Text,
    Image,
    StyleSheet,
    FlatList,
    Dimensions
} from "react-native"; // Importando React Native
import Icon from 'react-native-vector-icons/MaterialIcons'; // Importando iconos

const { width: screenWidth } = Dimensions.get('window');

// Componente y cards de reseñas
const ReviewCards = ({ reviews = [] }) => {

    // Renderizar estrellas para la calificación
    const renderRatingStars = (rating) => {
        return (
            <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <Icon
                        key={star}
                        name={star <= rating ? "star" : "star-border"}
                        size={16}
                        color={star <= rating ? "#FFD700" : "#ddd"}
                    />
                ))}
            </View>
        );
    };

    // Obtener imagen de perfil del usuario
    const getProfileImage = (review) => {
        if (review.profilePicture) {
            return { uri: review.profilePicture };
        }
        // Imagen por defecto si no tiene foto de perfil
        return { uri: 'https://via.placeholder.com/40x40/f0f0f0/666666?text=U' };
    };

    // Formatear nombre del usuario
    const getDisplayName = (review) => {
        if (review.name && review.name.trim() !== '') {
            return review.name;
        }
        return 'Usuario anónimo';
    };

    // Renderizar cada tarjeta de reseña
    const renderReviewCard = ({ item: review, index }) => (
        <View style={styles.reviewCard}>
            {/* Header de la reseña */}
            <View style={styles.reviewHeader}>
                {/* Imagen de perfil */}
                <Image
                    source={getProfileImage(review)}
                    style={styles.profileImage}
                />

                {/* Información del usuario */}
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>
                        {getDisplayName(review)}
                    </Text>

                    {/* Fecha */}
                    <Text style={styles.reviewDate}>
                        {review.year || new Date(review.date).getFullYear()}
                    </Text>
                </View>

                {/* Calificación */}
                <View style={styles.ratingContainer}>
                    {renderRatingStars(review.rating)}
                </View>
            </View>

            {/* Comentario de la reseña */}
            <View style={styles.commentContainer}>
                <Text style={styles.commentText}>
                    {review.comment || 'Sin comentario'}
                </Text>
            </View>

            {/* Respuesta del vendedor (si existe) */}
            {review.response && (
                <View style={styles.responseContainer}>
                    <View style={styles.responseHeader}>
                        <Icon name="reply" size={16} color="#666" />
                        <Text style={styles.responseLabel}>Respuesta del vendedor:</Text>
                    </View>
                    <Text style={styles.responseText}>
                        {review.response}
                    </Text>
                </View>
            )}
        </View>
    );

    // Componente de lista vacía
    const EmptyReviews = () => (
        <View style={styles.emptyContainer}>
            <Icon name="rate-review" size={48} color="#ccc" />
            <Text style={styles.emptyTitle}>Sin reseñas aún</Text>
            <Text style={styles.emptySubtitle}>
                Sé el primero en dejar una reseña sobre este producto
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {reviews.length === 0 ? (
                <EmptyReviews />
            ) : (
                <>
                    {/* Encabezado con contador */}
                    <View style={styles.headerContainer}>
                        <Text style={styles.reviewsCount}>
                            {reviews.length} {reviews.length === 1 ? 'reseña' : 'reseñas'}
                        </Text>
                    </View>

                    {/* Lista de reseñas */}
                    <FlatList
                        data={reviews}
                        renderItem={renderReviewCard}
                        keyExtractor={(item, index) => `review-${index}`}
                        showsVerticalScrollIndicator={false}
                        scrollEnabled={false} // No scroll porque está dentro de un ScrollView
                        ItemSeparatorComponent={() => <View style={styles.separator} />}
                        contentContainerStyle={styles.listContainer}
                    />
                </>
            )}
        </View>
    );
};

// Configuración de estilos
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerContainer: {
        marginBottom: 16,
    },
    reviewsCount: {
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
        color: '#333',
    },
    listContainer: {
        paddingBottom: 20,
    },
    reviewCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        marginBottom: 8, 
    },
    separator: {
        height: 12,
    },
    reviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
    },
    userInfo: {
        flex: 1,
        marginLeft: 12,
    },
    userName: {
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
        color: '#333',
        marginBottom: 2,
    },
    reviewDate: {
        fontSize: 12,
        fontFamily: 'Poppins-Regular',
        color: '#666',
    },
    ratingContainer: {
        alignItems: 'flex-end',
    },
    starsContainer: {
        flexDirection: 'row',
    },
    commentContainer: {
        marginBottom: 12,
    },
    commentText: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: '#333',
        lineHeight: 20,
    },
    responseContainer: {
        backgroundColor: '#f8f8f8',
        borderRadius: 8,
        padding: 12,
        marginTop: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#4A4170',
    },
    responseHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    responseLabel: {
        fontSize: 12,
        fontFamily: 'Poppins-SemiBold',
        color: '#666',
        marginLeft: 4,
    },
    responseText: {
        fontSize: 13,
        fontFamily: 'Poppins-Regular',
        color: '#555',
        lineHeight: 18,
        fontStyle: 'italic',
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    statusText: {
        fontSize: 12,
        fontFamily: 'Poppins-Regular',
        color: '#f39c12',
        marginLeft: 4,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    emptyTitle: {
        fontSize: 18,
        fontFamily: 'Poppins-SemiBold',
        color: '#666',
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
});

export default ReviewCards;