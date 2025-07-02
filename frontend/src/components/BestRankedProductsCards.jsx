import React from "react";
import Star from "../assets/star.png";
import { useBestRankedProducts } from "./Products/Hooks/useBestRankedProducts";

const BestRankedProductsCards = () => {
    const { bestProducts, loading, error } = useBestRankedProducts();

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    ¡Tus mejores productos!
                </h3>
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                                <div className="flex-1">
                                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                                </div>
                                <div className="flex space-x-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <div key={star} className="w-4 h-4 bg-gray-200 rounded"></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    ¡Tus mejores productos!
                </h3>
                <div className="text-center py-8">
                    <p className="text-gray-500 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Error al cargar los productos mejor calificados
                    </p>
                </div>
            </div>
        );
    }

    if (bestProducts.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    ¡Tus mejores productos!
                </h3>
                <div className="text-center py-8">
                    <p className="text-gray-500 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        No hay productos calificados aún
                    </p>
                </div>
            </div>
        );
    }

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < fullStars; i++) {
            stars.push(
                <img
                    key={`full-${i}`}
                    src={Star}
                    alt="star"
                    className="w-4 h-4"
                />
            );
        }

        if (hasHalfStar && fullStars < 5) {
            stars.push(
                <div key="half" className="relative w-4 h-4">
                    <img src={Star} alt="star" className="w-4 h-4 opacity-30" />
                    <div className="absolute inset-0 w-1/2 overflow-hidden">
                        <img src={Star} alt="star" className="w-4 h-4" />
                    </div>
                </div>
            );
        }

        const remainingStars = 5 - Math.ceil(rating);
        for (let i = 0; i < remainingStars; i++) {
            stars.push(
                <img
                    key={`empty-${i}`}
                    src={Star}
                    alt="star"
                    className="w-4 h-4 opacity-30"
                />
            );
        }

        return stars;
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                ¡Tus mejores productos!
            </h3>
            <div className="space-y-4">
                {bestProducts.map((product, index) => (
                    <div key={product._id || index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                            {/* Imagen del producto */}
                            {product.image && product.image.includes('http') ? (
                                <img
                                    style={{ borderRadius: '5px' }}
                                    src={product.image}
                                    alt={product.name}
                                    className="w-10 h-10 object-cover"
                                />
                            ) : (
                                <span className={`${product.image === '🎨' ? 'text-2xl' : 'text-gray-400 text-xs font-medium'}`}>
                                    {product.image || (product.itemType === 'custom' ? '🎨' : product.name.charAt(0).toUpperCase())}
                                </span>
                            )}

                            {/* Información del producto */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2">
                                    <h4 className="text-sm font-medium text-gray-900 truncate"
                                        style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        {product.name}
                                    </h4>
                                </div>
                                <p className="text-xs text-gray-500 truncate"
                                    style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    {product.category}
                                </p>
                                {product.type === 'custom' && product.selectedItemsCount > 0 && (
                                    <p className="text-xs text-gray-400"
                                        style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        {product.selectedItemsCount} productos incluidos
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Rating y reseñas */}
                        <div className="flex flex-col items-end space-y-1">
                            <div className="flex items-center space-x-1">
                                {renderStars(product.averageRating)}
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm font-semibold text-gray-900"
                                    style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    {product.averageRating.toFixed(1)}
                                </span>
                                <span className="text-xs text-gray-500"
                                    style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    ({product.reviewCount})
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BestRankedProductsCards;