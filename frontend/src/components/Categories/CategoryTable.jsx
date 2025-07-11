// Ruta: frontend/src/components/Categories/CategoryTable.jsx
import React from 'react';
import CategoryActions from './CategoryActions';

// Componente para mostrar una tabla de categorías
// Este componente maneja la visualización de categorías en formato de tabla y tarjetas
const CategoryTable = ({ categories, loading, onEdit, onDelete }) => {
    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                <div className="flex justify-center items-center py-8 sm:py-12">
                    <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-[#FF7260]"></div>
                    <span className="ml-2 text-gray-600 text-sm sm:text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Cargando categorías...
                    </span>
                </div>
            </div>
        );
    }

    if (categories.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                <div className="text-center py-8 sm:py-12">
                    <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        No hay categorías
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Comienza creando una nueva categoría.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Vista de escritorio - Tabla */}
            <div className="hidden lg:block bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <h3 className="text-base sm:text-lg font-medium text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Categorías
                        </h3>
                        <span className="text-xs sm:text-sm text-gray-500 order-first sm:order-last" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Mostrando {categories.length} de {categories.length} elementos
                        </span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    Imagen
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    Nombre
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {categories.map((category) => (
                                <tr key={category._id} className="hover:bg-gray-50 transition-colors duration-150">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            {category.image ? (
                                                <img
                                                    src={category.image}
                                                    alt={category.name}
                                                    className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            {category.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <CategoryActions
                                            category={category}
                                            onEdit={onEdit}
                                            onDelete={onDelete}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Vista móvil y tablet - Cards */}
            <div className="lg:hidden space-y-3 sm:space-y-4">
                {categories.map((category) => (
                    <div key={category._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
                        <div className="flex items-center space-x-3 sm:space-x-4">
                            {/* Imagen */}
                            <div className="flex-shrink-0">
                                {category.image ? (
                                    <img
                                        src={category.image}
                                        alt={category.name}
                                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover border border-gray-200"
                                    />
                                ) : (
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                                        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            {/* Información y acciones */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm sm:text-base font-medium text-gray-900 truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            {category.name}
                                        </h4>
                                    </div>
                                    <div className="ml-2 flex-shrink-0">
                                        <CategoryActions
                                            category={category}
                                            onEdit={onEdit}
                                            onDelete={onDelete}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

export default CategoryTable;