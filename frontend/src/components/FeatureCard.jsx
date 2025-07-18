// frontend/src/components/FeatureCard.jsx
import React from 'react';

const FeatureCard = ({ 
    icon, 
    title, 
    description, 
    className = '' 
}) => {
    const defaultIcon = (
        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-[#CD5277]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
    );

    return (
        <div 
            className={`bg-white border border-gray-200 rounded-lg p-6 sm:p-8 text-center hover:shadow-lg transition-shadow duration-300 group ${className}`} 
            style={{ cursor: 'pointer' }}
        >
            <div className="flex justify-center mb-4 sm:mb-6">
                <div className="p-3 sm:p-4 bg-pink-50 rounded-full group-hover:bg-[#F2C6C2] group-hover:bg-opacity-10 transition-colors duration-300">
                    {icon || defaultIcon}
                </div>
            </div>
            <h3
                className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4"
                style={{ fontFamily: "Poppins, sans-serif" }}
            >
                {title}
            </h3>
            <p
                className="text-gray-600 leading-relaxed text-sm sm:text-base"
                style={{ fontFamily: "Poppins, sans-serif" }}
            >
                {description}
            </p>
        </div>
    );
};

export default FeatureCard;