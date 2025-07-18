import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header/Header";
import Footer from "../components/Footer";
import CategoryNavigation from "../components/CategoryNavigation";

// Importar imágenes de productos
import Flower1 from "../assets/savesFlower1.png";
import Flower2 from "../assets/savesFlower2.png";
import Flower3 from "../assets/savesFlower3.png";

/**
 * Componente CategoryProductsPage
 * Página individual para mostrar todos los productos de una categoría específica
 * Los productos se muestran en grid (filas y columnas) en lugar de scroll horizontal
 */
const CategoryProductsPage = () => {
    const { categoryId } = useParams(); // Obtener el ID de categoría de la URL
    const navigate = useNavigate();
    
    // Estados del componente
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [categoryName, setCategoryName] = useState('');
    
    const handleProductDetailClick = (e) => {
        e.preventDefault();
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

    const categoryMap = {
        'flores-naturales': 'Arreglos con flores naturales',
        'flores-secas': 'Arreglos con flores secas',
        'cuadros-decorativos': 'Cuadros decorativos',
        'giftboxes': 'Giftboxes',
        'tarjetas': 'Tarjetas'
    };

    /**
     * Datos expandidos de productos por categoría (exactamente los mismos que en CategoryProducts)
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
     * useEffect para cargar los productos de la categoría específica
     */
    useEffect(() => {
        // Verificar si la categoría existe
        if (!categoryMap[categoryId]) {
            navigate('/'); // Redirigir al home si la categoría no existe
            return;
        }

        // Simular tiempo de carga
        setIsLoading(true);
        const timer = setTimeout(() => {
            setCategoryName(categoryMap[categoryId]);
            setProducts(productsByCategory[categoryId] || []);
            setIsLoading(false);
        }, 800);

        return () => clearTimeout(timer);
    }, [categoryId, navigate]);

    /**
     * Maneja el cambio de categoría en la navegación
     * @param {string} newCategoryId - ID de la categoría seleccionada
     */
    const handleCategoryChange = (newCategoryId) => {
        if (newCategoryId === 'todos') {
            // Si selecciona "todos", regresar al home
            navigate('/categoryProducts');
        } else {
            // Si selecciona otra categoría, navegar a esa página
            navigate(`/categoria/${newCategoryId}`);
        }
    };

    /**
     * Formatea el precio del producto
     * @param {number} price - Precio a formatear
     * @returns {string} Precio formateado
     */
    const formatPrice = (price) => {
        return `${price.toFixed(2)}$`;
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

    /**
     * Componente de estado vacío
     */
    const EmptyState = () => (
        <div className="text-center py-8 sm:py-12">
            <div className="text-gray-400 mb-4">
                <svg 
                    className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={1} 
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" 
                    />
                </svg>
            </div>
            <p 
                className="text-gray-500 text-sm sm:text-base"
                style={{ fontFamily: 'Poppins, sans-serif' }}
            >
                No hay productos disponibles en esta categoría
            </p>
        </div>
    );

    return (
        <div className="min-h-screen bg-white-50">
            {/* Header de la página */}
            <Header />

            {/* Navegación de categorías */}
            <section className="bg-white pt-2 sm:pt-4 pb-4 sm:pb-6">
                <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
                    <CategoryNavigation
                        categories={categories}
                        activeCategory={categoryId}
                        onCategoryChange={handleCategoryChange}
                    />
                </div>
            </section>

            {/* Contenido principal */}
            <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
                {/* Header de la sección */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6">
                    {/* Título y contador de productos */}
                    <div className="mb-3 sm:mb-0">
                        <h2 
                            className="text-xl sm:text-2xl font-bold text-gray-800 mb-1"
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                            {categoryName}
                        </h2>
                        <p 
                            className="text-xs sm:text-sm text-gray-500"
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                            {products.length} productos
                        </p>
                    </div>
                </div>

                {/* Grid de productos */}
                {isLoading ? (
                    <LoadingState />
                ) : products.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6">
                        {products.map((product) => (
                            <div
                                key={product.id}
                                onClick={handleProductDetailClick}
                                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg 
                                         transition-all duration-300 cursor-pointer transform hover:scale-105"
                            >
                                {/* Imagen del producto */}
                                <div className="relative">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-32 sm:h-48 object-cover"
                                    />
                                    
                                    {/* Badge de precio */}
                                    <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-white bg-opacity-90 
                                                  rounded-full px-2 sm:px-3 py-1 shadow-md">
                                        <span 
                                            className="text-xs sm:text-sm font-bold text-gray-800"
                                            style={{ fontFamily: 'Poppins, sans-serif' }}
                                        >
                                            {formatPrice(product.price)}
                                        </span>
                                    </div>

                                    {/* Botón de favorito */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            console.log('Añadir a favoritos:', product.id);
                                        }}
                                        className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-white bg-opacity-80 hover:bg-opacity-100 
                                                 rounded-full p-1.5 sm:p-2 transition-all duration-200 shadow-md
                                                 hover:shadow-lg transform hover:scale-105 cursor-pointer"
                                        aria-label="Añadir a favoritos"
                                    >
                                        <svg 
                                            className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 hover:text-red-500" 
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round" 
                                                strokeWidth={2} 
                                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                                            />
                                        </svg>
                                    </button>
                                </div>

                                {/* Información del producto */}
                                <div className="p-2 sm:p-4">
                                    <h3 
                                        className="text-sm sm:text-lg font-semibold text-gray-800 mb-1 sm:mb-2 line-clamp-2"
                                        style={{ fontFamily: 'Poppins, sans-serif' }}
                                    >
                                        {product.name}
                                    </h3>
                                    
                                    <p 
                                        className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-2 sm:mb-3 hidden sm:block"
                                        style={{ fontFamily: 'Poppins, sans-serif' }}
                                    >
                                        {product.description}
                                    </p>

                                    {/* Botón de acción */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            console.log('Añadir al carrito:', product.id);
                                        }}
                                        className="w-full bg-[#E8ACD2] hover:bg-[#E096C8] text-white py-1.5 sm:py-2 px-2 sm:px-4 
                                                 rounded-lg transition-colors duration-200 text-xs sm:text-sm font-medium
                                                 cursor-pointer hover:scale-105"
                                        style={{ fontFamily: 'Poppins, sans-serif' }}
                                    >
                                        <span className="hidden sm:inline">Añadir al carrito</span>
                                        <span className="sm:hidden">Añadir</span>
                                    </button>
                                </div>
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

export default CategoryProductsPage;