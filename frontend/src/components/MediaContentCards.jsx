// frontend/src/components/MediaContentCards.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import playIcon from "../assets/playIcon.png";
import likeIcon from "../assets/likeIcon.png";
import calendarIcon from "../assets/calendar.png";

// Componente para mostrar tarjetas de contenido multimedia
// Permite navegar a la página de detalle del medio y manejar likes
const MediaContentCards = ({ item }) => {
    const navigate = useNavigate();
    const [imageError, setImageError] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    // Función mejorada para manejar el clic en la tarjeta y navegar a la página de detalle
    const handleCardClick = () => {
        try {
            // Usar replace: false para permitir navegación hacia atrás
            navigate(`/MediaDetailPage/${item.id}`, { 
                replace: false,
                state: { fromMediaPage: true } 
            });
        } catch (error) {
            console.error("Error en navegación:", error);
        }
    };

    // Función para manejar el clic en el botón de like
    const handleLikeClick = (e) => {
        e.stopPropagation();
        setIsLiked(!isLiked);
        console.log("Like clicked for item:", item.id);
    };

    // Función para manejar errores de imagen
    const handleImageError = () => {
        setImageError(true);
        setImageLoading(false);
    };

    // Función para manejar la carga exitosa de imagen
    const handleImageLoad = () => {
        setImageLoading(false);
    };

    // Función mejorada para manejar el botón de acción principal
    const handleActionClick = (e) => {
        e.stopPropagation();
        handleCardClick();
    };

    return (
        <article 
            className="bg-white rounded-lg sm:rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:-translate-y-1 border border-gray-100"
            onClick={handleCardClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCardClick();
                }
            }}
        >
            {/* Image Container */}
            <div className="relative overflow-hidden">
                <div className="relative aspect-video bg-gray-100">
                    {/* Loading skeleton */}
                    {imageLoading && !imageError && (
                        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-300 rounded-full animate-pulse"></div>
                        </div>
                    )}

                    {/* Image or error state */}
                    {!imageError ? (
                        <img
                            src={item.image}
                            alt={item.title}
                            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                            onError={handleImageError}
                            onLoad={handleImageLoad}
                            loading="lazy"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <div className="text-center p-4">
                                <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p className="text-gray-500 text-xs sm:text-sm">Imagen no disponible</p>
                            </div>
                        </div>
                    )}

                    {/* Play/Action Icon Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-white bg-opacity-95 rounded-full p-3 sm:p-4 lg:p-5 shadow-xl transform scale-90 group-hover:scale-100 transition-transform duration-300">
                            <img
                                src={playIcon}
                                alt={item.isVideo ? 'Reproducir video' : 'Leer artículo'}
                                className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8"
                            />
                        </div>
                    </div>

                    {/* Category Badge */}
                    <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                        <span className="inline-block px-2 py-1 sm:px-3 sm:py-1 bg-white bg-opacity-90 backdrop-blur-sm text-gray-800 text-xs sm:text-sm font-medium rounded-full shadow-lg border border-gray-200">
                            {item.category}
                        </span>
                    </div>

                    {/* Video indicator */}
                    {item.isVideo && (
                        <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                            <div className="bg-red-500 bg-opacity-90 backdrop-blur-sm text-white px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                </svg>
                                <span className="text-xs font-medium hidden sm:inline">Video</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-5 lg:p-6">
                {/* Date */}
                <div className="flex items-center text-gray-500 text-xs sm:text-sm mb-3 sm:mb-4">
                    <img src={calendarIcon} alt="Calendar" className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                    <span className="truncate">Fecha de publicación: {item.date}</span>
                </div>

                {/* Title */}
                <h3 className="text-gray-800 font-semibold text-sm sm:text-base lg:text-lg mb-4 sm:mb-5 line-clamp-2 leading-snug group-hover:text-gray-900 transition-colors min-h-[2.5rem] sm:min-h-[3rem]"
                    style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {item.title}
                </h3>

                {/* Description preview (if available) */}
                {item.content && (
                    <p className="text-gray-600 text-xs sm:text-sm mb-4 line-clamp-2 leading-relaxed"
                       style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {item.content.substring(0, 100)}...
                    </p>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                    <button 
                        className="bg-pink-200 hover:bg-pink-300 text-pink-800 px-3 py-2 sm:px-4 sm:py-2 lg:px-5 lg:py-3 rounded-full text-xs sm:text-sm font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                        onClick={handleActionClick}
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                        type="button"
                    >
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span className="hidden sm:inline">
                            {item.isVideo ? 'Ver Video' : 'Leer Artículo'}
                        </span>
                        <span className="sm:hidden">Ver</span>
                    </button>

                    <button 
                        className={`p-2 sm:p-3 hover:bg-gray-100 rounded-full transition-all duration-300 transform hover:scale-110 ${isLiked ? 'bg-red-50 text-red-500' : 'text-gray-400'}`}
                        onClick={handleLikeClick}
                        title={isLiked ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                        type="button"
                    >
                        <svg className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${isLiked ? 'fill-current' : ''}`} fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </button>
                </div>

                {/* Reading time estimate */}
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {item.isVideo ? '5 min' : '3 min lectura'}
                        </span>
                        <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            {Math.floor(Math.random() * 100) + 50} vistas
                        </span>
                    </div>
                </div>
            </div>
        </article>
    );
};

export default MediaContentCards;