import React, { useState } from "react";
import NavbarAdmin from "../components/NavbarAdmin";
import useDataCategories from "../components/Categories/hooks/useDataCategories";

const CategoriesManager = () => {
    const {
        activeTab,
        setActiveTab,
        id,
        name,
        setName,
        image,
        setImage,
        categories,
        setCategories,
        loading,
        createCategorie,
        deleteCategorie,
        updateCategorie,
        handleEdit,
    } = useDataCategories();


    const [searchTerm, setSearchTerm] = useState('');

    const handleUpload = () => {
        console.log('Abrir modal de subida');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <NavbarAdmin />

            {/* Contenido principal */}
            <div className="ml-16 p-3 sm:p-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Categorías de Marquesa
                            </h1>
                            <p className="text-gray-600 mt-1 text-sm sm:text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Gestiona las categorías de tus productos
                            </p>
                        </div>
                        <button
                            onClick={handleUpload}
                            className="w-full sm:w-auto bg-[#FDB4B7] hover:bg-[#F2C6C2] text-white px-4 sm:px-6 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
                            style={{ fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }}
                        >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span className="hidden sm:inline">Añadir Categoría</span>
                            <span className="sm:hidden">Añadir</span>
                        </button>
                    </div>

                    {/* Filtros y búsqueda */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Buscador */}
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder="Buscar..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7260] focus:border-transparent text-sm sm:text-base"
                                style={{ fontFamily: 'Poppins, sans-serif' }}
                            />
                            <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoriesManager;