import { useCallback, useMemo } from 'react';

/**
 * Hook personalizado con utilidades para manejo de medios
 * Proporciona funciones de validación, formateo y utilidades generales
 * Optimizado con useCallback y useMemo para evitar re-renderizados innecesarios
 * 
 * @returns {Object} Objeto con todas las utilidades disponibles
 */
export const useMediaUtils = () => {
    
    /**
     * Tipos de medios disponibles - memoizados para evitar recreación
     * Define los tipos permitidos en el sistema
     */
    const mediaTypes = useMemo(() => [
        { value: 'todos', label: 'Todos los tipos' },
        { value: 'Dato Curioso', label: 'Dato Curioso' },
        { value: 'Tip', label: 'Tip' },
        { value: 'Blog', label: 'Blog' }
    ], []);

    /**
     * Configuraciones de validación de archivos - memoizadas
     * Define límites de tamaño y tipos MIME permitidos
     */
    const validationConfig = useMemo(() => ({
        maxSizes: {
            image: 5 * 1024 * 1024,  // 5MB para imágenes
            video: 50 * 1024 * 1024  // 50MB para videos
        },
        allowedTypes: {
            image: [
                'image/jpeg', 
                'image/jpg', 
                'image/png', 
                'image/gif', 
                'image/webp'
            ],
            video: [
                'video/mp4', 
                'video/mov', 
                'video/avi', 
                'video/webm',
                'video/quicktime'
            ]
        },
        // Extensiones permitidas para mostrar en mensajes de error
        allowedExtensions: {
            image: ['JPG', 'JPEG', 'PNG', 'GIF', 'WEBP'],
            video: ['MP4', 'MOV', 'AVI', 'WEBM']
        }
    }), []);

    /**
     * Función para obtener el icono apropiado según el tipo de archivo
     * Optimizada con useCallback para evitar recreación en cada render
     * 
     * @param {Object} item - Elemento multimedia con URLs de imagen y video
     * @returns {Object} Objeto con tipo e icono JSX
     */
    const getFileIcon = useCallback((item) => {
        // Verificar si tiene URLs válidas
        const hasImage = item?.imageURL && item.imageURL.trim() !== "";
        const hasVideo = item?.videoURL && item.videoURL.trim() !== "";

        // Retornar icono según combinación de archivos
        if (hasImage && hasVideo) {
            return {
                type: 'both',
                component: (
                    <div className="flex items-center gap-1">
                        {/* Icono de imagen */}
                        <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                        {/* Icono de video */}
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

    /**
     * Función para formatear fechas en formato español
     * Optimizada con useCallback y manejo robusto de errores
     * 
     * @param {string|Date} dateString - Fecha a formatear
     * @returns {string} Fecha formateada o mensaje de error
     */
    const formatDate = useCallback((dateString) => {
        try {
            if (!dateString) {
                return 'Fecha no disponible';
            }

            const date = new Date(dateString);
            
            // Verificar si la fecha es válida
            if (isNaN(date.getTime())) {
                console.warn('Fecha inválida recibida:', dateString);
                return 'Fecha inválida';
            }

            return date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        } catch (error) {
            console.error('Error al formatear fecha:', error, 'Input:', dateString);
            return 'Error en fecha';
        }
    }, []);

    /**
     * Función para formatear tiempo relativo (hace X tiempo)
     * Útil para mostrar cuándo fue creado/modificado un elemento
     * 
     * @param {string|Date} dateString - Fecha a comparar con ahora
     * @returns {string} Tiempo relativo formateado
     */
    const formatRelativeTime = useCallback((dateString) => {
        try {
            if (!dateString) {
                return 'Fecha no disponible';
            }

            const date = new Date(dateString);
            const now = new Date();
            
            // Verificar si la fecha es válida
            if (isNaN(date.getTime())) {
                return formatDate(dateString); // Fallback a fecha normal
            }

            const diffInSeconds = Math.floor((now - date) / 1000);

            // Calcular tiempo relativo
            if (diffInSeconds < 60) {
                return 'Hace un momento';
            } else if (diffInSeconds < 3600) {
                const minutes = Math.floor(diffInSeconds / 60);
                return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
            } else if (diffInSeconds < 86400) {
                const hours = Math.floor(diffInSeconds / 3600);
                return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
            } else if (diffInSeconds < 2592000) {
                const days = Math.floor(diffInSeconds / 86400);
                return `Hace ${days} día${days > 1 ? 's' : ''}`;
            } else {
                // Para fechas muy antiguas, mostrar fecha formateada
                return formatDate(dateString);
            }
        } catch (error) {
            console.error('Error al formatear tiempo relativo:', error);
            return formatDate(dateString);
        }
    }, [formatDate]);

    /**
     * Función para copiar texto al portapapeles
     * Incluye fallback para navegadores sin soporte moderno
     * 
     * @param {string} text - Texto a copiar
     * @returns {Promise<Object>} Resultado de la operación
     */
    const copyToClipboard = useCallback(async (text) => {
        if (!text || typeof text !== 'string') {
            return { 
                success: false, 
                error: 'No hay texto válido para copiar' 
            };
        }

        try {
            // Verificar si está disponible la API moderna del portapapeles
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                console.log('✅ Texto copiado usando API moderna:', text.substring(0, 50) + '...');
                return { success: true };
            } else {
                // Fallback para navegadores sin soporte o contextos no seguros
                console.log('⚠️ Usando fallback para copiar al portapapeles');
                
                const textArea = document.createElement('textarea');
                textArea.value = text;
                
                // Configurar elemento temporal para ser invisible
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                textArea.style.opacity = '0';
                
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                
                try {
                    const successful = document.execCommand('copy');
                    document.body.removeChild(textArea);
                    
                    if (successful) {
                        console.log('✅ Texto copiado usando execCommand');
                        return { success: true };
                    } else {
                        return { 
                            success: false, 
                            error: 'No se pudo copiar usando execCommand' 
                        };
                    }
                } catch (err) {
                    document.body.removeChild(textArea);
                    console.error('❌ Error con execCommand:', err);
                    return { 
                        success: false, 
                        error: 'Error al ejecutar comando de copia' 
                    };
                }
            }
        } catch (error) {
            console.error('❌ Error al copiar al portapapeles:', error);
            return { 
                success: false, 
                error: 'No se pudo acceder al portapapeles' 
            };
        }
    }, []);

    /**
     * Función principal para validar archivos
     * Verifica tamaño, tipo MIME y otras restricciones
     * 
     * @param {File} file - Archivo a validar
     * @param {string} type - Tipo esperado ('image' o 'video')
     * @returns {Object} Resultado de la validación
     */
    const validateFile = useCallback((file, type = 'image') => {
        console.log(`🔍 Validando archivo ${type}:`, file?.name, `(${file?.size} bytes)`);

        // Verificar si el archivo existe
        if (!file) {
            return { 
                valid: false, 
                error: 'No se ha seleccionado ningún archivo' 
            };
        }

        // Verificar si es una instancia de File
        if (!(file instanceof File)) {
            return { 
                valid: false, 
                error: 'El objeto seleccionado no es un archivo válido' 
            };
        }

        // Validar que el tipo sea soportado
        if (!['image', 'video'].includes(type)) {
            return { 
                valid: false, 
                error: 'Tipo de archivo no soportado para validación' 
            };
        }

        // Validar tamaño del archivo
        const maxSize = validationConfig.maxSizes[type];
        if (file.size > maxSize) {
            const maxSizeMB = Math.round(maxSize / (1024 * 1024));
            const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
            
            console.error(`❌ Archivo demasiado grande: ${fileSizeMB}MB > ${maxSizeMB}MB`);
            return { 
                valid: false, 
                error: `El archivo es demasiado grande (${fileSizeMB}MB). Máximo permitido: ${maxSizeMB}MB` 
            };
        }

        // Validar tipo MIME
        const allowedMimeTypes = validationConfig.allowedTypes[type];
        if (!allowedMimeTypes.includes(file.type)) {
            const allowedExtensions = validationConfig.allowedExtensions[type].join(', ');
            
            console.error(`❌ Tipo MIME no válido: ${file.type}`);
            return { 
                valid: false, 
                error: `Tipo de archivo no válido. Formatos permitidos: ${allowedExtensions}` 
            };
        }

        // Validaciones adicionales específicas por tipo
        if (type === 'image') {
            // Para imágenes, verificar que no esté corrupta (básico)
            if (file.size < 100) { // Muy pequeña para ser una imagen válida
                return { 
                    valid: false, 
                    error: 'El archivo de imagen parece estar corrupto o incompleto' 
                };
            }
        }

        if (type === 'video') {
            // Para videos, verificar tamaño mínimo
            if (file.size < 1000) { // Muy pequeño para ser un video válido
                return { 
                    valid: false, 
                    error: 'El archivo de video parece estar corrupto o incompleto' 
                };
            }
        }

        console.log(`✅ Archivo ${type} válido:`, file.name);
        return { valid: true };

    }, [validationConfig]);

    /**
     * Función para obtener información formateada de un archivo
     * Útil para mostrar detalles en la UI
     * 
     * @param {File} file - Archivo del cual obtener información
     * @returns {string} Información formateada del archivo
     */
    const getFileInfo = useCallback((file) => {
        if (!file || !(file instanceof File)) {
            return '';
        }
        
        try {
            const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
            const fileType = file.type.split('/')[1]?.toUpperCase() || 'UNKNOWN';
            
            return `${file.name} (${sizeInMB} MB, ${fileType})`;
        } catch (error) {
            console.error('Error al obtener información del archivo:', error);
            return file.name || 'Archivo desconocido';
        }
    }, []);

    /**
     * Función para generar colores de badge según el tipo de contenido
     * Útil para mostrar tipos visualmente distintos
     * 
     * @param {string} type - Tipo de contenido
     * @returns {string} Clases CSS para el badge
     */
    const getTypeBadgeColor = useCallback((type) => {
        const colors = {
            'Dato Curioso': 'bg-blue-100 text-blue-800 border-blue-300',
            'Tip': 'bg-green-100 text-green-800 border-green-300',
            'Blog': 'bg-purple-100 text-purple-800 border-purple-300'
        };
        
        return colors[type] || 'bg-gray-100 text-gray-800 border-gray-300';
    }, []);

    /**
     * Función para obtener estadísticas de archivos en una lista
     * Útil para dashboards y resúmenes
     * 
     * @param {Array} items - Lista de elementos multimedia
     * @returns {Object} Estadísticas de archivos
     */
    const getFileStats = useCallback((items) => {
        if (!Array.isArray(items)) {
            console.warn('getFileStats: se esperaba un array, recibido:', typeof items);
            return { withImage: 0, withVideo: 0, withBoth: 0, withNone: 0, total: 0 };
        }

        return items.reduce((stats, item) => {
            if (!item) return stats;

            const hasImage = item.imageURL && item.imageURL.trim() !== "";
            const hasVideo = item.videoURL && item.videoURL.trim() !== "";

            if (hasImage && hasVideo) {
                stats.withBoth++;
            } else if (hasImage) {
                stats.withImage++;
            } else if (hasVideo) {
                stats.withVideo++;
            } else {
                stats.withNone++;
            }

            stats.total++;
            return stats;
        }, { 
            withImage: 0, 
            withVideo: 0, 
            withBoth: 0, 
            withNone: 0, 
            total: 0 
        });
    }, []);

    /**
     * Función para truncar texto de manera inteligente
     * Mantiene palabras completas cuando es posible
     * 
     * @param {string} text - Texto a truncar
     * @param {number} maxLength - Longitud máxima
     * @param {boolean} preserveWords - Si debe preservar palabras completas
     * @returns {string} Texto truncado
     */
    const truncateText = useCallback((text, maxLength = 50, preserveWords = true) => {
        if (!text || typeof text !== 'string') {
            return '';
        }

        if (text.length <= maxLength) {
            return text;
        }

        if (preserveWords) {
            // Truncar preservando palabras completas
            const truncated = text.substring(0, maxLength);
            const lastSpaceIndex = truncated.lastIndexOf(' ');
            
            if (lastSpaceIndex > maxLength * 0.7) { // Si el último espacio está razonablemente cerca
                return truncated.substring(0, lastSpaceIndex) + '...';
            }
        }

        // Truncar de manera simple
        return text.substring(0, maxLength) + '...';
    }, []);

    /**
     * Función para formatear tamaños de archivo de manera legible
     * 
     * @param {number} bytes - Tamaño en bytes
     * @param {number} decimals - Número de decimales a mostrar
     * @returns {string} Tamaño formateado
     */
    const formatFileSize = useCallback((bytes, decimals = 2) => {
        if (!bytes || bytes === 0) return '0 Bytes';

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }, []);

    /**
     * Función para validar URLs de manera básica
     * 
     * @param {string} url - URL a validar
     * @returns {Object} Resultado de la validación
     */
    const validateUrl = useCallback((url) => {
        if (!url || typeof url !== 'string') {
            return { valid: false, error: 'URL no proporcionada' };
        }

        try {
            const urlObject = new URL(url);
            
            // Verificar protocolo
            if (!['http:', 'https:'].includes(urlObject.protocol)) {
                return { valid: false, error: 'La URL debe usar protocolo HTTP o HTTPS' };
            }

            return { valid: true };
        } catch (error) {
            return { valid: false, error: 'Formato de URL inválido' };
        }
    }, []);

    // Retornar todas las utilidades disponibles
    return {
        // Constantes y configuraciones
        mediaTypes,
        validationConfig,
        
        // Funciones de formateo y presentación
        getFileIcon,
        formatDate,
        formatRelativeTime,
        getTypeBadgeColor,
        truncateText,
        formatFileSize,
        
        // Funciones de validación
        validateFile,
        validateUrl,
        
        // Funciones de archivos
        getFileInfo,
        getFileStats,
        
        // Funciones de interacción
        copyToClipboard
    };
};