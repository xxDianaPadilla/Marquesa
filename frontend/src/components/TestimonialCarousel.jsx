import React, { useState, useEffect } from "react";
import TestimonialCard from './TestimonialCard';
import useAllReviews from "./Reviews/Hooks/useAllReviews";

const TestimonialCarousel = ({ maxReviews = 6, autoSlideInterval = 4000 }) => {
    const { reviews, loading, error } = useAllReviews();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [displayReviews, setDisplayReviews] = useState([]);

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

    useEffect(() => {
        if (displayReviews.length > 3) {
            const interval = setInterval(() => {
                setCurrentIndex((prevIndex) =>
                    prevIndex >= displayReviews.length - 3 ? 0 : prevIndex + 1
                );
            }, autoSlideInterval);

            return () => clearInterval(interval);
        }
    }, [displayReviews.length, autoSlideInterval]);

    const goToNext = () => {
        setCurrentIndex(prev =>
            prev >= displayReviews.length - 3 ? 0 : prev + 1
        );
    };

    const goToPrevious = () => {
        setCurrentIndex(prev =>
            prev <= 0 ? displayReviews.length - 3 : prev - 1
        );
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

    if (displayReviews.length <= 3) {
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

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
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
                <div className="relative">
                    {/* Botones de navegación */}
                    <button
                        onClick={goToPrevious}
                        className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                        style={{ marginLeft: '-2rem' }}
                    >
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <button
                        onClick={goToNext}
                        className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                        style={{ marginRight: '-2rem' }}
                    >
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    {/* Grid de reseñas con transición */}
                    <div className="overflow-hidden">
                        <div
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 transition-transform duration-500 ease-in-out"
                            style={{
                                transform: `translateX(-${currentIndex * (100 / Math.min(3, displayReviews.length))}%)`,
                                width: `${Math.ceil(displayReviews.length / 3) * 100}%`
                            }}
                        >
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

                    {/* Indicadores de posición */}
                    <div className="flex justify-center mt-8 space-x-2">
                        {Array.from({ length: Math.max(0, displayReviews.length - 2) }, (_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`w-3 h-3 rounded-full transition-all duration-200 ${currentIndex === index
                                        ? 'bg-pink-500 scale-110'
                                        : 'bg-pink-200 hover:bg-pink-300'
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Estadística de reseñas */}
                <div className="text-center mt-8">
                    <p className="text-sm text-gray-500" style={{ fontFamily: "Poppins" }}>
                        Mostrando {Math.min(3, displayReviews.length)} de {displayReviews.length} reseñas destacadas
                    </p>
                </div>
            </div>
        </section>
    );
};

export default TestimonialCarousel;