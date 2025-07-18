// frontend/src/components/Divider.jsx
import React from 'react';

const Divider = ({ 
    orientation = 'horizontal', 
    text, 
    className = '',
    color = '#E5E7EB' 
}) => {
    if (orientation === 'vertical') {
        return (
            <div 
                className={`w-px bg-gray-300 ${className}`}
                style={{ backgroundColor: color }}
            />
        );
    }

    if (text) {
        return (
            <div className={`relative flex items-center ${className}`}>
                <div className="flex-grow border-t" style={{ borderColor: color }}></div>
                <span 
                    className="flex-shrink mx-4 text-gray-500 text-sm"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                    {text}
                </span>
                <div className="flex-grow border-t" style={{ borderColor: color }}></div>
            </div>
        );
    }

    return (
        <hr 
            className={`border-0 h-px ${className}`}
            style={{ backgroundColor: color }}
        />
    );
};

export default Divider;