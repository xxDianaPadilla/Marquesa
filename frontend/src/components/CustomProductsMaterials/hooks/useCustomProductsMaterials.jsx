// hooks/useCustomProductsMaterials.js
import { useState, useEffect } from 'react';

const useCustomProductsMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'http://localhost:4000/api/customProductsMaterials';

  // Función helper para manejar respuestas del servidor
  const handleResponse = async (response) => {
    const contentType = response.headers.get('content-type');
    
    // Si no es JSON, probablemente es HTML (error del servidor)
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await response.text();
      console.error('Respuesta no-JSON del servidor:', textResponse);
      throw new Error('El servidor devolvió una respuesta inválida. Verifica que el endpoint esté funcionando correctamente.');
    }

    const data = await response.json();
    
    // Si la respuesta no es exitosa, lanzar error con el mensaje del servidor
    if (!response.ok) {
      throw new Error(data.message || `Error ${response.status}: ${response.statusText}`);
    }

    return data;
  };

  // GET - Obtener todos los materiales
  const getMaterials = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Obteniendo materiales de:', API_BASE_URL);
      const response = await fetch(API_BASE_URL);
      const result = await handleResponse(response);
      
      console.log('Materiales obtenidos:', result);
      
      // El backend devuelve { success: true, data: materials }
      setMaterials(result.data || []);
      return result.data || [];
    } catch (err) {
      console.error('Error al obtener materiales:', err);
      setError(err.message);
      setMaterials([]); // Reset en caso de error
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // POST - Crear nuevo material
  const createMaterial = async (materialData) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Creando material con datos:', materialData);
      
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        body: materialData, // materialData ya es FormData
      });

      const result = await handleResponse(response);
      console.log('Material creado:', result);

      // El backend devuelve { success: true, data: newMaterial }
      const newMaterial = result.data;
      setMaterials(prev => [...prev, newMaterial]);
      return newMaterial;
    } catch (err) {
      console.error('Error al crear material:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // PUT - Actualizar material
  const updateMaterial = async (id, materialData) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Actualizando material:', id, materialData);
      
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        body: materialData, // materialData ya es FormData
      });

      const result = await handleResponse(response);
      console.log('Material actualizado:', result);

      // El backend devuelve { success: true, data: updatedMaterial }
      const updatedMaterial = result.data;
      setMaterials(prev => 
        prev.map(material => 
          material._id === id ? updatedMaterial : material
        )
      );
      return updatedMaterial;
    } catch (err) {
      console.error('Error al actualizar material:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // DELETE - Eliminar material
  const deleteMaterial = async (id) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Eliminando material:', id);
      
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });

      const result = await handleResponse(response);
      console.log('Material eliminado:', result);

      setMaterials(prev => prev.filter(material => material._id !== id));
      return true;
    } catch (err) {
      console.error('Error al eliminar material:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cargar materiales al montar el componente
  useEffect(() => {
    getMaterials().catch(err => {
      console.error('Error inicial al cargar materiales:', err);
      // No lanzar el error aquí para evitar que se rompa el componente
    });
  }, []);

  return {
    materials,
    loading,
    error,
    getMaterials,
    createMaterial,
    updateMaterial,
    deleteMaterial,
  };
};

export default useCustomProductsMaterials;