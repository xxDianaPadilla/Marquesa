import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

/**
 * Hook personalizado para manejar toda la lógica relacionada con productos
 * Proporciona funcionalidades CRUD completas para productos:
 * - Crear, editar, eliminar productos
 * - Manejo de imágenes y archivos
 * - Validaciones del lado cliente
 * - Integración con categorías
 * - Control de pestañas y estado de formulario
 * - Manejo de errores y respuestas del servidor
 * 
 * @returns {Object} Objeto con estados y funciones para gestión de productos
 */
const useDataProducts = () => {
  // ============ ESTADOS DE NAVEGACIÓN ============
  
  /**
   * Controla qué pestaña está activa en la interfaz de administración
   * - "list": Vista de tabla con todos los productos
   * - "form": Vista de formulario para crear/editar productos
   */
  const [activeTab, setActiveTab] = useState("list");
  
  // ============ CONFIGURACIÓN DE API ============
  
  // URL base para todas las operaciones de productos
  const API = "http://localhost:4000/api/products";

  // ============ ESTADOS DEL FORMULARIO ============
  
  // Estados para todos los campos del formulario de productos
  const [id, setId] = useState(""); // ID del producto (para edición)
  const [name, setName] = useState(""); // Nombre del producto
  const [description, setDescription] = useState(""); // Descripción detallada
  const [price, setPrice] = useState(""); // Precio en formato string para inputs
  const [stock, setStock] = useState(0); // Cantidad en inventario
  const [categoryId, setCategoryId] = useState(""); // ID de la categoría asociada
  const [isPersonalizable, setIsPersonalizable] = useState(false); // Si se puede personalizar
  const [details, setDetails] = useState(""); // Detalles adicionales del producto
  const [image, setImage] = useState(null); // Archivo de imagen seleccionado

  // ============ ESTADOS DE DATOS ============
  
  const [products, setProducts] = useState([]); // Lista de todos los productos
  const [loading, setLoading] = useState(true); // Estado de carga general
  const [categories, setCategories] = useState([]); // Lista de categorías disponibles

  // ============ FUNCIONES DE UTILIDAD ============
  
  /**
   * Función auxiliar para manejar respuestas HTTP del servidor
   * Maneja tanto respuestas JSON como HTML (errores del servidor)
   * Proporciona mensajes de error más descriptivos
   * 
   * @param {Response} response - Objeto Response de fetch
   * @returns {Promise<Object>} Datos parseados de la respuesta
   * @throws {Error} Error con mensaje descriptivo si la respuesta no es válida
   */
  const handleResponse = async (response) => {
    const contentType = response.headers.get('content-type');

    // Verificar que la respuesta sea JSON válido
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await response.text();
      console.error('❌ Respuesta no es JSON:', textResponse);
      throw new Error(`El servidor devolvió HTML en lugar de JSON. Status: ${response.status}`);
    }

    const data = await response.json();

    // Verificar si la respuesta HTTP fue exitosa
    if (!response.ok) {
      // Extraer mensaje de error específico del backend
      const errorMessage = data.error || data.message || `Error ${response.status}`;
      throw new Error(errorMessage);
    }

    return data;
  };

  // ============ FUNCIONES DE CARGA DE DATOS ============
  
  /**
   * Carga todas las categorías disponibles desde el servidor
   * Maneja tanto la nueva estructura de respuesta como la anterior
   */
  const fetchCategories = async () => {
    try {
      console.log('📂 Cargando categorías...');
      const response = await fetch("http://localhost:4000/api/categories");
      const data = await handleResponse(response);
      
      // Manejar nueva estructura de respuesta { success, data, message }
      if (data.success && Array.isArray(data.data)) {
        console.log(`✅ ${data.data.length} categorías cargadas`);
        setCategories(data.data);
      } else if (Array.isArray(data)) {
        // Retrocompatibilidad con controladores antiguos
        console.log(`✅ ${data.length} categorías cargadas (formato anterior)`);
        setCategories(data);
      } else {
        console.warn("⚠️ Estructura de respuesta de categorías inesperada:", data);
        setCategories([]);
      }
    } catch (error) {
      toast.error("Error al cargar las categorías");
      console.error("❌ Error al cargar categorías:", error);
      setCategories([]); // Fallback a array vacío
    }
  };

  /**
   * Carga todos los productos desde el servidor
   * Maneja diferentes estructuras de respuesta y estados de error
   */
  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('📦 Cargando productos...');
      
      const response = await fetch(API);
      const data = await handleResponse(response);
      
      // Manejar nueva estructura de respuesta del controlador
      if (data.success && Array.isArray(data.data)) {
        setProducts(data.data);
        console.log(`✅ ${data.data.length} productos cargados exitosamente`);
      } else if (Array.isArray(data)) {
        // Retrocompatibilidad con controladores que devuelven array directo
        setProducts(data);
        console.log(`✅ ${data.length} productos cargados (formato anterior)`);
      } else {
        console.warn("⚠️ Estructura de respuesta de productos inesperada:", data);
        setProducts([]);
      }
    } catch (error) {
      toast.error("Error al cargar los productos");
      console.error("❌ Error al cargar productos:", error);
      setProducts([]); // Fallback a array vacío
    } finally {
      setLoading(false);
    }
  };

  // ============ EFECTO DE INICIALIZACIÓN ============
  
  /**
   * Efecto que se ejecuta una vez al montar el componente
   * Carga datos iniciales de productos y categorías
   */
  useEffect(() => {
    console.log('🚀 Inicializando hook de productos...');
    fetchProducts();
    fetchCategories();
  }, []);

  // ============ FUNCIONES DE UTILIDAD DEL FORMULARIO ============
  
  /**
   * Limpia todos los campos del formulario y resetea el estado
   * Se usa después de crear/editar productos exitosamente
   */
  const resetForm = () => {
    console.log('🧹 Limpiando formulario de productos');
    setId("");
    setName("");
    setDescription("");
    setPrice("");
    setStock(0);
    setCategoryId("");
    setIsPersonalizable(false);
    setDetails("");
    setImage(null);
  };

  // ============ FUNCIÓN PARA CREAR PRODUCTO ============
  
  /**
   * Crea un nuevo producto en el servidor
   * Incluye validaciones exhaustivas y manejo de archivos
   * 
   * @param {Object} productData - Datos del producto a crear
   */
  const createProduct = async (productData) => {
    console.log('➕ Iniciando creación de producto...');

    // ---- Validaciones del lado cliente ----
    
    // Validar nombre
    if (!productData.name?.trim()) {
      toast.error("El nombre es requerido");
      return;
    }

    // Validar descripción
    if (!productData.description?.trim()) {
      toast.error("La descripción es requerida");
      return;
    }

    // Validar precio
    if (!productData.price || isNaN(parseFloat(productData.price))) {
      toast.error("El precio debe ser un número válido");
      return;
    }

    if (parseFloat(productData.price) <= 0) {
      toast.error("El precio debe ser mayor a 0");
      return;
    }

    // Validar categoría
    if (!productData.categoryId) {
      toast.error("La categoría es requerida");
      return;
    }

    // Validar stock
    if (productData.stock && (isNaN(parseInt(productData.stock)) || parseInt(productData.stock) < 0)) {
      toast.error("El stock debe ser un número mayor o igual a 0");
      return;
    }

    // ---- Preparar datos para envío ----
    const formData = new FormData();
    formData.append("name", productData.name.trim());
    formData.append("description", productData.description.trim());
    formData.append("price", parseFloat(productData.price));
    formData.append("stock", parseInt(productData.stock) || 0);
    formData.append("categoryId", productData.categoryId);
    formData.append("isPersonalizable", productData.isPersonalizable ? "true" : "false");
    formData.append("details", productData.details || "");

    // Agregar imagen si existe
    if (productData.image) {
      formData.append("images", productData.image);
    }

    try {
      console.log('📤 Enviando producto al servidor...');
      
      // ---- Enviar petición POST ----
      const res = await fetch("http://localhost:4000/api/products", {
        method: "POST",
        body: formData // FormData maneja automáticamente el Content-Type
      });

      const data = await handleResponse(res);

      // ---- Procesar respuesta exitosa ----
      const newProduct = data.success ? data.data : data;

      // Enriquecer producto con información de categoría
      const categoryInfo = categories.find(cat => cat._id === productData.categoryId);
      const enrichedProduct = {
        ...newProduct,
        categoryId: categoryInfo ? categoryInfo : newProduct.categoryId
      };

      // Actualizar lista local de productos
      setProducts((prev) => [...prev, enrichedProduct]);
      
      // Mostrar mensaje de éxito
      const successMessage = data.success ? data.message : "Producto creado exitosamente";
      toast.success(successMessage);
      
      // Limpiar formulario y volver a la lista
      resetForm();
      setActiveTab("list");
      
      console.log('✅ Producto creado exitosamente');
    } catch (error) {
      console.error("❌ Error completo:", error);
      toast.error(error.message || "Error inesperado");
    }
  };

  // ============ FUNCIÓN PARA ELIMINAR PRODUCTO ============
  
  /**
   * Elimina un producto específico del servidor
   * 
   * @param {string} id - ID del producto a eliminar
   */
  const deleteProduct = async (id) => {
    try {
      console.log(`🗑️ Eliminando producto ID: ${id}`);
      
      const res = await fetch(`${API}/${id}`, {
        method: "DELETE"
      });

      const data = await handleResponse(res);

      // Mostrar mensaje de éxito
      const successMessage = data.success ? data.message : "Producto eliminado";
      toast.success(successMessage);
      
      // Recargar lista de productos
      fetchProducts();
      
      console.log('✅ Producto eliminado exitosamente');
    } catch (error) {
      toast.error(error.message || "Error al eliminar producto");
      console.error("❌ Error al eliminar:", error);
    }
  };

  // ============ FUNCIÓN PARA PREPARAR EDICIÓN ============
  
  /**
   * Prepara el formulario para editar un producto existente
   * Llena todos los campos con los datos actuales del producto
   * 
   * @param {Object} product - Objeto del producto a editar
   */
  const updateProduct = (product) => {
    console.log("📝 Preparando edición de producto:", product);
    console.log("🆔 ID del producto:", product._id);

    // ---- Llenar todos los campos del formulario ----
    setId(product._id);
    setName(product.name);
    setDescription(product.description);
    setPrice(product.price.toString()); // Convertir a string para inputs
    setStock(product.stock || 0);
    setCategoryId(product.categoryId._id || product.categoryId || "");
    setIsPersonalizable(product.isPersonalizable || false);
    setDetails(product.details || "");
    setImage(null); // Resetear imagen (se mostrará la actual en el preview)
    
    // Cambiar a la pestaña de formulario
    setActiveTab("form");
    
    console.log('✅ Formulario preparado para edición');
  };

  // ============ FUNCIÓN PARA GUARDAR EDICIÓN ============
  
  /**
   * Guarda los cambios de un producto editado en el servidor
   * Maneja tanto actualizaciones con nuevas imágenes como solo texto
   * 
   * @param {Object} productData - Datos actualizados del producto
   */
  const handleEdit = async (productData) => {
    console.log(`💾 Guardando cambios en producto ID: ${id}`);

    // ---- Validaciones (mismas que en crear) ----
    if (!productData.name?.trim()) {
      toast.error("El nombre es requerido");
      return;
    }

    if (!productData.description?.trim()) {
      toast.error("La descripción es requerida");
      return;
    }

    if (!productData.price || isNaN(parseFloat(productData.price))) {
      toast.error("El precio debe ser un número válido");
      return;
    }

    if (parseFloat(productData.price) <= 0) {
      toast.error("El precio debe ser mayor a 0");
      return;
    }

    if (!productData.categoryId) {
      toast.error("La categoría es requerida");
      return;
    }

    if (productData.stock && (isNaN(parseInt(productData.stock)) || parseInt(productData.stock) < 0)) {
      toast.error("El stock debe ser un número mayor o igual a 0");
      return;
    }

    // ---- Verificar que existe el ID ----
    if (!id) {
      console.error("❌ ID del producto no encontrado. ID actual:", id);
      toast.error("ID del producto no encontrado");
      return;
    }

    console.log(`📤 Actualizando producto en: ${API}/${id}`);

    try {
      let res;

      // ---- Determinar tipo de actualización ----
      if (productData.image instanceof File) {
        // Caso 1: Nueva imagen seleccionada - usar FormData
        console.log('📁 Actualizando con nueva imagen');
        
        const formData = new FormData();
        formData.append("name", productData.name.trim());
        formData.append("description", productData.description.trim());
        formData.append("price", parseFloat(productData.price));
        formData.append("stock", parseInt(productData.stock) || 0);
        formData.append("categoryId", productData.categoryId);
        formData.append("isPersonalizable", productData.isPersonalizable ? "true" : "false");
        formData.append("details", productData.details || "");
        formData.append("images", productData.image);

        res = await fetch(`${API}/${id}`, {
          method: "PUT",
          body: formData,
        });
      } else {
        // Caso 2: Solo actualización de texto - usar JSON
        console.log('📝 Actualizando solo datos de texto');
        
        const body = {
          name: productData.name.trim(),
          description: productData.description.trim(),
          price: parseFloat(productData.price),
          stock: parseInt(productData.stock) || 0,
          categoryId: productData.categoryId,
          isPersonalizable: productData.isPersonalizable,
          details: productData.details || "",
        };

        res = await fetch(`${API}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }

      // ---- Logging de debugging ----
      console.log("📊 Response status:", res.status);
      console.log("📋 Response URL:", res.url);

      const data = await handleResponse(res);

      // ---- Manejar éxito ----
      const successMessage = data.success ? data.message : "Producto actualizado";
      toast.success(successMessage);
      
      // Limpiar formulario y volver a la lista
      resetForm();
      setActiveTab("list");
      fetchProducts(); // Recargar lista
      
      console.log('✅ Producto actualizado exitosamente');
    } catch (error) {
      console.error("❌ Error completo:", error);
      toast.error(error.message || "Error al editar producto");
    }
  };

  // ============ RETORNO DEL HOOK ============
  
  /**
   * Retorna todos los estados y funciones necesarias para manejar productos
   * Los componentes que usen este hook tendrán acceso completo a la funcionalidad
   */
  return {
    // ---- Estados de navegación ----
    activeTab,              // Pestaña activa ("list" o "form")
    setActiveTab,           // Función para cambiar de pestaña

    // ---- Estados del formulario ----
    id,                     // ID del producto (para edición)
    name,                   // Nombre del producto
    setName,                // Función para actualizar nombre
    description,            // Descripción del producto
    setDescription,         // Función para actualizar descripción
    price,                  // Precio del producto (string)
    setPrice,               // Función para actualizar precio
    stock,                  // Stock/inventario del producto
    setStock,               // Función para actualizar stock
    categoryId,             // ID de la categoría seleccionada
    setCategoryId,          // Función para actualizar categoría
    isPersonalizable,       // Si el producto es personalizable
    setIsPersonalizable,    // Función para toggle personalizable
    details,                // Detalles adicionales del producto
    setDetails,             // Función para actualizar detalles
    image,                  // Imagen seleccionada (File o URL)
    setImage,               // Función para actualizar imagen

    // ---- Estados de datos ----
    products,               // Array de todos los productos
    loading,                // Estado de carga booleano
    categories,             // Array de categorías disponibles

    // ---- Funciones de operaciones CRUD ----
    createProduct,          // Crear nuevo producto
    deleteProduct,          // Eliminar producto existente
    updateProduct,          // Preparar edición de producto
    handleEdit,             // Guardar cambios en producto editado

    // ---- Función de utilidad ----
    resetForm,              // Limpiar formulario manualmente
  };
};

export default useDataProducts;