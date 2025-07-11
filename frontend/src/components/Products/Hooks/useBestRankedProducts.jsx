import { useState, useEffect } from "react";

// Define y exporta un custom hook para obtener los productos mejor calificados.
export const useBestRankedProducts = () => {
  // Estado para almacenar la lista de los mejores productos.
  const [bestProducts, setBestProducts] = useState([]);
  // Estado para manejar el estado de carga de la petición (cargando o no).
  const [loading, setLoading] = useState(true);
  // Estado para almacenar cualquier error que pueda ocurrir durante la petición.
  const [error, setError] = useState(null);

  // useEffect se ejecuta una sola vez después de que el componente se monta por primera vez.
  useEffect(() => {
    // Define una función asíncrona para realizar la llamada a la API.
    const fetchBestRankedProducts = async () => {
      try {
        // Establece el estado de carga a 'true' antes de iniciar la petición.
        setLoading(true);
        // Realiza la petición GET al endpoint de la API que devuelve los productos mejor calificados.
        const response = await fetch(
          "http://localhost:4000/api/reviews/best-ranked"
        );
        // Si la respuesta no fue exitosa (ej. error 404 o 500), lanza un error.
        if (!response.ok) {
          throw new Error("Error al obtener productos mejor calificados");
        }
        // Convierte la respuesta de la API a formato JSON.
        const data = await response.json();
        // Mensaje de depuración para ver los datos crudos recibidos en la consola.
        console.log("Datos recibidos del servidor:", data);
        // Limita la cantidad de productos a los primeros 5 del array recibido.
        const limitedProducts = data.slice(0, 5);
        // Actualiza el estado 'bestProducts' con la lista limitada.
        setBestProducts(limitedProducts);
        // Limpia cualquier error previo si la petición actual fue exitosa.
        setError(null);
      } catch (err) {
        // Si ocurre un error en el bloque 'try', se captura aquí.
        setError(err.message);
        // Muestra el error detallado en la consola para facilitar la depuración.
        console.error("Error fetching best ranked products:", err);
      } finally {
        // El bloque 'finally' se ejecuta siempre, independientemente de si hubo un error o no.
        // Establece el estado de carga a 'false' para indicar que la operación ha finalizado.
        setLoading(false);
      }
    };

    // Llama a la función para que se ejecute al montar el componente.
    fetchBestRankedProducts();
  }, []); // El array de dependencias vacío asegura que el efecto se ejecute solo una vez.

  // El hook retorna un objeto con los productos, el estado de carga y el posible error.
  return { bestProducts, loading, error };
};