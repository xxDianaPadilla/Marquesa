import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

/**
 * Hook personalizado para manejar toda la lógica relacionada con las categorías
 * Proporciona funcionalidades CRUD completas:
 * - Obtener, crear, editar y eliminar categorías
 * - Manejo de formularios y validaciones
 * - Control de pestañas (lista/formulario)
 * - Gestión de estado de carga y errores
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

    // ============ ESTADOS DE DATOS ============
    
    const [categories, setCategories] = useState([]); // Lista de todas las categorías
    const [loading, setLoading] = useState(true); // Estado de carga general

    // ============ FUNCIÓN PARA OBTENER CATEGORÍAS ============
    
    /**
     * Obtiene todas las categorías desde el servidor
     * Maneja la nueva estructura de respuesta del controlador actualizado
     */
    const fetchCategories = async () => {
        try {
            console.log('📡 Obteniendo categorías del servidor...');
            const response = await fetch(API);
            
            // Verificar que la respuesta sea exitosa
            if (!response.ok) {
                throw new Error("Hubo un error al obtener las categorías");
            }
            
            const data = await response.json();
            console.log('📦 Datos recibidos:', data);
            
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
            
            setLoading(false);
        } catch (error) {
            console.error("❌ Error al obtener categorías:", error);
            toast.error("Error al cargar las categorías");
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

    // ============ FUNCIÓN PARA CREAR CATEGORÍA ============
    
    /**
     * Crea una nueva categoría en el servidor
     * Incluye validaciones de datos y manejo de archivos
     * 
     * @param {Event} e - Evento del formulario para prevenir recarga de página
     */
    const createCategorie = async (e) => {
        e.preventDefault();
        console.log('➕ Iniciando creación de categoría...');

        // ---- Validaciones del lado cliente ----
        
        // Validar que el nombre no esté vacío
        if (!name.trim()) {
            toast.error("El nombre es requerido");
            return;
        }

        // Validar que se haya seleccionado una imagen
        if (!image) {
            toast.error("La imagen es requerida");
            return;
        }

        try {
            // ---- Preparar datos para envío ----
            
            // Usar FormData para enviar archivos al servidor
            const formData = new FormData();
            formData.append("name", name.trim()); // Nombre sin espacios extra
            formData.append("image", image); // Archivo de imagen

            console.log('📤 Enviando datos de nueva categoría:', {
                name: name.trim(),
                imageSize: image.size,
                imageType: image.type
            });

            // ---- Enviar petición POST al servidor ----
            const response = await fetch(API, {
                method: "POST",
                body: formData // FormData se envía sin Content-Type header
            });

            // Parsear respuesta del servidor
            const result = await response.json();

            // ---- Verificar si la operación fue exitosa ----
            if (!response.ok) {
                // Mostrar mensaje de error específico del backend
                throw new Error(result.message || "Hubo un error al registrar la categoría");
            }

            // ---- Manejar éxito ----
            console.log('✅ Categoría creada exitosamente:', result);
            
            // Mostrar mensaje de éxito
            toast.success(result.message || 'Categoría registrada');
            
            // Actualizar lista de categorías
            fetchCategories();
            
            // Limpiar formulario y volver a la lista
            setName("");
            setImage(null);
            setActiveTab("list");
            
        } catch (error) {
            console.error("❌ Error al crear categoría:", error);
            toast.error(error.message || "Error al crear la categoría");
        }
    };

    // ============ FUNCIÓN PARA ELIMINAR CATEGORÍA ============
    
    /**
     * Elimina una categoría específica del servidor
     * 
     * @param {string} id - ID de la categoría a eliminar
     */
    const deleteCategorie = async (id) => {
        try {
            console.log(`🗑️ Eliminando categoría con ID: ${id}`);
            
            // ---- Enviar petición DELETE al servidor ----
            const response = await fetch(`${API}/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            // Parsear respuesta del servidor
            const result = await response.json();

            // ---- Verificar si la eliminación fue exitosa ----
            if (!response.ok) {
                throw new Error(result.message || "Hubo un error al eliminar la categoría");
            }

            // ---- Manejar éxito ----
            console.log('✅ Categoría eliminada exitosamente');
            
            // Mostrar mensaje de éxito
            toast.success(result.message || 'Categoría eliminada');
            
            // Actualizar lista de categorías
            fetchCategories();
            
        } catch (error) {
            console.error("❌ Error al eliminar categoría:", error);
            toast.error(error.message || "Error al eliminar la categoría");
        }
    };

    // ============ FUNCIÓN PARA PREPARAR EDICIÓN ============
    
    /**
     * Prepara el formulario para editar una categoría existente
     * Cambia a la pestaña de formulario y llena los campos con datos actuales
     * 
     * @param {Object} dataCategorie - Objeto con datos de la categoría a editar
     */
    const updateCategorie = (dataCategorie) => {
        console.log("📝 Preparando edición de categoría:", dataCategorie);
        
        // ---- Llenar campos del formulario ----
        setId(dataCategorie._id); // Guardar ID para la actualización
        setName(dataCategorie.name); // Llenar campo nombre
        setImage(dataCategorie.image); // Establecer imagen actual (URL)
        
        // ---- Cambiar a vista de formulario ----
        setActiveTab("form");
        
        console.log(`✅ Formulario preparado para editar: ${dataCategorie.name}`);
    };

    // ============ FUNCIÓN PARA GUARDAR EDICIÓN ============
    
    /**
     * Guarda los cambios de una categoría editada en el servidor
     * Maneja tanto cambios de texto como de imagen
     * 
     * @param {Event} e - Evento del formulario
     */
    const handleEdit = async (e) => {
        e.preventDefault();
        console.log(`💾 Guardando cambios en categoría ID: ${id}`);

        // ---- Validación del lado cliente ----
        if (!name.trim()) {
            toast.error("El nombre es requerido");
            return;
        }

        try {
            let response;

            // ---- Determinar tipo de actualización ----
            if (image instanceof File) {
                // Caso 1: Se seleccionó una nueva imagen (usar FormData)
                console.log('📁 Actualizando con nueva imagen');
                
                const formData = new FormData();
                formData.append("name", name.trim());
                formData.append("image", image);

                response = await fetch(`${API}/${id}`, {
                    method: "PUT",
                    body: formData
                });
            } else {
                // Caso 2: Solo cambio de texto (usar JSON)
                console.log('📝 Actualizando solo texto');
                
                response = await fetch(`${API}/${id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ 
                        name: name.trim(), 
                        image 
                    }),
                });
            }

            // ---- Procesar respuesta ----
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Error al actualizar la categoría");
            }

            // ---- Manejar éxito ----
            console.log('✅ Categoría actualizada exitosamente');
            
            // Mostrar mensaje de éxito
            toast.success(result.message || 'Categoría actualizada');
            
            // Limpiar formulario y volver a la lista
            setId("");
            setName("");
            setImage(null);
            setActiveTab("list");
            
            // Actualizar lista de categorías
            fetchCategories();
            
        } catch (error) {
            console.error("❌ Error al editar la categoría:", error);
            toast.error(error.message || "Error al actualizar la categoría");
        }
    };

    // ============ RETORNO DEL HOOK ============
    
    /**
     * Retorna todos los estados y funciones necesarias para manejar categorías
     * Los componentes que usen este hook tendrán acceso a toda la funcionalidad
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

        // ---- Estados de datos ----
        categories,         // Array con todas las categorías
        setCategories,      // Función para actualizar la lista (uso interno)
        loading,            // Estado de carga booleano

        // ---- Funciones de operaciones CRUD ----
        createCategorie,    // Crear nueva categoría
        deleteCategorie,    // Eliminar categoría existente
        updateCategorie,    // Preparar edición de categoría
        handleEdit,         // Guardar cambios en categoría editada
    };
}

export default useDataCategories;