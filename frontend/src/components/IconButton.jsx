// frontend/src/components/IconButton.jsx
import React from 'react';

const IconButton = ({ 
    icon, 
    onClick, 
    variant = 'default',
    size = 'md',
    disabled = false,
    loading = false,
    tooltip,
    className = '',
    ...props 
}) => {
    const variants = {
        default: 'bg-gray-100 hover:bg-gray-200 text-gray-600',
        primary: 'bg-[#FDB4B7] hover:bg-[#F2C6C2] text-white',
        secondary: 'bg-white hover:bg-gray-50 text-gray-600 border border-gray-300',
        danger: 'bg-red-100 hover:bg-red-200 text-red-600',
        success: 'bg-green-100 hover:bg-green-200 text-green-600',
        transparent: 'bg-transparent hover:bg-gray-100 text-gray-600'
    };

    const sizes = {
        sm: 'w-8 h-8 p-1',
        md: 'w-10 h-10 p-2',
        lg: 'w-12 h-12 p-3'
    };

    const iconSizes = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6'
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            title={tooltip}
            className={`
                ${variants[variant]}
                ${sizes[size]}
                rounded-full flex items-center justify-center
                transition-all duration-200 transform hover:scale-105
                disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300
                ${className}
            `}
            style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
            {...props}
        >
            {loading ? (
                <div className={`animate-spin rounded-full border-b-2 border-current ${iconSizes[size]}`}></div>
            ) : typeof icon === 'string' ? (
                <img src={icon} alt="" className={iconSizes[size]} />
            ) : (
                React.cloneElement(icon, { className: iconSizes[size] })
            )}
        </button>
    );
};

export default IconButton;