// frontend/src/components/Products/Hooks/useProducts.jsx

import { useState, useEffect } from "react";

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('📦 Obteniendo productos desde API...');

        // ✅ CORRECCIÓN: Headers y manejo de errores mejorado
        const response = await fetch("https://marquesa.onrender.com/api/products", {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            // ✅ Headers para evitar cache en producción
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });

        console.log(`📡 Respuesta del servidor: ${response.status} ${response.statusText}`);

        if (!response.ok) {
          // ✅ MEJOR MANEJO DE ERRORES HTTP
          const errorText = await response.text();
          console.error(`❌ Error HTTP ${response.status}:`, errorText);
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('📦 Datos recibidos del servidor:', data);

        // ✅ MANEJO ROBUSTO DE MÚLTIPLES ESTRUCTURAS DE RESPUESTA
        let productsData = [];

        if (data.success === true) {
          // Estructura: { success: true, products: [...] }
          if (Array.isArray(data.products)) {
            productsData = data.products;
            console.log(`✅ Productos encontrados en data.products: ${productsData.length}`);
          }
          // Estructura: { success: true, data: [...] }
          else if (Array.isArray(data.data)) {
            productsData = data.data;
            console.log(`✅ Productos encontrados en data.data: ${productsData.length}`);
          }
          // Estructura: { success: true, message: "...", pero sin productos }
          else {
            console.warn('⚠️ Respuesta exitosa pero sin array de productos:', data);
            productsData = [];
          }
        }
        // Retrocompatibilidad: Array directo
        else if (Array.isArray(data)) {
          productsData = data;
          console.log(`✅ Array directo de productos: ${productsData.length}`);
        }
        // Estructura sin success pero con data
        else if (Array.isArray(data.products)) {
          productsData = data.products;
          console.log(`✅ Productos en data.products (sin success): ${productsData.length}`);
        }
        else if (Array.isArray(data.data)) {
          productsData = data.data;
          console.log(`✅ Productos en data.data (sin success): ${productsData.length}`);
        }
        else {
          console.error('❌ Estructura de respuesta no reconocida:', data);
          throw new Error('Estructura de respuesta inválida del servidor');
        }

        // ✅ VALIDACIÓN ADICIONAL DE LOS PRODUCTOS
        const validProducts = productsData.filter(product => {
          const isValid = product && 
                         typeof product === 'object' && 
                         (product._id || product.id) && 
                         product.name;
          
          if (!isValid) {
            console.warn('⚠️ Producto inválido filtrado:', product);
          }
          
          return isValid;
        });

        console.log(`✅ ${validProducts.length} productos válidos de ${productsData.length} totales`);

        setProducts(validProducts);
        setError(null);

      } catch (error) {
        console.error('❌ Error al obtener productos:', error);
        
        // ✅ MENSAJES DE ERROR MÁS ESPECÍFICOS
        let errorMessage = 'Error desconocido al cargar productos';
        
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          errorMessage = 'No se pudo conectar con el servidor. Verifica que esté funcionando.';
        } else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
          errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
        } else if (error.message.includes('CORS')) {
          errorMessage = 'Error de configuración del servidor (CORS).';
        } else {
          errorMessage = error.message || 'Error al cargar productos';
        }
        
        setError(errorMessage);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, loading, error };
};