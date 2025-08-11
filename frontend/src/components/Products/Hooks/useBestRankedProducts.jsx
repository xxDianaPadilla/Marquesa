// REEMPLAZAR COMPLETAMENTE: frontend/src/components/Products/Hooks/useBestRankedProducts.jsx

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
        setError(null);

        // CORREGIDO: Usar el endpoint correcto que existe en el backend
        const response = await fetch(
          "https://test-9gs3.onrender.com/api/products/best-rated", // ← BACKEND URL CORRECTA
          {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );

        if (!response.ok) {
          throw new Error(`Error ${response.status}: Error al obtener productos mejor calificados`);
        }

        const responseData = await response.json();
        console.log("Datos recibidos del servidor (best-rated):", responseData);

        // CORREGIDO: Verificar la estructura correcta que devuelve el backend
        if (responseData.success && Array.isArray(responseData.bestRated)) {
          const limitedProducts = responseData.bestRated.slice(0, 10);
          setBestProducts(limitedProducts);
          console.log(`✅ ${limitedProducts.length} productos mejor calificados cargados`);
        } else {
          console.warn("Estructura de respuesta inesperada:", responseData);
          setBestProducts([]);
        }

        setError(null);
      } catch (err) {
        console.error("Error fetching best ranked products:", err);
        setError(err.message);
        setBestProducts([]);
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