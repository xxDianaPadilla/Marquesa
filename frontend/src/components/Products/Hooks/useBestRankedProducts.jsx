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
        setLoading(true);
        const response = await fetch(
          "http://localhost:4000/api/reviews/bestRanked"
        );

        if (!response.ok) {
          throw new Error("Error al obtener productos mejor calificados");
        }

        const responseData = await response.json();
        console.log("Datos recibidos del servidor:", responseData);

        // Verifica que la respuesta tenga el formato esperado
        if (responseData.success && Array.isArray(responseData.data)) {
          const limitedProducts = responseData.data.slice(0, 5);
          setBestProducts(limitedProducts);
        } else {
          throw new Error("Formato de respuesta inválido del servidor");
        }

        setError(null);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching best ranked products:", err);
      } finally {
        setLoading(false);
      }
    };

    // Llama a la función para que se ejecute al montar el componente.
    fetchBestRankedProducts();
  }, []); // El array de dependencias vacío asegura que el efecto se ejecute solo una vez.

  // El hook retorna un objeto con los productos, el estado de carga y el posible error.
  return { bestProducts, loading, error };
};