import { useState, useEffect } from "react"; // Importamos hooks de React
import { Alert } from "react-native"; // Importamos Alert para mostrar errores al usuario

// Hook personalizado para obtener productos desde el backend
const useFetchProducts = () => {
  // Estados para la lista de productos
  const [productos, setProductos] = useState([]); // Estado para almacenar los productos
  const [loading, setLoading] = useState(true);  // Estado para indicar si se está cargando
  const [error, setError] = useState(null); // Estado para manejar errores

  // Función que realiza el fetch de productos
  const fetchProductos = async () => {
    setLoading(true);
    setError(null);
    
    try {
        // Realiza la petición al backend
      const response = await fetch("https://marquesa.onrender.com/api/products");
      
      // Verificar si la respuesta es exitosa
      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }
      
      // Parsea el cuerpo de la respuesta como JSON
      const data = await response.json();
      console.log('Datos recibidos:', data);
      
      // Manejar diferentes estructuras de respuesta
      let productosData = [];
      
      if (data.success && data.data) {
        // Estructura: { success: true, data: [...] }
        productosData = data.data;
      } else if (Array.isArray(data.data)) {
        // Estructura: { data: [...] }
        productosData = data.data;
      } else if (Array.isArray(data)) {
        // Respuesta directa: [...]
        productosData = data;
      } else {
        throw new Error('Formato de datos no reconocido');
      }
      
      // Transformar productos para asegurar consistencia con todos los campos
      const productosTransformados = productosData.map(producto => ({
        // IDs
        _id: producto._id || producto.id,
        id: producto._id || producto.id,
        
        // Información del producto
        name: producto.name || 'Producto sin nombre',
        description: producto.description || 'Sin descripción',
        details: producto.details || 'Sin detalles adicionales',
        price: producto.price || 0,
        stock: producto.stock || 0,
        
        // Categoría (puede venir poblada o solo el ID)
        categoryId: producto.categoryId?._id || producto.categoryId || null,
        category: producto.categoryId?.name || producto.category || 'Sin categoría',
        
        // Imágenes (manejar diferentes estructuras)
        images: producto.images || [],
        image: producto.images?.[0]?.image || 
               producto.images?.[0] || 
               producto.image || 
               null,
        
        // Características del producto
        isPersonalizable: producto.isPersonalizable || false,
        
        // Timestamps
        createdAt: producto.createdAt,
        updatedAt: producto.updatedAt,
        
        // Version key de Mongo
        __v: producto.__v || 0
      }));
      
      console.log(`${productosTransformados.length} productos cargados`); // Muestra en consola cuántos productos se cargaron
      setProductos(productosTransformados); // Guarda los productos transformados en el estado
      
    } catch (error) {
        // En caso de error, lo muestra en consola
      console.error("Error al cargar productos:", error);
      
      // Manejo de diferentes tipos de errores
      let errorMessage = "Error desconocido";
      
      // Distintos tipos de errores manejables
      if (error.message.includes('Network request failed')) {
        errorMessage = "Sin conexión a internet. Verifica tu conexión.";
      } else if (error.message.includes('timeout')) {
        errorMessage = "Tiempo de espera agotado. Inténtalo de nuevo.";
      } else if (error.message.includes('servidor')) {
        errorMessage = "Error del servidor. Inténtalo más tarde.";
      } else {
        errorMessage = error.message;
      }
      
      // Actualiza el estado con el error
      setError(errorMessage);
    
      
    } finally {
      setLoading(false);
    }
  };

  // Función para recargar productos manualmente
  const reloadProducts = () => {
    fetchProductos();
  };

  // Hook useEffect: carga inicial al montar el componente
  useEffect(() => {
    fetchProductos();
  }, []);

  // Devuelve el estado y funciones para ser usadas en otros componentes
  return {
    productos,
    loading,
    error,
    fetchProductos,
    reloadProducts, // Para pull-to-refresh
  };
};

// Exporta el hook para usarlo en otros componentes
export default useFetchProducts;