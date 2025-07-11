import React from "react";
import { useBestSellingProducts } from "./Products/Hooks/useBestSellingProducts";

// Individual product card component that displays product info, sales and percentage
const ProductCard = ({ product, sold, percentage }) => {
    // Destructure product properties with fallback values
    const productName = product?.name || 'Producto sin nombre';
    const productDescription = product?.description || 'Sin descripción';
    const productImage = product?.images?.[0]?.image;

    return (
        <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200">
            <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <img
                        src={productImage}
                        alt={productName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.src = '/api/placeholder/60/60';
                        }}
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {productName}
                    </h4>
                    <p
                   className="text-xs text-gray-500 break-words whitespace-normal leading-snug sm:truncate"
                   style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                   {productDescription}
                    </p>

                </div>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
                <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {percentage}%
                    </div>
                    <div className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {sold} vendidos
                    </div>
                </div>
            </div>
        </div>
    );
};

// Loading skeleton component shown while data is being fetched
const LoadingCard = () => (
    <div className="flex items-center justify-between p-3 animate-pulse">
        <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-lg bg-gray-200"></div>
            <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
        </div>
        <div className="text-right">
            <div className="h-4 bg-gray-200 rounded w-12 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-16"></div>
        </div>
    </div>
);

// Component displayed when no products are available
const EmptyState = () => (
    <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
        </div>
        <h3 className="text-sm font-medium text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            No hay productos vendidos
        </h3>
        <p className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Los productos más vendidos aparecerán aquí
        </p>
    </div>
);

// Main component that manages the display of best-selling products
const BestSelledProductsCards = () => {
    // Custom hook to fetch best selling products data
    const {bestSelling, loading} = useBestSellingProducts();

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            {/* Header section with title and update status */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Productos más comprados
                </h3>
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Actualizado
                    </span>
                </div>
            </div>

            {/* Conditional rendering based on loading and data state */}
            <div className="space-y-1">
                {loading ? (
                    // Show loading cards while fetching data
                    Array.from({ length: 3 }).map((_, index) => (
                        <LoadingCard key={index} />
                    ))
                ) : bestSelling.length > 0 ? (
                    // Display product cards if data exists
                    bestSelling.map((item, index) => (
                        <ProductCard
                            key={item.product._id || index}
                            product={item.product}
                            sold={item.sold}
                            percentage={item.percentage}
                        />
                    ))
                ) : (
                    // Show empty state if no products
                    <EmptyState />
                )}
            </div>

            {/* "View all" button shown only when products exist */}
            {bestSelling.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-100">
                    <button className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200" style={{ fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }}>
                        Ver todos los productos
                    </button>
                </div>
            )}
        </div>
    );
};

export default BestSelledProductsCards;