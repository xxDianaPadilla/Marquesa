import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header/Header";
import Footer from "../components/Footer";
import MediaContentCards from "../components/MediaContentCards";
import useMedia from "../components/Media/Hooks/useMedia";
import calendarIcon from "../assets/calendar.png";
import playIcon from "../assets/playIcon.png";
// import pauseIcon from "../assets/pauseIcon.png";

// Página de detalle de un artículo del blog
const MediaDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getItemById, getRelatedItems } = useMedia();
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [relatedItems, setRelatedItems] = useState([]);

    // Cargar datos del elemento actual y relacionados
    useEffect(() => {
        const item = getItemById(id);
        if (!item) {
            navigate('/mediaPage');
            return;
        }
        setCurrentItem(item);
        const related = getRelatedItems(id, item.type);
        setRelatedItems(related);
    }, [id, getItemById, getRelatedItems, navigate]);

    // Función para manejar la reproducción y pausa del video
    const handlePlayPause = () => {
        setIsPlaying(!isPlaying);
    };

    if (!currentItem) {
        return (
            <>
                <Header />
                <main className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-lg text-gray-600">Cargando...</p>
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
                        {/* Media Container */}
                        <div className="relative rounded-lg overflow-hidden shadow-xl bg-white mb-8">
                            <div className="relative aspect-video bg-gray-100">
                                <img
                                    src={currentItem.image}
                                    alt={currentItem.title}
                                    className="w-full h-full object-cover"
                                />
                                
                                {/* Video Controls Overlay (if it's a video) */}
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

                        {/* Article Content */}
                        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 lg:p-10">
                            {/* Date */}
                            <div className="flex items-center text-gray-500 text-sm mb-6">
                                <img src={calendarIcon} alt="Calendar" className="w-4 h-4 mr-2" />
                                <span>Fecha de publicación: {currentItem.date}</span>
                            </div>

                            {/* Title */}
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-8 leading-tight"
                                style={{ fontFamily: 'Poppins, sans-serif' }}>
                                {currentItem.title}
                            </h1>

                            {/* Content */}
                            <div className="prose prose-gray max-w-none">
                                <div className="text-gray-700 leading-relaxed text-base sm:text-lg mb-8">
                                    {currentItem.content}
                                </div>

                                {/* Sample content paragraphs */}
                                <div className="space-y-6 text-gray-700 leading-relaxed">
                                    <p>
                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                                    </p>
                                    <p>
                                        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                                    </p>
                                    <p>
                                        Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Related Content Section */}
                {relatedItems.length > 0 && (
                    <section className="py-12 sm:py-16 bg-white">
                        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-8 text-center"
                                style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Videos relacionados
                            </h2>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                                {relatedItems.map((item) => (
                                    <MediaContentCards key={item.id} item={item} />
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Navigation Footer */}
                <section className="py-8 bg-gray-50">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <button
                            onClick={() => navigate('/mediaPage')}
                            className="bg-pink-200 hover:bg-pink-300 text-pink-800 px-6 sm:px-8 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105"
                        >
                            ← Volver al Blog
                        </button>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
};

export default MediaDetailPage;