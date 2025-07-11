// Ruta: frontend/src/components/MediaTable.jsx
import React from 'react';
import { useMediaUtils } from './Media/Hooks/useMediaUtils';

// Componente para mostrar una tabla de elementos multimedia
// Permite editar, eliminar y copiar URLs de imágenes y videos
const MediaTable = ({ items, onEdit, onDelete, onCopyUrl }) => {
    const { getFileIcon, formatDate, getTypeBadgeColor } = useMediaUtils();

    if (items.length === 0) {
        return (
            <div className="p-6 sm:p-8 lg:p-12 text-center">
                <div className="text-gray-400 mb-4">
                    <svg className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <p className="text-gray-500 text-sm sm:text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    No se encontraron elementos multimedia
                </p>
            </div>
        );
    }

    return (
        <>
            {/* Vista Desktop - Tabla */}
            <div className="hidden lg:block">
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-gray-50">
                    <div className="grid grid-cols-12 gap-4 text-xs sm:text-sm font-medium text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        <div className="col-span-1">Archivos</div>
                        <div className="col-span-2">Tipo</div>
                        <div className="col-span-3">Título</div>
                        <div className="col-span-3">URLs</div>
                        <div className="col-span-2">Fecha</div>
                        <div className="col-span-1">Acciones</div>
                    </div>
                </div>

                <div className="divide-y divide-gray-200">
                    {items.map((item) => (
                        <div key={item._id} className="p-3 sm:p-4 hover:bg-gray-50 transition-colors duration-200">
                            <div className="grid grid-cols-12 gap-4 items-center">
                                {/* Archivos con icono */}
                                <div className="col-span-1 flex items-center justify-center">
                                    {getFileIcon(item).component}
                                </div>

                                {/* Tipo */}
                                <div className="col-span-2">
                                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full border ${getTypeBadgeColor(item.type)}`} style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        {item.type}
                                    </span>
                                </div>

                                {/* Título */}
                                <div className="col-span-3">
                                    <p className="font-medium text-gray-900 truncate text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        {item.title || 'Sin título'}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        {item.description || 'Sin descripción'}
                                    </p>
                                </div>

                                {/* URLs */}
                                <div className="col-span-3 space-y-1">
                                    {item.imageURL && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-blue-600 font-medium">IMG:</span>
                                            <code className="text-xs bg-gray-100 px-2 py-1 rounded flex-1 truncate" style={{ fontFamily: 'monospace' }}>
                                                {item.imageURL}
                                            </code>
                                            <button
                                                onClick={() => onCopyUrl(item.imageURL)}
                                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                                title="Copiar URL imagen"
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                            </button>
                                        </div>
                                    )}
                                    {item.videoURL && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-red-600 font-medium">VID:</span>
                                            <code className="text-xs bg-gray-100 px-2 py-1 rounded flex-1 truncate" style={{ fontFamily: 'monospace' }}>
                                                {item.videoURL}
                                            </code>
                                            <button
                                                onClick={() => onCopyUrl(item.videoURL)}
                                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                                title="Copiar URL video"
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                            </button>
                                        </div>
                                    )}
                                    {!item.imageURL && !item.videoURL && (
                                        <span className="text-xs text-gray-400">Sin archivos multimedia</span>
                                    )}
                                </div>

                                {/* Fecha */}
                                <div className="col-span-2">
                                    <p className="text-sm text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        {formatDate(item.createdAt)}
                                    </p>
                                </div>

                                {/* Acciones */}
                                <div className="col-span-1 flex items-center gap-1">
                                    <button
                                        onClick={() => onEdit(item)}
                                        className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                                        title="Editar"
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => onDelete(item)}
                                        className="text-red-600 hover:text-red-800 transition-colors p-1"
                                        title="Eliminar"
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Vista Mobile y Tablet - Cards */}
            <div className="lg:hidden space-y-3 sm:space-y-4">
                {items.map((item) => (
                    <div key={item._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
                        {/* Header de la tarjeta */}
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                {getFileIcon(item).component}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-gray-900 text-sm truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        {item.title || 'Sin título'}
                                    </h3>
                                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full border mt-1 ${getTypeBadgeColor(item.type)}`} style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        {item.type}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 ml-2">
                                <button
                                    onClick={() => onEdit(item)}
                                    className="text-blue-600 hover:text-blue-800 transition-colors p-2"
                                    title="Editar"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => onDelete(item)}
                                    className="text-red-600 hover:text-red-800 transition-colors p-2"
                                    title="Eliminar"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Descripción */}
                        {item.description && (
                            <p className="text-xs sm:text-sm text-gray-600 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                {item.description}
                            </p>
                        )}

                        {/* URLs */}
                        <div className="space-y-2 mb-3">
                            {item.imageURL && (
                                <div className="bg-blue-50 rounded p-2">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-blue-600 font-medium">Imagen:</span>
                                        <button
                                            onClick={() => onCopyUrl(item.imageURL)}
                                            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                                            title="Copiar URL imagen"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                        </button>
                                    </div>
                                    <code className="text-xs text-gray-700 break-all block" style={{ fontFamily: 'monospace' }}>
                                        {item.imageURL.length > 60 ? `${item.imageURL.substring(0, 60)}...` : item.imageURL}
                                    </code>
                                </div>
                            )}
                            {item.videoURL && (
                                <div className="bg-red-50 rounded p-2">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-red-600 font-medium">Video:</span>
                                        <button
                                            onClick={() => onCopyUrl(item.videoURL)}
                                            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                                            title="Copiar URL video"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                        </button>
                                    </div>
                                    <code className="text-xs text-gray-700 break-all block" style={{ fontFamily: 'monospace' }}>
                                        {item.videoURL.length > 60 ? `${item.videoURL.substring(0, 60)}...` : item.videoURL}
                                    </code>
                                </div>
                            )}
                            {!item.imageURL && !item.videoURL && (
                                <div className="bg-gray-50 rounded p-2 text-center">
                                    <span className="text-xs text-gray-400">Sin archivos multimedia</span>
                                </div>
                            )}
                        </div>

                        {/* Fecha */}
                        <div className="text-right">
                            <p className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                {formatDate(item.createdAt)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

export default MediaTable;