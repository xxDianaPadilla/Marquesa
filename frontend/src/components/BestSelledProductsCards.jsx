import React from "react";
import { useBestSellingProducts } from "./Products/Hooks/useBestSellingProducts";

// Individual product card component that displays product info, sales and percentage
const ProductCard = ({ product, sold, percentage }) => {
    // Destructure product properties with fallback values
    const productName = product?.name || 'Producto sin nombre';
    const productDescription = product?.description || 'Sin descripción';
    const productImage = product?.images?.[0]?.image;

    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 hover:bg-gray-50 rounded-lg transition-colors duration-200 gap-3 sm:gap-0">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
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
                    <h4 className="text-sm sm:text-base font-medium text-gray-900 truncate leading-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {productName}
                    </h4>
                    {/* Show description on mobile for better context */}
                    <p className="text-xs text-gray-500 truncate mt-1 sm:hidden" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {productDescription}
                    </p>
                </div>
            </div>
            
            <div className="flex items-center justify-between sm:justify-end sm:space-x-4 flex-shrink-0">
                <div className="text-left sm:text-right">
                    <div className="text-lg sm:text-sm font-semibold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {percentage}%
                    </div>
                    <div className="text-sm sm:text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {sold} vendidos
                    </div>
                </div>
            </div>
        </div>
    );
};

// Loading skeleton component shown while data is being fetched
const LoadingCard = () => (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 animate-pulse gap-3 sm:gap-0">
        <div className="flex items-center space-x-3 flex-1">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-gray-200 flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
                <div className="h-4 sm:h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 sm:hidden"></div>
            </div>
        </div>
        <div className="flex justify-between sm:justify-end sm:space-x-4">
            <div className="text-left sm:text-right">
                <div className="h-5 sm:h-4 bg-gray-200 rounded w-12 mb-2"></div>
                <div className="h-4 sm:h-3 bg-gray-200 rounded w-16"></div>
            </div>
        </div>
    </div>
);

// Component displayed when no products are available
const EmptyState = () => (
    <div className="text-center py-8 sm:py-12 px-4">
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
        </div>
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            No hay productos vendidos
        </h3>
        <p className="text-sm sm:text-base text-gray-500 max-w-sm mx-auto" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Los productos más vendidos aparecerán aquí cuando se realicen ventas
        </p>
    </div>
);

// Error component displayed when there's an error fetching data
const ErrorState = ({ error, onRetry }) => (
    <div className="text-center py-8 sm:py-12 px-4">
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </div>
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Error al cargar productos
        </h3>
        <p className="text-sm sm:text-base text-gray-500 mb-4 max-w-sm mx-auto" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {error}
        </p>
        {onRetry && (
            <button
                onClick={onRetry}
                className="text-sm sm:text-base text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-blue-50"
                style={{ fontFamily: 'Poppins, sans-serif' }}
            >
                Intentar de nuevo
            </button>
        )}
    </div>
);

// Main component that manages the display of bestSelling products
const BestSelledProductsCards = () => {
    // Custom hook to fetch best selling products data
    const { bestSelling, loading, error, totalSales } = useBestSellingProducts();

    return (
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 w-full max-w-full overflow-hidden">
            {/* Header section with title and update status */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2 sm:gap-0">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 leading-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Productos más comprados
                </h3>
                <div className="flex items-center space-x-2 self-start sm:self-auto">
                    <div className={`w-2 h-2 rounded-full ${error ? 'bg-red-500' : 'bg-green-500'}`}></div>
                    <span className="text-xs sm:text-sm text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {error ? 'Error' : 'Actualizado'}
                    </span>
                </div>
            </div>

            {/* Conditional rendering based on loading, error and data state */}
            <div className={`space-y-1 sm:space-y-2 ${
                !loading && !error && bestSelling.length > 4 
                    ? 'max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400 pr-2' 
                    : ''
            }`}>
                {loading ? (
                    // Show loading cards while fetching data
                    Array.from({ length: 3 }).map((_, index) => (
                        <LoadingCard key={index} />
                    ))
                ) : error ? (
                    // Show error state if there's an error
                    <ErrorState error={error} />
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

            {/* Statistics and "View all" button shown only when products exist */}
            {bestSelling.length > 0 && (
                <div className="mt-4 sm:mt-6 pt-4 border-t border-gray-100">
                    {/* Total sales statistics */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm sm:text-xs text-gray-500 mb-3 gap-1 sm:gap-0">
                        <span style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Total de productos vendidos
                        </span>
                        <span className="font-medium text-gray-900 sm:text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {totalSales} unidades
                        </span>
                    </div>

                    {/* View all button */}
                    <button className="w-full text-sm sm:text-base text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 py-2 sm:py-1 rounded-lg hover:bg-blue-50 sm:hover:bg-transparent" style={{ fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }}>
                        Ver todos los productos
                    </button>
                </div>
            )}
        </div>
    );
};

export default BestSelledProductsCards;