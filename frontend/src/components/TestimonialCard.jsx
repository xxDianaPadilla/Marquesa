// frontend/src/components/TestimonialCard.jsx
import React from 'react';

const TestimonialCard = ({ 
    name, 
    year, 
    comment, 
    rating = 5, 
    avatar,
    className = '' 
}) => {
    return (
        <div className={`bg-white rounded-lg p-6 sm:p-8 shadow-md hover:shadow-lg transition-shadow duration-300 ${className}`}>
            {/* Sistema de calificación con estrellas */}
            <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                    <svg 
                        key={i} 
                        className={`w-4 h-4 sm:w-5 sm:h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'} fill-current`} 
                        viewBox="0 0 20 20"
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                ))}
            </div>

            {/* Comentario del cliente */}
            <p
                className="text-gray-600 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base"
                style={{ fontFamily: "Poppins, sans-serif" }}
            >
                "{comment}"
            </p>

            {/* Información del cliente con foto */}
            <div className="flex items-center">
                <img
                    src={avatar || `https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80`}
                    alt={name}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover mr-3 sm:mr-4"
                />
                <div>
                    <h4
                        className="font-semibold text-gray-900 text-sm sm:text-base"
                        style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                        {name}
                    </h4>
                    <p
                        className="text-xs sm:text-sm text-gray-500"
                        style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                        Publicado en {year}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TestimonialCard;