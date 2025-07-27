// Ruta: frontend/src/components/ProductsAdmin/hooks/useDataProducts.jsx
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

/**
 * Hook personalizado mejorado para manejar toda la lógica relacionada con productos
 * 
 * Funcionalidades principales:
 * - Gestión completa del estado de productos y categorías
 * - Operaciones CRUD con validaciones exhaustivas
 * - Manejo de errores detallado y user-friendly
 * - Integración optimizada con react-hook-form
 * - Control de estados de carga y UI
 * 
 * @returns {Object} Estados y funciones para gestión completa de productos
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
  const [images, setImages] = useState(null); // Archivo de imagen seleccionado

  // ============ ESTADOS DE DATOS ============

  const [products, setProducts] = useState([]); // Lista de todos los productos
  const [loading, setLoading] = useState(true); // Estado de carga general
  const [categories, setCategories] = useState([]); // Lista de categorías disponibles

  // ============ ESTADOS DE VALIDACIÓN ============

  const [validationErrors, setValidationErrors] = useState({}); // Errores de validación
  const [isSubmitting, setIsSubmitting] = useState(false); // Estado de envío

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

  /**
   * Valida los datos del producto antes de enviar al servidor
   * Realiza validaciones exhaustivas del lado cliente
   * 
   * @param {Object} productData - Datos del producto a validar
   * @returns {Object} { isValid: boolean, errors: Object }
   */
  const validateProductData = (productData, isEditing = false) => {
    const errors = {};

    // Validación de nombre (obligatorio, longitud mínima)
    if (!productData.name || !productData.name.trim()) {
      errors.name = "El nombre del producto es obligatorio";
    } else if (productData.name.trim().length < 2) {
      errors.name = "El nombre debe tener al menos 2 caracteres";
    } else if (productData.name.trim().length > 100) {
      errors.name = "El nombre no puede exceder 100 caracteres";
    }

    // Validación de descripción (obligatorio, longitud mínima)
    if (!productData.description || !productData.description.trim()) {
      errors.description = "La descripción del producto es obligatoria";
    } else if (productData.description.trim().length < 10) {
      errors.description = "La descripción debe tener al menos 10 caracteres";
    } else if (productData.description.trim().length > 500) {
      errors.description = "La descripción no puede exceder 500 caracteres";
    }

    // Validación de precio (obligatorio, numérico, positivo)
    if (!productData.price) {
      errors.price = "El precio es obligatorio";
    } else {
      const priceValue = parseFloat(productData.price);
      if (isNaN(priceValue)) {
        errors.price = "El precio debe ser un número válido";
      } else if (priceValue <= 0) {
        errors.price = "El precio debe ser mayor a 0";
      } else if (priceValue > 999999.99) {
        errors.price = "El precio no puede exceder $999,999.99";
      }
    }

    // Validación de stock (obligatorio, entero, no negativo)
    if (productData.stock === undefined || productData.stock === null || productData.stock === '') {
      errors.stock = "El stock es obligatorio";
    } else {
      const stockValue = parseInt(productData.stock);
      if (isNaN(stockValue)) {
        errors.stock = "El stock debe ser un número entero";
      } else if (stockValue < 0) {
        errors.stock = "El stock no puede ser negativo";
      } else if (stockValue > 999999) {
        errors.stock = "El stock no puede exceder 999,999 unidades";
      }
    }

    // Validación de categoría (obligatorio)
    if (!productData.categoryId || !productData.categoryId.trim()) {
      errors.categoryId = "Debe seleccionar una categoría";
    }

    // ========== VALIDACIÓN DE IMÁGENES CORREGIDA ==========
    if (productData.images && Array.isArray(productData.images)) {
      // Separar imágenes existentes (strings) de archivos nuevos (File objects)
      const existingImages = productData.images.filter(img => typeof img === 'string');
      const newImageFiles = productData.images.filter(img => img instanceof File);
      const totalImages = existingImages.length + newImageFiles.length;

      console.log('Validación de imágenes:', {
        existingImages: existingImages.length,
        newImageFiles: newImageFiles.length,
        totalImages: totalImages,
        isEditing: isEditing
      });

      // Para productos nuevos: debe tener al menos una imagen
      if (!isEditing && totalImages === 0) {
        errors.images = "Debe seleccionar al menos una imagen";
      }

      // Para productos editados: debe tener al menos una imagen (existente o nueva)
      if (isEditing && totalImages === 0) {
        errors.images = "Debe tener al menos una imagen";
      }

      // Validar máximo de imágenes
      if (totalImages > 5) {
        errors.images = "Máximo 5 imágenes permitidas";
      }

      // Validar solo los archivos nuevos (File objects)
      if (newImageFiles.length > 0) {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        for (let i = 0; i < newImageFiles.length; i++) {
          const image = newImageFiles[i];

          // Validar tamaño de archivo
          if (image.size > maxSize) {
            errors.images = `La imagen "${image.name}" excede el tamaño máximo de 5MB`;
            break;
          }

          // Validar tipo de archivo
          if (!validTypes.includes(image.type)) {
            errors.images = `La imagen "${image.name}" debe ser JPG, PNG, WebP o GIF`;
            break;
          }
        }
      }
    } else {
      // Si no hay array de imágenes
      if (!isEditing) {
        errors.images = "Debe seleccionar al menos una imagen";
      } else {
        errors.images = "Debe tener al menos una imagen";
      }
    }

    // Validación de detalles (opcional, pero con límite de caracteres)
    if (productData.details && productData.details.length > 1000) {
      errors.details = "Los detalles no pueden exceder 1000 caracteres";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
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
    setImages(null);
    setValidationErrors({});
  };

  // ============ FUNCIÓN PARA CREAR PRODUCTO ============

  /**
   * Crea un nuevo producto en el servidor
   * Incluye validaciones exhaustivas y manejo de archivos
   * 
   * @param {Object} productData - Datos del producto a crear
   */
  const createProduct = async (productData) => {
    console.log('=== FRONTEND: INICIANDO CREACIÓN ===');
    console.log('Datos del producto:', productData);
    console.log('Número de imágenes a subir:', productData.images?.length || 0);

    // ---- Validar datos antes de enviar ----
    const validation = validateProductData(productData, false);
    if (!validation.isValid) {
      console.log('Validación fallida:', validation.errors);
      setValidationErrors(validation.errors);
      toast.error("Por favor corrige los errores en el formulario");
      return;
    }

    // ---- Validar que haya al menos una imagen ----
    if (!productData.images || productData.images.length === 0) {
      setValidationErrors({ images: "Debes seleccionar al menos una imagen" });
      toast.error("Debes seleccionar al menos una imagen");
      return;
    }

    // ---- Validar máximo de imágenes ----
    if (productData.images.length > 5) {
      setValidationErrors({ images: "Máximo 5 imágenes permitidas" });
      toast.error("Máximo 5 imágenes permitidas");
      return;
    }

    try {
      setIsSubmitting(true);
      setValidationErrors({});

      // ---- Preparar FormData para múltiples imágenes ----
      const formData = new FormData();

      // Agregar datos del producto
      formData.append("name", productData.name.trim());
      formData.append("description", productData.description.trim());
      formData.append("price", parseFloat(productData.price));
      formData.append("stock", parseInt(productData.stock) || 0);
      formData.append("categoryId", productData.categoryId);
      formData.append("isPersonalizable", productData.isPersonalizable ? "true" : "false");
      formData.append("details", productData.details || "");

      // ---- Agregar todas las imágenes al FormData ----
      console.log('=== PROCESANDO IMÁGENES ===');
      productData.images.forEach((image, index) => {
        if (image instanceof File) {
          console.log(`Agregando imagen ${index + 1}:`);
          console.log(`- Nombre: ${image.name}`);
          console.log(`- Tipo: ${image.type}`);
          console.log(`- Tamaño: ${(image.size / 1024 / 1024).toFixed(2)}MB`);

          formData.append("images", image);
        } else {
          console.error(`Imagen ${index + 1} no es un File:`, typeof image, image);
        }
      });

      // Debug: Mostrar contenido del FormData
      console.log('=== CONTENIDO DEL FORMDATA ===');
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File(${value.name}, ${value.type}, ${(value.size / 1024 / 1024).toFixed(2)}MB)`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }

      console.log('Enviando petición al servidor...');

      // ---- Enviar petición POST ----
      const res = await fetch("http://localhost:4000/api/products", {
        method: "POST",
        body: formData // FormData maneja automáticamente el Content-Type
      });

      console.log('Respuesta recibida:', res.status, res.statusText);

      const data = await handleResponse(res);
      console.log('Datos de respuesta:', data);

      // ---- Procesar respuesta exitosa ----
      const newProduct = data.success ? data.data : data;

      // Enriquecer producto con información de categoría
      const categoryInfo = categories.find(cat => cat._id === productData.categoryId);
      const enrichedProduct = {
        ...newProduct,
        categoryId: categoryInfo ? {
          _id: categoryInfo._id,
          name: categoryInfo.name
        } : newProduct.categoryId
      };

      // Actualizar lista local de productos
      setProducts((prev) => [...prev, enrichedProduct]);

      // Mostrar mensaje de éxito
      const successMessage = data.success ? data.message : "Producto creado exitosamente";
      toast.success(successMessage);

      // Limpiar formulario y volver a la lista
      resetForm();
      setActiveTab("list");

      console.log('=== PRODUCTO CREADO EXITOSAMENTE ===');
      console.log('ID:', newProduct._id);
      console.log('Imágenes:', newProduct.images?.length || 0);

    } catch (error) {
      console.error("=== ERROR EN FRONTEND ===");
      console.error("Error completo:", error);
      console.error("Mensaje:", error.message);
      console.error("Stack:", error.stack);

      toast.error(error.message || "Error inesperado");
    } finally {
      setIsSubmitting(false);
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
    setPrice(product.price.toString());
    setStock(product.stock || 0);
    setCategoryId(product.categoryId._id || product.categoryId || "");
    setIsPersonalizable(product.isPersonalizable ?? false);
    setDetails(product.details || "");

    // CAMBIO: Usar el estado correcto para múltiples imágenes
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      // Si las imágenes están como objetos con propiedades
      const imageUrls = product.images.map(img => {
        if (typeof img === 'object' && img.image) {
          return img.image; // { image: "url", _id: "..." }
        }
        return img; // Si ya es una URL directa
      });

      // CAMBIO: Usar setImages en lugar de setImage (plural)
      setImages(imageUrls); // Debe coincidir con el estado que usas en otras funciones
      console.log('📸 Imágenes cargadas para edición:', imageUrls.length);
      console.log('📸 URLs de imágenes:', imageUrls);
    } else {
      // CAMBIO: Usar setImages en lugar de setImage
      setImages([]); // Resetear imágenes
      console.log('📸 No hay imágenes para cargar');
    }

    setValidationErrors({});

    // Cambiar a la pestaña de formulario
    setActiveTab("form");

    console.log('✅ Formulario preparado para edición');
    console.log('📊 Estado actual después de cargar:', {
      id: product._id,
      name: product.name,
      imagesCount: product.images?.length || 0
    });
  };

  // ============ FUNCIÓN PARA GUARDAR EDICIÓN ============

  /**
   * Guarda los cambios de un producto editado en el servidor
   * Maneja tanto actualizaciones con nuevas imágenes como solo texto
   * 
   * @param {Object} productData - Datos actualizados del producto
   */
  const handleEdit = async (productData) => {
    console.log(`Guardando cambios en producto ID: ${id}`);
    console.log('Imágenes a procesar:', productData.images?.length || 0);

    // ---- CAMBIO: Usar true para indicar que es edición ----
    const validation = validateProductData(productData, true);
    if (!validation.isValid) {
      console.log('Validación fallida:', validation.errors);
      setValidationErrors(validation.errors);
      toast.error("Por favor corrige los errores en el formulario");
      return;
    }

    // ---- Verificar que existe el ID ----
    if (!id) {
      console.error("ID del producto no encontrado. ID actual:", id);
      toast.error("ID del producto no encontrado");
      return;
    }

    console.log(`Actualizando producto en: ${API}/${id}`);

    try {
      setIsSubmitting(true);
      setValidationErrors({});

      // ---- Separar imágenes nuevas de las existentes ----
      const newImages = productData.images?.filter(img => img instanceof File) || [];
      const existingImages = productData.images?.filter(img => typeof img === 'string') || [];

      console.log('Imágenes nuevas a subir:', newImages.length);
      console.log('Imágenes existentes a mantener:', existingImages.length);
      console.log('Total de imágenes:', newImages.length + existingImages.length);

      // ---- Validar que hay al menos una imagen (nueva o existente) ----
      if (newImages.length === 0 && existingImages.length === 0) {
        setValidationErrors({ images: "Debe tener al menos una imagen" });
        toast.error("Debe tener al menos una imagen");
        return;
      }

      // ---- Validar máximo total de imágenes ----
      if (newImages.length + existingImages.length > 5) {
        setValidationErrors({ images: "Máximo 5 imágenes en total" });
        toast.error("Máximo 5 imágenes en total");
        return;
      }

      let res;

      // ---- Determinar tipo de actualización ----
      if (newImages.length > 0) {
        // Caso 1: Hay nuevas imágenes - usar FormData
        console.log('Actualizando con nuevas imágenes');

        const formData = new FormData();

        // Agregar datos del producto
        formData.append("name", productData.name.trim());
        formData.append("description", productData.description.trim());
        formData.append("price", parseFloat(productData.price));
        formData.append("stock", parseInt(productData.stock) || 0);
        formData.append("categoryId", productData.categoryId);
        formData.append("isPersonalizable", productData.isPersonalizable ? "true" : "false");
        formData.append("details", productData.details || "");

        // Agregar imágenes existentes como JSON para que el backend las mantenga
        if (existingImages.length > 0) {
          formData.append("existingImages", JSON.stringify(existingImages));
          console.log('Imágenes existentes a mantener:', existingImages);
        }

        // Agregar nuevas imágenes
        newImages.forEach((image, index) => {
          formData.append("images", image);
          console.log(`Nueva imagen ${index + 1}: ${image.name} (${(image.size / 1024 / 1024).toFixed(2)}MB)`);
        });

        // Debug FormData
        console.log('=== CONTENIDO DEL FORMDATA (EDICIÓN) ===');
        for (let [key, value] of formData.entries()) {
          if (value instanceof File) {
            console.log(`${key}: File(${value.name}, ${value.type}, ${(value.size / 1024 / 1024).toFixed(2)}MB)`);
          } else {
            console.log(`${key}:`, value);
          }
        }

        res = await fetch(`${API}/${id}`, {
          method: "PUT",
          body: formData,
        });
      } else {
        // Caso 2: Solo actualización de texto y/o mantenimiento de imágenes existentes
        console.log('Actualizando solo datos de texto');

        const body = {
          name: productData.name.trim(),
          description: productData.description.trim(),
          price: parseFloat(productData.price),
          stock: parseInt(productData.stock) || 0,
          categoryId: productData.categoryId,
          isPersonalizable: productData.isPersonalizable,
          details: productData.details || "",
          existingImages: existingImages
        };

        console.log('Body JSON para actualización:', body);

        res = await fetch(`${API}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }

      // ---- Logging de debugging ----
      console.log("Response status:", res.status);
      console.log("Response URL:", res.url);

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Error response:", errorText);
        throw new Error(`Error ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      console.log("Datos de respuesta:", data);

      // ---- Manejar éxito ----
      const successMessage = data.success ? data.message : "Producto actualizado";
      toast.success(successMessage);

      // Actualizar producto en la lista local
      if (data.success && data.data) {
        setProducts(prev => prev.map(p =>
          p._id === id ? data.data : p
        ));
      }

      // Limpiar formulario y volver a la lista
      resetForm();
      setActiveTab("list");

      console.log('Producto actualizado exitosamente');
    } catch (error) {
      console.error("=== ERROR EN EDICIÓN ===");
      console.error("Error completo:", error);
      console.error("Mensaje:", error.message);

      // Manejar errores específicos
      if (error.message.includes('400')) {
        toast.error("Error de validación. Revisa los datos del formulario.");
      } else if (error.message.includes('404')) {
        toast.error("Producto no encontrado.");
      } else if (error.message.includes('409')) {
        toast.error("Ya existe un producto con ese nombre.");
      } else {
        toast.error(error.message || "Error al editar producto");
      }
    } finally {
      setIsSubmitting(false);
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
    images,                  // Imagen seleccionada (File o URL)              
    setImages,

    // ---- Estados de datos ----
    products,               // Array de todos los productos
    loading,                // Estado de carga booleano
    categories,             // Array de categorías disponibles

    // ---- Estados de validación ----
    validationErrors,       // Errores de validación actuales
    setValidationErrors,    // Función para establecer errores
    isSubmitting,           // Estado de envío del formulario

    // ---- Funciones de operaciones CRUD ----
    createProduct,          // Crear nuevo producto
    deleteProduct,          // Eliminar producto existente
    updateProduct,          // Preparar edición de producto
    handleEdit,             // Guardar cambios en producto editado

    // ---- Función de utilidad ----
    resetForm,              // Limpiar formulario manualmente
    validateProductData,    // Función de validación externa
  };
};

export default useDataProducts;