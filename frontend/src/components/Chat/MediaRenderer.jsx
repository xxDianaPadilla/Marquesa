import React from 'react';

/**
 * Componente MediaRenderer - Renderiza diferentes tipos de archivos multimedia
 * 
 * @param {Object} media - Objeto que contiene información del archivo multimedia
 * @param {string} media.url - URL del archivo multimedia
 * @param {string} media.type - Tipo de media ('image', 'video', 'audio', etc.)
 * @param {string} media.filename - Nombre del archivo
 * @param {number} media.size - Tamaño del archivo en bytes
 * @param {string} maxWidth - Clase CSS para el ancho máximo del elemento (default: 'max-w-xs')
 */
const MediaRenderer = ({ media, maxWidth = 'max-w-xs' }) => {
    // Si no hay media o no tiene URL, no renderizar nada
    if (!media || !media.url) return null;

    // Clases CSS comunes para todos los elementos multimedia
    const commonClasses = `${maxWidth} max-h-48 rounded-lg`;

    // Switch para renderizar según el tipo de archivo multimedia
    switch (media.type) {
        case 'image':
            // Renderizado para imágenes
            return (
                <img 
                    src={media.url} 
                    alt={media.filename}
                    className={`${commonClasses} cursor-pointer hover:opacity-90 transition-opacity`}
                    onClick={() => window.open(media.url, '_blank')} // Abrir imagen en nueva pestaña al hacer clic
                />
            );
        case 'video':
            // Renderizado para videos con controles nativos
            return (
                <video 
                    src={media.url} 
                    controls // Habilita controles de reproducción nativos del navegador
                    className={commonClasses}
                />
            );
        case 'audio':
            // Renderizado para archivos de audio con controles nativos
            return (
                <audio 
                    src={media.url} 
                    controls // Habilita controles de reproducción nativos del navegador
                    className={maxWidth} // Solo aplicar ancho máximo, sin altura para audio
                />
            );
        default:
            // Renderizado por defecto para archivos no reconocidos (documentos, etc.)
            return (
                <div className={`flex items-center space-x-2 p-2 border rounded-lg bg-gray-50 ${maxWidth}`}>
                    {/* Ícono genérico de documento */}
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    
                    {/* Información del archivo */}
                    <div className="flex-1 min-w-0">
                        {/* Nombre del archivo */}
                        <p className="text-sm font-medium text-gray-900 truncate">{media.filename}</p>
                        {/* Tamaño del archivo convertido de bytes a MB */}
                        <p className="text-xs text-gray-500">{(media.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    
                    {/* Botón de descarga/abrir archivo */}
                    <button
                        onClick={() => window.open(media.url, '_blank')} // Abrir archivo en nueva pestaña
                        className="text-blue-600 hover:text-blue-800"
                    >
                        {/* Ícono de descarga */}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </button>
                </div>
            );
    }
};

export default MediaRenderer;