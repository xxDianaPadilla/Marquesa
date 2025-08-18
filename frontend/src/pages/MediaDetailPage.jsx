import React, { useState, useEffect, useMemo } from "react"; // Importamos React
import { useParams, useNavigate } from "react-router-dom"; // Importamos librería para navegación
import Header from "../components/Header/Header"; // Importamos componente de Header
import Footer from "../components/Footer"; // Importamos componente de Footer
import MediaContentCards from "../components/MediaContentCards"; // Importamos cards para media
import useMedia from "../components/Media/Hooks/useMedia"; // Importamos hook para acciones
import calendarIcon from "../assets/calendar.png"; // Importamos icono de calendario

// Importamos página de detalles de multimedia
const MediaDetailPage = () => {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const { allMediaItems, getItemById, getRelatedItems, loading } = useMedia(); 

    // Obtemos en item actual
    const currentItem = useMemo(() => {
        console.log('=== MediaDetailPage useMemo ===');
        console.log('ID from URL:', id);
        console.log('allMediaItems length:', allMediaItems.length);

        if (!id || allMediaItems.length === 0) {
            console.log('No ID or no media items yet');
            return null;
        }

        const item = getItemById(id);
        console.log('Current item found:', item ? item.title : null);
        return item;
    }, [id, allMediaItems, getItemById]);

    // Importamos items similares
    const relatedItems = useMemo(() => {
        if (!currentItem || allMediaItems.length === 0) return [];

        console.log('Getting related items for:', currentItem.title, 'type:', currentItem.type);
        const related = getRelatedItems(currentItem.id, currentItem.type, 2);
        console.log('Related items found:', related.length);
        return related;
    }, [currentItem, getRelatedItems, allMediaItems]);

    // useEffect para carga constante de items de media
    useEffect(() => {
        if (!loading && !currentItem && id && allMediaItems.length > 0) {
            console.warn(`No se encontró el artículo con ID: ${id}`);
            console.log('Available IDs:', allMediaItems.map(item => item.id));
            setTimeout(() => {
                navigate('/mediaPage', { replace: true });
            }, 2000);
        }
    }, [currentItem, id, navigate, loading, allMediaItems]);

    // Manejamos regreso a la página de media
    const handleBackToBlog = () => {
        navigate('/mediaPage');
    };

    // Diseño en el caso de que la página se quede cargando
    if (loading) {
        return (
            <>
                <Header />
                <main className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center p-8">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500 mx-auto mb-4"></div>
                        <h1 className="text-xl font-semibold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Cargando artículo...
                        </h1>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    // Diseño en el caso que no se encuentre ningún item
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
                        <p className="text-sm text-gray-500 mb-6">
                            ID buscado: {id}
                        </p>
                        <button
                            onClick={handleBackToBlog}
                            className="bg-pink-200 hover:bg-pink-300 text-pink-800 px-6 py-3 rounded-full font-medium transition-all duration-300"
                            style={{ fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }}
                        >
                            Volver al Blog
                        </button>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    // Diseño de la página de detalles de multimedia
    return (
        <>
            <Header />

            <main>
                <section className="relative pt-8 sm:pt-12 pb-8 sm:pb-12">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="relative rounded-lg overflow-hidden shadow-xl bg-white mb-8">
                            <div className="relative aspect-video bg-gray-100">
                                {currentItem.isVideo && currentItem.videoUrl ? (
                                    // OPCIÓN 1: Video HTML5 con controles nativos (más simple)
                                    <video
                                        className="w-full h-full object-cover"
                                        src={currentItem.videoUrl}
                                        controls
                                        preload="metadata"
                                        style={{ outline: 'none' }}
                                    >
                                        Tu navegador no soporta la reproducción de video.
                                        <a href={currentItem.videoUrl} target="_blank" rel="noopener noreferrer">
                                            Ver video en nueva ventana
                                        </a>
                                    </video>
                                    
                                    // OPCIÓN 2: iframe para Cloudinary (descomenta si prefieres esta opción)
                                    /*
                                    <iframe
                                        src={currentItem.videoUrl}
                                        className="w-full h-full"
                                        frameBorder="0"
                                        allowFullScreen
                                        title={currentItem.title}
                                    />
                                    */
                                ) : (
                                    <img
                                        src={currentItem.image}
                                        alt={currentItem.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmllboxwQ-Box1PSIwIDAgNDAwIDMwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNGM0Y0RjYiLz4KPHBhdGggZD0iTTIwMCAxMDBWMjAwTTE1MCAxNTBIMjUwIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4=';
                                        }}
                                    />
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 lg:p-10">
                            <div className="flex items-center text-gray-500 text-sm mb-6">
                                <img src={calendarIcon} alt="Calendar" className="w-4 h-4 mr-2" />
                                <span>Fecha de publicación: {currentItem.date}</span>
                            </div>

                            <div className="mb-6">
                                <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-pink-100 text-pink-800 border border-pink-200">
                                    {currentItem.category}
                                </span>
                            </div>

                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-8 leading-tight"
                                style={{ fontFamily: 'Poppins, sans-serif' }}>
                                {currentItem.title}
                            </h1>

                            <div className="prose prose-gray max-w-none">
                                <div className="text-gray-700 leading-relaxed text-base sm:text-lg mb-8"
                                    style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    {currentItem.content}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

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

                <section className="py-8 bg-white-50">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button
                                onClick={handleBackToBlog}
                                className="bg-pink-200 hover:bg-pink-300 text-pink-800 px-6 sm:px-8 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                                style={{ fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Volver al Blog
                            </button>

                            <button
                                onClick={() => navigate('/')}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 sm:px-8 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                                style={{ fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                Ir a la Tienda
                            </button>
                        </div>

                        <div className="mt-4 text-xs text-gray-400">
                            Total artículos: {allMediaItems.length}
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
};

export default MediaDetailPage;