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
    const { favorites, isLoading, removeFromFavorites } = useFavorites();
    const { isAuthenticated, user } = useAuth();
    const [localLoading, setLocalLoading] = useState(true);

    // Simular carga inicial
    useEffect(() => {
        const timer = setTimeout(() => {
            setLocalLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    const handleRemoveProduct = (productId) => {
        removeFromFavorites(productId);
    };

    const handleExploreProducts = () => {
        navigate('/');
    };

    const handleViewCart = () => {
        navigate('/shopping-cart');
    };

    // Mostrar loading mientras se cargan los datos
    if (localLoading || isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
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

    return (
        <div className="min-h-screen bg-gray-50">
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
                            {favorites.length > 0 
                                ? `Tienes ${favorites.length} producto${favorites.length === 1 ? '' : 's'} en tu lista de favoritos`
                                : "Aquí encontrarás tus productos favoritos"
                            }
                        </p>
                        {isAuthenticated && user && (
                            <p 
                                className="text-sm text-gray-500 mt-1"
                                style={{ fontFamily: 'Poppins, sans-serif' }}
                            >
                                Guardados para: {user.userType === 'Customer' ? 'Cliente' : user.userType}
                            </p>
                        )}
                    </div>

                    {/* Contenido principal */}
                    {favorites.length === 0 ? (
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
                                {favorites.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        onRemove={handleRemoveProduct}
                                    />
                                ))}
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

export default Saves