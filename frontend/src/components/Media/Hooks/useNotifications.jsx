// Importa los hooks useState y useCallback desde React.
import { useState, useCallback } from "react";

// Define y exporta un custom hook para gestionar un sistema de notificaciones.
export const useNotifications = () => {
  // Estado para almacenar la lista de notificaciones activas. Inicia como un array vacío.
  const [notifications, setNotifications] = useState([]);

  /**
   * Muestra una nueva notificación.
   * useCallback memoriza la función para evitar que se recree en cada render, optimizando el rendimiento.
   * @param {string} message - El mensaje a mostrar en la notificación.
   * @param {string} type - El tipo de notificación ('success', 'error', etc.), por defecto es 'success'.
   * @param {number} duration - La duración en milisegundos antes de que se oculte, por defecto 5000ms.
   */
  const showNotification = useCallback(
    (message, type = "success", duration = 5000) => {
      // Genera un ID único para la notificación combinando el timestamp y un número aleatorio.
      const id = Date.now() + Math.random();
      // Crea el objeto de la notificación con todos sus datos.
      const notification = {
        id,
        message,
        type,
        timestamp: new Date(),
      };

      // Añade la nueva notificación al estado, manteniendo las anteriores.
      setNotifications((prev) => [...prev, notification]); // Si la duración es mayor a 0, programa la eliminación automática de la notificación.

      if (duration > 0) {
        setTimeout(() => {
          removeNotification(id);
        }, duration);
      }

      // Devuelve el ID de la notificación por si se necesita para alguna acción externa.
      return id;
    },
    []
  ); // El array de dependencias vacío significa que la función nunca se recreará.

  // Función para eliminar una notificación específica por su ID. Memorizada con useCallback.
  const removeNotification = useCallback((id) => {
    // Actualiza el estado, filtrando y excluyendo la notificación con el ID proporcionado.
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  }, []); // Dependencia vacía, la función se crea una sola vez.

  // Función para limpiar todas las notificaciones de la pantalla. Memorizada con useCallback.
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []); // Dependencia vacía, la función se crea una sola vez.

  // --- Funciones de conveniencia ---
  // Estas funciones son atajos para llamar a showNotification con un tipo específico.

  const showSuccess = useCallback(
    (message, duration) => showNotification(message, "success", duration),
    [showNotification]
  );
  const showError = useCallback(
    (message, duration) => showNotification(message, "error", duration),
    [showNotification]
  );
  const showWarning = useCallback(
    (message, duration) => showNotification(message, "warning", duration),
    [showNotification]
  );
  const showInfo = useCallback(
    (message, duration) => showNotification(message, "info", duration),
    [showNotification]
  );

  // El hook retorna el estado y todas las funciones para que puedan ser usadas en los componentes.
  return {
    notifications, // La lista de notificaciones activas.
    showNotification, // La función principal para mostrar notificaciones.
    showSuccess, // Atajo para notificaciones de éxito.
    showError, // Atajo para notificaciones de error.
    showWarning, // Atajo para notificaciones de advertencia.
    showInfo, // Atajo para notificaciones de información.
    removeNotification, // Función para eliminar una notificación específica.
    clearAllNotifications, // Función para eliminar todas las notificaciones.
  };
};