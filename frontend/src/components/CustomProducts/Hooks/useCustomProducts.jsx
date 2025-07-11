// Importa los hooks useState y useEffect desde la biblioteca de React.
import { useState, useEffect } from "react";

// Define y exporta un custom hook llamado useCustomProducts.
export const useCustomProducts = () => {
  // Declara un estado para almacenar la lista de productos personalizados.
  const [customProducts, setCustomProducts] = useState([]);
  // Declara un estado para manejar el estado de carga de la petición.
  const [loading, setLoading] = useState(true);
  // Declara un estado para almacenar posibles errores durante la petición.
  const [error, setError] = useState(null);

  // Hook de efecto que se ejecuta una sola vez cuando el componente que usa el hook se monta.
  useEffect(() => {
    // Define una función asíncrona para obtener los productos personalizados desde la API.
    const fetchCustomProducts = async () => {
      try {
        // Inicia el estado de carga.
        setLoading(true);
        // Realiza la petición fetch a la API.
        const response = await fetch(
          "http://localhost:4000/api/customProducts"
        );
        // Si la respuesta no es exitosa (ej: error 404 o 500), lanza un error.
        if (!response.ok) {
          throw new Error("Error al obtener productos personalizados");
        }
        // Convierte la respuesta de la API a formato JSON.
        const data = await response.json();
        // Actualiza el estado con los datos de los productos obtenidos.
        setCustomProducts(data);
      } catch (error) {
        // Si ocurre un error en el bloque try, se captura y se guarda el mensaje en el estado de error.
        setError(error.message);
      } finally {
        // El bloque finally se ejecuta siempre, tanto si la petición fue exitosa como si falló.
        // Finaliza el estado de carga.
        setLoading(false);
      }
    };

    // Llama a la función para que se ejecute.
    fetchCustomProducts();
  }, []); // El array de dependencias vacío asegura que el efecto se ejecute solo una vez.

  // El hook retorna un objeto con los productos, el estado de carga y el estado de error.
  return { customProducts, loading, error };
};