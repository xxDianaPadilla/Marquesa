// Importamos los hooks necesarios de React
import { useState, useEffect, useCallback } from 'react';
// Importamos AsyncStorage para almacenamiento local persistente
import AsyncStorage from '@react-native-async-storage/async-storage';

// Definimos la clave para guardar el historial en AsyncStorage
const SEARCH_HISTORY_KEY = '@search_history';
// Límite máximo de búsquedas que se guardarán (solo las 10 más recientes)
const MAX_HISTORY_ITEMS = 10; // Máximo 10 búsquedas guardadas

// Función principal del hook personalizado para manejar el historial de búsquedas
export const useSearchHistory = () => {
    // Estado para almacenar el array de búsquedas históricas
    const [searchHistory, setSearchHistory] = useState([]);
    // Estado para indicar si estamos cargando datos del AsyncStorage
    const [loading, setLoading] = useState(true);
    // Estado para manejar cualquier error que pueda ocurrir
    const [error, setError] = useState(null);

    // Función para cargar historial desde AsyncStorage - MEJORADA
    const loadSearchHistory = useCallback(async () => {
        try {
            // Establecemos loading en true para indicar que estamos cargando
            setLoading(true);
            // Limpiamos cualquier error previo
            setError(null);
            
            // Intentamos obtener el historial guardado usando la clave definida
            const history = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
            
            // Verificamos si existe historial guardado
            if (history) {
                // Parseamos el JSON string a un objeto JavaScript
                const parsedHistory = JSON.parse(history);
                // Validar que sea un array válido
                if (Array.isArray(parsedHistory)) {
                    // Filtrar elementos válidos (strings no vacíos)
                    const validHistory = parsedHistory.filter(item => 
                        // Verificamos que el item sea un string y no esté vacío después del trim
                        typeof item === 'string' && item.trim().length > 0
                    );
                    // Actualizamos el estado con el historial válido
                    setSearchHistory(validHistory);
                } else {
                    // Si no es un array válido, inicializar vacío
                    setSearchHistory([]);
                }
            } else {
                // Si no hay historial guardado, inicializamos con array vacío
                setSearchHistory([]);
            }
        } catch (error) {
            // Si ocurre un error, lo registramos en la consola
            console.error('Error loading search history:', error);
            // Guardamos el error en el estado
            setError(error);
            // En caso de error, inicializar con array vacío
            setSearchHistory([]);
        } finally {
            // Independientemente del resultado, establecemos loading en false
            setLoading(false);
        }
    }, []); // Array de dependencias vacío porque no depende de ningún estado

    // Cargar historial al inicializar el componente
    useEffect(() => {
        // Ejecutamos la función de carga cuando el componente se monta
        loadSearchHistory();
    }, [loadSearchHistory]); // Dependemos de loadSearchHistory

    // Función para agregar nueva búsqueda - MEJORADA
    const addSearchTerm = useCallback(async (searchTerm) => {
        // Validamos que el término de búsqueda sea válido
        if (!searchTerm || typeof searchTerm !== 'string' || !searchTerm.trim()) {
            // Si no es válido, salimos de la función sin hacer nada
            return;
        }

        try {
            // Limpiamos espacios en blanco del término de búsqueda
            const trimmedTerm = searchTerm.trim();
            
            // Obtener historial actual de forma segura
            const currentHistory = Array.isArray(searchHistory) ? [...searchHistory] : [];
            
            // Crear nueva lista: nuevo término primero, luego los demás sin duplicados
            const updatedHistory = [
                // Agregamos el nuevo término al inicio
                trimmedTerm,
                // Filtramos el historial actual para remover duplicados (case-insensitive)
                ...currentHistory.filter(term => 
                    // Verificamos que sea string y que no sea igual al nuevo término
                    typeof term === 'string' && 
                    term.toLowerCase() !== trimmedTerm.toLowerCase()
                )
            ].slice(0, MAX_HISTORY_ITEMS); // Limitar a 10 elementos usando slice

            // Actualizar estado local con el nuevo historial
            setSearchHistory(updatedHistory);
            
            // Guardar en AsyncStorage para persistencia
            await AsyncStorage.setItem(
                SEARCH_HISTORY_KEY, // Clave de almacenamiento
                JSON.stringify(updatedHistory) // Convertimos el array a JSON string
            );
            
            // Limpiamos cualquier error previo
            setError(null);
        } catch (error) {
            // Si ocurre error, lo registramos
            console.error('Error saving search term:', error);
            // Guardamos el error en el estado
            setError(error);
        }
    }, [searchHistory]); // Dependemos del historial actual

    // Función para eliminar término específico - MEJORADA
    const removeSearchTerm = useCallback(async (termToRemove) => {
        // Validamos que el término a eliminar sea válido
        if (!termToRemove || typeof termToRemove !== 'string') {
            // Si no es válido, salimos sin hacer nada
            return;
        }

        try {
            // Obtener historial actual de forma segura
            const currentHistory = Array.isArray(searchHistory) ? [...searchHistory] : [];
            
            // Filtramos el historial removiendo el término específico
            const updatedHistory = currentHistory.filter(
                // Mantenemos todos los términos excepto el que queremos eliminar
                term => typeof term === 'string' && term !== termToRemove
            );
            
            // Actualizamos el estado local
            setSearchHistory(updatedHistory);
            
            // Guardamos el historial actualizado en AsyncStorage
            await AsyncStorage.setItem(
                SEARCH_HISTORY_KEY, 
                JSON.stringify(updatedHistory)
            );
            
            // Limpiamos cualquier error previo
            setError(null);
        } catch (error) {
            // Si ocurre error, lo registramos
            console.error('Error removing search term:', error);
            // Guardamos el error en el estado
            setError(error);
        }
    }, [searchHistory]); // Dependemos del historial actual

    // Función para limpiar todo el historial - MEJORADA
    const clearSearchHistory = useCallback(async () => {
        try {
            // Limpiamos el estado local estableciendo array vacío
            setSearchHistory([]);
            // Removemos completamente la clave del AsyncStorage
            await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
            // Limpiamos cualquier error previo
            setError(null);
        } catch (error) {
            // Si ocurre error, lo registramos
            console.error('Error clearing search history:', error);
            // Guardamos el error en el estado
            setError(error);
            // Aún así, intentar limpiar el estado local
            setSearchHistory([]);
        }
    }, []); // No tiene dependencias

    // Función para recargar el historial manualmente
    const reloadHistory = useCallback(() => {
        // Ejecutamos la función de carga nuevamente
        loadSearchHistory();
    }, [loadSearchHistory]); // Dependemos de loadSearchHistory

    // Retornamos un objeto con todas las funciones y estados que necesita el componente
    return {
        // Historial de búsquedas (siempre garantizamos que sea un array)
        searchHistory: Array.isArray(searchHistory) ? searchHistory : [],
        // Estado de carga
        loading,
        // Estado de error (si existe)
        error,
        // Función para agregar nuevo término de búsqueda
        addSearchTerm,
        // Función para eliminar un término específico
        removeSearchTerm,
        // Función para limpiar todo el historial
        clearSearchHistory,
        // Función para recargar el historial manualmente
        reloadHistory
    };
};