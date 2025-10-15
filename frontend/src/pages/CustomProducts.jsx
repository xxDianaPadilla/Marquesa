import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Header from "../components/Header/Header";
import Footer from "../components/Footer";
import CategoryNavigation from "../components/CategoryNavigation";
import CustomizationPanel from "../components/CustomizationPanel";
import CustomCategorySection from "../components/CustomCategorySection";
import { useCustomProductsByType } from "../components/CustomProductsMaterials/hooks/useCustomProductsMaterialsUsers";

const CustomProducts = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const productType = searchParams.get('product');
    const availableCategories = searchParams.get('categories') ? JSON.parse(searchParams.get('categories')) : [];

    const categories = useMemo(() => [
        { _id: 'todos', name: 'Todos' },
        { _id: '688175a69579a7cde1657aaa', name: 'Arreglos con flores naturales' },
        { _id: '688175d89579a7cde1657ac2', name: 'Arreglos con flores secas' },
        { _id: '688175fd9579a7cde1657aca', name: 'Cuadros decorativos' },
        { _id: '688176179579a7cde1657ace', name: 'Giftboxes' },
        { _id: '688175e79579a7cde1657ac6', name: 'Tarjetas' }
    ], []);

    const [activeNavCategory, setActiveNavCategory] = useState('todos');
    const [activeCategory, setActiveCategory] = useState('todos');
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [cart, setCart] = useState([]);

    const { productData, loading, error } = useCustomProductsByType(productType);

    useEffect(() => {
        if (!productType) {
            navigate('/');
        }
    }, [productType, navigate]);

    const handleGoBack = useCallback(() => {
        navigate('/categoryProducts');
    }, [navigate]);

    const handleCategoryChange = useCallback((categoryId) => {
        console.log(`👆 CustomProducts - Cambio de categoría solicitado: ${activeNavCategory} → ${categoryId}`);

        if (categoryId === activeNavCategory) {
            console.log(`⚠️ CustomProducts - Ya estamos en la categoría: ${categoryId}`);
            return;
        }

        setActiveNavCategory(categoryId);

        if (categoryId === 'todos') {
            navigate('/categoryProducts', { replace: true });
        } else {
            navigate(`/categoria/${categoryId}`, { replace: true });
        }

        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
    }, [activeNavCategory, navigate]);

    const handleAddToCart = (product) => {
        setCart(prev => [...prev, product]);
        console.log('Producto añadido al carrito:', product);
    };

    const handleCustomize = (product, isSelected) => {
        if (isSelected) {
            setSelectedProducts(prev => {
                const existingProduct = prev.find(p => p._id === product._id);
                if (existingProduct) {
                    console.log('Producto ya seleccionado:', product.name);
                    return prev;
                }
                console.log('✅ Agregando producto con cantidad inicial:', { name: product.name, quantity: 1 });
                return [...prev, { ...product, quantity: 1 }];
            });
        } else {
            console.log('❌ Removiendo producto:', product.name);
            setSelectedProducts(prev => prev.filter(p => p._id !== product._id));
        }
    };

    // Manejo de cambio de cantidad con validación
    const handleQuantityChange = (product, newQuantity) => {
        console.log('=== CustomProducts - handleQuantityChange ===');
        console.log('Product:', {
            id: product._id,
            name: product.name,
            currentQuantity: product.quantity,
            stock: product.stock
        });
        console.log('Nueva cantidad solicitada:', newQuantity, 'Tipo:', typeof newQuantity);

        // Validar y normalizar la cantidad
        const validQuantity = Math.max(1, Math.min(50, Math.floor(Number(newQuantity))));
        
        // Verificar stock disponible
        const maxAllowed = Math.min(validQuantity, product.stock || 50);
        const finalQuantity = Math.min(validQuantity, maxAllowed);

        console.log('Cantidad validada:', {
            solicitada: newQuantity,
            validada: validQuantity,
            stockDisponible: product.stock,
            finalQuantity: finalQuantity
        });

        if (finalQuantity !== newQuantity) {
            console.warn('⚠️ Cantidad ajustada por validación o stock');
        }

        setSelectedProducts(prev => {
            const updated = prev.map(p => {
                if (p._id === product._id) {
                    console.log('✅ Actualizando cantidad de:', p.name, 'de', p.quantity, 'a', finalQuantity);
                    return { ...p, quantity: finalQuantity };
                }
                return p;
            });

            // Verificar que se actualizó
            const updatedProduct = updated.find(p => p._id === product._id);
            console.log('Estado después de actualización:', {
                productName: updatedProduct?.name,
                newQuantity: updatedProduct?.quantity
            });

            return updated;
        });
    };

    const handleRemoveProduct = (productId) => {
        console.log('🗑️ Removiendo producto ID:', productId);
        setSelectedProducts(prev => prev.filter(p => p._id !== productId));
    };

    const handleFinishCustomization = (customizationData) => {
        console.log('Personalización finalizada con datos:', customizationData);

        const { selectedProducts, productType, totalPrice, referenceImage, comments } = customizationData;

        const customizationOrder = {
            productType,
            selectedProducts,
            totalPrice,
            referenceImage,
            comments,
            timestamp: new Date().toISOString(),
            id: `custom-${Date.now()}`
        };

        setCart(prev => [...prev, customizationOrder]);

        setSelectedProducts([]);

        console.log('Orden de personalización creada:', customizationOrder);
    };

    const transformMaterialsToProducts = (materials) => {
        return materials.map(material => ({
            _id: material._id,  
            name: material.name,
            description: `Stock disponible: ${material.stock}`,
            price: material.price,
            image: material.image,
            inStock: material.stock > 0,
            category: material.categoryToParticipate,
            stock: material.stock,
            productToPersonalize: material.productToPersonalize
        }));
    };

    // Monitorear cambios en selectedProducts
    useEffect(() => {
        console.log('📊 Estado actual de selectedProducts:', selectedProducts.map(p => ({
            name: p.name,
            quantity: p.quantity,
            price: p.price,
            subtotal: (p.quantity || 1) * p.price
        })));
    }, [selectedProducts]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando productos personalizables...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-xl mb-4">⚠️</div>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors"
                    >
                        Volver al inicio
                    </button>
                </div>
            </div>
        );
    }

    if (!productData || Object.keys(productData.categories).length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-gray-400 text-xl mb-4">📦</div>
                    <p className="text-gray-600 mb-4">No hay materiales disponibles para este producto</p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors"
                    >
                        Volver al inicio
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white-50">
            <Header />

            <section className="bg-white pt-2 sm:pt-4 pb-4 sm:pb-6 shadow-sm">
                <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={handleGoBack}
                            className="flex items-center justify-center p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors duration-200 group"
                            title="Volver a CategoryProducts"
                        >
                            <ArrowLeft className="h-5 w-5 text-gray-600 group-hover:text-gray-800" />
                        </button>

                        <div className="flex-1">
                            <CategoryNavigation
                                categories={categories}
                                activeCategory={activeNavCategory}
                                onCategoryChange={handleCategoryChange}
                            />
                        </div>
                    </div>
                </div>
            </section>

            <main className="py-4 sm:py-8">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Personalizar {productType}
                        </h1>
                        <p className="text-gray-600">
                            Selecciona los materiales para crear tu producto personalizado único
                        </p>
                        <div className="mt-4 flex items-center space-x-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                {productData.totalMaterials} materiales disponibles
                            </span>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                {Object.keys(productData.categories).length} categorías
                            </span>
                            {selectedProducts.length > 0 && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-pink-100 text-pink-800">
                                    {selectedProducts.length} producto{selectedProducts.length !== 1 ? 's' : ''} seleccionado{selectedProducts.length !== 1 ? 's' : ''}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        <div className="lg:col-span-3">
                            {Object.entries(productData.categories).map(([categoryName, materials]) => {
                                const categoryId = categoryName.toLowerCase().replace(/\s+/g, '-');
                                const transformedProducts = transformMaterialsToProducts(materials);

                                return (
                                    <div key={categoryName} id={`category-${categoryId}`}>
                                        <CustomCategorySection
                                            title={`Escoge ${categoryName.toLowerCase()}`}
                                            products={transformedProducts}
                                            onAddToCart={handleAddToCart}
                                            onCustomize={handleCustomize}
                                            onQuantityChange={handleQuantityChange}
                                            selectedProducts={selectedProducts}
                                        />
                                    </div>
                                );
                            })}
                        </div>

                        <div className="lg:col-span-1">
                            <div className="sticky top-4">
                                <CustomizationPanel
                                    selectedProducts={selectedProducts}
                                    onRemoveProduct={handleRemoveProduct}
                                    onQuantityChange={handleQuantityChange}
                                    onFinishCustomization={handleFinishCustomization}
                                    productType={productType}
                                />

                                {cart.length > 0 && (
                                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                            <p className="text-sm text-green-700 font-medium">
                                                Productos en carrito: {cart.length}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                                        💡 Consejos de personalización
                                    </h3>
                                    <ul className="text-xs text-gray-600 space-y-1">
                                        <li>• Selecciona al menos un elemento de cada categoría</li>
                                        <li>• Ajusta las cantidades según tus necesidades (máx. 50)</li>
                                        <li>• El precio se calculará según la cantidad seleccionada</li>
                                        <li>• Puedes cambiar tu selección en cualquier momento</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default CustomProducts;