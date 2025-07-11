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
        // Realiza la petición fetch a la API de productos. (Nota: hay un typo, 'reponse' en lugar de 'response').
        const reponse = await fetch("http://localhost:4000/api/products");
        // Si la respuesta no es exitosa (ej. status 404, 500), lanza un error.
        if (!reponse.ok) {
          throw new Error("Error al obtener productos");
        }
        // Convierte la respuesta de la API a formato JSON.
        const data = await reponse.json();
        // Actualiza el estado con los datos de los productos obtenidos.
        setProducts(data);
      } catch (error) {
        // Si ocurre un error en el bloque try, se captura y se guarda el mensaje en el estado de error.
        setError(error.message);
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
