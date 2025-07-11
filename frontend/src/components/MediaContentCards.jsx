import React from "react";
import { useNavigate } from "react-router-dom";
import playIcon from "../assets/playIcon.png";
// import bookIcon from "../assets/bookIcon.png";
import likeIcon from "../assets/likeIcon.png";
import calendarIcon from "../assets/calendar.png";

// Componente para mostrar tarjetas de contenido multimedia
// Permite navegar a la página de detalle del medio y manejar likes
const MediaContentCards = ({ item }) => {
    const navigate = useNavigate();
    // Función para manejar el clic en la tarjeta y navegar a la página de detalle
    const handleCardClick = () => {
        navigate(`/MediaDetailPage/${item.id}`);
    };
    // Función para manejar el clic en el botón de like
    // Aquí podrías agregar lógica para manejar el like, como actualizar el estado o enviar una
    const handleLikeClick = (e) => {
        e.stopPropagation();
        // Lógica para manejar el like
        console.log("Like clicked for item:", item.id);
    };

    return (
        <div 
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer group"
            onClick={handleCardClick}
        >
            {/* Image Container */}
            <div className="relative">
                <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-48 sm:h-56 md:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Play/Book Icon Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white bg-opacity-90 rounded-full p-3 sm:p-4 shadow-lg group-hover:bg-opacity-100 transition-all duration-300">
                        <img
                            // src={item.type === 'video' ? playIcon : bookIcon}
                            alt={item.type === 'video' ? 'Play' : 'Read'}
                            className="w-6 h-6 sm:w-8 sm:h-8"
                            src={playIcon}
                        />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                {/* Date */}
                <div className="flex items-center text-gray-500 text-xs sm:text-sm mb-3">
                    <img src={calendarIcon} alt="Calendar" className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    <span>Fecha de publicación: {item.date}</span>
                </div>

                {/* Title */}
                <h3 className="text-gray-800 font-medium text-sm sm:text-base lg:text-lg mb-4 line-clamp-2 group-hover:text-gray-900 transition-colors">
                    {item.title}
                </h3>

                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                    <button 
                        className="bg-pink-200 text-pink-800 px-3 py-2 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium hover:bg-pink-300 transition-colors"
                        onClick={handleCardClick}
                    >
                        {item.type === 'video' ? 'Ver Video' : 'Leer Artículo'}
                    </button>

                    <button 
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        onClick={handleLikeClick}
                    >
                        <img src={likeIcon} alt="Like" className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MediaContentCards;