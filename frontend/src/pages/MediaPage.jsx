import React from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer";
import MediaGrid from "../components/MediaGrid";
import FilterButtons from "../components/FilterButtons";
import useMedia from "../components/Media/Hooks/useMedia";

// Página principal del blog de Marquesa
// Utiliza el hook useMedia para manejar la lógica de filtrado y carga de artículos
const MediaPage = () => {
    const {
        displayedItems,
        activeFilter,
        hasMoreItems,
        loadMoreItems,
        handleFilterChange,
        totalItems
    } = useMedia();

    return (
        <>
            <Header />

            <main className="min-h-screen">
                {/* Page Header */}
                <section className="relative pt-8 sm:pt-12 lg:pt-16 xl:pt-20 pb-8 sm:pb-12 lg:pb-16">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                        <div className="text-center max-w-4xl mx-auto">
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-800 mb-4 sm:mb-6"
                                style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Blog de Marquesa
                            </h1>
                            <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-gray-600 leading-relaxed px-4 sm:px-0">
                                Descubre consejos, técnicas y contenido especialmente diseñado para el cuidado y disfrute de las flores.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Filter Section */}
                <section >
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <FilterButtons 
                            activeFilter={activeFilter}
                            onFilterChange={handleFilterChange}
                        />
                    </div>
                </section>

                {/* Results Counter */}
                <section >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <p className="text-sm sm:text-base text-gray-600 text-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                {displayedItems.length === 0 ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        No se encontraron artículos para este filtro
                                    </span>
                                ) : (
                                    <>
                                        Mostrando <span className="font-semibold text-gray-800">{displayedItems.length}</span> de <span className="font-semibold text-gray-800">{totalItems}</span> artículos
                                        {activeFilter !== 'all' && (
                                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                                Filtro: {activeFilter}
                                            </span>
                                        )}
                                    </>
                                )}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Blog Cards Grid */}
                <section className="py-8 sm:py-12 lg:py-16 ">
                    {displayedItems.length > 0 ? (
                        <MediaGrid mediaItems={displayedItems} />
                    ) : (
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
                                <div className="text-gray-400 mb-6">
                                    <svg className="w-16 h-16 sm:w-20 sm:h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    No hay contenido disponible
                                </h3>
                                <p className="text-gray-500 text-sm sm:text-base mb-6">
                                    No se encontraron artículos que coincidan con el filtro seleccionado.
                                </p>
                                <button
                                    onClick={() => handleFilterChange('all')}
                                    className="bg-pink-200 hover:bg-pink-300 text-pink-800 px-4 sm:px-6 py-2 sm:py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
                                    style={{ fontFamily: 'Poppins, sans-serif' }}
                                >
                                    Ver todos los artículos
                                </button>
                            </div>
                        </div>
                    )}
                </section>

                {/* Load More Button */}
                {hasMoreItems && displayedItems.length > 0 && (
                    <section className="pb-12 sm:pb-16 lg:pb-20 ">
                        <div className="text-center">
                            <button 
                                onClick={loadMoreItems}
                                className="bg-pink-200 hover:bg-pink-300 text-pink-800 px-6 sm:px-8 lg:px-10 py-3 sm:py-4 rounded-full font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base lg:text-lg"
                                style={{ fontFamily: 'Poppins, sans-serif' }}
                            >
                                <span className="flex items-center gap-2">
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Cargar más contenido
                                </span>
                            </button>
                        </div>
                    </section>
                )}

                {/* Call to Action Section */}
                <section className="py-12 sm:py-16 lg:py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-8 sm:p-12 lg:p-16 border border-pink-100">
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4 sm:mb-6"
                                style={{ fontFamily: 'Poppins, sans-serif' }}>
                                ¿Te gustó nuestro contenido?
                            </h2>
                            <p className="text-sm sm:text-base lg:text-lg text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto">
                                Explora nuestra tienda para encontrar los mejores arreglos florales y productos especiales para tus momentos más importantes.
                            </p>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="bg-pink-200 hover:bg-pink-300 text-pink-800 px-6 sm:px-8 lg:px-10 py-3 sm:py-4 rounded-full font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base lg:text-lg"
                                style={{ fontFamily: 'Poppins, sans-serif' }}
                            >
                                <span className="flex items-center gap-2 justify-center">
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                    Explorar tienda
                                </span>
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
};

export default MediaPage;