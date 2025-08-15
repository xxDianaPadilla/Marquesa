// Importa los hooks useState y useEffect desde React.
import { useState, useEffect, useCallback } from "react";
import { useAuth } from '../../context/AuthContext';

// Define un custom hook llamado useClients para manejar la lógica relacionada con los clientes.
// ✅ CRÍTICO: Sistema de autenticación cross-domain híbrido COMPLETAMENTE alineado
export const useClients = () => {
  // Declara el estado para almacenar la lista de clientes. Inicializa como un array vacío.
  const [clients, setClients] = useState([]);
  // Declara el estado para almacenar el número total de clientes. Inicializa en 0.
  const [totalClients, setTotalClients] = useState(0);
  // Declara el estado para manejar el estado de carga de los datos. Inicializa en true.
  const [loading, setLoading] = useState(true);
  // Declara el estado para almacenar cualquier error que ocurra durante la obtención de datos.
  const [error, setError] = useState(null);

  // ✅ CRÍTICO: Hook de autenticación para sistema híbrido
  const { getBestAvailableToken, setAuthToken } = useAuth();

  /**
   * ✅ CRÍTICA: Crear headers de autenticación híbridos IGUAL que en loginController
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

  // ✅ CRÍTICA: Función asíncrona para obtener la lista de todos los clientes desde la API con sistema híbrido.
  const fetchClients = useCallback(async () => {
    try {
      // ✅ CRÍTICA: Petición con sistema híbrido IGUAL que loginController
      const operationPromise = fetch("https://marquesa.onrender.com/api/clients", {
        method: 'GET',
        credentials: 'include', // ✅ CRÍTICO: Incluir cookies IGUAL que loginController
        headers: getAuthHeaders(), // ✅ CRÍTICO: Headers híbridos IGUAL que loginController
      });

      // ✅ CRÍTICO: Timeout para conexiones lentas IGUAL que useLoginForm
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('TIMEOUT')), 30000);
      });

      // ✅ CRÍTICO: Race entre operación y timeout IGUAL que useLoginForm
      const response = await Promise.race([operationPromise, timeoutPromise]);
      
      // Verificar si la respuesta es exitosa
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Convierte la respuesta a formato JSON.
      const data = await response.json();

      // ✅ CRÍTICO: Manejo híbrido de tokens IGUAL que useLoginForm
      let token = null;

      // Primera prioridad: response body
      if (data.token) {
        token = data.token;
        setAuthToken(token); // Guardar en estado local
        console.log('✅ Token actualizado desde fetchClients');
      }

      // Segunda prioridad: cookie (con retraso)
      if (!token) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        token = getBestAvailableToken();
        if (token) {
          setAuthToken(token);
        }
      }

      // ✅ CORRECCIÓN: Verificar que data tenga la estructura correcta
      if (Array.isArray(data)) {
        // Si data es un array, usarlo directamente
        setClients(data);
      } else if (data.clients && Array.isArray(data.clients)) {
        // Si data tiene una propiedad clients que es un array
        setClients(data.clients);
      } else if (data.data && Array.isArray(data.data)) {
        // Si data tiene una propiedad data que es un array
        setClients(data.data);
      } else {
        // Si no hay estructura reconocible, inicializar array vacío
        console.warn('Estructura de datos inesperada:', data);
        setClients([]);
      }
      
      // Limpiar error si la operación fue exitosa
      setError(null);
      
    } catch (error) {
      // ✅ CRÍTICO: Manejo específico de errores IGUAL que useLoginForm
      let errorMessage = error.message;
      
      if (error.message === 'TIMEOUT') {
        errorMessage = 'La conexión tardó demasiado tiempo. Inténtalo nuevamente.';
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
      } else if (error.message?.includes('timeout')) {
        errorMessage = 'La conexión tardó demasiado. Inténtalo nuevamente.';
      } else if (error.message?.includes('network')) {
        errorMessage = 'Error de red. Verifica tu conexión a internet.';
      } else if (error.message?.includes('HTTP 401')) {
        errorMessage = 'Sesión expirada. Inicia sesión nuevamente.';
      } else if (error.message?.includes('HTTP 403')) {
        errorMessage = 'No tienes permisos para acceder a esta información.';
      } else if (error.message?.includes('HTTP 500')) {
        errorMessage = 'Error del servidor. Inténtalo más tarde.';
      }
      
      console.error('❌ Error en fetchClients:', error);
      // Si ocurre un error, actualiza el estado 'error' con el mensaje de error.
      setError(errorMessage);
      // Establecer array vacío en caso de error
      setClients([]);
    }
  }, [getAuthHeaders, getBestAvailableToken, setAuthToken]);

  // ✅ CRÍTICA: Función asíncrona para obtener el número total de clientes con sistema híbrido.
  const fetchTotalClients = useCallback(async () => {
    try {
      // ✅ CRÍTICA: Petición con sistema híbrido IGUAL que loginController
      const operationPromise = fetch("https://marquesa.onrender.com/api/clients/total", {
        method: 'GET',
        credentials: 'include', // ✅ CRÍTICO: Incluir cookies IGUAL que loginController
        headers: getAuthHeaders(), // ✅ CRÍTICO: Headers híbridos IGUAL que loginController
      });

      // ✅ CRÍTICO: Timeout para conexiones lentas IGUAL que useLoginForm
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('TIMEOUT')), 30000);
      });

      // ✅ CRÍTICO: Race entre operación y timeout IGUAL que useLoginForm
      const response = await Promise.race([operationPromise, timeoutPromise]);
      
      // Verificar si la respuesta es exitosa
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Convierte la respuesta a formato JSON.
      const data = await response.json();

      // ✅ CRÍTICO: Manejo híbrido de tokens IGUAL que useLoginForm
      let token = null;

      // Primera prioridad: response body
      if (data.token) {
        token = data.token;
        setAuthToken(token); // Guardar en estado local
        console.log('✅ Token actualizado desde fetchTotalClients');
      }

      // Segunda prioridad: cookie (con retraso)
      if (!token) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        token = getBestAvailableToken();
        if (token) {
          setAuthToken(token);
        }
      }

      // ✅ CORRECCIÓN: Manejo robusto del total
      let totalCount = 0;
      
      if (typeof data.total === 'number') {
        totalCount = data.total;
      } else if (typeof data.count === 'number') {
        totalCount = data.count;
      } else if (typeof data === 'number') {
        totalCount = data;
      } else if (data.data && typeof data.data.total === 'number') {
        totalCount = data.data.total;
      } else {
        console.warn('No se pudo determinar el total de clientes:', data);
        totalCount = 0;
      }

      // Actualiza el estado 'totalClients' con el valor total recibido.
      setTotalClients(totalCount);
      
      // Una vez que los datos se han cargado, establece 'loading' en false.
      setLoading(false);
      
      // Limpiar error si la operación fue exitosa
      setError(null);
      
    } catch (error) {
      // ✅ CRÍTICO: Manejo específico de errores IGUAL que useLoginForm
      let errorMessage = error.message;
      
      if (error.message === 'TIMEOUT') {
        errorMessage = 'La conexión tardó demasiado tiempo. Inténtalo nuevamente.';
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
      } else if (error.message?.includes('timeout')) {
        errorMessage = 'La conexión tardó demasiado. Inténtalo nuevamente.';
      } else if (error.message?.includes('network')) {
        errorMessage = 'Error de red. Verifica tu conexión a internet.';
      } else if (error.message?.includes('HTTP 401')) {
        errorMessage = 'Sesión expirada. Inicia sesión nuevamente.';
      } else if (error.message?.includes('HTTP 403')) {
        errorMessage = 'No tienes permisos para acceder a esta información.';
      } else if (error.message?.includes('HTTP 500')) {
        errorMessage = 'Error del servidor. Inténtalo más tarde.';
      }
      
      console.error('❌ Error en fetchTotalClients:', error);
      // Si ocurre un error, actualiza el estado 'error'.
      setError(errorMessage);
      // También establece 'loading' en false para indicar que el proceso de carga ha finalizado (aunque con error).
      setLoading(false);
      // Establecer total en 0 en caso de error
      setTotalClients(0);
    }
  }, [getAuthHeaders, getBestAvailableToken, setAuthToken]);

  // ✅ NUEVA: Función para crear un nuevo cliente
  const createClient = useCallback(async (clientData) => {
    try {
      const operationPromise = fetch("https://marquesa.onrender.com/api/clients", {
        method: 'POST',
        credentials: 'include', // ✅ CRÍTICO: Incluir cookies
        headers: getAuthHeaders(),
        body: JSON.stringify(clientData)
      });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('TIMEOUT')), 30000);
      });

      const response = await Promise.race([operationPromise, timeoutPromise]);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
      
      const data = await response.json();

      // Actualizar token si viene en la respuesta
      if (data.token) {
        setAuthToken(data.token);
      }

      return { success: true, client: data.client || data };
    } catch (error) {
      console.error('❌ Error creando cliente:', error);
      return { success: false, message: error.message };
    }
  }, [getAuthHeaders, setAuthToken]);

  // ✅ NUEVA: Función para actualizar un cliente
  const updateClient = useCallback(async (clientId, clientData) => {
    try {
      const operationPromise = fetch(`https://marquesa.onrender.com/api/clients/${clientId}`, {
        method: 'PUT',
        credentials: 'include', // ✅ CRÍTICO: Incluir cookies
        headers: getAuthHeaders(),
        body: JSON.stringify(clientData)
      });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('TIMEOUT')), 30000);
      });

      const response = await Promise.race([operationPromise, timeoutPromise]);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
      
      const data = await response.json();

      // Actualizar token si viene en la respuesta
      if (data.token) {
        setAuthToken(data.token);
      }

      return { success: true, client: data.client || data };
    } catch (error) {
      console.error('❌ Error actualizando cliente:', error);
      return { success: false, message: error.message };
    }
  }, [getAuthHeaders, setAuthToken]);

  // ✅ NUEVA: Función para eliminar un cliente
  const deleteClient = useCallback(async (clientId) => {
    try {
      const operationPromise = fetch(`https://marquesa.onrender.com/api/clients/${clientId}`, {
        method: 'DELETE',
        credentials: 'include', // ✅ CRÍTICO: Incluir cookies
        headers: getAuthHeaders()
      });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('TIMEOUT')), 30000);
      });

      const response = await Promise.race([operationPromise, timeoutPromise]);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
      
      const data = await response.json();

      // Actualizar token si viene en la respuesta
      if (data.token) {
        setAuthToken(data.token);
      }

      return { success: true, message: data.message };
    } catch (error) {
      console.error('❌ Error eliminando cliente:', error);
      return { success: false, message: error.message };
    }
  }, [getAuthHeaders, setAuthToken]);

  // ✅ NUEVA: Función para obtener un cliente específico
  const getClient = useCallback(async (clientId) => {
    try {
      const operationPromise = fetch(`https://marquesa.onrender.com/api/clients/${clientId}`, {
        method: 'GET',
        credentials: 'include', // ✅ CRÍTICO: Incluir cookies
        headers: getAuthHeaders()
      });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('TIMEOUT')), 30000);
      });

      const response = await Promise.race([operationPromise, timeoutPromise]);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
      
      const data = await response.json();

      // Actualizar token si viene en la respuesta
      if (data.token) {
        setAuthToken(data.token);
      }

      return { success: true, client: data.client || data };
    } catch (error) {
      console.error('❌ Error obteniendo cliente:', error);
      return { success: false, message: error.message };
    }
  }, [getAuthHeaders, setAuthToken]);

  // useEffect se ejecuta una vez después del montaje inicial del componente, ya que el array de dependencias está vacío.
  useEffect(() => {
    // ✅ MEJORA: Solo cargar datos si no hay procesos en curso
    if (!loading) {
      setLoading(true);
    }
    
    // Llamar a las funciones para obtener los datos de los clientes y el total de clientes.
    fetchClients();
    fetchTotalClients();
  }, [fetchClients, fetchTotalClients]); // ✅ CRÍTICO: Incluir dependencias en el array

  // ✅ NUEVA: Función de refetch mejorada
  const refetch = useCallback(() => {
    console.log('🔄 Refetching clients data...');
    setLoading(true);
    setError(null); // Limpiar errores previos
    
    // Ejecutar ambas funciones y manejar loading correctamente
    Promise.all([
      fetchClients(),
      fetchTotalClients()
    ]).finally(() => {
      // setLoading(false) se maneja en fetchTotalClients
    });
  }, [fetchClients, fetchTotalClients]);

  // El hook retorna un objeto con los estados y funciones necesarias.
  return {
    // Estados principales
    clients, // La lista de clientes.
    totalClients, // El número total de clientes.
    loading, // El estado de carga.
    error, // El estado de error.
    
    // Funciones de obtención de datos
    refetch, // ✅ MEJORADA: Función para volver a cargar los datos
    fetchClients, // Función para obtener lista de clientes
    fetchTotalClients, // Función para obtener total de clientes
    
    // ✅ NUEVAS: Funciones CRUD
    createClient, // Crear nuevo cliente
    updateClient, // Actualizar cliente existente
    deleteClient, // Eliminar cliente
    getClient, // Obtener cliente específico
    
    // ✅ NUEVA: Función de utilidad
    clearError: useCallback(() => setError(null), []) // Limpiar errores manualmente
  };
};