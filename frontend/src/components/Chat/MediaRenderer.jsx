import React from 'react';

const MediaRenderer = ({ media, maxWidth = 'max-w-xs' }) => {
    if (!media || !media.url) return null;

    const commonClasses = `${maxWidth} max-h-48 rounded-lg`;

    switch (media.type) {
        case 'image':
            return (
                <img 
                    src={media.url} 
                    alt={media.filename}
                    className={`${commonClasses} cursor-pointer hover:opacity-90 transition-opacity`}
                    onClick={() => window.open(media.url, '_blank')}
                />
            );
        case 'video':
            return (
                <video 
                    src={media.url} 
                    controls
                    className={commonClasses}
                />
            );
        case 'audio':
            return (
                <audio 
                    src={media.url} 
                    controls
                    className={maxWidth}
                />
            );
        default:
            return (
                <div className={`flex items-center space-x-2 p-2 border rounded-lg bg-gray-50 ${maxWidth}`}>
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{media.filename}</p>
                        <p className="text-xs text-gray-500">{(media.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button
                        onClick={() => window.open(media.url, '_blank')}
                        className="text-blue-600 hover:text-blue-800"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </button>
                </div>
            );
    }
};

export default MediaRenderer;