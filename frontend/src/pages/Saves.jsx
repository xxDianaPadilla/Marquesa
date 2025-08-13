import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header/Header";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import Container from "../components/Container";
import ActionButton from "../components/ActionButton";
import { useFavorites } from "../context/FavoritesContext";
import { useAuth } from "../context/AuthContext";

const Saves = () => {
    const navigate = useNavigate();
    const {
        favorites,
        isLoading,
        favoritesError,
        removeFromFavorites,
        refreshFavorites,
        clearFavoritesError
    } = useFavorites();
    const { isAuthenticated, user } = useAuth();
    const [localLoading, setLocalLoading] = useState(true);

    // Crear un array seguro de favoritos
    const safeFavorites = Array.isArray(favorites) ? favorites : [];
    const favoritesCount = safeFavorites.length;

    // Simular carga inicial
    useEffect(() => {
        const timer = setTimeout(() => {
            setLocalLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    // Limpiar errores al montar el componente
    useEffect(() => {
        clearFavoritesError();
    }, [clearFavoritesError]);

    const handleRemoveProduct = async (productId) => {
        try {
            const success = await removeFromFavorites(productId);
            if (!success) {
                console.error('Failed to remove product from favorites');
                // Aquí podrías mostrar una notificación de error
            }
        } catch (error) {
            console.error('Error removing product:', error);
        }
    };

    const handleExploreProducts = () => {
        navigate('/categoryProducts');
    };

    const handleViewCart = () => {
        navigate('/shoppingCart');
    };

    const handleRetry = () => {
        clearFavoritesError();
        refreshFavorites();
    };

    const handleLogin = () => {
        navigate('/login');
    };

    // Si el usuario no está autenticado
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-white-50">
                <Header />
                <main className="py-8">
                    <Container>
                        <div className="text-center mb-8">
                            <h1
                                className="text-3xl font-bold text-gray-800 mb-2"
                                style={{ fontFamily: 'Poppins, sans-serif' }}
                            >
                                Mis guardados
                            </h1>
                            <p
                                className="text-gray-600"
                                style={{ fontFamily: 'Poppins, sans-serif' }}
                            >
                                Inicia sesión para ver tus productos favoritos
                            </p>
                        </div>

                        <EmptyState
                            icon={
                                <svg className="w-20 h-20 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            }
                            title="Debes iniciar sesión"
                            description="Para ver y guardar tus productos favoritos necesitas tener una cuenta"
                            actionText="Iniciar sesión"
                            onAction={handleLogin}
                        />
                    </Container>
                </main>
                <Footer />
            </div>
        );
    }

    // Mostrar loading mientras se cargan los datos
    if (localLoading || isLoading) {
        return (
            <div className="min-h-screen bg-white-50">
                <Header />
                <main className="py-8">
                    <Container>
                        <LoadingSpinner
                            text="Cargando productos guardados..."
                            className="min-h-[400px]"
                        />
                    </Container>
                </main>
                <Footer />
            </div>
        );
    }

    // Mostrar error si hay algún problema
    if (favoritesError) {
        return (
            <div className="min-h-screen bg-white-50">
                <Header />
                <main className="py-8">
                    <Container>
                        <div className="text-center mb-8">
                            <h1
                                className="text-3xl font-bold text-gray-800 mb-2"
                                style={{ fontFamily: 'Poppins, sans-serif' }}
                            >
                                Mis guardados
                            </h1>
                        </div>

                        <EmptyState
                            icon={
                                <svg className="w-20 h-20 text-red-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            }
                            title="Error al cargar favoritos"
                            description={favoritesError}
                            actionText="Reintentar"
                            onAction={handleRetry}
                        />
                    </Container>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white-50">
            <Header />

            <main className="py-8">
                <Container>
                    {/* Título de la página */}
                    <div className="text-center mb-8">
                        <h1
                            className="text-3xl font-bold text-gray-800 mb-2"
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                            Mis guardados
                        </h1>
                        <p
                            className="text-gray-600"
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                            {favoritesCount > 0
                                ? `Tienes ${favoritesCount} producto${favoritesCount === 1 ? '' : 's'} en tu lista de favoritos`
                                : "Aquí encontrarás tus productos favoritos"
                            }
                        </p>
                    </div>

                    {/* Contenido principal */}
                    {favoritesCount === 0 ? (
                        <EmptyState
                            icon={
                                <svg className="w-20 h-20 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            }
                            title="No tienes productos guardados"
                            description="Explora nuestro catálogo y guarda tus productos favoritos para verlos aquí"
                            actionText="Explorar productos"
                            onAction={handleExploreProducts}
                        />
                    ) : (
                        <>
                            {/* Grid de productos guardados */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                                {safeFavorites.map((product, index) => {
                                    // Validar que el producto tenga los datos mínimos necesarios
                                    if (!product || typeof product !== 'object') {
                                        console.warn('Invalid product at index', index, product);
                                        return null;
                                    }

                                    const productKey = product._id || product.id || `product-${index}`;

                                    // Crear un producto validado para evitar errores en ProductCard
                                    const validatedProduct = {
                                        _id: product._id || product.id,
                                        id: product.id || product._id,
                                        name: product.name || 'Producto sin nombre',
                                        description: product.description || '',
                                        price: product.price || 0,
                                        image: product.image || '/placeholder-product.jpg',
                                        categoryId: product.categoryId,
                                        ...product // Spread the rest of the properties
                                    };

                                    return (
                                        <ProductCard
                                            key={productKey}
                                            product={validatedProduct}
                                            onRemove={handleRemoveProduct}
                                        />
                                    );
                                })}
                            </div>

                            {/* Sección de acciones */}
                            <div className="text-center">
                                <div className="bg-white rounded-lg shadow-sm p-6 max-w-md mx-auto">
                                    <h3
                                        className="text-lg font-semibold text-gray-800 mb-2"
                                        style={{ fontFamily: 'Poppins, sans-serif' }}
                                    >
                                        ¿Listo para comprar?
                                    </h3>
                                    <p
                                        className="text-gray-600 mb-4 text-sm"
                                        style={{ fontFamily: 'Poppins, sans-serif' }}
                                    >
                                        Explora más productos o procede con tu compra
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                        <ActionButton
                                            onClick={handleExploreProducts}
                                            variant="outline"
                                            size="md"
                                        >
                                            Seguir explorando
                                        </ActionButton>
                                        <ActionButton
                                            onClick={handleViewCart}
                                            variant="primary"
                                            size="md"
                                        >
                                            Ver carrito
                                        </ActionButton>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </Container>
            </main>

            <Footer />
        </div>
    );
};

export default Saves;