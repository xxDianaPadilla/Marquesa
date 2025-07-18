/**
 * Componente CategoryProducts (Home) - Página principal de productos por categorías
 * ACTUALIZADA: Implementa componentes reutilizables para mejorar la organización del código
 * 
 * Funcionalidades principales:
 * - Navegación por categorías con filtros
 * - Productos organizados por secciones
 * - Sistema de carga y estados vacíos
 * - Navegación a páginas de detalle de productos
 * 
 * Componentes utilizados:
 * - Header/Footer (existentes)
 * - CategoryNavigation (existente)
 * - CategorySection (existente)
 * - LoadingSpinner (nuevo)
 * - Container (nuevo)
 */

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header/Header";
import Footer from "../components/Footer";
import CategoryNavigation from "../components/CategoryNavigation";
import CategorySection from "../components/CategorySection";

// Componentes nuevos reutilizables
import LoadingSpinner from "../components/LoadingSpinner";
import Container from "../components/Container";

// Importar imágenes de productos
import Flower1 from "../assets/savesFlower1.png";
import Flower2 from "../assets/savesFlower2.png";
import Flower3 from "../assets/savesFlower3.png";

const CategoryProducts = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Estados para el manejo de la página
    const [activeCategory, setActiveCategory] = useState('todos');
    const [isLoading, setIsLoading] = useState(true);

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
     * Datos expandidos de productos por categoría
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
     */
    const handleCategoryChange = (categoryId) => {
        setActiveCategory(categoryId);
        
        if (categoryId === 'todos') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            navigate(`/categoria/${categoryId}`);
        }
    };

    /**
     * Maneja el click en "Ver todos" de una categoría
     */
    const handleViewAll = (categoryId) => {
        console.log('Ver todos de categoría:', categoryId);
        navigate(`/categoria/${categoryId}`);
    };

    /**
     * Maneja la navegación al detalle del producto
     */
    const handleProductDetailClick = () => {
        navigate('/ProductDetail');
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
     */
    const getCategoryName = (categoryId) => {
        const category = categories.find(cat => cat.id === categoryId);
        return category ? category.name : categoryId;
    };

    return (
        <div className="min-h-screen bg-white-50">
            {/* Header de la página */}
            <Header />

            {/* Navegación de categorías */}
            <section className="bg-white pt-2 sm:pt-4 pb-4 sm:pb-6">
                <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
                    <CategoryNavigation
                        categories={categories}
                        activeCategory={activeCategory}
                        onCategoryChange={handleCategoryChange}
                    />
                </div>
            </section>

            {/* Contenido principal */}
            <main className="py-4 sm:py-8">
                <Container>
                    {isLoading ? (
                        // Componente de carga reutilizable
                        <LoadingSpinner 
                            text="Cargando productos..."
                            className="min-h-[300px] sm:min-h-[400px]"
                        />
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
                </Container>
            </main>

            {/* Footer de la página */}
            <Footer />
        </div>
    );
};

export default CategoryProducts;