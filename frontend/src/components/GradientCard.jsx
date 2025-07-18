// frontend/src/components/GradientCard.jsx
import React from 'react';

const GradientCard = ({ 
    icon, 
    title, 
    description, 
    gradient = 'linear-gradient(to right, #FDB4B7, #F2C6C2)',
    iconBg = 'rgba(255, 255, 255, 0.2)',
    className = '' 
}) => {
    const defaultIcon = (
        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
    );

    return (
        <div 
            className={`rounded-3xl shadow-xl p-8 sm:p-10 text-center ${className}`} 
            style={{ background: gradient }}
        >
            <div className="flex justify-center mb-6">
                <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: iconBg }}
                >
                    {icon || defaultIcon}
                </div>
            </div>
            <h4 
                className="text-white text-xl sm:text-2xl font-bold mb-4" 
                style={{ fontFamily: 'Poppins, sans-serif' }}
            >
                {title}
            </h4>
            <p 
                className="text-white/90 text-lg" 
                style={{ fontFamily: 'Poppins, sans-serif' }}
            >
                {description}
            </p>
        </div>
    );
};

export default GradientCard;