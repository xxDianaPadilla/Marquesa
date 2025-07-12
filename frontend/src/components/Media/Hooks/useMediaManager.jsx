import { useState, useEffect, useCallback, useMemo } from 'react';

// Hook para manejar la lógica del administrador de medios
// Permite crear, editar, eliminar y filtrar elementos multimedia
export const useMediaManager = () => {
    const [mediaItems, setMediaItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados para filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('todos');

    // Estados para modales
    const [modals, setModals] = useState({
        upload: false,
        edit: false,
        delete: false
    });
    const [selectedItem, setSelectedItem] = useState(null);

    const API_BASE_URL = 'http://localhost:4000/api/media';

    // Función utilitaria para reintentos con mejor manejo de errores
    const fetchWithRetry = useCallback(async (url, options = {}, maxRetries = 3) => {
        let lastError;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const response = await fetch(url, {
                    ...options,
                    // Aumentar timeout para operaciones con archivos
                    timeout: 30000, // 30 segundos
                });

                // Obtener texto de respuesta para debugging
                const responseText = await response.text();

                if (!response.ok) {
                    // Intentar parsear como JSON para obtener error específico
                    let errorMessage = `Error ${response.status}: ${response.statusText}`;
                    try {
                        const errorData = JSON.parse(responseText);
                        if (errorData.message) {
                            errorMessage = errorData.message;
                        } else if (errorData.error) {
                            errorMessage = errorData.error;
                        }
                    } catch (parseError) {
                        // Si no es JSON válido, usar el texto completo
                        if (responseText) {
                            errorMessage = responseText;
                        }
                    }

                    console.error('Error Response:', {
                        status: response.status,
                        statusText: response.statusText,
                        responseText: responseText,
                        url: url,
                        method: options.method || 'GET'
                    });

                    throw new Error(errorMessage);
                }

                // Retornar respuesta parseada
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

                // Si es ECONNRESET y no es el último intento, reintentar
                if ((error.code === 'ECONNRESET' || error.name === 'TypeError') && attempt < maxRetries) {
                    console.log(`Reintentando... Intento ${attempt + 1}/${maxRetries}`);
                    // Espera exponencial: 1s, 2s, 4s
                    await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
                    continue;
                }

                throw error;
            }
        }

        throw lastError;
    }, []);

    // Filtros computados con useMemo para optimización
    const filteredItems = useMemo(() => {
        let filtered = mediaItems;

        // Filtrar por tipo
        if (selectedType !== 'todos') {
            filtered = filtered.filter(item => item && item.type === selectedType);
        }

        // Filtrar por término de búsqueda
        if (searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(item =>
                (item.title && item.title.toLowerCase().includes(searchLower)) ||
                (item.description && item.description.toLowerCase().includes(searchLower))
            );
        }

        return filtered;
    }, [mediaItems, selectedType, searchTerm]);

    // Estadísticas computadas con useMemo
    const stats = useMemo(() => ({
        total: mediaItems.length,
        datoCurioso: mediaItems.filter(item => item.type === 'Dato Curioso').length,
        tip: mediaItems.filter(item => item.type === 'Tip').length,
        blog: mediaItems.filter(item => item.type === 'Blog').length,
    }), [mediaItems]);

    // Fetch de elementos multimedia
    const fetchMediaItems = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetchWithRetry(API_BASE_URL);
            const data = await response.json();
            setMediaItems(data);

        } catch (error) {
            console.error('Error al cargar multimedia:', error);
            setError(error.message);

            // Datos mock para desarrollo
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

    // Función para convertir objeto a FormData
    const convertToFormData = useCallback((data) => {
        // Si ya es FormData, devolverlo tal como está
        if (data instanceof FormData) {
            return data;
        }

        // Si es un objeto, convertirlo a FormData
        const formData = new FormData();

        for (const [key, value] of Object.entries(data)) {
            if (value !== null && value !== undefined) {
                // Si es un archivo (File o Blob), agregarlo directamente
                if (value instanceof File || value instanceof Blob) {
                    formData.append(key, value);
                } else {
                    // Para otros tipos de datos, convertir a string
                    formData.append(key, String(value));
                }
            }
        }

        return formData;
    }, []);

    // Función para validar FormData antes de enviar
    const validateFormData = useCallback((formData) => {
        const errors = [];

        // Asegurarse de que sea FormData
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

        // Validar archivos (al menos uno debe existir para creación)
        const image = formData.get('image');
        const video = formData.get('video');

        if (!image && !video) {
            errors.push('Se requiere al menos una imagen o un video');
        }

        return { errors, formData };
    }, [convertToFormData]);

    // Función optimizada para crear elemento multimedia
    const createMediaItem = useCallback(async (data) => {
        try {
            setError(null);

            // Convertir a FormData si es necesario y validar
            const { errors, formData } = validateFormData(data);

            if (errors.length > 0) {
                throw new Error(`Datos inválidos: ${errors.join(', ')}`);
            }

            // Debug: Mostrar contenido del FormData
            console.log('FormData a enviar:');
            for (let [key, value] of formData.entries()) {
                if (value instanceof File) {
                    console.log(`${key}: File - ${value.name} (${value.size} bytes, ${value.type})`);
                } else {
                    console.log(`${key}: ${value}`);
                }
            }

            const response = await fetchWithRetry(API_BASE_URL, {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            // Actualizar estado local de forma optimizada
            setMediaItems(prev => [result.data, ...prev]);

            return { success: true, data: result.data };

        } catch (error) {
            console.error('Error al crear multimedia:', error);
            return { success: false, error: error.message };
        }
    }, [fetchWithRetry, validateFormData]);

    // Función optimizada para actualizar elemento multimedia con reintentos
    const updateMediaItem = useCallback(async (itemId, data) => {
        try {
            setError(null);

            // Convertir a FormData si es necesario
            const formData = convertToFormData(data);

            // Debug: Mostrar contenido del FormData para actualización
            console.log('FormData para actualización:');
            for (let [key, value] of formData.entries()) {
                if (value instanceof File) {
                    console.log(`${key}: File - ${value.name} (${value.size} bytes, ${value.type})`);
                } else {
                    console.log(`${key}: ${value}`);
                }
            }

            // Mostrar indicador de carga para operaciones largas
            const hasFiles = formData.get('image') || formData.get('video');
            if (hasFiles) {
                console.log('Actualizando con archivos... Esto puede tomar un momento.');
            }

            const response = await fetchWithRetry(`${API_BASE_URL}/${itemId}`, {
                method: 'PUT',
                body: formData,
            }, 5); // Más reintentos para updates con archivos

            const result = await response.json();

            // Actualizar estado local de forma optimizada
            setMediaItems(prev =>
                prev.map(item =>
                    item._id === itemId ? result.data : item
                )
            );

            return { success: true, data: result.data };

        } catch (error) {
            console.error('Error al actualizar multimedia:', error);

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

    // Función optimizada para eliminar elemento multimedia
    const deleteMediaItem = useCallback(async (itemId) => {
        try {
            setError(null);

            const response = await fetchWithRetry(`${API_BASE_URL}/${itemId}`, {
                method: 'DELETE',
            });

            // Actualizar estado local de forma optimizada
            setMediaItems(prev => prev.filter(item => item._id !== itemId));

            return { success: true };

        } catch (error) {
            console.error('Error al eliminar multimedia:', error);
            return { success: false, error: error.message };
        }
    }, [fetchWithRetry]);

    // Funciones optimizadas para manejar modales
    const openModal = useCallback((modalType, item = null) => {
        setModals(prev => ({ ...prev, [modalType]: true }));
        if (item) setSelectedItem(item);
    }, []);

    const closeModal = useCallback((modalType) => {
        setModals(prev => ({ ...prev, [modalType]: false }));
        if (modalType !== 'upload') setSelectedItem(null);
    }, []);

    const closeAllModals = useCallback(() => {
        setModals({ upload: false, edit: false, delete: false });
        setSelectedItem(null);
    }, []);

    // Función para refrescar datos
    const refreshItems = useCallback(() => {
        fetchMediaItems();
    }, [fetchMediaItems]);

    // Función optimizada para búsqueda
    const handleSearch = useCallback((newSearchTerm) => {
        setSearchTerm(newSearchTerm);
    }, []);

    // Función optimizada para filtro por tipo
    const handleTypeFilter = useCallback((newType) => {
        setSelectedType(newType);
    }, []);

    // Cargar datos iniciales
    useEffect(() => {
        fetchMediaItems();
    }, [fetchMediaItems]);

    // Limpiar selectedItem cuando se cierre el modal
    useEffect(() => {
        const hasOpenModal = Object.values(modals).some(isOpen => isOpen);
        if (!hasOpenModal && selectedItem) {
            setSelectedItem(null);
        }
    }, [modals, selectedItem]);

    return {
        // Estados principales
        mediaItems: filteredItems,
        allItems: mediaItems,
        loading,
        error,

        // Estados de filtros
        searchTerm,
        selectedType,

        // Estados de modales
        modals,
        selectedItem,

        // Estadísticas
        stats,

        // Acciones de API
        createMediaItem,
        updateMediaItem,
        deleteMediaItem,
        refreshItems,

        // Filtros optimizados
        setSearchTerm: handleSearch,
        setSelectedType: handleTypeFilter,

        // Modales optimizados
        openModal,
        closeModal,
        closeAllModals,

        // Utilidades
        setError
    };
};