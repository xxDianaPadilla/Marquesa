// frontend/src/components/Badge.jsx
import React from 'react';

const Badge = ({ 
    children, 
    variant = 'default', 
    size = 'md',
    className = '' 
}) => {
    const variants = {
        default: 'bg-gray-100 text-gray-800 border-gray-300',
        primary: 'bg-pink-100 text-pink-800 border-pink-300',
        success: 'bg-green-100 text-green-800 border-green-300',
        warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        error: 'bg-red-100 text-red-800 border-red-300',
        info: 'bg-blue-100 text-blue-800 border-blue-300',
        agendado: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        'en-proceso': 'bg-blue-100 text-blue-800 border-blue-300',
        entregado: 'bg-green-100 text-green-800 border-green-300'
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-1.5 text-base'
    };

    return (
        <span
            className={`
                inline-flex items-center font-medium rounded-full border
                ${variants[variant]}
                ${sizes[size]}
                ${className}
            `}
            style={{ fontFamily: 'Poppins, sans-serif' }}
        >
            {children}
        </span>
    );
};

export default Badge;