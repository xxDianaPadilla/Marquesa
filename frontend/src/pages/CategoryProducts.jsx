import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header/Header";
import Footer from "../components/Footer";
import CategoryNavigation from "../components/CategoryNavigation";
import CategorySection from "../components/CategorySection";

// Importar imágenes de productos
import Flower1 from "../assets/savesFlower1.png";
import Flower2 from "../assets/savesFlower2.png";
import Flower3 from "../assets/savesFlower3.png";

/**
 * Componente CategoryProducts (Home)
 * Página principal que muestra todas las categorías y productos
 * Incluye navegación por categorías y secciones de productos
 */
const CategoryProducts = () => {
    const navigate = useNavigate();
    const location = useLocation();
    // Estado para la categoría activa en la navegación
    const [activeCategory, setActiveCategory] = useState('todos');
    // Estado para controlar la carga de datos
    const [isLoading, setIsLoading] = useState(true);

    const handleProductDetailClick = () => {
        navigate('/ProductDetail');
    };

    /**
     * Configuración de categorías disponibles
     */
    const categories = [
        { id: 'todos', name: 'Todos' },
        { id: 'flores-naturales', name: 'Arreglos con flores naturales' },
        { id: 'flores-secas', name: 'Arreglos con flores secas' },
        { id: 'cuadros-decorativos', name: 'Cuadros decorativos' },
        { id: 'giftboxes', name: 'Giftboxes' },
        { id: 'tarjetas', name: 'Tarjetas' }
    ];

    /**
     * Datos expandidos de productos por categoría (exactamente los mismos datos)
     * En una aplicación real, estos datos vendrían de una API
     */
    const productsByCategory = {
        'flores-naturales': [
            { id: 'fn1', name: 'Ramo de rosas amarillas', description: 'Hermoso ramo con rosas amarillas frescas', price: 23.00, image: Flower1 },
            { id: 'fn2', name: 'Ramo primaveral', description: 'Arreglo con flores de temporada', price: 30.00, image: Flower2 },
            { id: 'fn3', name: 'Ramo de rosas frescas', description: 'Rosas rojas recién cortadas', price: 35.00, image: Flower3 },
            { id: 'fn4', name: 'Bouquet de tulipanes', description: 'Coloridos tulipanes holandeses', price: 28.00, image: Flower1 },
            { id: 'fn5', name: 'Arreglo de gerberas', description: 'Vibrantes gerberas multicolor', price: 25.00, image: Flower2 },
            { id: 'fn6', name: 'Ramo de peonías', description: 'Elegantes peonías rosas', price: 45.00, image: Flower3 },
            { id: 'fn7', name: 'Bouquet mixto', description: 'Combinación de flores silvestres', price: 32.00, image: Flower1 },
            { id: 'fn8', name: 'Ramo de lirios', description: 'Lirios blancos perfumados', price: 38.00, image: Flower2 }
        ],
        'flores-secas': [
            { id: 'fs1', name: 'Ramo de flores secas lavanda', description: 'Aromática lavanda seca', price: 18.00, image: Flower1 },
            { id: 'fs2', name: 'Bouquet morado tulipán', description: 'Tulipanes secos preservados', price: 24.00, image: Flower2 },
            { id: 'fs3', name: 'Centro de mesa con flores secas', description: 'Elegante centro decorativo', price: 28.00, image: Flower3 },
            { id: 'fs4', name: 'Ramo de eucalipto', description: 'Eucalipto seco aromático', price: 22.00, image: Flower1 },
            { id: 'fs5', name: 'Flores de algodón', description: 'Suaves flores de algodón', price: 20.00, image: Flower2 },
            { id: 'fs6', name: 'Ramo de pampas', description: 'Hierba de pampas decorativa', price: 26.00, image: Flower3 },
            { id: 'fs7', name: 'Corona de flores secas', description: 'Corona decorativa para puerta', price: 35.00, image: Flower1 }
        ],
        'cuadros-decorativos': [
            { id: 'cd1', name: 'Cuadro de flores', description: 'Arte floral enmarcado', price: 25.00, image: Flower1 },
            { id: 'cd2', name: 'Girasoles', description: 'Pintura de girasoles', price: 30.00, image: Flower2 },
            { id: 'cd3', name: 'Cactus', description: 'Arte de cactus minimalista', price: 15.00, image: Flower3 },
            { id: 'cd4', name: 'Paisaje botánico', description: 'Cuadro de jardín vintage', price: 40.00, image: Flower1 },
            { id: 'cd5', name: 'Flores abstractas', description: 'Arte floral moderno', price: 35.00, image: Flower2 },
            { id: 'cd6', name: 'Herbario enmarcado', description: 'Plantas prensadas artísticas', price: 28.00, image: Flower3 },
            { id: 'cd7', name: 'Cuadro de rosas', description: 'Elegante composición de rosas', price: 32.00, image: Flower1 },
            { id: 'cd8', name: 'Arte de hojas', description: 'Composición de hojas naturales', price: 22.00, image: Flower2 },
            { id: 'cd9', name: 'Mandala floral', description: 'Diseño mandala con flores', price: 45.00, image: Flower3 }
        ],
        'giftboxes': [
            { id: 'gb1', name: 'Giftbox de vino', description: 'Caja regalo con vino premium', price: 60.00, image: Flower1 },
            { id: 'gb2', name: 'Giftbox Flores', description: 'Caja con flores y chocolates', price: 45.00, image: Flower2 },
            { id: 'gb3', name: 'Giftbox spa', description: 'Set de relajación completo', price: 55.00, image: Flower3 },
            { id: 'gb4', name: 'Giftbox dulces', description: 'Caja con dulces artesanales', price: 38.00, image: Flower1 },
            { id: 'gb5', name: 'Giftbox café', description: 'Set de café gourmet', price: 42.00, image: Flower2 },
            { id: 'gb6', name: 'Giftbox romántico', description: 'Kit romántico especial', price: 65.00, image: Flower3 }
        ],
        'tarjetas': [
            { id: 't1', name: 'Tarjeta floral', description: 'Tarjeta con diseño floral', price: 8.00, image: Flower1 },
            { id: 't2', name: 'Tarjeta roja', description: 'Tarjeta roja elegante', price: 10.00, image: Flower2 },
            { id: 't3', name: 'Bouquet como de girasol', description: 'Tarjeta con girasoles', price: 12.00, image: Flower3 },
            { id: 't4', name: 'Tarjeta vintage', description: 'Diseño retro romántico', price: 9.00, image: Flower1 },
            { id: 't5', name: 'Tarjeta minimalista', description: 'Diseño limpio y moderno', price: 7.00, image: Flower2 },
            { id: 't6', name: 'Tarjeta dorada', description: 'Acabados dorados elegantes', price: 15.00, image: Flower3 },
            { id: 't7', name: 'Tarjeta acuarela', description: 'Efectos de acuarela artística', price: 11.00, image: Flower1 },
            { id: 't8', name: 'Tarjeta pop-up', description: 'Tarjeta 3D interactiva', price: 18.00, image: Flower2 }
        ]
    };

    /**
     * useEffect para simular la carga inicial de datos
     */
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    /**
     * Maneja el cambio de categoría en la navegación
     * @param {string} categoryId - ID de la categoría seleccionada
     */
    const handleCategoryChange = (categoryId) => {
        setActiveCategory(categoryId);
        
        if (categoryId === 'todos') {
            // Si selecciona "todos", mostrar todas las categorías en scroll horizontal
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            // Si selecciona una categoría específica, navegar a la página individual
            navigate(`/categoria/${categoryId}`);
        }
    };

    /**
     * Maneja el click en "Ver todos" de una categoría
     * @param {string} categoryId - ID de la categoría
     */
    const handleViewAll = (categoryId) => {
        console.log('Ver todos de categoría:', categoryId);
        // Navegar a la página de categoría individual
        navigate(`/categoria/${categoryId}`);
    };

    /**
     * Filtra las categorías a mostrar según la selección activa
     */
    const getCategoriesToShow = () => {
        if (activeCategory === 'todos') {
            return Object.keys(productsByCategory);
        }
        return [activeCategory];
    };

    /**
     * Obtiene el nombre de una categoría por su ID
     * @param {string} categoryId - ID de la categoría
     * @returns {string} Nombre de la categoría
     */
    const getCategoryName = (categoryId) => {
        const category = categories.find(cat => cat.id === categoryId);
        return category ? category.name : categoryId;
    };

    /**
     * Componente de estado de carga
     */
    const LoadingState = () => (
        <div className="flex items-center justify-center min-h-[300px] sm:min-h-[400px]">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-[#FDB4B7] mx-auto mb-4"></div>
                <p 
                    className="text-gray-600 text-sm sm:text-base"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                    Cargando productos...
                </p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white-50">
            {/* Header de la página */}
            <Header />

            {/* Navegación de categorías */}
            <CategoryNavigation
                categories={categories}
                activeCategory={activeCategory}
                onCategoryChange={handleCategoryChange}
            />

            {/* Contenido principal */}
            <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
                {isLoading ? (
                    <LoadingState />
                ) : (
                    <div className="space-y-6 sm:space-y-8">
                        {/* Renderizar secciones según la categoría activa */}
                        {getCategoriesToShow().map((categoryId) => (
                            <div key={categoryId} id={`section-${categoryId}`}>
                                <CategorySection
                                    title={getCategoryName(categoryId)}
                                    products={productsByCategory[categoryId] || []}
                                    categoryId={categoryId}
                                    onProductClick={handleProductDetailClick}
                                    onViewAll={handleViewAll}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Footer de la página */}
            <Footer />
        </div>
    );
};

export default CategoryProducts;