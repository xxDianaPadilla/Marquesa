import React, { useState, useEffect } from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import Flower1 from "../assets/savesFlower1.png";
import Flower2 from "../assets/savesFlower2.png";
import Flower3 from "../assets/savesFlower3.png";

/**
 * Componente Saves
 * Página principal que muestra los productos guardados/favoritos del usuario
 * Incluye header, grid de productos y footer
 */
const Saves = () => {
    // Estado para almacenar los productos guardados
    const [savedProducts, setSavedProducts] = useState([]);
    // Estado para controlar la carga de datos
    const [isLoading, setIsLoading] = useState(true);

    /**
     * Datos de ejemplo de productos guardados
     * En una aplicación real, estos datos vendrían de una API o base de datos
     * Ahora usando las imágenes reales importadas
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
        // Simular tiempo de carga
        const timer = setTimeout(() => {
            setSavedProducts(mockSavedProducts);
            setIsLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    /**
     * Función para eliminar un producto de la lista de guardados
     * @param {string} productId - ID del producto a eliminar
     */
    const handleRemoveProduct = (productId) => {
        setSavedProducts(prevProducts => 
            prevProducts.filter(product => product.id !== productId)
        );
    };

    /**
     * Componente de estado de carga
     */
    const LoadingState = () => (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FDB4B7] mx-auto mb-4"></div>
                <p 
                    className="text-gray-600"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                    Cargando productos guardados...
                </p>
            </div>
        </div>
    );

    /**
     * Componente de estado vacío (cuando no hay productos guardados)
     */
    const EmptyState = () => (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center max-w-md mx-auto">
                <div className="mb-6">
                    <svg 
                        className="w-20 h-20 text-gray-300 mx-auto mb-4" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={1} 
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                        />
                    </svg>
                </div>
                <h3 
                    className="text-xl font-semibold text-gray-800 mb-2"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                    No tienes productos guardados
                </h3>
                <p 
                    className="text-gray-600 mb-6"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                    Explora nuestro catálogo y guarda tus productos favoritos para verlos aquí
                </p>
                <button
                    className="bg-[#FDB4B7] hover:bg-[#FCA5A9] text-white px-6 py-3 
                             rounded-lg transition-colors duration-200 font-medium"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                    onClick={() => window.location.href = '/'}
                >
                    Explorar productos
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white-50">
            {/* Header de la página */}
            <Header />

            {/* Contenido principal */}
            <main className="max-w-7xl mx-auto px-4 py-8">
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

                {/* Contenedor de productos */}
                {isLoading ? (
                    <LoadingState />
                ) : savedProducts.length === 0 ? (
                    <EmptyState />
                ) : (
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
            </main>

            {/* Footer de la página */}
            <Footer />
        </div>
    );
};

export default Saves;