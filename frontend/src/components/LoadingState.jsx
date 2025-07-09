import React from 'react';

const LoadingState = ({ message = "Cargando multimedia...", size = "md" }) => {
    const sizeClasses = {
        sm: "h-6 w-6",
        md: "h-12 w-12",
        lg: "h-16 w-16"
    };

    const containerClasses = {
        sm: "h-32",
        md: "h-64",
        lg: "min-h-[400px]"
    };

    return (
        <div className={`flex items-center justify-center ${containerClasses[size]}`}>
            <div className="text-center">
                <div className={`animate-spin rounded-full border-b-2 border-[#FF7260] mx-auto mb-4 ${sizeClasses[size]}`}></div>
                <p className="text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {message}
                </p>
            </div>
        </div>
    );
};

export default LoadingState;