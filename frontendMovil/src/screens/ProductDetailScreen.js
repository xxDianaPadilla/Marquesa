import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Dimensions,
    ActivityIndicator,
    TextInput,
    Platform,
    ToastAndroid
} from "react-native";
import backIcon from '../images/backIcon.png';
import Icon from 'react-native-vector-icons/MaterialIcons';
import sendIcon from "../images/sendIcon.png";
import ReviewCards from "../components/ReviewCards";
import { useAuth } from '../context/AuthContext';
import { useCart } from "../context/CartContext";
import useDataBaseProductsDetail from '../hooks/useDataBaseProductsDetail';
import useReviewsUsers from '../hooks/useReviewUsers';
import { useAlert } from '../hooks/useAlert';
import { CustomAlert, ConfirmationDialog, ToastDialog } from '../components/CustomAlerts';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const ProductDetailScreen = ({ route, navigation }) => {
    const { productId } = route.params;
    
    // Estados locales
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [reviewText, setReviewText] = useState('');
    const [reviewRating, setReviewRating] = useState(0);
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    // Hook de alertas personalizadas
    const {
        alertState,
        showSuccess,
        showError,
        showWarning,
        showSuccessToast,
        showErrorToast,
        showConfirmation,
        hideAlert,
        hideConfirmation,
        hideToast
    } = useAlert();

    // Crear objeto de helpers para las alertas
    const alertHelpers = {
        showSuccess,
        showError,
        showWarning,
        showSuccessToast,
        showErrorToast,
        showWarningToast: (message) => showWarning(message, 'Advertencia'),
        showInfoToast: (message) => showSuccess(message, 'Información')
    };

    // Contextos
    const { 
        user, 
        userInfo, 
        isAuthenticated, 
        toggleFavorite, 
        isFavorite,
        favoritesLoading 
    } = useAuth();
    
    const {
        addToCart,
        cartLoading,
        cartError,
        isInCart,
        getItemQuantity,
        clearCartError
    } = useCart();

    // Hooks personalizados - Pasar alertHelpers al hook de reviews
    const { product, loading: productLoading, error: productError } = useDataBaseProductsDetail(productId);
    const { reviews, loading: reviewsLoading, submitting: reviewSubmitting, submitReview, fetchProductReviews } = useReviewsUsers(productId, alertHelpers);

    // Función para mostrar toast/mensaje
    const showToast = (message) => {
        if (Platform.OS === 'android') {
            ToastAndroid.show(message, ToastAndroid.SHORT);
        } else {
            Alert.alert('Información', message);
        }
    };

    // Limpiar errores del carrito cuando se monte el componente
    useEffect(() => {
        return () => {
            clearCartError();
        };
    }, []);

    // Verificar si el producto está en favoritos
    const isProductFavorite = product ? isFavorite(product._id) : false;

    // Verificar si el producto está en el carrito
    const productInCart = product ? isInCart(product._id) : false;
    const cartQuantity = product ? getItemQuantity(product._id) : 0;

    // Manejar navegación hacia atrás
    const handleGoBack = () => {
        navigation.goBack();
    };

    // Manejar toggle de favorito
    const handleToggleFavorite = async () => {
        try {
            if (!isAuthenticated) {
                showConfirmation({
                    title: "Iniciar sesión",
                    message: "Debes iniciar sesión para agregar productos a favoritos",
                    onConfirm: () => {
                        hideConfirmation();
                        navigation.navigate('Login');
                    },
                    onCancel: hideConfirmation,
                    confirmText: "Iniciar sesión",
                    cancelText: "Cancelar"
                });
                return;
            }

            if (!product) return;

            const result = await toggleFavorite(product);
            if (!result.success) {
                showError(result.message || 'No se pudo actualizar favoritos', 'Error');
            }
        } catch (error) {
            showError('Error de conexión. Intenta nuevamente.', 'Error');
        }
    };

    // Manejar cambio de cantidad
    const handleQuantityChange = (increment) => {
        if (increment) {
            if (quantity < product.stock) {
                setQuantity(prev => prev + 1);
            }
        } else {
            if (quantity > 1) {
                setQuantity(prev => prev - 1);
            }
        }
    };

    // Manejar agregar al carrito
    const handleAddToCart = async () => {
        try {
            if (!isAuthenticated) {
                showConfirmation({
                    title: "Iniciar sesión",
                    message: "Debes iniciar sesión para agregar productos al carrito",
                    onConfirm: () => {
                        hideConfirmation();
                        navigation.navigate('Login');
                    },
                    onCancel: hideConfirmation,
                    confirmText: "Iniciar sesión",
                    cancelText: "Cancelar"
                });
                return;
            }

            if (!product) return;

            if (product.stock === 0) {
                showError("Este producto no está disponible en este momento", "Sin stock");
                return;
            }

            const result = await addToCart(product, quantity, 'product');

            if (result.success) {
                showSuccessToast(`${product.name} agregado al carrito`);
            } else {
                showError(result.message || 'No se pudo agregar el producto al carrito', 'Error al agregar al carrito');
            }

        } catch (error) {
            showError('Ocurrió un error inesperado. Inténtalo nuevamente.', 'Error inesperado');
        }
    };

    // Manejar envío de reseña
    const handleSubmitReview = async () => {
        try {
            if (!isAuthenticated) {
                showConfirmation({
                    title: "Iniciar sesión",
                    message: "Debes iniciar sesión para escribir una reseña",
                    onConfirm: () => {
                        hideConfirmation();
                        navigation.navigate('Login');
                    },
                    onCancel: hideConfirmation,
                    confirmText: "Iniciar sesión",
                    cancelText: "Cancelar"
                });
                return;
            }

            if (reviewRating === 0) {
                showError('Por favor selecciona una calificación', 'Calificación requerida');
                return;
            }

            if (reviewText.trim() === '') {
                showError('Por favor escribe un comentario', 'Comentario requerido');
                return;
            }

            setIsSubmittingReview(true);

            const reviewData = {
                productId: product._id,
                clientId: userInfo._id,
                rating: reviewRating,
                message: reviewText.trim()
            };

            const result = await submitReview(reviewData);

            if (result.success) {
                setReviewText('');
                setReviewRating(0);
                // Recargar reseñas
                fetchProductReviews(productId);
            }

        } catch (error) {
            showError('Error al enviar la reseña', 'Error');
        } finally {
            setIsSubmittingReview(false);
        }
    };

    // Renderizar estrellas para calificación
    const renderRatingStars = (rating, interactive = false, onPress = null) => {
        return (
            <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                        key={star}
                        disabled={!interactive}
                        onPress={() => interactive && onPress && onPress(star)}
                        style={interactive ? styles.interactiveStar : null}
                    >
                        <Icon
                            name={star <= rating ? "star" : "star-border"}
                            size={20}
                            color={star <= rating ? "#FFD700" : "#ddd"}
                        />
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    // Obtener primera imagen
    const getProductImage = (index = 0) => {
        if (product && product.images && Array.isArray(product.images) && product.images.length > 0) {
            return product.images[index] || product.images[0];
        }
        return 'https://via.placeholder.com/300x240/f0f0f0/666666?text=Sin+Imagen';
    };

    // Estados de carga
    if (productLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4A4170" />
                <Text style={styles.loadingText}>Cargando producto...</Text>
            </View>
        );
    }

    if (productError || !product) {
        return (
            <View style={styles.errorContainer}>
                <Icon name="error-outline" size={48} color="#e74c3c" />
                <Text style={styles.errorText}>
                    {productError || 'Producto no encontrado'}
                </Text>
                <TouchableOpacity style={styles.retryButton} onPress={handleGoBack}>
                    <Text style={styles.retryButtonText}>Volver</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
                    <Image source={backIcon} style={styles.backIcon} />
                </TouchableOpacity>
                
                <TouchableOpacity
                    style={[
                        styles.favoriteButton,
                        isProductFavorite && styles.favoriteButtonActive
                    ]}
                    onPress={handleToggleFavorite}
                    disabled={favoritesLoading}
                >
                    <Icon
                        name={isProductFavorite ? 'favorite' : 'favorite-border'}
                        size={24}
                        color={isProductFavorite ? '#fff' : '#666'}
                    />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                {/* Imagen del producto */}
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: getProductImage(currentImageIndex) }}
                        style={styles.productImage}
                        resizeMode="cover"
                    />
                    
                    {/* Indicador de stock */}
                    {product.stock === 0 && (
                        <View style={styles.outOfStockOverlay}>
                            <Text style={styles.outOfStockText}>Sin stock</Text>
                        </View>
                    )}
                </View>

                {/* Información del producto */}
                <View style={styles.contentContainer}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productPrice}>{product.price}</Text>
                    
                    {/* Calificación */}
                    <View style={styles.ratingContainer}>
                        {renderRatingStars(reviews.average)}
                        <Text style={styles.ratingText}>
                            ({reviews.count} {reviews.count === 1 ? 'reseña' : 'reseñas'})
                        </Text>
                    </View>

                    <Text style={styles.availabilityText}>
                        {product.stock > 0 ? `Disponible en stock` : 'No disponible'}
                    </Text>

                    {/* Descripción */}
                    <View style={styles.descriptionSection}>
                        <Text style={styles.sectionTitle}>Descripción</Text>
                        <Text style={styles.descriptionText}>{product.description}</Text>
                    </View>

                    {/* Detalles */}
                    <View style={styles.detailsSection}>
                        <Text style={styles.sectionTitle}>Detalles</Text>
                        <Text style={styles.detailsText}>{product.details}</Text>
                    </View>

                    {/* Selector de cantidad y botón agregar al carrito */}
                    {product.stock > 0 && (
                        <View style={styles.actionSection}>
                            <View style={styles.quantityContainer}>
                                <TouchableOpacity
                                    style={styles.quantityButton}
                                    onPress={() => handleQuantityChange(false)}
                                    disabled={quantity <= 1}
                                >
                                    <Icon name="remove" size={20} color="#666" />
                                </TouchableOpacity>
                                
                                <Text style={styles.quantityText}>{quantity}</Text>
                                
                                <TouchableOpacity
                                    style={styles.quantityButton}
                                    onPress={() => handleQuantityChange(true)}
                                    disabled={quantity >= product.stock}
                                >
                                    <Icon name="add" size={20} color="#666" />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={styles.addToCartButton}
                                onPress={handleAddToCart}
                                disabled={cartLoading}
                            >
                                {cartLoading ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <>
                                        <Icon name="add-shopping-cart" size={20} color="#fff" />
                                        <Text style={styles.addToCartText}>Añadir al carrito</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Sección de reseñas */}
                    <View style={styles.reviewsSection}>
                        <Text style={styles.sectionTitle}>Nos importa tu opinión</Text>
                        
                        {/* Escribir reseña */}
                        {isAuthenticated && (
                            <View style={styles.writeReviewContainer}>
                                <View style={styles.reviewInputContainer}>
                                    <TextInput
                                        style={styles.reviewInput}
                                        placeholder="Deja una reseña de este producto"
                                        multiline
                                        value={reviewText}
                                        onChangeText={setReviewText}
                                        maxLength={500}
                                    />
                                    
                                    <TouchableOpacity
                                        style={styles.sendButton}
                                        onPress={handleSubmitReview}
                                        disabled={isSubmittingReview || reviewText.trim() === '' || reviewRating === 0}
                                    >
                                        {isSubmittingReview ? (
                                            <ActivityIndicator size="small" color="#fff" />
                                        ) : (
                                            <Image source={sendIcon} style={styles.sendIcon} />
                                        )}
                                    </TouchableOpacity>
                                </View>
                                
                                <View style={styles.ratingInputContainer}>
                                    {renderRatingStars(reviewRating, true, setReviewRating)}
                                </View>
                            </View>
                        )}

                        {/* Lista de reseñas */}
                        {reviewsLoading ? (
                            <View style={styles.reviewsLoadingContainer}>
                                <ActivityIndicator size="small" color="#4A4170" />
                                <Text style={styles.reviewsLoadingText}>Cargando reseñas...</Text>
                            </View>
                        ) : (
                            <ReviewCards reviews={reviews.comments} />
                        )}
                    </View>
                </View>
            </ScrollView>

            {/* Alertas personalizadas */}
            <CustomAlert
                visible={alertState.basicAlert.visible}
                title={alertState.basicAlert.title}
                message={alertState.basicAlert.message}
                type={alertState.basicAlert.type}
                onConfirm={alertState.basicAlert.onConfirm}
                onCancel={alertState.basicAlert.onCancel}
                confirmText={alertState.basicAlert.confirmText}
                cancelText={alertState.basicAlert.cancelText}
                showCancel={alertState.basicAlert.showCancel}
            />

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

            <ToastDialog
                visible={alertState.toast.visible}
                message={alertState.toast.message}
                type={alertState.toast.type}
                duration={alertState.toast.duration}
                onHide={hideToast}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 45,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#fff',
        zIndex: 10,
    },
    backButton: {
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backIcon: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
    },
    favoriteButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
    favoriteButtonActive: {
        backgroundColor: '#ff6b8a',
    },
    scrollContainer: {
        flex: 1,
    },
    imageContainer: {
        width: screenWidth,
        height: screenWidth * 0.8,
        position: 'relative',
    },
    productImage: {
        width: '100%',
        height: '100%',
        backgroundColor: '#f5f5f5',
    },
    outOfStockOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    outOfStockText: {
        fontSize: 18,
        color: '#fff',
        fontFamily: 'Poppins-Bold',
    },
    contentContainer: {
        padding: 20,
    },
    productName: {
        fontSize: 24,
        fontFamily: 'Poppins-Bold',
        color: '#333',
        marginBottom: 8,
    },
    productPrice: {
        fontSize: 28,
        fontFamily: 'Poppins-Bold',
        color: '#4A4170',
        marginBottom: 12,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    starsContainer: {
        flexDirection: 'row',
        marginRight: 8,
    },
    interactiveStar: {
        padding: 2,
    },
    ratingText: {
        fontSize: 14,
        color: '#666',
        fontFamily: 'Poppins-Regular',
    },
    availabilityText: {
        fontSize: 14,
        color: '#27ae60',
        fontFamily: 'Poppins-Medium',
        marginBottom: 20,
    },
    descriptionSection: {
        marginBottom: 20,
    },
    detailsSection: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'Poppins-SemiBold',
        color: '#333',
        marginBottom: 8,
    },
    descriptionText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        fontFamily: 'Poppins-Regular',
    },
    detailsText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        fontFamily: 'Poppins-Regular',
    },
    actionSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
        gap: 16,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
        borderRadius: 25,
        paddingHorizontal: 4,
    },
    quantityButton: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 18,
    },
    quantityText: {
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
        color: '#333',
        marginHorizontal: 16,
        minWidth: 20,
        textAlign: 'center',
    },
    addToCartButton: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#f5c7e6ff',
        paddingVertical: 12,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    addToCartText: {
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
        color: '#fff',
    },
    reviewsSection: {
        marginTop: 20,
    },
    writeReviewContainer: {
        marginBottom: 20,
        backgroundColor: '#f8f8f8',
        borderRadius: 12,
        padding: 16,
    },
    reviewInputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: 12,
    },
    reviewInput: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginRight: 8,
        maxHeight: 100,
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        textAlignVertical: 'top',
    },
    sendButton: {
        width: 40,
        height: 40,
        backgroundColor: '#f5c7e6ff',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendIcon: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
    },
    ratingInputContainer: {
        alignItems: 'flex-start',
    },
    reviewsLoadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
    },
    reviewsLoadingText: {
        fontSize: 14,
        color: '#666',
        fontFamily: 'Poppins-Regular',
        marginLeft: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
        fontFamily: 'Poppins-Regular',
        marginTop: 12,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: '#e74c3c',
        fontFamily: 'Poppins-Regular',
        textAlign: 'center',
        marginVertical: 16,
    },
    retryButton: {
        backgroundColor: '#4A4170',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
    },
    retryButtonText: {
        fontSize: 16,
        color: '#fff',
        fontFamily: 'Poppins-SemiBold',
    },
});

export default ProductDetailScreen;