import React from 'react';
// Importo el componente que maneja las acciones de cada categoría (editar y eliminar)
import CategoryActions from './CategoryActions';

// Componente que muestra la tabla de categorías
const CategoryTable = ({ categories, loading, onEdit, onDelete }) => {
    // Si está cargando, muestro un loader con animación
    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF7260]"></div>
                    <span className="ml-2 text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Cargando categorías...
                    </span>
                </div>
            </div>
        );
    }

    // Si no hay categorías disponibles, muestro un mensaje con ícono informativo
    if (categories.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        No hay categorías
                    </h3>
                    <p className="mt-1 text-sm text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Comienza creando una nueva categoría.
                    </p>
                </div>
            </div>
        );
    }

    // Si hay categorías, muestro la tabla con los datos
    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Header de la tabla con título y cantidad de categorías mostradas */}
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <h3 className="text-lg font-medium text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Categorías
                    </h3>
                    <span className="text-xs sm:text-sm text-gray-500 order-first sm:order-last" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Mostrando {categories.length} de {categories.length} elementos
                    </span>
                </div>
            </div>

            {/* Cuerpo de la tabla con los datos de cada categoría */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {/* Encabezado: Imagen de la categoría */}
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Imagen
                            </th>
                            {/* Encabezado: Nombre de la categoría */}
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Nombre
                            </th>
                            {/* Encabezado: Acciones (editar / eliminar) */}
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {/* Recorro cada categoría y renderizo su fila */}
                        {categories.map((category) => (
                            <tr key={category._id} className="hover:bg-gray-50 transition-colors duration-150">
                                {/* Celda de la imagen */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        {category.image ? (
                                            // Si hay imagen, la muestro
                                            <img
                                                src={category.image}
                                                alt={category.name}
                                                className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                                            />
                                        ) : (
                                            // Si no hay imagen, muestro un ícono por defecto
                                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                </td>

                                {/* Celda del nombre de la categoría */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        {category.name}
                                    </div>
                                </td>

                                {/* Celda con las acciones de editar y eliminar */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <CategoryActions
                                        category={category}      // Paso la categoría actual
                                        onEdit={onEdit}          // Paso la función para editar
                                        onDelete={onDelete}      // Paso la función para eliminar
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CategoryTable;
