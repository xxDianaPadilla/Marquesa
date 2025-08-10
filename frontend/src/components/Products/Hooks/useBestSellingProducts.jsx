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
        // Realiza la petición fetch a la API de productos más vendidos
        const response = await fetch("http://localhost:4000/api/products/best-selling");
        
        // Si la respuesta no es exitosa, lanza un error
        if (!response.ok) {
          throw new Error("Error al obtener productos más vendidos");
        }
        
        // Convierte la respuesta de la API a formato JSON
        const data = await response.json();
        
        // Actualiza los estados con los datos obtenidos
        setBestSelling(data.data || []);
        setTotalSales(data.totalSales || 0);
        
      } catch (error) {
        // Si ocurre un error, se captura y se guarda el mensaje en el estado de error
        setError(error.message);
        // En caso de error, asegurar que bestSelling sea un array vacío
        setBestSelling([]);
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