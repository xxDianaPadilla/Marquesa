// Importa los hooks useState y useEffect desde React.
import { useState, useEffect } from "react";

// Define un custom hook para manejar la lógica de ventas en el panel de administración.
const useSalesAdmin = () => {
  // Estado para almacenar la lista de ventas detalladas.
  const [sales, setSales] = useState([]);
  // Estado para controlar el estado de carga de los datos.
  const [loading, setLoading] = useState(true);
  // Estado para almacenar cualquier error que ocurra.
  const [error, setError] = useState(null);

  // Función asíncrona para obtener todas las ventas desde el backend.
  const fetchSales = async () => {
    try {
      setLoading(true);
      // Realiza la petición a un endpoint que devuelve ventas con datos detallados.
      const response = await fetch("http://localhost:4000/api/sales/detailed");

      if (!response.ok) {
        throw new Error("Error al obtener las ventas");
      }

      const data = await response.json();

      // Ordena las ventas por fecha de entrega de forma ascendente antes de guardarlas en el estado.
      const sortedSales = data.sort((a, b) => {
        return new Date(a.deliveryDate) - new Date(b.deliveryDate);
      });

      setSales(sortedSales);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar el estado de seguimiento de una venta específica.
  const updateTrackingStatus = async (saleId, newStatus) => {
    try {
      // Realiza una petición PUT al backend para actualizar el estado.
      const response = await fetch(
        `http://localhost:4000/api/sales/${saleId}/tracking`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          // Envía el nuevo estado en el cuerpo de la petición.
          body: JSON.stringify({ trackingStatus: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error("Error al actualizar el estado");
      }

      // Actualiza el estado localmente para reflejar el cambio sin necesidad de volver a cargar todo.
      setSales((prevSales) =>
        prevSales.map((sale) =>
          sale._id === saleId
            ? // Si es la venta correcta, devuelve un nuevo objeto con el estado actualizado.
              { ...sale, trackingStatus: newStatus }
            : // Si no, devuelve la venta sin cambios.
              sale
        )
      );

      // Devuelve true para indicar que la operación fue exitosa.
      return true;
    } catch (error) {
      setError(error.message);
      // Devuelve false si la operación falló.
      return false;
    }
  };

  // Función síncrona para filtrar las ventas en el estado local por su estado de seguimiento.
  const filterSalesByStatus = (status) => {
    return sales.filter((sale) => sale.trackingStatus === status);
  };

  // Función para filtrar las ventas en el estado local por un rango de fechas.
  const filterSalesByDate = (startDate, endDate) => {
    return sales.filter((sale) => {
      const saleDate = new Date(sale.deliveryDate);
      return saleDate >= startDate && saleDate <= endDate;
    });
  };

  // Función para buscar ventas en el estado local basadas en un término de búsqueda.
  const searchSales = (searchTerm) => {
    const term = searchTerm.toLowerCase(); // Búsqueda insensible a mayúsculas/minúsculas.
    return sales.filter(
      (sale) =>
        sale.clientName.toLowerCase().includes(term) ||
        sale.receiverName.toLowerCase().includes(term) ||
        sale.deliveryPoint.toLowerCase().includes(term) ||
        sale.deliveryAddress.toLowerCase().includes(term)
    );
  };

  // useEffect para cargar las ventas iniciales cuando el componente se monta.
  useEffect(() => {
    fetchSales();
  }, []); // El array vacío asegura que se ejecute solo una vez.

  // El hook retorna los estados y todas las funciones para ser usadas por el componente.
  return {
    sales,
    loading,
    error,
    fetchSales, // Permite recargar los datos manualmente.
    updateTrackingStatus,
    filterSalesByStatus,
    filterSalesByDate,
    searchSales,
  };
};

export default useSalesAdmin;
