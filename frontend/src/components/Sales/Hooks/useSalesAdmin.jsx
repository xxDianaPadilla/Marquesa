import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from '../../../context/AuthContext';

const useSalesAdmin = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const salesRef = useRef([]);
  const isMountedRef = useRef(true);
  const fetchInProgressRef = useRef(false);

  const authContext = useAuth();

  const fetchSales = useCallback(async () => {
    if (fetchInProgressRef.current) {
      return;
    }

    if (!isMountedRef.current) {
      return;
    }

    fetchInProgressRef.current = true;

    try {
      if (!authContext?.getBestAvailableToken || !authContext?.setAuthToken) {
        throw new Error('AuthContext no disponible');
      }

      setLoading(true);
      setError(null);

      const token = authContext.getBestAvailableToken();
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      try {
        const response = await fetch("https://marquesa.onrender.com/api/sales/detailed", {
          method: 'GET',
          credentials: 'include',
          headers,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!isMountedRef.current) {
          return;
        }

        if (!response.ok) {
          let errorDetails;
          try {
            errorDetails = await response.json();
          } catch {
            errorDetails = await response.text();
          }
          throw new Error(`Error ${response.status}: ${errorDetails.message || response.statusText}`);
        }

        const result = await response.json();

        if (!isMountedRef.current) {
          return;
        }

        if (result.token) {
          try {
            authContext.setAuthToken(result.token);
          } catch (tokenError) {
            console.warn('Error estableciendo token:', tokenError);
          }
        }

        if (!result.success) {
          throw new Error(result.message || "El servidor indica un error");
        }

        let salesData = [];

        if (!result.data) {
        } else if (Array.isArray(result.data)) {
          salesData = result.data;
        } else if (result.data && typeof result.data === 'object') {
          if (Array.isArray(result.data.sales)) {
            salesData = result.data.sales;
          } else if (Array.isArray(result.data.data)) {
            salesData = result.data.data;
          } else {
            throw new Error("Formato de datos inválido");
          }
        } else {
          throw new Error("Datos de respuesta inválidos");
        }

        const validSales = salesData.filter((sale) => {
          return sale && typeof sale === 'object' && sale._id;
        });

        const sortedSales = validSales.sort((a, b) => {
          try {
            const dateA = new Date(a.deliveryDate || 0);
            const dateB = new Date(b.deliveryDate || 0);
            return dateA - dateB;
          } catch {
            return 0;
          }
        });

        if (!isMountedRef.current) {
          return;
        }

        salesRef.current = sortedSales;
        setSales(sortedSales);

      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }

    } catch (error) {
      if (!isMountedRef.current) return;

      let errorMessage = error.message;
      if (error.name === 'AbortError') {
        errorMessage = 'La conexión tardó demasiado tiempo. Inténtalo nuevamente.';
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
      }

      setError(errorMessage);
      setSales([]);
      salesRef.current = [];

    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
      fetchInProgressRef.current = false;
    }
  }, []);

  const forceFetchSales = useCallback(async () => {
    fetchInProgressRef.current = false;
    setSales([]);
    salesRef.current = [];
    setLoading(true);
    setError(null);
    
    setTimeout(() => {
      fetchSales();
    }, 100);
  }, [fetchSales]);

  const updateTrackingStatus = useCallback(async (saleId, newStatus) => {
    try {
      if (!saleId || !newStatus) {
        console.error('updateTrackingStatus: Parámetros inválidos', { saleId, newStatus });
        setError('Parámetros inválidos para actualizar el estado');
        return false;
      }

      if (!authContext?.getBestAvailableToken || !authContext?.setAuthToken) {
        console.error('updateTrackingStatus: AuthContext no disponible');
        setError('Error de autenticación');
        return false;
      }

      console.log('🔄 Actualizando estado de tracking:', { saleId, newStatus });

      const token = authContext.getBestAvailableToken();
      const headers = { 
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('✅ Token agregado a headers');
      } else {
        console.warn('⚠️ No hay token disponible');
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); 

      const response = await fetch(
        `https://marquesa.onrender.com/api/sales/${saleId}/trackingStatus`,
        {
          method: "PATCH",
          credentials: 'include', 
          headers,
          body: JSON.stringify({ trackingStatus: newStatus }),
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);

      console.log('📥 Respuesta recibida:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      });

      if (!response.ok) {
        let errorDetails;
        try {
          errorDetails = await response.json();
          console.error('❌ Error del servidor:', errorDetails);
        } catch {
          errorDetails = { message: response.statusText };
        }

        if (response.status === 401) {
          setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
        } else if (response.status === 403) {
          setError('No tienes permisos para realizar esta acción.');
        } else if (response.status === 404) {
          setError('La venta no fue encontrada.');
        } else if (response.status >= 500) {
          setError('Error del servidor. Inténtalo más tarde.');
        } else {
          setError(errorDetails.message || 'Error al actualizar el estado');
        }

        return false;
      }

      const data = await response.json();
      console.log('✅ Respuesta exitosa:', data);

      if (data.token && authContext.setAuthToken) {
        try {
          authContext.setAuthToken(data.token);
          console.log('🔄 Token actualizado exitosamente');
        } catch (tokenError) {
          console.warn('⚠️ Error estableciendo token:', tokenError);
          // No fallar la operación por esto
        }
      }

      if (!data.success) {
        const errorMsg = data.message || 'Error desconocido al actualizar';
        setError(errorMsg);
        console.error('❌ Operación no exitosa:', errorMsg);
        return false;
      }

      setSales((prevSales) => {
        if (!Array.isArray(prevSales)) {
          console.warn('⚠️ prevSales no es un array:', prevSales);
          return [];
        }

        const updatedSales = prevSales.map((sale) => {
          if (!sale || !sale._id) {
            console.warn('⚠️ Sale inválida encontrada:', sale);
            return sale;
          }
          
          if (sale._id === saleId) {
            const updatedSale = { 
              ...sale, 
              trackingStatus: newStatus,
              updatedAt: new Date().toISOString() 
            };
            console.log('✅ Sale actualizada localmente:', {
              id: saleId,
              oldStatus: sale.trackingStatus,
              newStatus: newStatus
            });
            return updatedSale;
          }
          
          return sale;
        });

        salesRef.current = updatedSales;
        return updatedSales;
      });

      setError(null);

      console.log('🎉 Estado actualizado exitosamente');
      return true;

    } catch (error) {
      console.error('❌ Error en updateTrackingStatus:', error);

      let errorMessage = 'Error al actualizar el estado';
      
      if (error.name === 'AbortError') {
        errorMessage = 'La operación tardó demasiado tiempo. Inténtalo nuevamente.';
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      return false;
    }
  }, [authContext]);

  const filterSalesByStatus = useCallback((status) => {
    const currentSales = salesRef.current;
    if (!Array.isArray(currentSales)) return [];
    
    return status === "all" 
      ? currentSales 
      : currentSales.filter((sale) => sale && sale.trackingStatus === status);
  }, []);

  const filterSalesByDate = useCallback((startDate, endDate) => {
    const currentSales = salesRef.current;
    if (!Array.isArray(currentSales)) return [];
    
    return currentSales.filter((sale) => {
      if (!sale || !sale.deliveryDate) return false;
      try {
        const saleDate = new Date(sale.deliveryDate);
        return saleDate >= startDate && saleDate <= endDate;
      } catch {
        return false;
      }
    });
  }, []);

  const searchSales = useCallback((searchTerm) => {
    const currentSales = salesRef.current;
    if (!Array.isArray(currentSales)) return [];
    
    if (!searchTerm || !searchTerm.trim()) return currentSales;

    const term = searchTerm.toLowerCase();
    return currentSales.filter((sale) => {
      if (!sale || typeof sale !== 'object') return false;
      
      return (
        (sale.clientName && sale.clientName.toLowerCase().includes(term)) ||
        (sale.receiverName && sale.receiverName.toLowerCase().includes(term)) ||
        (sale.deliveryPoint && sale.deliveryPoint.toLowerCase().includes(term)) ||
        (sale.deliveryAddress && sale.deliveryAddress.toLowerCase().includes(term))
      );
    });
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    if (authContext && typeof authContext.getBestAvailableToken === 'function') {
      const timeoutId = setTimeout(() => {
        if (isMountedRef.current) {
          fetchSales();
        }
      }, 100);

      return () => {
        clearTimeout(timeoutId);
      };
    } else {
      setError('Error de configuración de autenticación');
      setLoading(false);
    }

    return () => {
      isMountedRef.current = false;
      fetchInProgressRef.current = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      fetchInProgressRef.current = false;
    };
  }, []);

  return {
    sales,
    loading,
    error,
    fetchSales,
    forceFetchSales,
    updateTrackingStatus, 
    filterSalesByStatus,
    filterSalesByDate,
    searchSales,
  };
};

export default useSalesAdmin;