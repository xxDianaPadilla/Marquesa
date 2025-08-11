// REEMPLAZAR COMPLETAMENTE: frontend/src/components/Products/Hooks/useProducts.jsx

// Importa los hooks useState y useEffect desde la biblioteca de React.
import { useState, useEffect } from "react";

// Define y exporta un custom hook llamado useProducts.
export const useProducts = () => {
  // Declara un estado para almacenar la lista de productos.
  const [products, setProducts] = useState([]);
  // Declara un estado para manejar el estado de carga de la petición.
  const [loading, setLoading] = useState(true);
  // Declara un estado para almacenar cualquier error que ocurra durante la petición.
  const [error, setError] = useState(null);

  // Hook de efecto que se ejecuta una sola vez cuando el componente que lo usa se monta.
  useEffect(() => {
    // Define una función asíncrona para obtener los productos desde la API.
    const fetchProducts = async () => {
      try {
        // Inicia el estado de carga.
        setLoading(true);
        setError(null);

        console.log('📦 Obteniendo productos desde API...');

        // CORREGIDO: Arreglar el typo y agregar headers apropiados
        const response = await fetch("https://marquesa.onrender.com/api/products", {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        // Si la respuesta no es exitosa (ej. status 404, 500), lanza un error.
        if (!response.ok) {
          throw new Error(`Error ${response.status}: Error al obtener productos`);
        }

        // Convierte la respuesta de la API a formato JSON.
        const data = await response.json();
        console.log('📦 Respuesta recibida:', data);

        // CORREGIDO: Manejar la estructura correcta de respuesta del backend
        if (data.success && Array.isArray(data.products)) {
          // Estructura nueva: { success: true, products: [...], count: N }
          setProducts(data.products);
          console.log(`✅ ${data.products.length} productos cargados exitosamente`);
        } else if (Array.isArray(data.products)) {
          // Fallback si no hay success pero sí products
          setProducts(data.products);
          console.log(`✅ ${data.products.length} productos cargados (fallback)`);
        } else if (Array.isArray(data)) {
          // Retrocompatibilidad si devuelve array directo
          setProducts(data);
          console.log(`✅ ${data.length} productos cargados (formato anterior)`);
        } else {
          console.warn('⚠️ Estructura de respuesta inesperada:', data);
          setProducts([]);
        }

        setError(null);
      } catch (error) {
        // Si ocurre un error en el bloque try, se captura y se guarda el mensaje en el estado de error.
        console.error('❌ Error al obtener productos:', error);
        setError(error.message);
        setProducts([]);
      } finally {
        // El bloque finally se ejecuta siempre, al finalizar el try o el catch.
        // Finaliza el estado de carga, indicando que la operación ha terminado.
        setLoading(false);
      }
    };

    // Llama a la función para que se ejecute.
    fetchProducts();
  }, []); // El array de dependencias vacío asegura que el efecto se ejecute solo una vez.

  // El hook retorna un objeto con los productos, el estado de carga y el estado de error.
  return { products, loading, error };
};