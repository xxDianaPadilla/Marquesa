// Importa los hooks useState y useEffect desde React.
import { useState, useEffect, useCallback } from "react";
import { useAuth } from '../../context/AuthContext';

// Define un custom hook llamado useClients para manejar la lógica relacionada con los clientes.
// ACTUALIZADO: Sistema de autenticación cross-domain híbrido
export const useClients = () => {
  // Declara el estado para almacenar la lista de clientes. Inicializa como un array vacío.
  const [clients, setClients] = useState([]);
  // Declara el estado para almacenar el número total de clientes. Inicializa en 0.
  const [totalClients, setTotalClients] = useState(0);
  // Declara el estado para manejar el estado de carga de los datos. Inicializa en true.
  const [loading, setLoading] = useState(true);
  // Declara el estado para almacenar cualquier error que ocurra durante la obtención de datos.
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

  // ✅ ACTUALIZADA: Función asíncrona para obtener la lista de todos los clientes desde la API con sistema híbrido.
  const fetchClients = useCallback(async () => {
    try {
      // ✅ NUEVA LÓGICA: Petición con sistema híbrido
      const operationPromise = fetch("https://test-9gs3.onrender.com/api/clients", {
        method: 'GET',
        credentials: 'include', // ✅ NUEVO: Incluir cookies
        headers: getAuthHeaders(), // ✅ NUEVO: Headers híbridos
      });

      // ✅ NUEVO: Timeout para conexiones lentas
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('TIMEOUT')), 30000);
      });

      // Realiza una petición GET al endpoint de la API para obtener los clientes.
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

      // Actualiza el estado 'clients' con los datos recibidos.
      setClients(data);
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
      
      // Si ocurre un error, actualiza el estado 'error' con el mensaje de error.
      setError(errorMessage);
    }
  }, [getAuthHeaders, getBestAvailableToken, setAuthToken]);

  // ✅ ACTUALIZADA: Función asíncrona para obtener el número total de clientes con sistema híbrido.
  const fetchTotalClients = useCallback(async () => {
    try {
      // ✅ NUEVA LÓGICA: Petición con sistema híbrido
      const operationPromise = fetch("https://test-9gs3.onrender.com/api/clients/total", {
        method: 'GET',
        credentials: 'include', // ✅ NUEVO: Incluir cookies
        headers: getAuthHeaders(), // ✅ NUEVO: Headers híbridos
      });

      // ✅ NUEVO: Timeout para conexiones lentas
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('TIMEOUT')), 30000);
      });

      // Realiza una petición GET a un endpoint específico para obtener el total.
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

      // Actualiza el estado 'totalClients' con el valor total recibido.
      setTotalClients(data.total);
      // Una vez que los datos se han cargado, establece 'loading' en false.
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
      
      // Si ocurre un error, actualiza el estado 'error'.
      setError(errorMessage);
      // También establece 'loading' en false para indicar que el proceso de carga ha finalizado (aunque con error).
      setLoading(false);
    }
  }, [getAuthHeaders, getBestAvailableToken, setAuthToken]);

  // useEffect se ejecuta una vez después del montaje inicial del componente, ya que el array de dependencias está vacío.
  useEffect(() => {
    // Llama a las funciones para obtener los datos de los clientes y el total de clientes.
    fetchClients();
    fetchTotalClients();
  }, [fetchClients, fetchTotalClients]); // ✅ NUEVO: Incluir dependencias en el array

  // El hook retorna un objeto con los estados y una función para volver a cargar los datos.
  return {
    clients, // La lista de clientes.
    totalClients, // El número total de clientes.
    loading, // El estado de carga.
    error, // El estado de error.
    // Función 'refetch' que permite a los componentes que usan este hook volver a solicitar los datos.
    refetch: useCallback(() => {
      setLoading(true);
      fetchClients();
      fetchTotalClients();
    }, [fetchClients, fetchTotalClients]), // ✅ NUEVO: Memoizar refetch
  };
};