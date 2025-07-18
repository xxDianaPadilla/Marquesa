// frontend/src/components/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = ({ 
    size = 'md', 
    text = 'Cargando...', 
    color = '#FDB4B7',
    className = '' 
}) => {
    const sizeClasses = {
        sm: 'w-6 h-6',
        md: 'w-8 h-8 sm:w-12 sm:h-12',
        lg: 'w-16 h-16'
    };

    return (
        <div className={`flex items-center justify-center min-h-[200px] ${className}`}>
            <div className="text-center">
                <div 
                    className={`animate-spin rounded-full border-b-2 mx-auto mb-4 ${sizeClasses[size]}`}
                    style={{ borderColor: color }}
                ></div>
                {text && (
                    <p 
                        className="text-gray-600 text-sm sm:text-base"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                        {text}
                    </p>
                )}
            </div>
        </div>
    );
};

export default LoadingSpinner;