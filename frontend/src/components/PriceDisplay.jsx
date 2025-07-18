// frontend/src/components/PriceDisplay.jsx

// Importa React para crear el componente
import React from 'react';

/**
 * Componente PriceDisplay - Visualizador de precios con funcionalidad de descuentos
 * 
 * Componente especializado para mostrar precios con soporte para:
 * - Precios originales y con descuento
 * - Diferentes tamaños de texto
 * - Badges de porcentaje de descuento
 * - Formato de moneda personalizable
 * 
 * @param {number} price - Precio actual/final a mostrar
 * @param {number} originalPrice - Precio original (antes del descuento)
 * @param {string} currency - Símbolo de moneda a usar
 * @param {string} size - Tamaño del texto ('sm', 'md', 'lg', 'xl')
 * @param {boolean} showDiscount - Si mostrar el badge de descuento
 * @param {string} className - Clases CSS adicionales
 */
const PriceDisplay = ({ 
    price, 
    originalPrice, 
    currency = '$',
    size = 'md',
    showDiscount = false,
    className = '' 
}) => {
    // Definición de tamaños de texto
    const sizes = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl'
    };

    /**
     * Formatea un precio con el símbolo de moneda
     * @param {number} amount - Cantidad a formatear
     * @returns {string} Precio formateado
     */
    const formatPrice = (amount) => {
        return `${amount.toFixed(2)}${currency}`;
    };

    // Calcula el porcentaje de descuento si hay precio original
    const discountPercentage = originalPrice && originalPrice > price 
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : 0;

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {/* Precio actual/final */}
            <span 
                className={`font-bold text-gray-800 ${sizes[size]}`}
                style={{ fontFamily: 'Poppins, sans-serif' }}
            >
                {formatPrice(price)}
            </span>

            {/* Precio original (tachado si hay descuento) */}
            {originalPrice && originalPrice > price && (
                <span 
                    className={`text-gray-500 line-through ${sizes[size === 'xl' ? 'lg' : 'sm']}`}
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                    {formatPrice(originalPrice)}
                </span>
            )}

            {/* Badge de porcentaje de descuento */}
            {showDiscount && discountPercentage > 0 && (
                <span 
                    className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                    -{discountPercentage}%
                </span>
            )}
        </div>
    );
};

export default PriceDisplay;