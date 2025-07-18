/**
 * Componente Saves - Página de productos guardados/favoritos del usuario
 * 
 * Funcionalidades principales:
 * - Listado de productos favoritos del usuario
 * - Estados de carga y vacío
 * - Grid responsivo de productos
 * - Gestión de eliminación de favoritos
 * 
 * Componentes utilizados:
 * - Header/Footer (existentes)
 * - ProductCard (existente)
 * - LoadingSpinner (nuevo)
 * - EmptyState (nuevo)
 * - Container (nuevo)
 * - ActionButton (nuevo)
 */

import React, { useState, useEffect } from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";

// Componentes nuevos reutilizables
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import Container from "../components/Container";
import ActionButton from "../components/ActionButton";

// Imágenes de productos
import Flower1 from "../assets/savesFlower1.png";
import Flower2 from "../assets/savesFlower2.png";
import Flower3 from "../assets/savesFlower3.png";

const Saves = () => {
    // Estados para el manejo de la página
    const [savedProducts, setSavedProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    /**
     * Datos de ejemplo de productos guardados
     * En una aplicación real, estos datos vendrían de una API o base de datos
     */
    const mockSavedProducts = [
        {
            id: "1",
            name: "Ramo de flores secas lavanda",
            description: "Arreglos con flores secas",
            price: 10.00,
            image: Flower1,
            category: "Arreglos con flores secas"
        },
        {
            id: "2", 
            name: "Cuadro sencillo de hogar",
            description: "Cuadros decorativos",
            price: 34.00,
            image: Flower2,
            category: "Cuadros decorativos"
        },
        {
            id: "3",
            name: "Ramo de rosas frescas",
            description: "Arreglos con flores naturales", 
            price: 23.00,
            image: Flower3,
            category: "Arreglos con flores naturales"
        },
        {
            id: "4",
            name: "Arreglo floral primaveral",
            description: "Hermoso arreglo con flores de temporada",
            price: 45.00,
            image: Flower1, 
            category: "Arreglos con flores naturales"
        },
        {
            id: "5",
            name: "Cuadro decorativo moderno",
            description: "Diseño contemporáneo para el hogar",
            price: 28.50,
            image: Flower2,
            category: "Cuadros decorativos"
        },
        {
            id: "6",
            name: "Giftbox especial",
            description: "Caja de regalo con flores y chocolates",
            price: 55.00,
            image: Flower3,
            category: "Giftboxes"
        }
    ];

    /**
     * useEffect para simular la carga de productos guardados
     * En una aplicación real, aquí se haría una llamada a la API
     */
    useEffect(() => {
        const timer = setTimeout(() => {
            setSavedProducts(mockSavedProducts);
            setIsLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    /**
     * Función para eliminar un producto de la lista de guardados
     */
    const handleRemoveProduct = (productId) => {
        setSavedProducts(prevProducts => 
            prevProducts.filter(product => product.id !== productId)
        );
    };

    /**
     * Función para navegar a la página de exploración de productos
     */
    const handleExploreProducts = () => {
        window.location.href = '/';
    };

    return (
        <div className="min-h-screen bg-white-50">
            {/* Header de la página */}
            <Header />

            {/* Contenido principal */}
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
                            {savedProducts.length > 0 
                                ? `Tienes ${savedProducts.length} productos en la lista de guardados`
                                : "Aquí encontrarás tus productos favoritos"
                            }
                        </p>
                    </div>

                    {/* Contenedor de productos con estados de carga y vacío */}
                    {isLoading ? (
                        // Estado de carga usando componente reutilizable
                        <LoadingSpinner 
                            text="Cargando productos guardados..."
                            className="min-h-[400px]"
                        />
                    ) : savedProducts.length === 0 ? (
                        // Estado vacío usando componente reutilizable
                        <EmptyState
                            icon={
                                <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            }
                            title="No tienes productos guardados"
                            description="Explora nuestro catálogo y guarda tus productos favoritos para verlos aquí"
                            actionText="Explorar productos"
                            onAction={handleExploreProducts}
                        />
                    ) : (
                        // Grid de productos guardados
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {savedProducts.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onRemove={handleRemoveProduct}
                                />
                            ))}
                        </div>
                    )}

                    {/* Sección adicional con acciones cuando hay productos */}
                    {!isLoading && savedProducts.length > 0 && (
                        <div className="mt-12 text-center">
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
                                        onClick={() => window.location.href = '/'}
                                        variant="outline"
                                        size="md"
                                    >
                                        Seguir explorando
                                    </ActionButton>
                                    <ActionButton
                                        onClick={() => window.location.href = '/shopping-cart'}
                                        variant="primary"
                                        size="md"
                                    >
                                        Ver carrito
                                    </ActionButton>
                                </div>
                            </div>
                        </div>
                    )}
                </Container>
            </main>

            {/* Footer de la página */}
            <Footer />
        </div>
    );
};

export default Saves;