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

// Obtener dimensiones de la pantalla para elementos responsivos
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Componente principal para mostrar los detalles de un producto
const ProductDetailScreen = ({ route, navigation }) => {
    // Obtener el ID del producto desde los parámetros de navegación
    const { productId } = route.params;

    // Estados locales del componente
    const [currentImageIndex, setCurrentImageIndex] = useState(0); // Índice de la imagen actual en el carrusel
    const [quantity, setQuantity] = useState(1); // Cantidad seleccionada para agregar al carrito
    const [reviewText, setReviewText] = useState(''); // Texto de la reseña que está escribiendo el usuario
    const [reviewRating, setReviewRating] = useState(0); // Calificación seleccionada para la reseña (1-5 estrellas)
    const [isSubmittingReview, setIsSubmittingReview] = useState(false); // Estado de carga al enviar reseña

    // Hook personalizado para manejar alertas y notificaciones
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

    // Crear objeto de helpers para pasar a otros hooks que necesiten mostrar alertas
    const alertHelpers = {
        showSuccess,
        showError,
        showWarning,
        showSuccessToast,
        showErrorToast,
        showWarningToast: (message) => showWarning(message, 'Advertencia'),
        showInfoToast: (message) => showSuccess(message, 'Información')
    };

    // Hook de autenticación - maneja usuario, favoritos y estado de login
    const {
        user,
        userInfo,
        isAuthenticated,
        toggleFavorite,
        isFavorite,
        favoritesLoading
    } = useAuth();

    // Hook del carrito - maneja agregar productos y estado del carrito
    const {
        addToCart,
        removeFromCart,
        cartLoading,
        cartError,
        isInCart,
        getItemQuantity,
        clearCartError
    } = useCart();

    // Hooks personalizados para datos del producto y reseñas
    const { product, loading: productLoading, error: productError } = useDataBaseProductsDetail(productId);
    const { reviews, loading: reviewsLoading, submitting: reviewSubmitting, submitReview, fetchProductReviews } = useReviewsUsers(productId, alertHelpers);

    // Función para mostrar mensajes toast multiplataforma
    const showToast = (message) => {
        if (Platform.OS === 'android') {
            ToastAndroid.show(message, ToastAndroid.SHORT);
        } else {
            Alert.alert('Información', message);
        }
    };

    // Limpiar errores del carrito al desmontar el componente
    useEffect(() => {
        return () => {
            clearCartError();
        };
    }, []);

    // Verificar si el producto actual está en la lista de favoritos del usuario
    const isProductFavorite = product ? isFavorite(product._id) : false;

    // Verificar si el producto está en el carrito y obtener cantidad
    const productInCart = product ? isInCart(product._id) : false;
    const cartQuantity = product ? getItemQuantity(product._id) : 0;

    // Función para regresar a la pantalla anterior
    const handleGoBack = () => {
        navigation.goBack();
    };

    // Manejar la acción de agregar/quitar de favoritos
    const handleToggleFavorite = async () => {
        try {
            // Verificar si el usuario está autenticado
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

            // Ejecutar la acción de toggle favorito
            const result = await toggleFavorite(product);
            if (!result.success) {
                showError(result.message || 'No se pudo actualizar favoritos', 'Error');
            }
        } catch (error) {
            showError('Error de conexión. Intenta nuevamente.', 'Error');
        }
    };

    // Manejar cambios en la cantidad seleccionada
    const handleQuantityChange = (increment) => {
        if (increment) {
            // Incrementar cantidad si no excede el stock disponible
            if (quantity < product.stock) {
                setQuantity(prev => prev + 1);
            }
        } else {
            // Decrementar cantidad si es mayor a 1
            if (quantity > 1) {
                setQuantity(prev => prev - 1);
            }
        }
    };

    // Nueva función para manejar agregar/quitar del carrito
    const handleToggleCart = async () => {
        try {
            // Verificar autenticación del usuario
            if (!isAuthenticated) {
                showConfirmation({
                    title: "Iniciar sesión",
                    message: "Debes iniciar sesión para gestionar el carrito",
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

            // Verificar disponibilidad de stock
            if (product.stock === 0) {
                showError("Este producto no está disponible en este momento", "Sin stock");
                return;
            }

            // Si el producto ya está en el carrito, removelo
            if (productInCart) {
                const result = await removeFromCart(product._id);

                if (result.success) {
                    showSuccessToast(`${product.name} removido del carrito`);
                } else {
                    showError(result.message || 'No se pudo remover el producto del carrito', 'Error al remover del carrito');
                }
            } else {
                // Si no está en el carrito, agregarlo
                const result = await addToCart(product, quantity, 'product');

                if (result.success) {
                    showSuccessToast(`${product.name} agregado al carrito`);
                } else {
                    showError(result.message || 'No se pudo agregar el producto al carrito', 'Error al agregar al carrito');
                }
            }

        } catch (error) {
            showError('Ocurrió un error inesperado. Inténtalo nuevamente.', 'Error inesperado');
        }
    };

    // Función antigua mantenida por compatibilidad (puede ser removida si no se usa en otros lugares)
    const handleAddToCart = async () => {
        return handleToggleCart();
    };

    // Manejar el envío de una nueva reseña
    const handleSubmitReview = async () => {
        try {
            // Verificar autenticación
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

            // Validar que se haya seleccionado una calificación
            if (reviewRating === 0) {
                showError('Por favor selecciona una calificación', 'Calificación requerida');
                return;
            }

            // Validar que se haya escrito un comentario
            if (reviewText.trim() === '') {
                showError('Por favor escribe un comentario', 'Comentario requerido');
                return;
            }

            setIsSubmittingReview(true);

            // Preparar datos de la reseña
            const reviewData = {
                productId: product._id,
                clientId: userInfo._id,
                rating: reviewRating,
                message: reviewText.trim()
            };

            // Enviar la reseña
            const result = await submitReview(reviewData);

            if (result.success) {
                // Limpiar el formulario y recargar reseñas
                setReviewText('');
                setReviewRating(0);
                fetchProductReviews(productId);
            }

        } catch (error) {
            showError('Error al enviar la reseña', 'Error');
        } finally {
            setIsSubmittingReview(false);
        }
    };

    // Función para renderizar estrellas de calificación (interactivas o no)
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

    // Función para obtener la imagen del producto (con fallback)
    const getProductImage = (index = 0) => {
        if (product && product.images && Array.isArray(product.images) && product.images.length > 0) {
            return product.images[index] || product.images[0];
        }
        // Imagen placeholder si no hay imagen disponible
        return 'https://via.placeholder.com/300x240/f0f0f0/666666?text=Sin+Imagen';
    };

    // Mostrar pantalla de carga mientras se cargan los datos del producto
    if (productLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4A4170" />
                <Text style={styles.loadingText}>Cargando producto...</Text>
            </View>
        );
    }

    // Mostrar pantalla de error si no se pudo cargar el producto
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
            {/* Header con navegación y favoritos */}
            <View style={styles.header}>
                {/* Botón para regresar */}
                <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
                    <Image source={backIcon} style={styles.backIcon} />
                </TouchableOpacity>

                {/* Botón de favoritos */}
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

            {/* Contenido principal con scroll */}
            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                {/* Contenedor de imagen del producto */}
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: getProductImage(currentImageIndex) }}
                        style={styles.productImage}
                        resizeMode="cover"
                    />

                    {/* Overlay para productos sin stock */}
                    {product.stock === 0 && (
                        <View style={styles.outOfStockOverlay}>
                            <Text style={styles.outOfStockText}>Sin stock</Text>
                        </View>
                    )}
                </View>

                {/* Contenedor de información del producto */}
                <View style={styles.contentContainer}>
                    {/* Nombre y precio del producto */}
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productPrice}>{product.price}</Text>

                    {/* Sección de calificación y reseñas */}
                    <View style={styles.ratingContainer}>
                        {renderRatingStars(reviews.average)}
                        <Text style={styles.ratingText}>
                            ({reviews.count} {reviews.count === 1 ? 'reseña' : 'reseñas'})
                        </Text>
                    </View>

                    {/* Estado de disponibilidad */}
                    <Text style={styles.availabilityText}>
                        {product.stock > 0 ? `Disponible en stock` : 'No disponible'}
                    </Text>

                    {/* Sección de descripción del producto */}
                    <View style={styles.descriptionSection}>
                        <Text style={styles.sectionTitle}>Descripción</Text>
                        <Text style={styles.descriptionText}>{product.description}</Text>
                    </View>

                    {/* Sección de detalles del producto */}
                    <View style={styles.detailsSection}>
                        <Text style={styles.sectionTitle}>Detalles</Text>
                        <Text style={styles.detailsText}>{product.details}</Text>
                    </View>

                    {/* Sección de acciones (cantidad y agregar al carrito) - solo si hay stock */}
                    {product.stock > 0 && (
                        <View style={styles.actionSection}>
                            {/* Contenedor para selector de cantidad e información del carrito */}
                            <View style={styles.topActionContainer}>
                                {/* Selector de cantidad - solo mostrar si el producto NO está en el carrito */}
                                {!productInCart && (
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
                                )}

                                {/* Información de cantidad si está en el carrito */}
                                {productInCart && (
                                    <View style={styles.inCartInfoContainer}>
                                        <Icon name="check-circle" size={20} color="#27ae60" />
                                        <Text style={styles.inCartInfoText}>
                                            En carrito ({cartQuantity} {cartQuantity === 1 ? 'unidad' : 'unidades'})
                                        </Text>
                                    </View>
                                )}
                            </View>

                            {/* Botón para agregar/quitar del carrito - siempre en una nueva línea */}
                            <TouchableOpacity
                                style={[
                                    styles.toggleCartButton,
                                    productInCart ? styles.removeFromCartButton : styles.addToCartButton
                                ]}
                                onPress={handleToggleCart}
                                disabled={cartLoading}
                            >
                                {cartLoading ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <>
                                        <Icon
                                            name={productInCart ? "remove-shopping-cart" : "add-shopping-cart"}
                                            size={20}
                                            color="#fff"
                                        />
                                        <Text style={styles.toggleCartButtonText}>
                                            {productInCart ? "Quitar del carrito" : "Añadir al carrito"}
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Sección de reseñas */}
                    <View style={styles.reviewsSection}>
                        <Text style={styles.sectionTitle}>Nos importa tu opinión</Text>

                        {/* Formulario para escribir reseña (solo usuarios autenticados) */}
                        {isAuthenticated && (
                            <View style={styles.writeReviewContainer}>
                                {/* Campo de texto para la reseña */}
                                <View style={styles.reviewInputContainer}>
                                    <TextInput
                                        style={styles.reviewInput}
                                        placeholder="Deja una reseña de este producto"
                                        multiline
                                        value={reviewText}
                                        onChangeText={setReviewText}
                                        maxLength={500}
                                    />

                                    {/* Botón para enviar reseña */}
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

                                {/* Selector de calificación con estrellas */}
                                <View style={styles.ratingInputContainer}>
                                    {renderRatingStars(reviewRating, true, setReviewRating)}
                                </View>
                            </View>
                        )}

                        {/* Lista de reseñas existentes */}
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

            {/* Componentes de alertas personalizadas */}
            {/* Alerta básica para mostrar mensajes */}
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

            {/* Diálogo de confirmación para acciones importantes */}
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

            {/* Toast para notificaciones rápidas */}
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

// Estilos del componente
const styles = StyleSheet.create({
    // Contenedor principal de la pantalla
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 45, // Espacio para la status bar
    },
    // Header fijo con navegación y favoritos
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#fff',
        zIndex: 10, // Asegurar que esté sobre otros elementos
    },
    // Botón de navegación hacia atrás
    backButton: {
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Icono del botón de regreso
    backIcon: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
    },
    // Botón de favoritos con estilo circular
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
        elevation: 3, // Sombra en Android
    },
    // Estado activo del botón de favoritos
    favoriteButtonActive: {
        backgroundColor: '#ff6b8a',
    },
    // Contenedor del scroll principal
    scrollContainer: {
        flex: 1,
    },
    // Contenedor de la imagen principal del producto
    imageContainer: {
        width: screenWidth,
        height: screenWidth * 0.8, // Aspect ratio 4:3
        position: 'relative',
    },
    // Imagen del producto
    productImage: {
        width: '100%',
        height: '100%',
        backgroundColor: '#f5f5f5', // Color de fondo mientras carga
    },
    // Overlay para productos sin stock
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
    // Texto del overlay sin stock
    outOfStockText: {
        fontSize: 18,
        color: '#fff',
        fontFamily: 'Poppins-Bold',
    },
    // Contenedor principal del contenido
    contentContainer: {
        padding: 20,
    },
    // Nombre del producto
    productName: {
        fontSize: 24,
        fontFamily: 'Poppins-Bold',
        color: '#333',
        marginBottom: 8,
    },
    // Precio del producto
    productPrice: {
        fontSize: 28,
        fontFamily: 'Poppins-Bold',
        color: '#4A4170',
        marginBottom: 12,
    },
    // Contenedor de calificación y reseñas
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    // Contenedor de las estrellas
    starsContainer: {
        flexDirection: 'row',
        marginRight: 8,
    },
    // Estilo para estrellas interactivas
    interactiveStar: {
        padding: 2,
    },
    // Texto de número de reseñas
    ratingText: {
        fontSize: 14,
        color: '#666',
        fontFamily: 'Poppins-Regular',
    },
    // Texto de disponibilidad
    availabilityText: {
        fontSize: 14,
        color: '#27ae60',
        fontFamily: 'Poppins-Medium',
        marginBottom: 20,
    },
    // Sección de descripción
    descriptionSection: {
        marginBottom: 20,
    },
    // Sección de detalles
    detailsSection: {
        marginBottom: 20,
    },
    // Título de secciones
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'Poppins-SemiBold',
        color: '#333',
        marginBottom: 8,
    },
    // Texto de descripción
    descriptionText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        fontFamily: 'Poppins-Regular',
    },
    // Texto de detalles
    detailsText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        fontFamily: 'Poppins-Regular',
    },
    // Sección de acciones (cantidad + botón)
    actionSection: {
        marginBottom: 30,
        gap: 16,
    },
    topActionContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Contenedor del selector de cantidad
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
        borderRadius: 25,
        paddingHorizontal: 4,
    },
    // Botones de + y - para cantidad
    quantityButton: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 18,
    },
    // Texto que muestra la cantidad actual
    quantityText: {
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
        color: '#333',
        marginHorizontal: 16,
        minWidth: 20,
        textAlign: 'center',
    },
    // Contenedor de información cuando el producto está en el carrito
    inCartInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e8f5e8',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },
    // Texto de información cuando está en el carrito
    inCartInfoText: {
        fontSize: 14,
        fontFamily: 'Poppins-Medium',
        color: '#27ae60',
    },
    // Estilo base para el botón de toggle carrito
    toggleCartButton: {
        flexDirection: 'row',
        paddingVertical: 14, 
        paddingHorizontal: 20,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        width: '100%', 
        maxWidth: 300, 
        alignSelf: 'center',
    },
    // Botón principal para agregar al carrito
    addToCartButton: {
        backgroundColor: '#f5c7e6ff',
    },
    // Botón para quitar del carrito
    removeFromCartButton: {
        backgroundColor: '#e74c3c',
    },
    // Texto del botón de toggle carrito
    toggleCartButtonText: {
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
        color: '#fff',
    },
    // Sección completa de reseñas
    reviewsSection: {
        marginTop: 20,
    },
    // Contenedor del formulario para escribir reseñas
    writeReviewContainer: {
        marginBottom: 20,
        backgroundColor: '#f8f8f8',
        borderRadius: 12,
        padding: 16,
    },
    // Contenedor del input y botón enviar
    reviewInputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: 12,
    },
    // Campo de texto para escribir reseña
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
        textAlignVertical: 'top', // Alinear texto arriba en multiline
    },
    // Botón para enviar reseña
    sendButton: {
        width: 40,
        height: 40,
        backgroundColor: '#f5c7e6ff',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Icono del botón enviar
    sendIcon: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
    },
    // Contenedor del selector de calificación
    ratingInputContainer: {
        alignItems: 'flex-start',
    },
    // Contenedor de carga para reseñas
    reviewsLoadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
    },
    // Texto de carga de reseñas
    reviewsLoadingText: {
        fontSize: 14,
        color: '#666',
        fontFamily: 'Poppins-Regular',
        marginLeft: 8,
    },
    // Contenedor de pantalla de carga
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    // Texto de carga principal
    loadingText: {
        fontSize: 16,
        color: '#666',
        fontFamily: 'Poppins-Regular',
        marginTop: 12,
    },
    // Contenedor de pantalla de error
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20,
    },
    // Texto de error
    errorText: {
        fontSize: 16,
        color: '#e74c3c',
        fontFamily: 'Poppins-Regular',
        textAlign: 'center',
        marginVertical: 16,
    },
    // Botón para reintentar o volver
    retryButton: {
        backgroundColor: '#4A4170',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
    },
    // Texto del botón de reintentar
    retryButtonText: {
        fontSize: 16,
        color: '#fff',
        fontFamily: 'Poppins-SemiBold',
    },
});

export default ProductDetailScreen;