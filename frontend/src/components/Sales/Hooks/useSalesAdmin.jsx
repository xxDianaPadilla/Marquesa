import { useState, useEffect } from "react";

const useSalesAdmin = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:4000/api/sales/detailed");

      if (!response.ok) {
        throw new Error("Error al obtener las ventas");
      }

      const result = await response.json();

      if (!Array.isArray(result.data)) {
        throw new Error("Formato de datos inválido: se esperaba un array");
      }

      const sortedSales = result.data.sort((a, b) => {
        return new Date(a.deliveryDate) - new Date(b.deliveryDate);
      });

      setSales(sortedSales);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateTrackingStatus = async (saleId, newStatus) => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/sales/${saleId}/trackingStatus`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ trackingStatus: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error("Error al actualizar el estado");
      }

      setSales((prevSales) =>
        prevSales.map((sale) =>
          sale._id === saleId
            ? { ...sale, trackingStatus: newStatus }
            : sale
        )
      );

      return true;
    } catch (error) {
      setError(error.message);
      return false;
    }
  };

  const filterSalesByStatus = (status) => {
    return sales.filter((sale) => sale.trackingStatus === status);
  };

  const filterSalesByDate = (startDate, endDate) => {
    return sales.filter((sale) => {
      const saleDate = new Date(sale.deliveryDate);
      return saleDate >= startDate && saleDate <= endDate;
    });
  };

  const searchSales = (searchTerm) => {
    const term = searchTerm.toLowerCase();
    return sales.filter(
      (sale) =>
        sale.clientName.toLowerCase().includes(term) ||
        sale.receiverName.toLowerCase().includes(term) ||
        sale.deliveryPoint.toLowerCase().includes(term) ||
        sale.deliveryAddress.toLowerCase().includes(term)
    );
  };

  useEffect(() => {
    fetchSales();
  }, []);

  return {
    sales,
    loading,
    error,
    fetchSales,
    updateTrackingStatus,
    filterSalesByStatus,
    filterSalesByDate,
    searchSales,
  };
};

export default useSalesAdmin;