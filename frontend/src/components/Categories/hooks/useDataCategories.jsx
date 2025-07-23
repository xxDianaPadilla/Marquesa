import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

/**
 * Hook personalizado para manejar toda la lógica relacionada con las categorías
 * Proporciona funcionalidades CRUD completas con mejor manejo de estado y validaciones:
 * - Obtener, crear, editar y eliminar categorías
 * - Manejo de formularios con estados sincronizados
 * - Control de pestañas (lista/formulario)
 * - Gestión de estado de carga y errores
 * - Validaciones del lado cliente antes de enviar al servidor
 * 
 * @returns {Object} Objeto con estados y funciones para gestión de categorías
 */
const useDataCategories = () => {
    // ============ ESTADOS DE NAVEGACIÓN ============
    
    /**
     * Controla qué pestaña está activa en la interfaz
     * - "list": Muestra la tabla de categorías existentes
     * - "form": Muestra el formulario para crear/editar categorías
     */
    const [activeTab, setActiveTab] = useState("list");

    // ============ CONFIGURACIÓN DE API ============
    
    // URL base para todas las operaciones de categorías
    const API = "http://localhost:4000/api/categories";

    // ============ ESTADOS DEL FORMULARIO ============
    
    // Estados para el formulario de edición/creación de categorías
    const [id, setId] = useState(""); // ID de la categoría (para edición)
    const [name, setName] = useState(""); // Nombre de la categoría
    const [image, setImage] = useState(null); // Archivo de imagen seleccionado

    // ============ ESTADOS DE DATOS Y UI ============
    
    const [categories, setCategories] = useState([]); // Lista de todas las categorías
    const [loading, setLoading] = useState(true); // Estado de carga general
    const [submitting, setSubmitting] = useState(false); // Estado de envío de formulario

    // ============ FUNCIONES DE VALIDACIÓN DEL LADO CLIENTE ============
    
    /**
     * Valida los datos del formulario antes de enviar al servidor
     * Proporciona validación consistente tanto para crear como para editar
     * 
     * @param {string} categoryName - Nombre de la categoría a validar
     * @param {File|string|null} categoryImage - Imagen a validar
     * @param {boolean} isEditing - Si estamos en modo edición
     * @returns {Object} Objeto con isValid (boolean) y errors (array)
     */
    const validateCategoryData = (categoryName, categoryImage, isEditing = false) => {
        console.log('🔍 Validando datos de categoría:', { categoryName, categoryImage, isEditing });
        
        const errors = [];
        
        // ---- Validaciones del nombre ----
        if (!categoryName || typeof categoryName !== 'string') {
            errors.push('El nombre es requerido');
        } else {
            const trimmedName = categoryName.trim();
            
            if (trimmedName.length === 0) {
                errors.push('El nombre no puede estar vacío');
            } else if (trimmedName.length < 2) {
                errors.push('El nombre debe tener al menos 2 caracteres');
            } else if (trimmedName.length > 50) {
                errors.push('El nombre no puede superar los 50 caracteres');
            } else if (/^\d+$/.test(trimmedName)) {
                errors.push('El nombre no puede contener solo números');
            } else if (!/\S/.test(trimmedName)) {
                errors.push('El nombre no puede ser solo espacios en blanco');
            } else if (/[<>\"'%;()&+]/.test(trimmedName)) {
                errors.push('El nombre contiene caracteres no permitidos');
            } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-_.,!?0-9]+$/.test(trimmedName)) {
                errors.push('El nombre solo puede contener letras, números, espacios y puntuación básica');
            }
        }
        
        // ---- Validaciones de la imagen ----
        if (!categoryImage) {
            errors.push('La imagen es requerida');
        } else if (categoryImage instanceof File) {
            // Validar archivo nuevo
            if (categoryImage.size > 5 * 1024 * 1024) {
                errors.push('La imagen no puede superar los 5MB');
            }
            
            if (!categoryImage.type.startsWith('image/')) {
                errors.push('El archivo debe ser una imagen');
            }
            
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(categoryImage.type)) {
                errors.push('Formato de imagen no soportado. Use JPG, PNG, GIF o WebP');
            }
            
            if (!/^[a-zA-Z0-9._-]+\.(jpg|jpeg|png|gif|webp)$/i.test(categoryImage.name)) {
                errors.push('Nombre de archivo inválido');
            }
        } else if (typeof categoryImage === 'string') {
            // Validar URL existente (modo edición)
            if (categoryImage.trim().length === 0) {
                errors.push('La imagen es requerida');
            }
        }
        
        const isValid = errors.length === 0;
        
        console.log(isValid ? '✅ Validación exitosa' : '❌ Errores de validación:', errors);
        
        return { isValid, errors };
    };

    // ============ FUNCIÓN PARA OBTENER CATEGORÍAS ============
    
    /**
     * Obtiene todas las categorías desde el servidor
     * Maneja la nueva estructura de respuesta del controlador actualizado
     * Incluye manejo de errores robusto
     */
    const fetchCategories = async () => {
        try {
            console.log('📡 Obteniendo categorías del servidor...');
            setLoading(true);
            
            const response = await fetch(API, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            // Verificar que la respuesta sea exitosa
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Error del servidor:', response.status, errorText);
                throw new Error(`Error del servidor: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('📦 Datos recibidos del servidor:', data);
            
            // Manejar la nueva estructura de respuesta { success, message, data }
            if (data.success && Array.isArray(data.data)) {
                console.log(`✅ ${data.data.length} categorías cargadas exitosamente`);
                setCategories(data.data);
            } else if (Array.isArray(data)) {
                // Retrocompatibilidad con controladores que devuelven array directo
                console.log(`✅ ${data.length} categorías cargadas (formato anterior)`);
                setCategories(data);
            } else {
                console.error('❌ Formato de respuesta inesperado:', data);
                throw new Error("Formato de respuesta inválido del servidor");
            }
            
        } catch (error) {
            console.error("❌ Error al obtener categorías:", error);
            toast.error("Error al cargar las categorías. Por favor, intente nuevamente.");
            setCategories([]); // Establecer array vacío en caso de error
        } finally {
            setLoading(false);
        }
    };

    // ============ EFECTO DE INICIALIZACIÓN ============
    
    /**
     * Efecto que se ejecuta una sola vez al montar el componente
     * Carga las categorías iniciales desde el servidor
     */
    useEffect(() => {
        console.log('🚀 Inicializando hook de categorías...');
        fetchCategories();
    }, []); // Array vacío = solo se ejecuta una vez

    // ============ FUNCIONES DE LIMPIEZA DE FORMULARIO ============
    
    /**
     * Limpia todos los campos del formulario y resetea el estado
     * Utilizada después de operaciones exitosas o al cancelar
     */
    const clearFormData = () => {
        console.log('🧹 Limpiando datos del formulario');
        setId("");
        setName("");
        setImage(null);
        setSubmitting(false);
    };

    /**
     * Resetea el formulario y vuelve a la vista de lista
     * Función helper para operaciones exitosas
     */
    const resetFormAndGoToList = () => {
        clearFormData();
        setActiveTab("list");
    };

    // ============ FUNCIÓN PARA CREAR CATEGORÍA ============
    
    /**
     * Crea una nueva categoría en el servidor
     * Incluye validaciones del lado cliente y manejo de archivos
     * Previene envíos múltiples con estado de submitting
     * 
     * @param {Event} e - Evento del formulario para prevenir recarga de página
     */
    const createCategorie = async (e) => {
        e.preventDefault();
        
        // Prevenir envíos múltiples
        if (submitting) {
            console.log('⏳ Ya hay una operación en progreso, ignorando...');
            return;
        }
        
        console.log('➕ Iniciando creación de categoría...');
        setSubmitting(true);

        try {
            // Obtener los datos del evento simulado del formulario
            const formName = e.target.name.value;
            const formImage = e.target.image.value;
            
            console.log('📋 Datos recibidos del formulario:', { formName, formImage });

            // ---- Validaciones del lado cliente con los datos reales ----
            const validation = validateCategoryData(formName, formImage, false);
            
            if (!validation.isValid) {
                // Mostrar todos los errores de validación
                validation.errors.forEach(error => toast.error(error));
                return;
            }

            // ---- Preparar datos para envío ----
            const formData = new FormData();
            formData.append("name", formName.trim()); // Nombre sin espacios extra
            formData.append("image", formImage); // Archivo de imagen

            console.log('📤 Enviando datos de nueva categoría:', {
                name: formName.trim(),
                imageSize: formImage.size,
                imageType: formImage.type
            });

            // ---- Enviar petición POST al servidor ----
            const response = await fetch(API, {
                method: "POST",
                body: formData // FormData se envía sin Content-Type header
            });

            // Parsear respuesta del servidor
            const result = await response.json();
            console.log('📨 Respuesta del servidor:', result);

            // ---- Verificar si la operación fue exitosa ----
            if (!response.ok) {
                // Mostrar mensaje de error específico del backend
                const errorMessage = result.message || `Error del servidor: ${response.status}`;
                throw new Error(errorMessage);
            }

            // ---- Manejar éxito ----
            console.log('✅ Categoría creada exitosamente:', result);
            
            // Mostrar mensaje de éxito
            toast.success(result.message || 'Categoría registrada exitosamente');
            
            // Actualizar lista de categorías
            await fetchCategories();
            
            // Limpiar formulario y volver a la lista
            resetFormAndGoToList();
            
        } catch (error) {
            console.error("❌ Error al crear categoría:", error);
            toast.error(error.message || "Error al crear la categoría. Por favor, intente nuevamente.");
        } finally {
            setSubmitting(false);
        }
    };

    // ============ FUNCIÓN PARA ELIMINAR CATEGORÍA ============
    
    /**
     * Elimina una categoría específica del servidor
     * Incluye confirmación implícita (manejada por el componente CategoryActions)
     * 
     * @param {string} categoryId - ID de la categoría a eliminar
     */
    const deleteCategorie = async (categoryId) => {
        // Validar ID de categoría
        if (!categoryId || typeof categoryId !== 'string') {
            console.error('❌ ID de categoría inválido:', categoryId);
            toast.error('Error: ID de categoría inválido');
            return;
        }

        try {
            console.log(`🗑️ Eliminando categoría con ID: ${categoryId}`);
            
            // ---- Enviar petición DELETE al servidor ----
            const response = await fetch(`${API}/${categoryId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            // Parsear respuesta del servidor
            const result = await response.json();
            console.log('📨 Respuesta de eliminación:', result);

            // ---- Verificar si la eliminación fue exitosa ----
            if (!response.ok) {
                const errorMessage = result.message || `Error del servidor: ${response.status}`;
                throw new Error(errorMessage);
            }

            // ---- Manejar éxito ----
            console.log('✅ Categoría eliminada exitosamente');
            
            // Mostrar mensaje de éxito
            toast.success(result.message || 'Categoría eliminada exitosamente');
            
            // Actualizar lista de categorías
            await fetchCategories();
            
        } catch (error) {
            console.error("❌ Error al eliminar categoría:", error);
            toast.error(error.message || "Error al eliminar la categoría. Por favor, intente nuevamente.");
        }
    };

    // ============ FUNCIÓN PARA PREPARAR EDICIÓN ============
    
    /**
     * Prepara el formulario para editar una categoría existente
     * Cambia a la pestaña de formulario y llena los campos con datos actuales
     * Incluye validación de los datos de entrada
     * 
     * @param {Object} dataCategorie - Objeto con datos de la categoría a editar
     */
    const updateCategorie = (dataCategorie) => {
        // Validar que se proporcionen datos válidos
        if (!dataCategorie || typeof dataCategorie !== 'object') {
            console.error('❌ Datos de categoría inválidos para edición:', dataCategorie);
            toast.error('Error: Datos de categoría inválidos');
            return;
        }

        // Validar que tenga los campos requeridos
        if (!dataCategorie._id || !dataCategorie.name) {
            console.error('❌ Faltan campos requeridos en datos de categoría:', dataCategorie);
            toast.error('Error: Datos de categoría incompletos');
            return;
        }

        console.log("📝 Preparando edición de categoría:", dataCategorie);
        
        try {
            // ---- Llenar campos del formulario ----
            setId(dataCategorie._id); // Guardar ID para la actualización
            setName(dataCategorie.name || ""); // Llenar campo nombre
            setImage(dataCategorie.image || null); // Establecer imagen actual (URL)
            
            // ---- Cambiar a vista de formulario ----
            setActiveTab("form");
            
            console.log(`✅ Formulario preparado para editar: ${dataCategorie.name}`);
        } catch (error) {
            console.error('❌ Error al preparar edición:', error);
            toast.error('Error al preparar la edición');
        }
    };

    // ============ FUNCIÓN PARA GUARDAR EDICIÓN ============
    
    /**
     * Guarda los cambios de una categoría editada en el servidor
     * Maneja tanto cambios de texto como de imagen
     * Incluye validaciones y prevención de envíos múltiples
     * 
     * @param {Event} e - Evento del formulario
     */
    const handleEdit = async (e) => {
        e.preventDefault();
        
        // Prevenir envíos múltiples
        if (submitting) {
            console.log('⏳ Ya hay una operación en progreso, ignorando...');
            return;
        }

        // Validar que tengamos un ID de categoría
        if (!id) {
            console.error('❌ No hay ID de categoría para editar');
            toast.error('Error: No se puede identificar la categoría a editar');
            return;
        }

        console.log(`💾 Guardando cambios en categoría ID: ${id}`);
        setSubmitting(true);

        try {
            // Obtener los datos del evento simulado del formulario
            const formName = e.target.name.value;
            const formImage = e.target.image.value;
            
            console.log('📋 Datos recibidos del formulario para edición:', { formName, formImage });

            // ---- Validaciones del lado cliente con los datos reales ----
            const validation = validateCategoryData(formName, formImage, true);
            
            if (!validation.isValid) {
                // Mostrar todos los errores de validación
                validation.errors.forEach(error => toast.error(error));
                return;
            }

            let response;

            // ---- Determinar tipo de actualización según el tipo de imagen ----
            if (formImage instanceof File) {
                // Caso 1: Se seleccionó una nueva imagen (usar FormData)
                console.log('📁 Actualizando con nueva imagen');
                
                const formData = new FormData();
                formData.append("name", formName.trim());
                formData.append("image", formImage);

                response = await fetch(`${API}/${id}`, {
                    method: "PUT",
                    body: formData
                });
            } else {
                // Caso 2: Solo cambio de texto o imagen existente (usar JSON)
                console.log('📝 Actualizando solo texto o manteniendo imagen existente');
                
                response = await fetch(`${API}/${id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ 
                        name: formName.trim(), 
                        image: formImage 
                    }),
                });
            }

            // ---- Procesar respuesta ----
            const result = await response.json();
            console.log('📨 Respuesta de actualización:', result);

            if (!response.ok) {
                const errorMessage = result.message || `Error del servidor: ${response.status}`;
                throw new Error(errorMessage);
            }

            // ---- Manejar éxito ----
            console.log('✅ Categoría actualizada exitosamente');
            
            // Mostrar mensaje de éxito
            toast.success(result.message || 'Categoría actualizada exitosamente');
            
            // Actualizar lista de categorías
            await fetchCategories();
            
            // Limpiar formulario y volver a la lista
            resetFormAndGoToList();
            
        } catch (error) {
            console.error("❌ Error al editar la categoría:", error);
            toast.error(error.message || "Error al actualizar la categoría. Por favor, intente nuevamente.");
        } finally {
            setSubmitting(false);
        }
    };

    // ============ FUNCIONES AUXILIARES PARA MANEJO DE ESTADO ============
    
    /**
     * Cancela cualquier operación en curso y limpia el formulario
     * Útil para botones de cancelar
     */
    const cancelOperation = () => {
        console.log('❌ Cancelando operación y limpiando formulario');
        clearFormData();
        setActiveTab("list");
    };

    /**
     * Verifica si hay una operación en progreso
     * Útil para deshabilitar botones o mostrar indicadores de carga
     * 
     * @returns {boolean} true si hay una operación en progreso
     */
    const isOperationInProgress = () => {
        return submitting || loading;
    };

    /**
     * Obtiene el estado actual del formulario
     * Útil para debugging o validaciones adicionales
     * 
     * @returns {Object} Estado actual del formulario
     */
    const getFormState = () => {
        return {
            id,
            name,
            image,
            isEditing: !!id,
            isValid: validateCategoryData(name, image, !!id).isValid
        };
    };

    // ============ RETORNO DEL HOOK ============
    
    /**
     * Retorna todos los estados y funciones necesarias para manejar categorías
     * Los componentes que usen este hook tendrán acceso a toda la funcionalidad
     * Incluye funciones auxiliares para mejor experiencia de usuario
     */
    return {
        // ---- Estados de navegación ----
        activeTab,          // Pestaña activa ("list" o "form")
        setActiveTab,       // Función para cambiar de pestaña

        // ---- Estados del formulario ----
        id,                 // ID de categoría (para edición)
        name,               // Nombre de la categoría
        setName,            // Función para actualizar el nombre
        image,              // Imagen seleccionada o URL actual
        setImage,           // Función para actualizar la imagen

        // ---- Estados de datos y UI ----
        categories,         // Array con todas las categorías
        setCategories,      // Función para actualizar la lista (uso interno)
        loading,            // Estado de carga booleano
        submitting,         // Estado de envío de formulario

        // ---- Funciones de operaciones CRUD ----
        createCategorie,    // Crear nueva categoría
        deleteCategorie,    // Eliminar categoría existente
        updateCategorie,    // Preparar edición de categoría
        handleEdit,         // Guardar cambios en categoría editada

        // ---- Funciones auxiliares ----
        clearFormData,      // Limpiar datos del formulario
        cancelOperation,    // Cancelar operación y limpiar
        isOperationInProgress, // Verificar si hay operación en progreso
        getFormState,       // Obtener estado actual del formulario
        validateCategoryData, // Función de validación (para uso externo si se necesita)
        
        // ---- Función de actualización manual ----
        fetchCategories,    // Refrescar lista de categorías manualmente
    };
}

export default useDataCategories;