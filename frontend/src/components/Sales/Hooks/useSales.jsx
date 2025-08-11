// Importa los hooks useState y useEffect de la biblioteca de React.
import { useState, useEffect, useCallback } from "react";
import { useAuth } from '../../../context/AuthContext';

// Define y exporta un custom hook para manejar la lógica relacionada con las ventas.
// ACTUALIZADO: Sistema de autenticación cross-domain híbrido
export const useSales = () => {
  // Estado para almacenar la lista de todas las ventas.
  const [sales, setSales] = useState([]);
  // Estado para almacenar el número total de ventas.
  const [totalSales, setTotalSales] = useState(0);
  // Estado para manejar el estado de carga de los datos.
  const [loading, setLoading] = useState(true);
  // Estado para almacenar cualquier error que ocurra durante las peticiones.
  const [error, setError] = useState(null);

  // ✅ NUEVO: Hook de autenticación para sistema híbrido
  const { getBestAvailableToken,setAuthToken } = useAuth();

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

  // ✅ ACTUALIZADA: Función asíncrona para obtener la lista de ventas desde la API con sistema híbrido.
  const fetchSales = useCallback(async () => {
    try {
      // ✅ NUEVA LÓGICA: Petición con sistema híbrido
      const operationPromise = fetch("https://test-9gs3.onrender.com/api/sales", {
        method: 'GET',
        credentials: 'include', // ✅ NUEVO: Incluir cookies
        headers: getAuthHeaders(), // ✅ NUEVO: Headers híbridos
      });

      // ✅ NUEVO: Timeout para conexiones lentas
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('TIMEOUT')), 30000);
      });

      // Realizar petición con timeout
      const response = await Promise.race([operationPromise, timeoutPromise]);
      // Convierte la respuesta a formato JSON.
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

      // Actualiza el estado 'sales' con los datos recibidos.
      setSales(data);
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
      
      // Si ocurre un error, se guarda el mensaje en el estado de error.
      setError(errorMessage);
    }
  }, [getAuthHeaders, getBestAvailableToken, setAuthToken]);

  // ✅ ACTUALIZADA: Función asíncrona para obtener el número total de ventas con sistema híbrido.
  const fetchTotalSales = useCallback(async () => {
    try {
      // ✅ NUEVA LÓGICA: Petición con sistema híbrido
      const operationPromise = fetch("https://test-9gs3.onrender.com/api/sales/total", {
        method: 'GET',
        credentials: 'include', // ✅ NUEVO: Incluir cookies
        headers: getAuthHeaders(), // ✅ NUEVO: Headers híbridos
      });

      // ✅ NUEVO: Timeout para conexiones lentas
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('TIMEOUT')), 30000);
      });

      // Realizar petición con timeout
      const response = await Promise.race([operationPromise, timeoutPromise]);
      // Convierte la respuesta a formato JSON.
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

      // Actualiza el estado 'totalSales' con el valor 'total' del objeto recibido.
      setTotalSales(data.total);
      // Indica que la carga ha finalizado.
      setLoading(false);
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
      
      // Si hay un error, lo guarda en el estado de error.
      setError(errorMessage);
      // Igualmente, indica que la carga ha finalizado (aunque con error).
      setLoading(false);
    }
  }, [getAuthHeaders, getBestAvailableToken, setAuthToken]);

  // useEffect se ejecuta una vez cuando el componente que usa el hook se monta.
  useEffect(() => {
    // Llama a las funciones para obtener los datos iniciales.
    fetchSales();
    fetchTotalSales();
  }, [fetchSales, fetchTotalSales]); // ✅ NUEVO: Incluir dependencias en el array

  // El hook retorna un objeto con los estados y una función para volver a cargar los datos.
  return {
    sales, // La lista de ventas.
    totalSales, // El número total de ventas.
    loading, // El estado de carga.
    error, // El estado de error.
    // La función 'refetch' permite a los componentes que usan este hook volver a solicitar los datos de ventas.
    refetch: useCallback(() => {
      setLoading(true);
      fetchSales();
      fetchTotalSales();
    }, [fetchSales, fetchTotalSales]), // ✅ NUEVO: Memoizar refetch
  };
};