import React from 'react';

const FilePreview = ({ file, previewUrl, onClear, compact = false }) => {
    if (!file) return null;

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (fileType) => {
        if (fileType.startsWith('image/')) {
            return (
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            );
        } else if (fileType.startsWith('video/')) {
            return (
                <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
            );
        } else if (fileType.startsWith('audio/')) {
            return (
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
            );
        } else {
            return (
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            );
        }
    };

    return (
        <div className={`${compact ? 'p-2' : 'p-3 md:p-4'} border-t border-gray-200 bg-gray-50 flex-shrink-0`}>
            <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                        {/* Preview o ícono del archivo */}
                        <div className="flex-shrink-0">
                            {previewUrl ? (
                                <img 
                                    src={previewUrl} 
                                    alt="Preview" 
                                    className={`${compact ? 'w-10 h-10' : 'w-12 h-12'} rounded object-cover border border-gray-200`} 
                                />
                            ) : (
                                <div className={`${compact ? 'w-10 h-10' : 'w-12 h-12'} bg-gray-100 rounded flex items-center justify-center`}>
                                    {getFileIcon(file.type)}
                                </div>
                            )}
                        </div>
                        
                        {/* Información del archivo */}
                        <div className="flex-1 min-w-0">
                            <p className={`${compact ? 'text-xs' : 'text-sm'} font-medium text-gray-900 truncate`} style={{ fontFamily: 'Poppins, sans-serif' }}>
                                {file.name}
                            </p>
                            <p className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                {formatFileSize(file.size)}
                            </p>
                            {/* Tipo de archivo */}
                            <p className="text-xs text-gray-400 uppercase" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                {file.type.split('/')[1] || 'Archivo'}
                            </p>
                        </div>
                    </div>
                    
                    {/* Botón para quitar archivo */}
                    <button
                        onClick={onClear}
                        className="flex-shrink-0 ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                        title="Quitar archivo"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                {/* Barra de progreso (opcional para uploads futuros) */}
                <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1">
                        <div className="bg-[#E8ACD2] h-1 rounded-full w-full transition-all duration-300"></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Archivo listo para enviar
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FilePreview;