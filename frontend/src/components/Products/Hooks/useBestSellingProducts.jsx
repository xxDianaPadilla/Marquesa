// REEMPLAZAR COMPLETAMENTE: frontend/src/components/Products/Hooks/useBestSellingProducts.jsx

// Importa los hooks useState y useEffect desde la biblioteca de React
import { useState, useEffect } from "react";

// Define y exporta un custom hook para obtener productos más vendidos
export const useBestSellingProducts = () => {
  // Estado para almacenar la lista de productos más vendidos
  const [bestSelling, setBestSelling] = useState([]);
  // Estado para manejar el estado de carga de la petición
  const [loading, setLoading] = useState(true);
  // Estado para almacenar cualquier error que ocurra durante la petición
  const [error, setError] = useState(null);
  // Estado para almacenar estadísticas adicionales
  const [totalSales, setTotalSales] = useState(0);

  // Hook de efecto que se ejecuta una sola vez cuando el componente se monta
  useEffect(() => {
    // Función asíncrona para obtener los productos más vendidos desde la API
    const fetchBestSellingProducts = async () => {
      try {
        // Inicia el estado de carga
        setLoading(true);
        setError(null);

        console.log('🛒 Obteniendo productos más vendidos...');

        // CORREGIDO: Agregar headers apropiados y manejo de errores mejorado
        const response = await fetch("https://marquesa.onrender.com/api/products/best-selling", {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        // Si la respuesta no es exitosa, lanza un error
        if (!response.ok) {
          throw new Error(`Error ${response.status}: Error al obtener productos más vendidos`);
        }
        
        // Convierte la respuesta de la API a formato JSON
        const data = await response.json();
        console.log('🛒 Respuesta recibida:', data);
        
        // CORREGIDO: Manejar estructura correcta de respuesta
        if (data.success && Array.isArray(data.data)) {
          // Estructura correcta: { success: true, data: [...], totalSales: N }
          setBestSelling(data.data);
          setTotalSales(data.totalSales || 0);
          console.log(`✅ ${data.data.length} productos más vendidos cargados`);
          console.log(`📊 Total de ventas: ${data.totalSales || 0}`);
        } else if (Array.isArray(data.data)) {
          // Fallback si no hay success pero sí data
          setBestSelling(data.data);
          setTotalSales(data.totalSales || 0);
          console.log(`✅ ${data.data.length} productos más vendidos cargados (fallback)`);
        } else if (Array.isArray(data)) {
          // Retrocompatibilidad con estructura anterior
          setBestSelling(data);
          setTotalSales(0);
          console.log(`✅ ${data.length} productos más vendidos cargados (formato anterior)`);
        } else {
          console.warn('⚠️ Estructura de respuesta inesperada:', data);
          setBestSelling([]);
          setTotalSales(0);
        }

        setError(null);
        
      } catch (error) {
        // Si ocurre un error, se captura y se guarda el mensaje en el estado de error
        console.error('❌ Error al obtener productos más vendidos:', error);
        setError(error.message);
        // En caso de error, asegurar que bestSelling sea un array vacío
        setBestSelling([]);
        setTotalSales(0);
      } finally {
        // Finaliza el estado de carga, indicando que la operación ha terminado
        setLoading(false);
      }
    };

    // Llama a la función para que se ejecute
    fetchBestSellingProducts();
  }, []); // El array de dependencias vacío asegura que el efecto se ejecute solo una vez

  // El hook retorna un objeto con los productos más vendidos, estadísticas y estados
  return { 
    bestSelling, 
    loading, 
    error, 
    totalSales 
  };
};