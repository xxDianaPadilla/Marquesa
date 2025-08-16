import React, { useState, useEffect, useCallback } from "react";
import TestimonialCard from './TestimonialCard';
import useAllReviews from "./Reviews/Hooks/useAllReviews";

const TestimonialCarousel = ({ maxReviews = 6, autoSlideInterval = 4000 }) => {
    const { reviews, loading, error } = useAllReviews();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [displayReviews, setDisplayReviews] = useState([]);
    const [itemsPerView, setItemsPerView] = useState(3);

    // Función para calcular elementos por vista según el tamaño de pantalla
    const getItemsPerView = useCallback(() => {
        if (typeof window === 'undefined') return 3;
        const width = window.innerWidth;
        if (width >= 1024) return 3; // lg: 3 cards
        if (width >= 768) return 2;  // md: 2 cards  
        return 1; // sm: 1 card
    }, []);

    // Actualizar itemsPerView en resize
    useEffect(() => {
        const handleResize = () => {
            setItemsPerView(getItemsPerView());
        };

        setItemsPerView(getItemsPerView());
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [getItemsPerView]);

    useEffect(() => {
        if (reviews.length > 0) {
            const bestReviews = reviews
                .filter(review => review.rating === 5)
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, maxReviews);

            if (bestReviews.length < maxReviews) {
                const fourStarReviews = reviews
                    .filter(review => review.rating === 4)
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .slice(0, maxReviews - bestReviews.length);

                bestReviews.push(...fourStarReviews);
            }
            setDisplayReviews(bestReviews);
        }
    }, [reviews, maxReviews]);

    // Calcular el número máximo de slides
    const maxSlides = Math.max(0, displayReviews.length - itemsPerView + 1);

    // Auto-slide mejorado
    useEffect(() => {
        if (displayReviews.length > itemsPerView) {
            const interval = setInterval(() => {
                setCurrentIndex((prevIndex) => {
                    const nextIndex = prevIndex + 1;
                    return nextIndex >= maxSlides ? 0 : nextIndex;
                });
            }, autoSlideInterval);

            return () => clearInterval(interval);
        }
    }, [displayReviews.length, itemsPerView, maxSlides, autoSlideInterval]);

    const goToNext = () => {
        setCurrentIndex(prev => {
            const nextIndex = prev + 1;
            return nextIndex >= maxSlides ? 0 : nextIndex;
        });
    };

    const goToPrevious = () => {
        setCurrentIndex(prev => {
            return prev <= 0 ? maxSlides - 1 : prev - 1;
        });
    };

    const goToSlide = (index) => {
        setCurrentIndex(index);
    };

    if (loading) {
        return (
            <section className="bg-pink-50 py-8 sm:py-14">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8 sm:mb-12">
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-gray-900 mb-4" style={{ fontFamily: "Poppins" }}>
                            Lo que dicen nuestros clientes
                        </h2>
                    </div>
                    <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
                    </div>
                </div>
            </section>
        );
    }

    if (error || displayReviews.length === 0) {
        return (
            <section className="bg-pink-50 py-8 sm:py-14">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8 sm:mb-12">
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-gray-900 mb-4" style={{ fontFamily: "Poppins" }}>
                            Lo que dicen nuestros clientes
                        </h2>
                        <p className="text-gray-600 mx-auto text-sm sm:text-base lg:text-lg max-w-xs sm:max-w-2xl lg:max-w-4xl" style={{ fontFamily: "Poppins" }}>
                            {error ? 'Error al cargar reseñas' : 'Pronto tendremos reseñas de nuestros clientes'}
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    // Si hay pocas reseñas, mostrar grid estático
    if (displayReviews.length <= itemsPerView) {
        return (
            <section className="bg-pink-50 py-8 sm:py-14">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8 sm:mb-12">
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-gray-900 mb-4" style={{ fontFamily: "Poppins" }}>
                            Lo que dicen nuestros clientes
                        </h2>
                        <p className="text-gray-600 mx-auto text-sm sm:text-base lg:text-lg max-w-xs sm:max-w-2xl lg:max-w-4xl" style={{ fontFamily: "Poppins" }}>
                            Descubre por qué nuestros clientes confían en nosotros para sus momentos especiales.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
                        {displayReviews.map((review) => (
                            <TestimonialCard
                                key={review.id}
                                name={review.name}
                                year={review.year}
                                comment={review.comment}
                                rating={review.rating}
                                avatar={review.profilePicture}
                            />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="bg-pink-50 py-8 sm:py-14">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8 sm:mb-12">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-gray-900 mb-4" style={{ fontFamily: "Poppins" }}>
                        Lo que dicen nuestros clientes
                    </h2>
                    <p className="text-gray-600 mx-auto text-sm sm:text-base lg:text-lg max-w-xs sm:max-w-2xl lg:max-w-4xl" style={{ fontFamily: "Poppins" }}>
                        Descubre por qué nuestros clientes confían en nosotros para sus momentos especiales.
                    </p>
                </div>

                {/* Carrusel Container */}
                <div className="relative max-w-6xl mx-auto">
                    {/* Botones de navegación */}
                    {maxSlides > 1 && (
                        <>
                            <button
                                onClick={goToPrevious}
                                className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-2 sm:p-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 border border-gray-200"
                                aria-label="Reseña anterior"
                            >
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>

                            <button
                                onClick={goToNext}
                                className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-2 sm:p-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 border border-gray-200"
                                aria-label="Siguiente reseña"
                            >
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </>
                    )}

                    {/* Container del carrusel con overflow hidden */}
                    <div className="overflow-hidden">
                        <div 
                            className="flex transition-transform duration-500 ease-in-out"
                            style={{
                                transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
                                width: `${(displayReviews.length / itemsPerView) * 100}%`
                            }}
                        >
                            {displayReviews.map((review) => (
                                <div
                                    key={review.id}
                                    className="flex-shrink-0 px-3 sm:px-4"
                                    style={{ 
                                        width: `${100 / displayReviews.length}%`,
                                        minWidth: `${100 / itemsPerView}%`
                                    }}
                                >
                                    <TestimonialCard
                                        name={review.name}
                                        year={review.year}
                                        comment={review.comment}
                                        rating={review.rating}
                                        avatar={review.profilePicture}
                                        className="h-full"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Indicadores de posición */}
                    {maxSlides > 1 && (
                        <div className="flex justify-center mt-6 sm:mt-8 space-x-2">
                            {Array.from({ length: maxSlides }, (_, index) => (
                                <button
                                    key={index}
                                    onClick={() => goToSlide(index)}
                                    className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                                        currentIndex === index
                                            ? 'bg-pink-500 scale-125'
                                            : 'bg-pink-200 hover:bg-pink-300 hover:scale-110'
                                    }`}
                                    aria-label={`Ir al slide ${index + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Estadística de reseñas */}
                <div className="text-center mt-6 sm:mt-8">
                    <p className="text-sm text-gray-500" style={{ fontFamily: "Poppins" }}>
                        Mostrando {Math.min(itemsPerView, displayReviews.length)} de {displayReviews.length} reseñas destacadas
                    </p>
                </div>
            </div>
        </section>
    );
};

export default TestimonialCarousel;