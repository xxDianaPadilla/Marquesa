import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast"; // Importar react-hot-toast
import { useFavorites } from "../context/FavoritesContext"; // Importar el hook de favoritos
import Header from "../components/Header/Header";
import Footer from "../components/Footer";
import CategoryNavigation from "../components/CategoryNavigation";
import CategorySection from "../components/CategorySection";
import PersonalizableSection from "../components/PersonalizableSection";
import LoadingSpinner from "../components/LoadingSpinner";
import Container from "../components/Container";
import ProductCard from "../components/ProductCard"; // Importar el componente ProductCard

const CategoryProducts = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Estados para el manejo de la página
    const [activeCategory, setActiveCategory] = useState('todos');
    const [isLoading, setIsLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [error, setError] = useState(null);

    // Hook de favoritos
    const { 
        favorites, 
        addToFavorites, 
        removeFromFavorites, 
        isFavorite, 
        toggleFavorite 
    } = useFavorites();

    // URL base de la API
    const API_BASE_URL = process.env.NODE_ENV === 'production' 
        ? '/api' 
        : 'http://localhost:4000/api';

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
     * Función para obtener todos los productos
     */
    const fetchAllProducts = async () => {
        try {
            setIsLoading(true);
            console.log('🔄 Fetching all products...');
            
            const response = await fetch(`${API_BASE_URL}/products`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('📦 All products response:', data);
            
            const productsData = Array.isArray(data) ? data : (data.products || data.data || []);
            
            console.log('📊 Total products loaded:', productsData.length);
            setProducts(productsData);
            setError(null);
            
        } catch (error) {
            console.error('❌ Error fetching all products:', error);
            setError('Error al cargar todos los productos');
            setProducts([]);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Función para obtener productos por categoría específica
     */
    const fetchProductsByCategory = async (categoryId) => {
        try {
            setIsLoading(true);
            console.log('🔄 Fetching products for category:', categoryId);
            
            const response = await fetch(`${API_BASE_URL}/products/by-category/${categoryId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log(`📦 Products for category ${categoryId}:`, data);
            
            const productsData = Array.isArray(data) ? data : (data.products || data.data || []);
            
            console.log(`📊 Products loaded for category ${categoryId}:`, productsData.length);
            setProducts(productsData);
            setError(null);
            
        } catch (error) {
            console.error(`❌ Error fetching products for category ${categoryId}:`, error);
            setError(`Error al cargar los productos de la categoría`);
            setProducts([]);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Maneja el toggle de favorito para un producto específico
     */
    const handleToggleFavorite = (product) => {
        try {
            console.log('❤️ Toggle favorite for product:', product.name);
            const wasAdded = toggleFavorite(product);
            
            // Mostrar toast según la acción realizada
            if (wasAdded) {
                toast.success(`¡${product.name} agregado a favoritos!`, {
                    duration: 2000,
                    position: 'top-center',
                    icon: '❤️',
                    style: {
                        background: '#EC4899',
                        color: '#fff',
                    },
                });
                console.log('✅ Producto agregado a favoritos');
            } else {
                toast.success(`${product.name} eliminado de favoritos`, {
                    duration: 2000,
                    position: 'top-center',
                    icon: '💔',
                    style: {
                        background: '#6B7280',
                        color: '#fff',
                    },
                });
                console.log('❌ Producto removido de favoritos');
            }
        } catch (error) {
            console.error('Error al manejar favoritos:', error);
            toast.error('Error al actualizar favoritos', {
                duration: 2000,
                position: 'top-center',
                icon: '❌'
            });
        }
    };

    /**
     * useEffect para cargar datos iniciales
     */
    useEffect(() => {
        console.log('🚀 Loading initial data...');
        fetchAllProducts();
    }, []);

    /**
     * useEffect para detectar cambios en la URL
     */
    useEffect(() => {
        const pathParts = location.pathname.split('/');
        if (pathParts[1] === 'categoria' && pathParts[2]) {
            const categoryFromUrl = pathParts[2];
            if (categoryFromUrl !== activeCategory) {
                console.log('🌐 URL category change detected:', categoryFromUrl);
                setActiveCategory(categoryFromUrl);
                fetchProductsByCategory(categoryFromUrl);
            }
        } else if (location.pathname === '/' && activeCategory !== 'todos') {
            console.log('🏠 Home page detected, setting to todos');
            setActiveCategory('todos');
            fetchAllProducts();
        }
    }, [location.pathname]);

    /**
     * Maneja el cambio de categoría en la navegación
     */
    const handleCategoryChange = async (categoryId) => {
        console.log('🎯 Category changed to:', categoryId);
        setActiveCategory(categoryId);
        
        if (categoryId === 'todos') {
            await fetchAllProducts();
            navigate('/', { replace: true });
        } else {
            await fetchProductsByCategory(categoryId);
            navigate(`/categoria/${categoryId}`, { replace: true });
        }
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    /**
     * Maneja el click en "Ver todos" de una categoría
     */
    const handleViewAll = (categoryId) => {
        console.log('👀 View all clicked for category:', categoryId);
        handleCategoryChange(categoryId);
    };

    /**
     * Maneja la navegación al detalle del producto
     */
    const handleProductDetailClick = (productId) => {
        console.log('🔗 Navigating to product detail:', productId);
        navigate(`/ProductDetail/${productId}`);
    };

    /**
     * Maneja la navegación a la página de personalización por categoría
     */
    const handlePersonalizeClick = (categoryId) => {
        console.log('🎨 Navigating to personalize category:', categoryId);
        navigate(`/personalizar/${categoryId}`);
    };

    /**
     * Agrupa los productos por categoría para mostrar en secciones
     */
    const getProductsByCategory = () => {
        const safeProducts = Array.isArray(products) ? products : [];
        
        if (activeCategory === 'todos') {
            const groupedProducts = {};
            
            safeProducts.forEach(product => {
                let categoryId, categoryName;
                
                if (typeof product.categoryId === 'object' && product.categoryId._id) {
                    categoryId = product.categoryId._id;
                    categoryName = product.categoryId.name;
                } else {
                    categoryId = product.categoryId;
                    categoryName = categoryMap[categoryId] || 'Sin categoría';
                }
                
                if (!groupedProducts[categoryId]) {
                    groupedProducts[categoryId] = {
                        name: categoryName,
                        products: []
                    };
                }
                
                groupedProducts[categoryId].products.push(product);
            });
            
            console.log('📊 Grouped products:', Object.keys(groupedProducts).map(key => ({
                categoryId: key,
                name: groupedProducts[key].name,
                count: groupedProducts[key].products.length
            })));
            
            return groupedProducts;
        } else {
            const categoryName = categoryMap[activeCategory] || categories.find(cat => cat._id === activeCategory)?.name || 'Categoría';
            return {
                [activeCategory]: {
                    name: categoryName,
                    products: safeProducts
                }
            };
        }
    };

    /**
     * Formatea los productos para usar con ProductCard
     * Incluye toda la información necesaria para el componente
     */
    const formatProductForCard = (product) => {
        console.log("🎨 Formateando producto para ProductCard:", product);

        const fallbackImage = '/placeholder-image.jpg';
        let image = fallbackImage;
        
        // Extraer la imagen del producto
        if (product.images && Array.isArray(product.images) && product.images.length > 0) {
            if (product.images[0].image) {
                image = product.images[0].image;
            }
        }

        // Extraer información de la categoría
        let categoryName = 'Sin categoría';
        if (typeof product.categoryId === 'object' && product.categoryId.name) {
            categoryName = product.categoryId.name;
        } else if (product.categoryId && categoryMap[product.categoryId]) {
            categoryName = categoryMap[product.categoryId];
        }

        const productId = product._id || product.id;

        return {
            ...product, // Incluir todos los datos originales del producto
            id: productId,
            _id: productId,
            name: product.name,
            description: product.description,
            price: product.price,
            image: image,
            stock: product.stock,
            category: categoryName,
            isPersonalizable: product.isPersonalizable || false
        };
    };

    /**
     * Función para reintentar la carga
     */
    const handleRetry = () => {
        setError(null);
        if (activeCategory === 'todos') {
            fetchAllProducts();
        } else {
            fetchProductsByCategory(activeCategory);
        }
    };

    /**
     * Renderiza la grilla de productos usando ProductCard
     */
    const renderProductGrid = (products, categoryId) => {
        if (!products || products.length === 0) {
            return (
                <div className="text-center py-8">
                    <p className="text-gray-500">No hay productos disponibles en esta categoría</p>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {products.map((product) => {
                    const formattedProduct = formatProductForCard(product);
                    const productId = formattedProduct._id || formattedProduct.id;
                    
                    return (
                        <ProductCard
                            key={productId}
                            product={formattedProduct}
                            showFavoriteButton={true} // Mostrar botón de favoritos
                            showRemoveButton={false} // No mostrar botón de eliminar en esta vista
                            isFavorite={isFavorite(productId)}
                            onToggleFavorite={() => handleToggleFavorite(formattedProduct)}
                        />
                    );
                })}
            </div>
        );
    };

    // Mostrar error si existe
    if (error && !isLoading) {
        return (
            <div className="min-h-screen bg-white-50">
                <Header />
                <Container>
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                            <div className="text-red-500 text-lg mb-4">⚠️ {error}</div>
                            <button 
                                onClick={handleRetry}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                            >
                                Reintentar
                            </button>
                        </div>
                    </div>
                </Container>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white-50">
            <Header />

            <section className="bg-white pt-2 sm:pt-4 pb-4 sm:pb-6">
                <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
                    <CategoryNavigation
                        categories={categories}
                        activeCategory={activeCategory}
                        onCategoryChange={handleCategoryChange}
                    />
                </div>
            </section>

            <main className="py-4 sm:py-8">
                <Container>
                    {isLoading ? (
                        <LoadingSpinner 
                            text="Cargando productos..."
                            className="min-h-[300px] sm:min-h-[400px]"
                        />
                    ) : (
                        <div className="space-y-8 sm:space-y-12">
                            {activeCategory === 'todos' && (
                                <PersonalizableSection
                                    onPersonalizeClick={handlePersonalizeClick}
                                />
                            )}
                            
                            {Object.entries(getProductsByCategory()).map(([categoryId, categoryData]) => (
                                <section key={categoryId} id={`section-${categoryId}`} className="space-y-4 sm:space-y-6">
                                    {/* Título de la categoría */}
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            {categoryData.name}
                                        </h2>
                                        {activeCategory === 'todos' && categoryData.products.length > 4 && (
                                            <button
                                                onClick={() => handleViewAll(categoryId)}
                                                className="text-pink-500 hover:text-pink-600 font-medium transition-colors duration-200"
                                                style={{ fontFamily: 'Poppins, sans-serif' }}
                                            >
                                                Ver todos
                                            </button>
                                        )}
                                    </div>
                                    
                                    {/* Grilla de productos usando ProductCard */}
                                    {renderProductGrid(
                                        activeCategory === 'todos' 
                                            ? categoryData.products.slice(0, 4) // Mostrar solo 4 en vista de todos
                                            : categoryData.products, // Mostrar todos en vista de categoría específica
                                        categoryId
                                    )}
                                </section>
                            ))}
                            
                            {products.length === 0 && !isLoading && (
                                <div className="text-center py-12">
                                    <div className="text-gray-500 text-lg">
                                        No se encontraron productos
                                        {activeCategory !== 'todos' && ' en esta categoría'}
                                    </div>
                                    {activeCategory !== 'todos' && (
                                        <button
                                            onClick={() => handleCategoryChange('todos')}
                                            className="mt-4 text-blue-500 hover:text-blue-600 underline"
                                        >
                                            Ver todos los productos
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </Container>
            </main>

            <Footer />
        </div>
    );
};

export default CategoryProducts;