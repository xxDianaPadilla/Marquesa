// Importa los hooks useState y useEffect de la biblioteca de React.
import { useState, useEffect } from "react";

// Define y exporta un custom hook para manejar la lógica relacionada con las ventas.
export const useSales = () => {
  // Estado para almacenar la lista de todas las ventas.
  const [sales, setSales] = useState([]);
  // Estado para almacenar el número total de ventas.
  const [totalSales, setTotalSales] = useState(0);
  // Estado para manejar el estado de carga de los datos.
  const [loading, setLoading] = useState(true);
  // Estado para almacenar cualquier error que ocurra durante las peticiones.
  const [error, setError] = useState(null);

  // useEffect se ejecuta una vez cuando el componente que usa el hook se monta.
  useEffect(() => {
    // Llama a las funciones para obtener los datos iniciales.
    fetchSales();
    fetchTotalSales();
  }, []); // El array de dependencias vacío asegura que se ejecute solo una vez.

  // Función asíncrona para obtener la lista de ventas desde la API.
  const fetchSales = async () => {
    try {
      // Realiza una petición GET al endpoint que devuelve todas las ventas.
      const response = await fetch("http://localhost:4000/api/sales");
      // Convierte la respuesta a formato JSON.
      const data = await response.json();
      // Actualiza el estado 'sales' con los datos recibidos.
      setSales(data);
    } catch (error) {
      // Si ocurre un error, se guarda el mensaje en el estado de error.
      setError(error.message);
    }
  };

  // Función asíncrona para obtener el número total de ventas.
  const fetchTotalSales = async () => {
    try {
      // Realiza una petición GET al endpoint específico para el total de ventas.
      const response = await fetch("http://localhost:4000/api/sales/total");
      // Convierte la respuesta a formato JSON.
      const data = await response.json();
      // Actualiza el estado 'totalSales' con el valor 'total' del objeto recibido.
      setTotalSales(data.total);
      // Indica que la carga ha finalizado.
      setLoading(false);
    } catch (error) {
      // Si hay un error, lo guarda en el estado de error.
      setError(error.message);
      // Igualmente, indica que la carga ha finalizado (aunque con error).
      setLoading(false);
    }
  };

  // El hook retorna un objeto con los estados y una función para recargar los datos.
  return {
    sales, // La lista de ventas.
    totalSales, // El número total de ventas.
    loading, // El estado de carga.
    error, // El estado de error.
    // La función 'refetch' permite a los componentes volver a solicitar los datos de ventas.
    refetch: () => {
      fetchSales();
      fetchTotalSales();
    },
  };
};