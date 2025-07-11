// Importa los hooks useState y useEffect desde React.
import { useState, useEffect } from "react";

// Define un custom hook llamado useClients para manejar la lógica relacionada con los clientes.
export const useClients = () => {
  // Declara el estado para almacenar la lista de clientes. Inicializa como un array vacío.
  const [clients, setClients] = useState([]);
  // Declara el estado para almacenar el número total de clientes. Inicializa en 0.
  const [totalClients, setTotalClients] = useState(0);
  // Declara el estado para manejar el estado de carga de los datos. Inicializa en true.
  const [loading, setLoading] = useState(true);
  // Declara el estado para almacenar cualquier error que ocurra durante la obtención de datos.
  const [error, setError] = useState(null);

  // useEffect se ejecuta una vez después del montaje inicial del componente, ya que el array de dependencias está vacío.
  useEffect(() => {
    // Llama a las funciones para obtener los datos de los clientes y el total de clientes.
    fetchClients();
    fetchTotalClients();
  }, []);

  // Función asíncrona para obtener la lista de todos los clientes desde la API.
  const fetchClients = async () => {
    try {
      // Realiza una petición GET al endpoint de la API para obtener los clientes.
      const response = await fetch("http://localhost:4000/api/clients");
      // Convierte la respuesta a formato JSON.
      const data = await response.json();
      // Actualiza el estado 'clients' con los datos recibidos.
      setClients(data);
    } catch (error) {
      // Si ocurre un error, actualiza el estado 'error' con el mensaje de error.
      setError(error.message);
    }
  };

  // Función asíncrona para obtener el número total de clientes.
  const fetchTotalClients = async () => {
    try {
      // Realiza una petición GET a un endpoint específico para obtener el total.
      const response = await fetch("http://localhost:4000/api/clients/total");
      // Convierte la respuesta a formato JSON.
      const data = await response.json();
      // Actualiza el estado 'totalClients' con el valor total recibido.
      setTotalClients(data.total);
      // Una vez que los datos se han cargado, establece 'loading' en false.
      setLoading(false);
    } catch (error) {
      // Si ocurre un error, actualiza el estado 'error'.
      setError(error.message);
      // También establece 'loading' en false para indicar que el proceso de carga ha finalizado (aunque con error).
      setLoading(false);
    }
  };

  // El hook retorna un objeto con los estados y una función para volver a cargar los datos.
  return {
    clients, // La lista de clientes.
    totalClients, // El número total de clientes.
    loading, // El estado de carga.
    error, // El estado de error.
    // Función 'refetch' que permite a los componentes que usan este hook volver a solicitar los datos.
    refetch: () => {
      fetchClients();
      fetchTotalClients();
    },
  };
};
