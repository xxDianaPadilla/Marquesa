import React from 'react';
import { useMediaUtils } from './Media/Hooks/useMediaUtils';

// Componente para mostrar una lista de elementos multimedia
// Permite editar, eliminar y copiar URLs de imágenes y videos
const MediaList = ({ items, onEdit, onDelete, onCopyUrl }) => {
    const { getFileIcon, formatDate, getTypeBadgeColor } = useMediaUtils();

    return (
        <div className="lg:hidden">
            <div className="p-4 space-y-4">
                {items.map((item) => (
                    <div key={item._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        {/* Header de la tarjeta */}
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                {getFileIcon(item).component}
                                <div>
                                    <h3 className="font-medium text-gray-900 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        {item.title || 'Sin título'}
                                    </h3>
                                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full border mt-1 ${getTypeBadgeColor(item.type)}`} style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        {item.type}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
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
                            <p className="text-sm text-gray-600 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                {item.description}
                            </p>
                        )}

                        {/* URLs */}
                        <div className="space-y-2 mb-3">
                            {item.imageURL && (
                                <div className="bg-white rounded p-2">
                                    <div className="flex items-center justify-between">
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
                                    <code className="text-xs text-gray-700 break-all" style={{ fontFamily: 'monospace' }}>
                                        {item.imageURL.length > 50 ? `${item.imageURL.substring(0, 50)}...` : item.imageURL}
                                    </code>
                                </div>
                            )}
                            {item.videoURL && (
                                <div className="bg-white rounded p-2">
                                    <div className="flex items-center justify-between">
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
                                    <code className="text-xs text-gray-700 break-all" style={{ fontFamily: 'monospace' }}>
                                        {item.videoURL.length > 50 ? `${item.videoURL.substring(0, 50)}...` : item.videoURL}
                                    </code>
                                </div>
                            )}
                            {!item.imageURL && !item.videoURL && (
                                <div className="bg-white rounded p-2 text-center">
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
        </div>
    );
};

export default MediaList;