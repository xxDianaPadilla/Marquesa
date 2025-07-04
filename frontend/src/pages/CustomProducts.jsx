import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import Header from "../components/Header/Header";
import CategoryNavigation from "../components/CategoryNavigation";
import Footer from "../components/Footer";
import CustomizationPanel from "../components/CustomizationPanel";
import CustomCategorySection from "../components/CustomCategorySection";
import cuadro1 from "../assets/cuadro1.png";
import cuadro2 from "../assets/cuadro2.png";
import cuadro3 from "../assets/cuadro3.png";
import flor1 from "../assets/flor1.png";
import flor2 from "../assets/flor2.png";
import flor3 from "../assets/flor3.png";
import papel1 from "../assets/papel1.png";
import papel2 from "../assets/papel2.png";
import papel3 from "../assets/papel3.png";

const CustomProducts = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Estado para la categoría activa en la navegación
    const [activeCategory, setActiveCategory] = useState('todos');
    
    // Estado para controlar la carga de datos
    const [isLoading, setIsLoading] = useState(true);
    
    // Estado para productos seleccionados para personalización
    const [selectedProducts, setSelectedProducts] = useState([]);
    
    // Estado para el carrito de compras
    const [cart, setCart] = useState([]);

     // Configuración de categorías disponibles
     
    const categories = [
        { id: 'todos', name: 'Todos' },
        { id: 'flores-naturales', name: 'Arreglos con flores naturales' },
        { id: 'flores-secas', name: 'Arreglos con flores secas' },
        { id: 'cuadros-decorativos', name: 'Cuadros decorativos' },
        { id: 'giftboxes', name: 'Giftboxes' },
        { id: 'tarjetas', name: 'Tarjetas' }
    ];

    
     // Datos de productos de ejemplo
     
    const sampleProducts = {
        flores: [
            {
                id: 1,
                name: "Rosas rojas",
                description: "Disponible en stock",
                price: 23.00,
                image: flor1,
                inStock: true,
                category: "flores"
            },
            {
                id: 2,
                name: "Margaritas",
                description: "Flores blancas naturales",
                price: 18.00,
                image: flor2,
                inStock: true,
                category: "flores"
            },
            {
                id: 3,
                name: "Flores silvestres",
                description: "Arreglo natural variado",
                price: 25.00,
                image: flor3,
                inStock: true,
                category: "flores"
            }
        ],
        envolturas: [
            {
                id: 4,
                name: "Papel Kraft",
                description: "Envoltura natural",
                price: 5.00,
                image: papel1,
                inStock: true,
                category: "envolturas"
            },
            {
                id: 5,
                name: "Papel Rosa",
                description: "Envoltura elegante",
                price: 7.00,
                image: papel2,
                inStock: true,
                category: "envolturas"
            },
            {
                id: 6,
                name: "Papel Blanco",
                description: "Clásico y elegante",
                price: 6.00,
                image: papel3,
                inStock: true,
                category: "envolturas"
            }
        ],
        marcos: [
            {
                id: 7,
                name: "Marco de Madera",
                description: "Marco rústico natural",
                price: 35.00,
                image: cuadro1,
                inStock: true,
                category: "marcos"
            },
            {
                id: 8,
                name: "Marco con Girasoles",
                description: "Diseño floral vibrante",
                price: 42.00,
                image: cuadro2,
                inStock: true,
                category: "marcos"
            },
            {
                id: 9,
                name: "Marco Decorativo",
                description: "Estilo vintage",
                price: 38.00,
                image: cuadro3,
                inStock: true,
                category: "marcos"
            }
        ]
    };

    
     // useEffect para simular la carga inicial de datos
    
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
     * Maneja la adición de productos al carrito
     * @param {Object} product - Producto a añadir al carrito
     */

    const handleAddToCart = (product) => {
        setCart(prev => [...prev, product]);
        console.log('Producto añadido al carrito:', product);
        // Aquí podremos mostrar una notificación o actualizar un contador
    };

    /**
     * Maneja la personalización de productos
     * @param {Object} product - Producto a personalizar
     * @param {boolean} isSelected - Si el producto está seleccionado
     */

    const handleCustomize = (product, isSelected) => {
        if (isSelected) {
            setSelectedProducts(prev => [...prev, product]);
        } else {
            setSelectedProducts(prev => prev.filter(p => p.id !== product.id));
        }
    };

    /**
     * Maneja la eliminación de productos de la personalización
     * @param {number} productId - ID del producto a eliminar
     */

    const handleRemoveProduct = (productId) => {
        setSelectedProducts(prev => prev.filter(p => p.id !== productId));
    };

    
     // Maneja la finalización de la personalización
     
    const handleFinishCustomization = () => {
        console.log('Personalización finalizada con productos:', selectedProducts);
        // Aquí podremos navegar a la página de checkout o mostrar un modal
        alert(`¡Personalización completada! Total de productos: ${selectedProducts.length}`);
        
        setCart(prev => [...prev, ...selectedProducts]);
        
        // Limpiamos la selección después de finalizar
        setSelectedProducts([]);
    };

    // Mostramos loading mientras se cargan los datos
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando productos...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <Header />
            
            <CategoryNavigation
                categories={categories}
                activeCategory={activeCategory}
                onCategoryChange={handleCategoryChange}
            />

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Área de productos */}
                    <div className="lg:col-span-3">
                        <CustomCategorySection 
                            title="Escoge el estilo de flores"
                            products={sampleProducts.flores}
                            onAddToCart={handleAddToCart}
                            onCustomize={handleCustomize}
                        />
                        
                        <CustomCategorySection 
                            title="Escoge el tipo de envoltura"
                            products={sampleProducts.envolturas}
                            onAddToCart={handleAddToCart}
                            onCustomize={handleCustomize}
                        />
                        
                        <CustomCategorySection 
                            title="Escoge el marco"
                            products={sampleProducts.marcos}
                            onAddToCart={handleAddToCart}
                            onCustomize={handleCustomize}
                        />
                    </div>
                    
                    {/* Panel de personalización */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-4">
                            <CustomizationPanel 
                                selectedProducts={selectedProducts}
                                onRemoveProduct={handleRemoveProduct}
                                onFinishCustomization={handleFinishCustomization}
                            />
                            
                            {/* Información adicional del carrito */}
                            {cart.length > 0 && (
                                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                                    <p className="text-sm text-green-700">
                                        Productos en carrito: {cart.length}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
};

export default CustomProducts;