import React from "react";
import { Star, StarHalf } from "lucide-react";
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
                                        <Star key={star} className="w-4 h-4 text-gray-300 animate-pulse" />
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
        const roundedRating = Math.round(rating * 2) / 2; // Redondear a 0.5 más cercano
        const fullStars = Math.floor(roundedRating);
        const hasHalfStar = roundedRating % 1 !== 0;

        // Estrellas llenas
        for (let i = 0; i < fullStars; i++) {
            stars.push(
                <Star
                    key={`full-${i}`}
                    className="w-4 h-4 fill-yellow-400 text-yellow-400"
                />
            );
        }

        // Media estrella
        if (hasHalfStar && fullStars < 5) {
            stars.push(
                <StarHalf
                    key="half"
                    className="w-4 h-4 fill-yellow-400 text-yellow-400"
                />
            );
        }

        // Estrellas vacías
        const emptyStars = 5 - Math.ceil(roundedRating);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(
                <Star
                    key={`empty-${i}`}
                    className="w-4 h-4 text-gray-300"
                />
            );
        }

        return stars;
    };

    // Mejorar la lógica de agrupación con validaciones más estrictas
    const groupedProducts = bestProducts.reduce((acc, product) => {
        // Solo agrupar si tienen exactamente el mismo _id Y el mismo nombre
        const existingProduct = acc.find(p => 
            p._id === product._id && 
            p.name === product.name &&
            p.category === product.category
        );
        
        if (existingProduct) {
            // Combinar ratings solo si son realmente el mismo producto
            const totalRating = existingProduct.averageRating * existingProduct.reviewCount + product.averageRating * product.reviewCount;
            const totalReviews = existingProduct.reviewCount + product.reviewCount;
            existingProduct.averageRating = totalRating / totalReviews;
            existingProduct.reviewCount = totalReviews;
        } else {
            acc.push({ ...product });
        }
        return acc;
    }, []);

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                ¡Tus mejores productos!
            </h3>
            {/* Contenedor con scroll mejorado */}
            <div 
                className="overflow-y-auto pr-2"
                style={{ 
                    maxHeight: '300px', // Altura adecuada
                    scrollbarWidth: 'thin', // Para Firefox
                    scrollbarColor: '#CBD5E0 #F7FAFC' // Para Firefox
                }}
            >
                {groupedProducts.map((product, index) => (
                    <div key={product._id || index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0" style={{ minHeight: '70px' }}>
                        <div className="flex items-center space-x-3 flex-1">
                            {/* Imagen del producto */}
                            {product.image && product.image.includes('http') ? (
                                <img
                                    style={{ borderRadius: '5px' }}
                                    src={product.image}
                                    alt={product.name}
                                    className="w-10 h-10 object-cover flex-shrink-0"
                                />
                            ) : (
                                <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded flex-shrink-0">
                                    <span className={`${product.image === '🎨' ? 'text-2xl' : 'text-gray-400 text-xs font-medium'}`}>
                                        {product.image || (product.itemType === 'custom' ? '🎨' : product.name.charAt(0).toUpperCase())}
                                    </span>
                                </div>
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
                        <div className="flex flex-col items-end space-y-1 flex-shrink-0">
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
            
            {/* Estilo personalizado para el scrollbar */}
            <style jsx>{`
                div::-webkit-scrollbar {
                    width: 6px;
                }
                div::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 3px;
                }
                div::-webkit-scrollbar-thumb {
                    background: #CBD5E0;
                    border-radius: 3px;
                }
                div::-webkit-scrollbar-thumb:hover {
                    background: #A0AEC0;
                }
            `}</style>
        </div>
    );
};

export default BestRankedProductsCards;