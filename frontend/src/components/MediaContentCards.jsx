// frontend/src/components/MediaContentCards.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import playIcon from "../assets/playIcon.png";
import calendarIcon from "../assets/calendar.png";

// Componente para mostrar tarjetas de contenido multimedia
// Permite navegar a la página de detalle del medio y manejar likes
const MediaContentCards = ({ item }) => {
    const navigate = useNavigate();
    const [imageError, setImageError] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    // SOLUCIÓN: Función mejorada para manejar el clic en la tarjeta y navegar a la página de detalle
    const handleCardClick = () => {
        try {
            // Asegurar que el ID esté disponible
            if (!item.id) {
                console.error("Item ID no disponible:", item);
                return;
            }

            // SOLUCIÓN: Normalizar el ID como string
            const itemId = String(item.id).trim();
            console.log("Navegando a MediaDetailPage con ID:", itemId);
            console.log("Item completo:", item);

            // Usar replace: false para permitir navegación hacia atrás
            navigate(`/MediaDetailPage/${itemId}`, {
                replace: false,
                state: {
                    fromMediaPage: true,
                    item: item // Pasar el item completo por si se necesita
                }
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
        console.warn("Error loading image for item:", item.id, "URL:", item.image);
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

    // Función para obtener la imagen a mostrar
    const getDisplayImage = () => {
        // Si es un video y tiene thumbnail, usar thumbnail
        if (item.isVideo && item.thumbnail) {
            return item.thumbnail;
        }
        // Si no, usar la imagen regular
        return item.image;
    };

    // Función para determinar el tipo de contenido para el botón
    const getContentType = () => {
        if (item.isVideo) {
            return {
                action: 'Ver Video',
                actionShort: 'Ver',
                icon: 'play'
            };
        }
        return {
            action: 'Leer Artículo',
            actionShort: 'Leer',
            icon: 'read'
        };
    };

    const contentType = getContentType();

    return (
        <article
            className="bg-white rounded-lg sm:rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:-translate-y-1 border border-gray-100 h-full flex flex-col"
            onClick={handleCardClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCardClick();
                }
            }}
            aria-label={`${item.isVideo ? 'Ver video' : 'Leer artículo'}: ${item.title}`}
        >
            {/* Image Container - Altura fija */}
            <div className="relative overflow-hidden flex-shrink-0">
                <div className="relative aspect-video bg-gray-100 h-48 sm:h-52 lg:h-56">
                    {/* Loading skeleton */}
                    {imageLoading && !imageError && (
                        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-300 rounded-full animate-pulse"></div>
                        </div>
                    )}

                    {/* Image or error state */}
                    {!imageError ? (
                        <img
                            src={getDisplayImage()}
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
                            {item.isVideo ? (
                                <img
                                    src={playIcon}
                                    alt="Reproducir video"
                                    className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8"
                                />
                            ) : (
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
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
                        <div className="absolute top-3 right-4 sm:top-4 sm:right-6">
                            <div className="bg-red-500 bg-opacity-90 backdrop-blur-sm text-white px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                </svg>
                                <span className="text-xs font-medium hidden sm:inline">Video</span>
                            </div>
                        </div>
                    )}

                    {/* Duration indicator for videos */}
                    {item.isVideo && item.duration && (
                        <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4">
                            <div className="bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs font-medium">
                                {item.duration}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Content - Altura flexible que se expande */}
            <div className="p-4 sm:p-5 lg:p-6 flex-1 flex flex-col">
                {/* Date */}
                <div className="flex items-center text-gray-500 text-xs sm:text-sm mb-2 sm:mb-3 flex-shrink-0">
                    <img src={calendarIcon} alt="Calendar" className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                    <span className="truncate">Fecha de publicación: {item.date}</span>
                </div>

                {/* Title - Altura fija con clamp */}
                <h3 className="text-gray-800 font-semibold text-sm sm:text-base lg:text-lg mb-2 sm:mb-3 line-clamp-2 leading-tight group-hover:text-gray-900 transition-colors flex-shrink-0"
                    style={{
                        fontFamily: 'Poppins, sans-serif',
                        minHeight: '2.5rem',
                        maxHeight: '3rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    }}>
                    {item.title}
                </h3>

                {/* Description preview - Altura fija con clamp */}
                <div className="flex-1 mb-4 sm:mb-5">
                    {item.content && (
                        <p className="text-gray-600 text-xs sm:text-sm line-clamp-3 leading-relaxed"
                            style={{
                                fontFamily: 'Poppins, sans-serif',
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                minHeight: '3.6rem',
                                maxHeight: '3.6rem'
                            }}>
                            {item.content.length > 120 ? `${item.content.substring(0, 120)}...` : item.content}
                        </p>
                    )}
                </div>

                {/* Action Buttons - Siempre al final */}
                <div className="flex items-center justify-between mt-auto flex-shrink-0">
                    <button
                        className="bg-pink-200 hover:bg-pink-300 text-pink-800 px-3 py-2 sm:px-4 sm:py-2 lg:px-5 lg:py-3 rounded-full text-xs sm:text-sm font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                        onClick={handleActionClick}
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                        type="button"
                        aria-label={`${contentType.action}: ${item.title}`}
                    >
                        {contentType.icon === 'play' ? (
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        )}
                        <span className="hidden sm:inline">
                            {contentType.action}
                        </span>
                        <span className="sm:hidden">{contentType.actionShort}</span>
                    </button>
                </div>
            </div>
        </article>
    );
};

export default MediaContentCards;