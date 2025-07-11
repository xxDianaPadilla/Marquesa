// Importaciones necesarias: React, hooks y íconos
import React, { useState } from "react";
import { Plus, Minus, ShoppingCart } from 'lucide-react';

// Componente de tarjeta de producto que acepta props: product, onAddToCart y onCustomize
const ProductCard = ({ product, onAddToCart, onCustomize }) => {
    // Estado local para manejar la cantidad del producto
    const [quantity, setQuantity] = useState(1);
    // Estado local para manejar si el producto está seleccionado para personalización
    const [isSelected, setIsSelected] = useState(false);

    // Función para incrementar o decrementar la cantidad (no permite valores menores a 1)
    const handleQuantityChange = (increment) => {
        setQuantity(prev => Math.max(1, prev + increment));
    };

    // Función para agregar el producto al carrito con la cantidad seleccionada
    const handleAddToCart = () => {
        onAddToCart({ ...product, quantity });
    };

    // Función para manejar la selección/personalización del producto
    const handleCustomize = () => {
        setIsSelected(!isSelected);
        onCustomize(product, !isSelected);
    };

    return (
        // Contenedor principal con estilos condicionales para el estado seleccionado
        <div className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg ${isSelected ? 'ring-2 ring-pink-400' : ''}`}>
            {/* Sección de imagen del producto con indicador de stock */}
            <div className="relative">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-60 object-cover"
                />
                {/* Etiqueta condicional que muestra si hay stock */}
                {product.inStock && (
                    <span className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                        En stock
                    </span>
                )}
            </div>

            {/* Sección de información del producto */}
            <div className="p-4">
                {/* Nombre y descripción del producto */}
                <h3 className="font-semibold text-gray-800 mb-2">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-3">{product.description}</p>

                {/* Control de precio y cantidad */}
                <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-gray-900">${product.price}</span>
                    {/* Controles para ajustar la cantidad */}
                    <div className="flex items-center border rounded-lg">
                        <button
                            onClick={() => handleQuantityChange(-1)}
                            className="p-1 hover:bg-gray-100 transition-colors"
                        >
                            <Minus size={16} />
                        </button>
                        <span className="px-3 py-1 border-x">{quantity}</span>
                        <button
                            onClick={() => handleQuantityChange(1)}
                            className="p-1 hover:bg-gray-100 transition-colors"
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                </div>

                {/* Botones de acción: Personalizar y Agregar al carrito */}
                <div className="flex gap-2">
                    {/* Botón de personalización con estilo condicional */}
                    <button
                        onClick={handleCustomize}
                        className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors ${isSelected
                                ? 'bg-pink-500 text-white hover:bg-pink-600'
                                : 'bg-pink-100 text-pink-600 hover:bg-pink-200'
                            }`}
                    >
                        {isSelected ? 'Seleccionado' : 'Personalizar'}
                    </button>
                    {/* Botón de agregar al carrito */}
                    <button
                        onClick={handleAddToCart}
                        className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        <ShoppingCart size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;