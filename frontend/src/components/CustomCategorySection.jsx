
import React from "react";
import ProductCard from "./CustomProductCard";

// Componente para mostrar una sección personalizada de categorías
// Permite mostrar productos de una categoría específica con opciones para añadir al carrito o personalizar
const CustomCategorySection = ({ 
    title = "Categoría", 
    products = [], 
    onAddToCart = () => {}, 
    onCustomize = () => {} 
}) => {
    return (
        <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
                <button className="text-pink-500 hover:text-pink-600 font-medium">
                    Ver todos
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={onAddToCart}
                        onCustomize={onCustomize}
                    />
                ))}
            </div>
        </div>
    );
};

export default CustomCategorySection;