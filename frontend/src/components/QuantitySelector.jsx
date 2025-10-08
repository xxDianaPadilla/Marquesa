import React, { useState } from 'react';
import { Minus, Plus } from 'lucide-react';

const QuantitySelector = ({
    product,
    currentQuantity = 1,
    onQuantityChange,
    maxQuantity = 50
}) => {
    const [quantity, setQuantity] = useState(currentQuantity);

    const handleDecrement = (e) => {
        e.stopPropagation();
        if (quantity > 1) {
            const newQuantity = quantity - 1;
            setQuantity(newQuantity);
            onQuantityChange(product, newQuantity);
        }
    };

    const handleIncrement = (e) => {
        e.stopPropagation();
        const maxAllowed = Math.min(maxQuantity, product.stock || maxQuantity);
        if (quantity < maxAllowed) {
            const newQuantity = quantity + 1;
            setQuantity(newQuantity);
            onQuantityChange(product, newQuantity);
        }
    };

    const handleInputChange = (e) => {
        e.stopPropagation();
        const value = e.target.value;

        if (value === '') {
            setQuantity('');
            return;
        }

        const numValue = parseInt(value);
        const maxAllowed = Math.min(maxQuantity, product.stock || maxQuantity);

        if (!isNaN(numValue) && numValue >= 1 && numValue <= maxAllowed) {
            setQuantity(numValue);
            onQuantityChange(product, numValue);
        }
    };

    const handleBlur = (e) => {
        e.stopPropagation();
        if (quantity === '' || quantity < 1) {
            setQuantity(1);
            onQuantityChange(product, 1);
        }
    };

    const maxAllowed = Math.min(maxQuantity, product.stock || maxQuantity);

    return (
        <div className="flex items-center space-x-2 bg-white rounded-lg border border-gray-300 p-1">
            <button
                onClick={handleDecrement}
                disabled={quantity <= 1}
                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                style={{ cursor: 'pointer' }}
            >
                <Minus className="w-4 h-4 text-gray-600" />
            </button>

            <input
                type="number"
                value={quantity}
                onChange={handleInputChange}
                onBlur={handleBlur}
                onClick={(e) => e.stopPropagation()}
                min="1"
                max={maxAllowed}
                className="w-12 text-center text-sm font-medium text-gray-700 border-0 focus:outline-none focus:ring-2 focus:ring-pink-500 rounded"
                style={{ cursor: 'text' }}
            />

            <button
                onClick={handleIncrement}
                disabled={quantity >= maxAllowed}
                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                style={{ cursor: 'pointer' }}
            >
                <Plus className="w-4 h-4 text-gray-600" />
            </button>

            <span className="text-xs text-gray-500 ml-1">
                /{maxAllowed}
            </span>
        </div>
    );
};

export default QuantitySelector;