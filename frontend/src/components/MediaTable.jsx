import React from 'react';
import { useMediaUtils } from './Media/Hooks/useMediaUtils';

const MediaTable = ({ items, onEdit, onDelete, onCopyUrl }) => {
    const { getFileIcon, formatDate, getTypeBadgeColor } = useMediaUtils();

    if (items.length === 0) {
        return (
            <div className="p-12 text-center">
                <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <p className="text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    No se encontraron elementos multimedia
                </p>
            </div>
        );
    }

    return (
        <div className="hidden lg:block">
            {/* Header de la tabla */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    <div className="col-span-1">Archivos</div>
                    <div className="col-span-2">Tipo</div>
                    <div className="col-span-3">Título</div>
                    <div className="col-span-3">URLs</div>
                    <div className="col-span-2">Fecha</div>
                    <div className="col-span-1">Acciones</div>
                </div>
            </div>

            {/* Filas de la tabla */}
            <div className="divide-y divide-gray-200">
                {items.map((item) => (
                    <div key={item._id} className="p-4 hover:bg-gray-50 transition-colors duration-200">
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
                                <p className="font-medium text-gray-900 truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    {item.title || 'Sin título'}
                                </p>
                                <p className="text-sm text-gray-500 truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>
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
                            <div className="col-span-1 flex items-center gap-2">
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
    );
};

export default MediaTable;