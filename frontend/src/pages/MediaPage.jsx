import React from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer";
import MediaGrid from "../components/MediaGrid";
import FilterButtons from "../components/FilterButtons";
import useMedia from "../components/Media/Hooks/useMedia";

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

            <main className="min-h-screen bg-gray-50">
                {/* Page Header */}
                <section className="relative pt-12 sm:pt-16 lg:pt-20 pb-12 sm:pb-16">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-4xl mx-auto">
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4"
                                style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Blog de Marquesa
                            </h1>
                            <p className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed">
                                Descubre consejos, técnicas y contenido especialmente diseñado para el cuidado y disfrute de las flores.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Filter Section */}
                <section className="py-6 sm:py-8">
                    <FilterButtons 
                        activeFilter={activeFilter}
                        onFilterChange={handleFilterChange}
                    />
                </section>

                {/* Results Counter */}
                <section className="pb-6">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <p className="text-sm text-gray-600 text-center">
                            Mostrando {displayedItems.length} de {totalItems} artículos
                        </p>
                    </div>
                </section>

                {/* Blog Cards Grid */}
                <section className="pb-12 sm:pb-16">
                    <MediaGrid mediaItems={displayedItems} />
                </section>

                {/* Load More Button */}
                {hasMoreItems && (
                    <section className="pb-16 text-center">
                        <button 
                            onClick={loadMoreItems}
                            className="bg-pink-200 hover:bg-pink-300 text-pink-800 px-6 sm:px-8 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105"
                        >
                            Cargar más contenido
                        </button>
                    </section>
                )}
            </main>

            <Footer />
        </>
    );
};

export default MediaPage;