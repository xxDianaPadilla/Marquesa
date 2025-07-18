/**
 * Página de detalle de un artículo del blog/media
 * Muestra el contenido completo de un artículo con imagen/video,
 * información detallada y artículos relacionados
 */
import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header/Header";
import Footer from "../components/Footer";
import MediaContentCards from "../components/MediaContentCards";
import useMedia from "../components/Media/Hooks/useMedia";
import calendarIcon from "../assets/calendar.png";
import playIcon from "../assets/playIcon.png";

const MediaDetailPage = () => {
    const { id } = useParams(); // Obtener ID del artículo desde la URL
    const navigate = useNavigate();
    const { allMediaItems } = useMedia(); // Hook para obtener todos los artículos
    const [isPlaying, setIsPlaying] = useState(false); // Estado para controlar reproducción de video

    /**
     * Función directa para obtener elemento por ID - SIN HOOKS
     * @param {string} itemId - ID del artículo a buscar
     * @returns {Object|null} Artículo encontrado o null
     */
    const getCurrentItem = (itemId) => {
        const numericId = parseInt(itemId, 10);
        return allMediaItems.find((item) => item.id === numericId) || null;
    };

    /**
     * Función directa para obtener elementos relacionados - SIN HOOKS
     * @param {string} currentId - ID del artículo actual
     * @param {string} currentType - Tipo del artículo actual
     * @returns {Array} Array de artículos relacionados (máximo 2)
     */
    const getRelated = (currentId, currentType) => {
        const numericId = parseInt(currentId, 10);
        return allMediaItems
            .filter((item) => item.id !== numericId && item.type === currentType)
            .slice(0, 2);
    };

    // Usar useMemo para obtener el elemento actual basado en el ID de la URL
    const currentItem = useMemo(() => {
        return getCurrentItem(id);
    }, [id, allMediaItems]);

    // Usar useMemo para obtener elementos relacionados
    const relatedItems = useMemo(() => {
        if (!currentItem) return [];
        return getRelated(id, currentItem.type);
    }, [id, currentItem, allMediaItems]);

    // Efecto para manejar elementos no encontrados
    useEffect(() => {
        if (!currentItem && id) {
            console.warn(`No se encontró el artículo con ID: ${id}`);
            setTimeout(() => {
                navigate('/mediaPage', { replace: true });
            }, 2000);
        }
    }, [currentItem, id, navigate]);

    /**
     * Función para manejar la reproducción y pausa del video
     */
    const handlePlayPause = () => {
        setIsPlaying(!isPlaying);
    };

    /**
     * Función para navegar de vuelta al blog
     */
    const handleBackToBlog = () => {
        navigate('/mediaPage');
    };

    // Si no hay elemento actual, mostrar página de error
    if (!currentItem) {
        return (
            <>
                <Header />
                <main className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center p-8">
                        <div className="text-red-500 mb-4">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Artículo no encontrado
                        </h1>
                        <p className="text-gray-600 mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            El artículo que buscas no existe o ha sido movido.
                        </p>
                        <button
                            onClick={handleBackToBlog}
                            className="bg-pink-200 hover:bg-pink-300 text-pink-800 px-6 py-3 rounded-full font-medium transition-all duration-300"
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                            Volver al Blog
                        </button>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />

            <main>
                {/* Hero Section with Media */}
                <section className="relative pt-8 sm:pt-12 pb-8 sm:pb-12">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Contenedor de media */}
                        <div className="relative rounded-lg overflow-hidden shadow-xl bg-white mb-8">
                            <div className="relative aspect-video bg-gray-100">
                                <img
                                    src={currentItem.image}
                                    alt={currentItem.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTAwVjIwME0xNTAgMTUwSDI1MCIgc3Ryb2tlPSIjOUNBM0FGIiBzdHJva2Utd2lkdGg9IjIiLz4KPC9zdmc+';
                                    }}
                                />
                                
                                {/* Controles de video overlay (si es un video) */}
                                {currentItem.isVideo && (
                                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                                        <button
                                            onClick={handlePlayPause}
                                            className="bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-4 sm:p-6 shadow-lg transition-all duration-300 transform hover:scale-110"
                                        >
                                            <img
                                                src={playIcon}
                                                alt={isPlaying ? "Pausar" : "Reproducir"}
                                                className="w-8 h-8 sm:w-12 sm:h-12"
                                            />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Contenido del artículo */}
                        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 lg:p-10">
                            {/* Fecha de publicación */}
                            <div className="flex items-center text-gray-500 text-sm mb-6">
                                <img src={calendarIcon} alt="Calendar" className="w-4 h-4 mr-2" />
                                <span>Fecha de publicación: {currentItem.date}</span>
                            </div>

                            {/* Badge de categoría */}
                            <div className="mb-6">
                                <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-pink-100 text-pink-800 border border-pink-200">
                                    {currentItem.category}
                                </span>
                            </div>

                            {/* Título del artículo */}
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-8 leading-tight"
                                style={{ fontFamily: 'Poppins, sans-serif' }}>
                                {currentItem.title}
                            </h1>

                            {/* Contenido principal */}
                            <div className="prose prose-gray max-w-none">
                                <div className="text-gray-700 leading-relaxed text-base sm:text-lg mb-8"
                                     style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    {currentItem.content}
                                </div>

                                {/* Párrafos de contenido de ejemplo */}
                                <div className="space-y-6 text-gray-700 leading-relaxed"
                                     style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    <p>
                                        En este artículo exploraremos en profundidad los conceptos y técnicas más importantes para aprovechar al máximo los beneficios que nos ofrecen las flores. Desde técnicas ancestrales hasta métodos modernos, descubrirás cómo integrar la belleza natural en tu vida diaria.
                                    </p>
                                    <p>
                                        Las flores no solo embellecen nuestros espacios, sino que también tienen propiedades terapéuticas que pueden mejorar significativamente nuestro bienestar físico y emocional. Aprenderás a seleccionar las especies adecuadas según tus necesidades específicas.
                                    </p>
                                    <p>
                                        Además, te proporcionaremos consejos prácticos y fáciles de implementar que te permitirán mantener tus flores en perfectas condiciones durante períodos prolongados, maximizando así su impacto positivo en tu entorno.
                                    </p>
                                    <p>
                                        La conexión entre el ser humano y las flores trasciende lo meramente estético. A lo largo de la historia, diferentes culturas han reconocido el poder transformador de estos elementos naturales, utilizándolos no solo como decoración, sino como herramientas de sanación y crecimiento personal.
                                    </p>
                                </div>
                            </div>

                            {/* Información adicional del artículo */}
                            <div className="mt-12 pt-8 border-t border-gray-200">
                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                    <span className="flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {currentItem.isVideo ? '5 min de video' : '3 min de lectura'}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        {Math.floor(Math.random() * 500) + 100} vistas
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a1.994 1.994 0 01-1.414.586H7a4 4 0 01-4-4V7a4 4 0 014-4z" />
                                        </svg>
                                        ID: {currentItem.id}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Sección de contenido relacionado */}
                {relatedItems.length > 0 && (
                    <section className="py-12 sm:py-16 bg-white">
                        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-8 text-center"
                                style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Contenido relacionado
                            </h2>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                                {relatedItems.map((item) => (
                                    <MediaContentCards key={item.id} item={item} />
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Footer de navegación */}
                <section className="py-8 bg-gray-50">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button
                                onClick={handleBackToBlog}
                                className="bg-pink-200 hover:bg-pink-300 text-pink-800 px-6 sm:px-8 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                                style={{ fontFamily: 'Poppins, sans-serif' }}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Volver al Blog
                            </button>
                            
                            <button
                                onClick={() => navigate('/')}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 sm:px-8 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                                style={{ fontFamily: 'Poppins, sans-serif' }}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                Ir a la Tienda
                            </button>
                        </div>

                        {/* Información de debug - remover en producción */}
                        <div className="mt-4 text-xs text-gray-400">
                            Artículo ID: {id} | Total artículos: {allMediaItems.length}
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
};

export default MediaDetailPage;