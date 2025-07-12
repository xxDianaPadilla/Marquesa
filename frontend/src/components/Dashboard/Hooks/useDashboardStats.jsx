// Importa los hooks useState y useEffect de React para manejar el estado y los efectos secundarios.
import { useState, useEffect } from "react";

// Define y exporta un custom hook para obtener y procesar las estadísticas del dashboard.
export const useDashboardStats = () => {
  // Inicializa el estado 'stats' con una estructura anidada para clientes y productos.
  // Cada uno tiene valores para el período actual, anterior, cambio porcentual y un estado de carga.
  const [stats, setStats] = useState({
    newClients: {
      current: 0,
      previous: 0,
      percentageChange: 0,
      loading: true, // Indica que los datos de nuevos clientes están cargando.
    },
    soldProducts: {
      current: 0,
      previous: 0,
      percentageChange: 0,
      loading: true, // Indica que los datos de productos vendidos están cargando.
    },
  });
  // Estado para almacenar cualquier error que ocurra durante las peticiones.
  const [error, setError] = useState(null);

  // useEffect se ejecuta una vez al montar el componente para cargar las estadísticas iniciales.
  useEffect(() => {
    fetchDashboardStats();
  }, []); // El array vacío asegura que se ejecute solo una vez.

  // Función auxiliar reutilizable para realizar peticiones fetch y manejar respuestas JSON y errores.
  const fetchJSON = async (url) => {
    const res = await fetch(url);
    // Si la respuesta de la red no es exitosa (ej. status 4xx o 5xx).
    if (!res.ok) {
      // Intenta leer el cuerpo del error como JSON, si falla, devuelve un objeto vacío.
      const errorBody = await res.json().catch(() => ({}));
      // Lanza un nuevo error con el mensaje del servidor o un mensaje genérico.
      throw new Error(errorBody.message || `Error en ${url}: ${res.status}`);
    }
    // Si la respuesta es exitosa, la devuelve como JSON.
    return res.json();
  };

  // Función principal asíncrona que orquesta la obtención de todas las estadísticas.
  const fetchDashboardStats = async () => {
    try {
      // Utiliza Promise.all para ejecutar las peticiones de clientes (actual y anterior) en paralelo.
      const [currentClients, previousClients] = await Promise.all([
        fetchJSON(
          "http://localhost:4000/api/clients/newClientsStats?period=current"
        ),
        fetchJSON(
          "http://localhost:4000/api/clients/newClientsStats?period=previous"
        ),
      ]);

      // Hace lo mismo para las estadísticas de ventas, también en paralelo.
      const [currentSales, previousSales] = await Promise.all([
        fetchJSON(
          "http://localhost:4000/api/sales/soldProductsStats?period=current"
        ),
        fetchJSON(
          "http://localhost:4000/api/sales/soldProductsStats?period=previous"
        ),
      ]);

      // Calcula el cambio porcentual de clientes. Si el valor previo es 0, asume un 100% de crecimiento para evitar división por cero.
      const clientsPercentageChange =
        previousClients.count === 0
          ? 100
          : ((currentClients.count - previousClients.count) /
              previousClients.count) *
            100;

      // Calcula el cambio porcentual de ventas con la misma lógica para evitar división por cero.
      const salesPercentageChange =
        previousSales.count === 0
          ? 100
          : ((currentSales.count - previousSales.count) / previousSales.count) *
            100;

      // Actualiza el estado 'stats' con todos los datos calculados y recibidos.
      setStats({
        newClients: {
          current: currentClients.count,
          previous: previousClients.count,
          // Redondea el porcentaje a un decimal.
          percentageChange: Math.round(clientsPercentageChange * 10) / 10,
          loading: false, // Termina el estado de carga.
        },
        soldProducts: {
          current: currentSales.count,
          previous: previousSales.count,
          percentageChange: Math.round(salesPercentageChange * 10) / 10,
          loading: false, // Termina el estado de carga.
        },
      });
    } catch (error) {
      // Si cualquier promesa en el bloque try falla, se captura el error aquí.
      setError(error.message);
      // Actualiza el estado para indicar que la carga ha terminado, incluso si hubo un error.
      setStats((prev) => ({
        newClients: { ...prev.newClients, loading: false },
        soldProducts: { ...prev.soldProducts, loading: false },
      }));
    }
  };

  // El hook retorna el objeto de estadísticas, el estado de error y una función para recargar los datos.
  return { stats, error, refetch: fetchDashboardStats };
};
