// frontend/src/components/ActionButton.jsx
import React from 'react';

const ActionButton = ({ 
    children, 
    onClick, 
    variant = 'primary', 
    size = 'md', 
    disabled = false,
    loading = false,
    icon,
    className = '',
    ...props 
}) => {
    const variants = {
        primary: 'bg-[#FDB4B7] hover:bg-[#F2C6C2] text-white',
        secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
        outline: 'border border-[#FDB4B7] text-[#FDB4B7] hover:bg-[#FDB4B7] hover:text-white',
        danger: 'bg-red-500 hover:bg-red-600 text-white',
        success: 'bg-green-500 hover:bg-green-600 text-white'
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base'
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            className={`
                ${variants[variant]}
                ${sizes[size]}
                rounded-lg font-medium transition-all duration-200 
                flex items-center justify-center gap-2
                disabled:opacity-50 disabled:cursor-not-allowed
                hover:scale-105 transform
                ${className}
            `}
            style={{ 
                fontFamily: 'Poppins, sans-serif',
                cursor: disabled ? 'not-allowed' : 'pointer'
            }}
            {...props}
        >
            {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
            ) : icon ? (
                typeof icon === 'string' ? (
                    <img src={icon} alt="" className="w-4 h-4" />
                ) : (
                    icon
                )
            ) : null}
            {children}
        </button>
    );
};

export default ActionButton;