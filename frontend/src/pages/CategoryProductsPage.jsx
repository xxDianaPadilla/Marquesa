import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header/Header";
import Footer from "../components/Footer";
import CategoryNavigation from "../components/CategoryNavigation";
import Container from "../components/Container"; // AGREGADO: Importar Container

/**
 * Componente CategoryProductsPage
 * Página individual para mostrar todos los productos de una categoría específica
 * Los productos se muestran en grid (filas y columnas) en lugar de scroll horizontal
 */

const CategoryProductsPage = () => {
    const { categoryId = 'todos' } = useParams(); // Obtener el ID de categoría de la URL
    const navigate = useNavigate();
    
    // Estados del componente
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [categoryName, setCategoryName] = useState('');
    
    // Cambia esta función en CategoryProductsPage
const handleProductDetailClick = (e, productId) => {
    e.preventDefault();
    navigate(`/ProductDetail/${productId}`);
};

    /**
     * Configuración de categorías disponibles
     */
    const categories = [
        { _id: 'todos', name: 'Todos' },
        { _id: '688175a69579a7cde1657aaa', name: 'Arreglos con flores naturales' },
        { _id: '688175d89579a7cde1657ac2', name: 'Arreglos con flores secas' },
        { _id: '688175fd9579a7cde1657aca', name: 'Cuadros decorativos' },
        { _id: '688176179579a7cde1657ace', name: 'Giftboxes' },
        { _id: '688175e79579a7cde1657ac6', name: 'Tarjetas' }
    ];

    const categoryMap = {
        '688175a69579a7cde1657aaa': 'Arreglos con flores naturales',
        '688175d89579a7cde1657ac2': 'Arreglos con flores secas',
        '688175fd9579a7cde1657aca': 'Cuadros decorativos',
        '688176179579a7cde1657ace': 'Giftboxes',
        '688175e79579a7cde1657ac6': 'Tarjetas'
    };

    /**
     * useEffect para cargar los productos de la categoría específica
     */
    useEffect(() => {
        if (!categoryId) return;

        if (categoryId === 'todos') {
            navigate('/categoryProducts');
            return;
        }

        const fetchProductsByCategory = async () => {
            try {
                setIsLoading(true);

                const response = await fetch(`http://localhost:4000/api/products/by-category/${categoryId}`);
                const result = await response.json();

                // Si tu API devuelve un array directamente:
                const data = Array.isArray(result) ? result : result.products || result.data || [];

                setProducts(data);
                setCategoryName(categoryMap[categoryId] || 'Categoría');
            } catch (error) {
                console.error("Error al cargar productos por categoría:", error);
                setProducts([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProductsByCategory();
    }, [categoryId]);

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
        return `$${price.toFixed(2)}`;
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

            {/* Navegación de categorías - MISMO ESTILO QUE CategoryProducts */}
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
            <main className="py-4 sm:py-8">
                <Container>
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
                        (() => {
                            const formattedProducts = products.map((product) => {
                                const fallback = '/placeholder-image.jpg';
                                const mainImage = (
                                    product.images &&
                                    Array.isArray(product.images) &&
                                    product.images.length > 0 &&
                                    product.images[0].image
                                ) ? product.images[0].image : fallback;

                                return {
                                    ...product,
                                    image: mainImage
                                };
                            });

                            return (
                                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6">
    {formattedProducts.map((product) => (
        <div
            key={product._id}
            onClick={(e) => handleProductDetailClick(e, product._id)} // ✅ Pasar el ID aquí
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
                        // Lógica de favoritos aquí
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

                {/* Botón de acción - Opcional: también puede ir al detalle */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        // Opción 1: Añadir al carrito (funcionalidad futura)
                        console.log('Añadir al carrito:', product._id);
                        
                        // Opción 2: O también ir al detalle del producto
                        // handleProductDetailClick(e, product._id);
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
                            );
                        })()
                    )}
                </Container>
            </main>

            {/* Footer de la página */}
            <Footer />
        </div>
    );
};

export default CategoryProductsPage;