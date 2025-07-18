// frontend/src/components/PageTitle.jsx
import React from 'react';

const PageTitle = ({ 
    title, 
    subtitle, 
    showDecorations = true,
    className = '' 
}) => {
    return (
        <div className={`text-center mb-16 ${className}`}>
            {/* Decoración superior */}
            {showDecorations && (
                <div className="flex justify-center mb-6">
                    <div className="flex space-x-2">
                        <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: '#FDB4B7' }}></div>
                        <div className="w-3 h-3 rounded-full animate-pulse delay-75" style={{ backgroundColor: '#F2C6C2' }}></div>
                        <div className="w-3 h-3 rounded-full animate-pulse delay-150" style={{ backgroundColor: '#FDB4B7' }}></div>
                    </div>
                </div>
            )}

            <h1
                className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold bg-clip-text text-transparent mb-6 px-4"
                style={{ 
                    fontFamily: 'Poppins, sans-serif',
                    backgroundImage: 'linear-gradient(to right, #FF6A5F, #FDB4B7)'
                }}
            >
                {title}
            </h1>

            {/* Línea decorativa */}
            {showDecorations && (
                <div className="w-24 h-1 mx-auto rounded-full mb-8" style={{ background: 'linear-gradient(to right, #F2C6C2, #FADDDD)' }}></div>
            )}

            {subtitle && (
                <p
                    className="text-sm sm:text-base lg:text-lg xl:text-xl text-gray-600 leading-relaxed px-4 sm:px-0 max-w-4xl mx-auto"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                    {subtitle}
                </p>
            )}
        </div>
    );
};

export default PageTitle;