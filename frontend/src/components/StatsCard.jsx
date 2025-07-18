// frontend/src/components/StatsCard.jsx
import React from 'react';

const StatsCard = ({ 
    icon, 
    title, 
    value, 
    subtitle, 
    color = '#E8ACD2',
    textColor = 'white',
    className = '' 
}) => {
    return (
        <div 
            className={`text-center rounded-xl p-4 flex-1 ${className}`} 
            style={{ backgroundColor: color }}
        >
            {icon && (
                <div className="flex justify-center mb-2">
                    {typeof icon === 'string' ? (
                        <img src={icon} alt={title} className="w-6 h-6" />
                    ) : (
                        icon
                    )}
                </div>
            )}
            <p 
                className={`text-xs text-${textColor} mb-1`}
                style={{ fontFamily: 'Poppins, sans-serif' }}
            >
                {title}
            </p>
            <p 
                className={`text-${textColor} text-xl font-bold`}
                style={{ fontFamily: 'Poppins, sans-serif' }}
            >
                {value}
            </p>
            {subtitle && (
                <p 
                    className={`text-xs text-${textColor} opacity-75 mt-1`}
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                    {subtitle}
                </p>
            )}
        </div>
    );
};

export default StatsCard;