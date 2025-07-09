import { useCallback, useMemo } from 'react';

export const useMediaUtils = () => {
    // Tipos de medios disponibles - memoizados para evitar recreación
    const mediaTypes = useMemo(() => [
        { value: 'todos', label: 'Todos los tipos' },
        { value: 'Dato Curioso', label: 'Dato Curioso' },
        { value: 'Tip', label: 'Tip' },
        { value: 'Blog', label: 'Blog' }
    ], []);

    // Configuraciones de validación de archivos - memoizadas
    const validationConfig = useMemo(() => ({
        maxSizes: {
            image: 5 * 1024 * 1024, // 5MB
            video: 50 * 1024 * 1024  // 50MB
        },
        allowedTypes: {
            image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
            video: ['video/mp4', 'video/mov', 'video/avi', 'video/webm']
        }
    }), []);

    // Obtener icono según el tipo de archivo - optimizado con useCallback
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

    // Formatear fecha - optimizado con useCallback
    const formatDate = useCallback((dateString) => {
        try {
            return new Date(dateString).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        } catch (error) {
            console.error('Error al formatear fecha:', error);
            return 'Fecha inválida';
        }
    }, []);

    // Formatear tiempo relativo - optimizado con useCallback
    const formatRelativeTime = useCallback((dateString) => {
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffInSeconds = Math.floor((now - date) / 1000);

            if (diffInSeconds < 60) return 'Hace un momento';
            if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} minutos`;
            if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`;
            if (diffInSeconds < 2592000) return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
            
            return formatDate(dateString);
        } catch (error) {
            console.error('Error al formatear tiempo relativo:', error);
            return formatDate(dateString);
        }
    }, [formatDate]);

    // Copiar al portapapeles - optimizado con useCallback
    const copyToClipboard = useCallback(async (text) => {
        if (!text) {
            return { success: false, error: 'No hay texto para copiar' };
        }

        try {
            // Verificar si está disponible la API del portapapeles
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                return { success: true };
            } else {
                // Fallback para navegadores sin soporte o contextos no seguros
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                
                try {
                    const successful = document.execCommand('copy');
                    textArea.remove();
                    return successful 
                        ? { success: true }
                        : { success: false, error: 'No se pudo copiar usando execCommand' };
                } catch (err) {
                    textArea.remove();
                    return { success: false, error: 'Error al ejecutar execCommand' };
                }
            }
        } catch (error) {
            console.error('Error al copiar al portapapeles:', error);
            return { success: false, error: 'No se pudo copiar al portapapeles' };
        }
    }, []);

    // Validar archivo - optimizado con useCallback
    const validateFile = useCallback((file, type = 'image') => {
        if (!file) {
            return { valid: false, error: 'No se ha seleccionado ningún archivo' };
        }

        // Validar tamaño
        if (file.size > validationConfig.maxSizes[type]) {
            const maxSizeMB = validationConfig.maxSizes[type] / (1024 * 1024);
            return { 
                valid: false, 
                error: `El archivo no debe superar los ${maxSizeMB}MB` 
            };
        }

        // Validar tipo de archivo
        if (!validationConfig.allowedTypes[type].includes(file.type)) {
            const allowedExtensions = validationConfig.allowedTypes[type]
                .map(mimeType => mimeType.split('/')[1].toUpperCase())
                .join(', ');
            return { 
                valid: false, 
                error: `Tipo de archivo no válido. Formatos permitidos: ${allowedExtensions}` 
            };
        }

        return { valid: true };
    }, [validationConfig]);

    // Obtener información del archivo - optimizado con useCallback
    const getFileInfo = useCallback((file) => {
        if (!file) return '';
        
        try {
            const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
            return `${file.name} (${sizeInMB} MB)`;
        } catch (error) {
            console.error('Error al obtener información del archivo:', error);
            return file.name || 'Archivo desconocido';
        }
    }, []);

    // Generar color para el badge de tipo - optimizado con useCallback
    const getTypeBadgeColor = useCallback((type) => {
        const colors = {
            'Dato Curioso': 'bg-blue-100 text-blue-800 border-blue-300',
            'Tip': 'bg-green-100 text-green-800 border-green-300',
            'Blog': 'bg-purple-100 text-purple-800 border-purple-300'
        };
        return colors[type] || 'bg-gray-100 text-gray-800 border-gray-300';
    }, []);

    // Obtener estadísticas de archivos - nuevo helper
    const getFileStats = useCallback((items) => {
        if (!Array.isArray(items)) return { withImage: 0, withVideo: 0, withBoth: 0, withNone: 0 };

        return items.reduce((stats, item) => {
            const hasImage = item.imageURL && item.imageURL.trim() !== "";
            const hasVideo = item.videoURL && item.videoURL.trim() !== "";

            if (hasImage && hasVideo) stats.withBoth++;
            else if (hasImage) stats.withImage++;
            else if (hasVideo) stats.withVideo++;
            else stats.withNone++;

            return stats;
        }, { withImage: 0, withVideo: 0, withBoth: 0, withNone: 0 });
    }, []);

    // Truncar texto - nuevo helper
    const truncateText = useCallback((text, maxLength = 50) => {
        if (!text || text.length <= maxLength) return text;
        return `${text.substring(0, maxLength)}...`;
    }, []);

    return {
        // Constantes
        mediaTypes,
        validationConfig,
        
        // Funciones de utilidad
        getFileIcon,
        formatDate,
        formatRelativeTime,
        copyToClipboard,
        validateFile,
        getFileInfo,
        getTypeBadgeColor,
        getFileStats,
        truncateText
    };
};