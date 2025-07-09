import { useCallback } from 'react';

export const useMediaUtils = () => {
    // Tipos de medios disponibles
    const mediaTypes = [
        { value: 'todos', label: 'Todos los tipos' },
        { value: 'Dato Curioso', label: 'Dato Curioso' },
        { value: 'Tip', label: 'Tip' },
        { value: 'Blog', label: 'Blog' }
    ];

    // Obtener icono según el tipo de archivo
    const getFileIcon = useCallback((item) => {
        const hasImage = item.imageURL && item.imageURL.trim() !== "";
        const hasVideo = item.videoURL && item.videoURL.trim() !== "";

        if (hasImage && hasVideo) {
            return {
                type: 'both',
                component: (
                    <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                        <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                        </svg>
                    </div>
                )
            };
        } else if (hasImage) {
            return {
                type: 'image',
                component: (
                    <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                )
            };
        } else if (hasVideo) {
            return {
                type: 'video',
                component: (
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                    </svg>
                )
            };
        } else {
            return {
                type: 'text',
                component: (
                    <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                )
            };
        }
    }, []);

    // Formatear fecha
    const formatDate = useCallback((dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }, []);

    // Formatear tiempo relativo
    const formatRelativeTime = useCallback((dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Hace un momento';
        if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} minutos`;
        if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`;
        if (diffInSeconds < 2592000) return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
        
        return formatDate(dateString);
    }, [formatDate]);

    // Copiar al portapapeles
    const copyToClipboard = useCallback(async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            return { success: true };
        } catch (error) {
            console.error('Error al copiar al portapapeles:', error);
            
            // Fallback para navegadores sin soporte
            try {
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand('copy');
                textArea.remove();
                return { success: true };
            } catch (fallbackError) {
                return { success: false, error: 'No se pudo copiar al portapapeles' };
            }
        }
    }, []);

    // Validar archivo
    const validateFile = useCallback((file, type = 'image') => {
        const maxSizes = {
            image: 5 * 1024 * 1024, // 5MB
            video: 50 * 1024 * 1024  // 50MB
        };

        const allowedTypes = {
            image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
            video: ['video/mp4', 'video/mov', 'video/avi', 'video/webm']
        };

        if (!file) {
            return { valid: false, error: 'No se ha seleccionado ningún archivo' };
        }

        if (file.size > maxSizes[type]) {
            const maxSizeMB = maxSizes[type] / (1024 * 1024);
            return { 
                valid: false, 
                error: `El archivo no debe superar los ${maxSizeMB}MB` 
            };
        }

        if (!allowedTypes[type].includes(file.type)) {
            return { 
                valid: false, 
                error: `Tipo de archivo no válido. Formatos permitidos: ${allowedTypes[type].join(', ')}` 
            };
        }

        return { valid: true };
    }, []);

    // Obtener información del archivo
    const getFileInfo = useCallback((file) => {
        if (!file) return '';
        const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
        return `${file.name} (${sizeInMB} MB)`;
    }, []);

    // Generar color para el badge de tipo
    const getTypeBadgeColor = useCallback((type) => {
        const colors = {
            'Dato Curioso': 'bg-blue-100 text-blue-800 border-blue-300',
            'Tip': 'bg-green-100 text-green-800 border-green-300',
            'Blog': 'bg-purple-100 text-purple-800 border-purple-300'
        };
        return colors[type] || 'bg-gray-100 text-gray-800 border-gray-300';
    }, []);

    return {
        mediaTypes,
        getFileIcon,
        formatDate,
        formatRelativeTime,
        copyToClipboard,
        validateFile,
        getFileInfo,
        getTypeBadgeColor
    };
};