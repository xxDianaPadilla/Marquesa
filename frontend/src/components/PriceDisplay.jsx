// frontend/src/components/PriceDisplay.jsx
import React from 'react';

const PriceDisplay = ({ 
    price, 
    originalPrice, 
    currency = '$',
    size = 'md',
    showDiscount = false,
    className = '' 
}) => {
    const sizes = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl'
    };

    const formatPrice = (amount) => {
        return `${amount.toFixed(2)}${currency}`;
    };

    const discountPercentage = originalPrice && originalPrice > price 
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : 0;

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {/* Precio actual */}
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

            {/* Badge de descuento */}
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