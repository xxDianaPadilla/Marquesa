import { useState, useEffect, useCallback, useMemo } from 'react';

/**
 * Hook personalizado para gestionar el administrador de medios
 * Maneja todas las operaciones CRUD de elementos multimedia:
 * - Creación, edición, eliminación de medios
 * - Filtrado por tipo y búsqueda por texto
 * - Manejo de modales y estado de carga
 * - Estadísticas de medios
 * 
 * @returns {Object} Objeto con estados y funciones del administrador de medios
 */
export const useMediaManager = () => {
    // ============ ESTADOS PRINCIPALES ============
    
    const [mediaItems, setMediaItems] = useState([]); // Lista de elementos multimedia
    const [loading, setLoading] = useState(true); // Estado de carga general
    const [error, setError] = useState(null); // Mensajes de error

    // ============ ESTADOS PARA FILTROS ============
    
    const [searchTerm, setSearchTerm] = useState(''); // Término de búsqueda actual
    const [selectedType, setSelectedType] = useState('todos'); // Tipo de medio seleccionado

    // ============ ESTADOS PARA MODALES ============
    
    const [modals, setModals] = useState({
        upload: false,    // Modal de subida de nuevos medios
        edit: false,      // Modal de edición de medios existentes
        delete: false     // Modal de confirmación de eliminación
    });
    const [selectedItem, setSelectedItem] = useState(null); // Elemento seleccionado para edición/eliminación

    // ============ CONFIGURACIÓN DE API ============
    
    const API_BASE_URL = 'http://localhost:4000/api/media'; // URL base de la API de medios

    // ============ FUNCIONES DE PETICIONES HTTP ============
    
    /**
     * Función utilitaria para realizar peticiones HTTP con reintentos automáticos
     * Incluye manejo de errores mejorado y timeout personalizado
     * 
     * @param {string} url - URL completa del endpoint
     * @param {Object} options - Opciones de fetch (método, headers, body, etc.)
     * @param {number} maxRetries - Número máximo de reintentos (por defecto 3)
     * @returns {Promise<Response>} Respuesta HTTP procesada
     */
    const fetchWithRetry = useCallback(async (url, options = {}, maxRetries = 3) => {
        let lastError;

        // Intentar la petición con reintentos
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const response = await fetch(url, {
                    ...options,
                    timeout: 30000, // Timeout de 30 segundos para operaciones con archivos
                });

                // Obtener el texto de respuesta para debugging
                const responseText = await response.text();

                // Verificar si la respuesta HTTP fue exitosa
                if (!response.ok) {
                    // Intentar parsear el error como JSON para obtener detalles
                    let errorMessage = `Error ${response.status}: ${response.statusText}`;
                    try {
                        const errorData = JSON.parse(responseText);
                        if (errorData.message) {
                            errorMessage = errorData.message;
                        } else if (errorData.error) {
                            errorMessage = errorData.error;
                        }
                    } catch (parseError) {
                        // Si no es JSON válido, usar el texto completo como error
                        if (responseText) {
                            errorMessage = responseText;
                        }
                    }

                    // Log detallado del error para debugging
                    console.error('Error Response:', {
                        status: response.status,
                        statusText: response.statusText,
                        responseText: responseText,
                        url: url,
                        method: options.method || 'GET'
                    });

                    throw new Error(errorMessage);
                }

                // Retornar respuesta procesada con métodos helper
                try {
                    return {
                        ...response,
                        json: async () => JSON.parse(responseText),
                        text: async () => responseText
                    };
                } catch (parseError) {
                    console.error('Error parsing response:', parseError);
                    throw new Error('Error parsing server response');
                }
            } catch (error) {
                lastError = error;

                // Reintentar solo en errores de red y si no es el último intento
                if ((error.code === 'ECONNRESET' || error.name === 'TypeError') && attempt < maxRetries) {
                    console.log(`Reintentando... Intento ${attempt + 1}/${maxRetries}`);
                    // Espera exponencial: 1s, 2s, 4s
                    await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
                    continue;
                }

                // Si no se puede reintentar, lanzar el último error
                throw error;
            }
        }

        // Si se agotaron todos los reintentos, lanzar el último error
        throw lastError;
    }, []);

    // ============ FILTROS Y ESTADÍSTICAS COMPUTADAS ============
    
    /**
     * Lista filtrada de elementos multimedia
     * Se recalcula automáticamente cuando cambian los filtros o la lista de medios
     */
    const filteredItems = useMemo(() => {
        let filtered = mediaItems;

        // Filtrar por tipo de medio
        if (selectedType !== 'todos') {
            filtered = filtered.filter(item => item && item.type === selectedType);
        }

        // Filtrar por término de búsqueda (título y descripción)
        if (searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(item =>
                (item.title && item.title.toLowerCase().includes(searchLower)) ||
                (item.description && item.description.toLowerCase().includes(searchLower))
            );
        }

        return filtered;
    }, [mediaItems, selectedType, searchTerm]);

    /**
     * Estadísticas computadas de los elementos multimedia
     * Cuenta total y por cada tipo de medio
     */
    const stats = useMemo(() => ({
        total: mediaItems.length,
        datoCurioso: mediaItems.filter(item => item.type === 'Dato Curioso').length,
        tip: mediaItems.filter(item => item.type === 'Tip').length,
        blog: mediaItems.filter(item => item.type === 'Blog').length,
    }), [mediaItems]);

    // ============ FUNCIONES DE OBTENCIÓN DE DATOS ============
    
    /**
     * Obtiene todos los elementos multimedia del servidor
     * Incluye manejo de errores y datos mock para desarrollo
     */
    const fetchMediaItems = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('📡 Obteniendo elementos multimedia...');
            const response = await fetchWithRetry(API_BASE_URL);
            const data = await response.json();
            
            console.log('✅ Elementos multimedia obtenidos:', data.length);
            setMediaItems(data);

        } catch (error) {
            console.error('❌ Error al cargar multimedia:', error);
            setError(error.message);

            // Datos mock para desarrollo cuando el servidor no está disponible
            console.log('🔧 Usando datos mock para desarrollo');
            const mockData = [
                {
                    _id: "1",
                    type: "Dato Curioso",
                    title: "Dato curioso sobre flores",
                    description: "Las flores pueden comunicarse entre sí",
                    imageURL: "https://example.com/image1.jpg",
                    videoURL: "",
                    createdAt: new Date().toISOString()
                },
                {
                    _id: "2",
                    type: "Tip",
                    title: "Tip para cuidar flores",
                    description: "Cambia el agua cada 2 días",
                    imageURL: "",
                    videoURL: "https://example.com/video1.mp4",
                    createdAt: new Date().toISOString()
                }
            ];
            setMediaItems(mockData);

        } finally {
            setLoading(false);
        }
    }, [fetchWithRetry]);

    // ============ FUNCIONES DE UTILIDAD PARA DATOS ============
    
    /**
     * Convierte un objeto a FormData para envío de archivos
     * Maneja automáticamente archivos (File/Blob) y datos primitivos
     * 
     * @param {Object|FormData} data - Datos a convertir
     * @returns {FormData} Objeto FormData listo para envío
     */
    const convertToFormData = useCallback((data) => {
        // Si ya es FormData, devolverlo tal como está
        if (data instanceof FormData) {
            return data;
        }

        // Convertir objeto a FormData
        const formData = new FormData();

        for (const [key, value] of Object.entries(data)) {
            if (value !== null && value !== undefined) {
                // Archivos se agregan directamente
                if (value instanceof File || value instanceof Blob) {
                    formData.append(key, value);
                } else {
                    // Otros tipos se convierten a string
                    formData.append(key, String(value));
                }
            }
        }

        return formData;
    }, []);

    /**
     * Valida los datos de FormData antes de enviar al servidor
     * Verifica campos requeridos y existencia de archivos multimedia
     * 
     * @param {FormData|Object} formData - Datos a validar
     * @returns {Object} Objeto con errores encontrados y FormData procesado
     */
    const validateFormData = useCallback((formData) => {
        const errors = [];

        // Asegurar que sea FormData
        if (!(formData instanceof FormData)) {
            formData = convertToFormData(formData);
        }

        // Validar campos requeridos
        const type = formData.get('type');
        const title = formData.get('title');
        const description = formData.get('description');

        if (!type || String(type).trim() === '') {
            errors.push('El tipo es requerido');
        }

        if (!title || String(title).trim() === '') {
            errors.push('El título es requerido');
        }

        if (!description || String(description).trim() === '') {
            errors.push('La descripción es requerida');
        }

        // Validar que existe al menos un archivo multimedia
        const image = formData.get('image');
        const video = formData.get('video');

        if (!image && !video) {
            errors.push('Se requiere al menos una imagen o un video');
        }

        return { errors, formData };
    }, [convertToFormData]);

    // ============ FUNCIONES CRUD ============
    
    /**
     * Crea un nuevo elemento multimedia en el servidor
     * Incluye validación de datos y manejo optimista del estado
     * 
     * @param {Object|FormData} data - Datos del nuevo elemento
     * @returns {Promise<Object>} Resultado de la operación con éxito/error
     */
    const createMediaItem = useCallback(async (data) => {
        try {
            setError(null);
            console.log('📝 Creando nuevo elemento multimedia...');

            // Convertir y validar datos
            const { errors, formData } = validateFormData(data);

            if (errors.length > 0) {
                throw new Error(`Datos inválidos: ${errors.join(', ')}`);
            }

            // Debug: Mostrar contenido del FormData
            console.log('📋 FormData a enviar:');
            for (let [key, value] of formData.entries()) {
                if (value instanceof File) {
                    console.log(`${key}: File - ${value.name} (${value.size} bytes, ${value.type})`);
                } else {
                    console.log(`${key}: ${value}`);
                }
            }

            // Enviar petición al servidor
            const response = await fetchWithRetry(API_BASE_URL, {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            // Actualizar estado local de forma optimizada (agregar al inicio)
            setMediaItems(prev => [result.data, ...prev]);

            console.log('✅ Elemento multimedia creado exitosamente');
            return { success: true, data: result.data };

        } catch (error) {
            console.error('❌ Error al crear multimedia:', error);
            return { success: false, error: error.message };
        }
    }, [fetchWithRetry, validateFormData]);

    /**
     * Actualiza un elemento multimedia existente
     * Soporta actualizaciones parciales y manejo de archivos grandes
     * 
     * @param {string} itemId - ID del elemento a actualizar
     * @param {Object|FormData} data - Nuevos datos del elemento
     * @returns {Promise<Object>} Resultado de la operación
     */
    const updateMediaItem = useCallback(async (itemId, data) => {
        try {
            setError(null);
            console.log(`📝 Actualizando elemento multimedia: ${itemId}`);

            // Convertir a FormData si es necesario
            const formData = convertToFormData(data);

            // Debug: Mostrar contenido para actualización
            console.log('📋 FormData para actualización:');
            for (let [key, value] of formData.entries()) {
                if (value instanceof File) {
                    console.log(`${key}: File - ${value.name} (${value.size} bytes, ${value.type})`);
                } else {
                    console.log(`${key}: ${value}`);
                }
            }

            // Mostrar indicador para operaciones con archivos grandes
            const hasFiles = formData.get('image') || formData.get('video');
            if (hasFiles) {
                console.log('📁 Actualizando con archivos... Esto puede tomar un momento.');
            }

            // Enviar petición con más reintentos para archivos grandes
            const response = await fetchWithRetry(`${API_BASE_URL}/${itemId}`, {
                method: 'PUT',
                body: formData,
            }, 5); // 5 reintentos para updates con archivos

            const result = await response.json();

            // Actualizar estado local de forma optimizada
            setMediaItems(prev =>
                prev.map(item =>
                    item._id === itemId ? result.data : item
                )
            );

            console.log('✅ Elemento multimedia actualizado exitosamente');
            return { success: true, data: result.data };

        } catch (error) {
            console.error('❌ Error al actualizar multimedia:', error);

            // Proporcionar mensaje más específico según el tipo de error
            let errorMessage = error.message;
            if (error.code === 'ECONNRESET') {
                errorMessage = 'La conexión se interrumpió. Esto puede ocurrir al subir archivos grandes. Intenta de nuevo.';
            } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
                errorMessage = 'Error de conexión. Verifica tu conexión a internet e intenta nuevamente.';
            }

            return { success: false, error: errorMessage };
        }
    }, [fetchWithRetry, convertToFormData]);

    /**
     * Elimina un elemento multimedia del servidor
     * Actualiza inmediatamente el estado local para mejor UX
     * 
     * @param {string} itemId - ID del elemento a eliminar
     * @returns {Promise<Object>} Resultado de la operación
     */
    const deleteMediaItem = useCallback(async (itemId) => {
        try {
            setError(null);
            console.log(`🗑️ Eliminando elemento multimedia: ${itemId}`);

            // Enviar petición de eliminación
            const response = await fetchWithRetry(`${API_BASE_URL}/${itemId}`, {
                method: 'DELETE',
            });

            // Actualizar estado local inmediatamente (filtrar el elemento eliminado)
            setMediaItems(prev => prev.filter(item => item._id !== itemId));

            console.log('✅ Elemento multimedia eliminado exitosamente');
            return { success: true };

        } catch (error) {
            console.error('❌ Error al eliminar multimedia:', error);
            return { success: false, error: error.message };
        }
    }, [fetchWithRetry]);

    // ============ FUNCIONES DE MANEJO DE MODALES ============
    
    /**
     * Abre un modal específico y opcionalmente selecciona un elemento
     * 
     * @param {string} modalType - Tipo de modal ('upload', 'edit', 'delete')
     * @param {Object} item - Elemento a seleccionar (opcional)
     */
    const openModal = useCallback((modalType, item = null) => {
        console.log(`🔓 Abriendo modal: ${modalType}`);
        setModals(prev => ({ ...prev, [modalType]: true }));
        if (item) {
            console.log('📋 Elemento seleccionado:', item.title);
            setSelectedItem(item);
        }
    }, []);

    /**
     * Cierra un modal específico y limpia la selección si es necesario
     * 
     * @param {string} modalType - Tipo de modal a cerrar
     */
    const closeModal = useCallback((modalType) => {
        console.log(`🔒 Cerrando modal: ${modalType}`);
        setModals(prev => ({ ...prev, [modalType]: false }));
        if (modalType !== 'upload') {
            setSelectedItem(null);
        }
    }, []);

    /**
     * Cierra todos los modales y limpia las selecciones
     */
    const closeAllModals = useCallback(() => {
        console.log('🔒 Cerrando todos los modales');
        setModals({ upload: false, edit: false, delete: false });
        setSelectedItem(null);
    }, []);

    // ============ FUNCIONES DE FILTRADO Y BÚSQUEDA ============
    
    /**
     * Actualiza el término de búsqueda
     * 
     * @param {string} newSearchTerm - Nuevo término de búsqueda
     */
    const handleSearch = useCallback((newSearchTerm) => {
        console.log('🔍 Búsqueda actualizada:', newSearchTerm);
        setSearchTerm(newSearchTerm);
    }, []);

    /**
     * Actualiza el filtro de tipo de medio
     * 
     * @param {string} newType - Nuevo tipo seleccionado
     */
    const handleTypeFilter = useCallback((newType) => {
        console.log('🏷️ Filtro de tipo actualizado:', newType);
        setSelectedType(newType);
    }, []);

    /**
     * Refresca la lista de elementos desde el servidor
     */
    const refreshItems = useCallback(() => {
        console.log('🔄 Refrescando lista de elementos...');
        fetchMediaItems();
    }, [fetchMediaItems]);

    // ============ EFECTOS DE CICLO DE VIDA ============
    
    /**
     * Cargar datos iniciales al montar el componente
     */
    useEffect(() => {
        console.log('🚀 Inicializando useMediaManager...');
        fetchMediaItems();
    }, [fetchMediaItems]);

    /**
     * Limpiar elemento seleccionado cuando se cierran todos los modales
     */
    useEffect(() => {
        const hasOpenModal = Object.values(modals).some(isOpen => isOpen);
        if (!hasOpenModal && selectedItem) {
            console.log('🧹 Limpiando elemento seleccionado');
            setSelectedItem(null);
        }
    }, [modals, selectedItem]);

    // ============ RETORNO DEL HOOK ============
    
    return {
        // ---- Estados principales ----
        mediaItems: filteredItems,      // Lista filtrada de elementos multimedia
        allItems: mediaItems,           // Lista completa sin filtrar
        loading,                        // Estado de carga
        error,                          // Mensajes de error

        // ---- Estados de filtros ----
        searchTerm,                     // Término de búsqueda actual
        selectedType,                   // Tipo de medio seleccionado

        // ---- Estados de modales ----
        modals,                         // Estado de todos los modales
        selectedItem,                   // Elemento seleccionado para edición/eliminación

        // ---- Estadísticas ----
        stats,                          // Estadísticas computadas de medios

        // ---- Acciones de API ----
        createMediaItem,                // Crear nuevo elemento multimedia
        updateMediaItem,                // Actualizar elemento existente
        deleteMediaItem,                // Eliminar elemento
        refreshItems,                   // Refrescar lista desde servidor

        // ---- Filtros optimizados ----
        setSearchTerm: handleSearch,    // Actualizar búsqueda
        setSelectedType: handleTypeFilter, // Actualizar filtro de tipo

        // ---- Modales optimizados ----
        openModal,                      // Abrir modal específico
        closeModal,                     // Cerrar modal específico
        closeAllModals,                 // Cerrar todos los modales

        // ---- Utilidades ----
        setError                        // Función para establecer errores manualmente
    };
};