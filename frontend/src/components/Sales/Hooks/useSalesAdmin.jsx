import { useState, useEffect, useCallback } from "react";
import { useAuth } from '../../../context/AuthContext';

// ACTUALIZADO: Sistema de autenticación cross-domain híbrido
const useSalesAdmin = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ NUEVO: Hook de autenticación para sistema híbrido
  const { getBestAvailableToken, setAuthToken } = useAuth();

  /**
   * ✅ NUEVA FUNCIÓN: Crear headers de autenticación híbridos
   */
  const getAuthHeaders = useCallback(() => {
    const token = getBestAvailableToken();
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }, [getBestAvailableToken]);

  // ✅ ACTUALIZADA: Función fetchSales con sistema híbrido
  const fetchSales = useCallback(async () => {
    try {
      setLoading(true);

      // ✅ NUEVA LÓGICA: Petición con sistema híbrido
      const operationPromise = fetch("https://marquesa.onrender.com/api/sales/detailed", {
        method: 'GET',
        credentials: 'include', // ✅ NUEVO: Incluir cookies
        headers: getAuthHeaders(), // ✅ NUEVO: Headers híbridos
      });

      // ✅ NUEVO: Timeout para conexiones lentas
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('TIMEOUT')), 30000);
      });

      const response = await Promise.race([operationPromise, timeoutPromise]);

      if (!response.ok) {
        throw new Error("Error al obtener las ventas");
      }

      const result = await response.json();

      // ✅ NUEVO: Manejo híbrido de tokens
      let token = null;

      // Primera prioridad: response body
      if (result.token) {
        token = result.token;
        setAuthToken(token); // Guardar en estado local
      }

      // Segunda prioridad: cookie (con retraso)
      if (!token) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        token = getBestAvailableToken();
        if (token) {
          setAuthToken(token);
        }
      }

      if (!Array.isArray(result.data)) {
        throw new Error("Formato de datos inválido: se esperaba un array");
      }

      const sortedSales = result.data.sort((a, b) => {
        return new Date(a.deliveryDate) - new Date(b.deliveryDate);
      });

      setSales(sortedSales);
    } catch (error) {
      // ✅ NUEVO: Manejo específico de errores de red vs servidor
      let errorMessage = error.message;
      
      if (error.message === 'TIMEOUT') {
        errorMessage = 'La conexión tardó demasiado tiempo. Inténtalo nuevamente.';
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
      } else if (error.message?.includes('timeout')) {
        errorMessage = 'La conexión tardó demasiado. Inténtalo nuevamente.';
      } else if (error.message?.includes('network')) {
        errorMessage = 'Error de red. Verifica tu conexión a internet.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders, getBestAvailableToken, setAuthToken]);

  // ✅ ACTUALIZADA: Función updateTrackingStatus con sistema híbrido
  const updateTrackingStatus = useCallback(async (saleId, newStatus) => {
    try {
      // ✅ NUEVA LÓGICA: Petición con sistema híbrido
      const operationPromise = fetch(
        `https://marquesa.onrender.com/api/sales/${saleId}/trackingStatus`,
        {
          method: "PATCH",
          credentials: 'include', // ✅ NUEVO: Incluir cookies
          headers: getAuthHeaders(), // ✅ NUEVO: Headers híbridos
          body: JSON.stringify({ trackingStatus: newStatus }),
        }
      );

      // ✅ NUEVO: Timeout para conexiones lentas
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('TIMEOUT')), 30000);
      });

      const response = await Promise.race([operationPromise, timeoutPromise]);

      if (!response.ok) {
        throw new Error("Error al actualizar el estado");
      }

      const data = await response.json();

      // ✅ NUEVO: Manejo híbrido de tokens
      let token = null;

      // Primera prioridad: response body
      if (data.token) {
        token = data.token;
        setAuthToken(token); // Guardar en estado local
      }

      // Segunda prioridad: cookie (con retraso)
      if (!token) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        token = getBestAvailableToken();
        if (token) {
          setAuthToken(token);
        }
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
      // ✅ NUEVO: Manejo específico de errores de red vs servidor
      let errorMessage = error.message;
      
      if (error.message === 'TIMEOUT') {
        errorMessage = 'La conexión tardó demasiado tiempo. Inténtalo nuevamente.';
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
      } else if (error.message?.includes('timeout')) {
        errorMessage = 'La conexión tardó demasiado. Inténtalo nuevamente.';
      } else if (error.message?.includes('network')) {
        errorMessage = 'Error de red. Verifica tu conexión a internet.';
      }
      
      setError(errorMessage);
      return false;
    }
  }, [getAuthHeaders, getBestAvailableToken, setAuthToken]);

  // Funciones de filtrado (sin cambios, no requieren autenticación)
  const filterSalesByStatus = useCallback((status) => {
    return sales.filter((sale) => sale.trackingStatus === status);
  }, [sales]);

  const filterSalesByDate = useCallback((startDate, endDate) => {
    return sales.filter((sale) => {
      const saleDate = new Date(sale.deliveryDate);
      return saleDate >= startDate && saleDate <= endDate;
    });
  }, [sales]);

  const searchSales = useCallback((searchTerm) => {
    const term = searchTerm.toLowerCase();
    return sales.filter(
      (sale) =>
        sale.clientName.toLowerCase().includes(term) ||
        sale.receiverName.toLowerCase().includes(term) ||
        sale.deliveryPoint.toLowerCase().includes(term) ||
        sale.deliveryAddress.toLowerCase().includes(term)
    );
  }, [sales]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]); // ✅ NUEVO: Incluir fetchSales en dependencias

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