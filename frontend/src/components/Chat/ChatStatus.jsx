import React from 'react';

const ChatStatus = ({ isConnected, isLoading, error, onRetry }) => {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-4 bg-yellow-50 border-b border-yellow-200">
                <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                    <span className="text-sm text-yellow-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Conectando al chat...
                    </span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-between p-4 bg-red-50 border-b border-red-200">
                <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-sm text-red-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {error}
                    </span>
                </div>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="text-sm text-red-700 hover:text-red-900 underline"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                        Reintentar
                    </button>
                )}
            </div>
        );
    }

    if (!isConnected) {
        return (
            <div className="flex items-center justify-between p-4 bg-orange-50 border-b border-orange-200">
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm text-orange-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Desconectado - Intentando reconectar...
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center p-2 bg-green-50 border-b border-green-200">
            <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    En línea
                </span>
            </div>
        </div>
    );
};

export default ChatStatus;