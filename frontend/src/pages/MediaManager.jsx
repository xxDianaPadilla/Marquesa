import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "../components/AdminLayout";
import MediaUploadModal from "../components/MediaUploadModal";
import MediaEditModal from "../components/MediaEditModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import MediaHeader from "../components/MediaHeader";
import MediaContent from "../components/MediaContent";
import NotificationContainer from "../components/NotificationContainer";

import { useMediaManager } from "../components/Media/Hooks/useMediaManager";
import { useNotifications } from "../components/Media/Hooks/useNotifications";
import { useMediaUtils } from "../components/Media/Hooks/useMediaUtils";

/**
 * Componente principal para la gestión de multimedia
 * Coordina todos los hooks y componentes relacionados con la administración de medios
 * Maneja el estado global de modales, notificaciones y operaciones CRUD
 */
const MediaManager = () => {
    console.log('🚀 Inicializando MediaManager...');

    // ============ HOOKS PRINCIPALES ============
    
    /**
     * Hook principal para gestión de medios
     * Proporciona CRUD operations y estado de la aplicación
     */
    const {
        mediaItems,           // Lista filtrada de elementos multimedia
        loading,              // Estado de carga general
        error,                // Errores de la aplicación
        searchTerm,           // Término de búsqueda actual
        selectedType,         // Tipo de medio seleccionado para filtrar
        modals,              // Estado de todos los modales
        selectedItem,        // Elemento seleccionado para edición/eliminación
        stats,               // Estadísticas de medios (totales por tipo)
        createMediaItem,     // Función para crear nuevos elementos
        updateMediaItem,     // Función para actualizar elementos existentes
        deleteMediaItem,     // Función para eliminar elementos
        setSearchTerm,       // Función para actualizar búsqueda
        setSelectedType,     // Función para cambiar filtro de tipo
        openModal,           // Función para abrir modales específicos
        closeModal,          // Función para cerrar modales específicos
        refreshItems         // Función para refrescar datos desde el servidor
    } = useMediaManager();

    /**
     * Hook para sistema de notificaciones
     * Maneja mensajes de éxito, error, advertencia e información
     */
    const {
        notifications,       // Lista de notificaciones activas
        showSuccess,         // Mostrar notificación de éxito
        showError,           // Mostrar notificación de error
        showWarning,         // Mostrar notificación de advertencia
        showInfo,            // Mostrar notificación de información
        removeNotification,  // Eliminar notificación específica
        clearAllNotifications // Limpiar todas las notificaciones
    } = useNotifications();

    /**
     * Hook con utilidades para manejo de medios
     * Proporciona funciones de validación, formateo y helpers
     */
    const {
        mediaTypes,          // Tipos de medios disponibles
        copyToClipboard,     // Función para copiar al portapapeles
        formatFileSize       // Función para formatear tamaños de archivo
    } = useMediaUtils();

    // ============ ESTADO LOCAL ============
    
    /**
     * Estado para controlar el indicador de carga de operaciones
     * Usado para mostrar spinners durante operaciones asíncronas
     */
    const [operationLoading, setOperationLoading] = useState(false);

    /**
     * Estado para rastrear la última operación realizada
     * Útil para debugging y logs
     */
    const [lastOperation, setLastOperation] = useState(null);

    // ============ EFECTOS DE CICLO DE VIDA ============

    /**
     * Efecto para mostrar errores del sistema en notificaciones
     * Se ejecuta cuando cambia el estado de error del hook principal
     */
    useEffect(() => {
        if (error) {
            console.error('❌ Error en MediaManager:', error);
            showError(`Error en el sistema: ${error}`);
        }
    }, [error, showError]);

    /**
     * Efecto para limpiar notificaciones al cargar datos
     * Limpia notificaciones anteriores cuando inicia una nueva carga
     */
    useEffect(() => {
        if (loading) {
            // Limpiar notificaciones previas al iniciar carga
            clearAllNotifications();
        }
    }, [loading, clearAllNotifications]);

    // ============ MANEJADORES DE OPERACIONES CRUD ============

    /**
     * Manejador para editar un elemento multimedia
     * Abre el modal de edición con el elemento seleccionado
     * 
     * @param {Object} item - Elemento a editar
     */
    const handleEdit = useCallback((item) => {
        console.log('✏️ Iniciando edición de elemento:', item.title);
        
        if (!item || !item._id) {
            console.error('❌ Elemento inválido para edición:', item);
            showError('Error: No se puede editar un elemento inválido');
            return;
        }

        try {
            setLastOperation({ type: 'edit', itemId: item._id, timestamp: new Date() });
            openModal('edit', item);
            
            // Mostrar información sobre el elemento a editar
            showInfo(`Editando: ${item.title || 'Sin título'}`);
        } catch (error) {
            console.error('❌ Error al abrir modal de edición:', error);
            showError('Error al abrir el editor');
        }
    }, [openModal, showError, showInfo]);

    /**
     * Manejador para eliminar un elemento multimedia
     * Abre el modal de confirmación de eliminación
     * 
     * @param {Object} item - Elemento a eliminar
     */
    const handleDelete = useCallback((item) => {
        console.log('🗑️ Iniciando eliminación de elemento:', item.title);
        
        if (!item || !item._id) {
            console.error('❌ Elemento inválido para eliminación:', item);
            showError('Error: No se puede eliminar un elemento inválido');
            return;
        }

        try {
            setLastOperation({ type: 'delete', itemId: item._id, timestamp: new Date() });
            openModal('delete', item);
            
            // Mostrar advertencia sobre la eliminación
            showWarning(`Preparando eliminación de: ${item.title || 'Sin título'}`);
        } catch (error) {
            console.error('❌ Error al abrir modal de eliminación:', error);
            showError('Error al abrir confirmación de eliminación');
        }
    }, [openModal, showError, showWarning]);

    /**
     * Manejador para abrir el modal de carga de nuevos elementos
     * Limpia el estado y abre el modal de upload
     */
    const handleOpenUploadModal = useCallback(() => {
        console.log('📤 Abriendo modal de carga de multimedia');
        
        try {
            setLastOperation({ type: 'upload', timestamp: new Date() });
            openModal('upload');
            
            // Limpiar notificaciones para una mejor UX
            clearAllNotifications();
        } catch (error) {
            console.error('❌ Error al abrir modal de carga:', error);
            showError('Error al abrir el formulario de carga');
        }
    }, [openModal, clearAllNotifications, showError]);

    /**
     * Manejador para copiar URLs al portapapeles
     * Incluye validación y feedback al usuario
     * 
     * @param {string} url - URL a copiar
     */
    const handleCopyUrl = useCallback(async (url) => {
        console.log('📋 Copiando URL al portapapeles:', url?.substring(0, 50) + '...');
        
        if (!url || typeof url !== 'string') {
            console.error('❌ URL inválida para copiar:', url);
            showError('Error: URL inválida');
            return;
        }

        try {
            setOperationLoading(true);
            
            const result = await copyToClipboard(url);
            
            if (result.success) {
                console.log('✅ URL copiada exitosamente');
                showSuccess('URL copiada al portapapeles');
            } else {
                console.error('❌ Error al copiar URL:', result.error);
                showError(result.error || 'Error al copiar URL');
            }
        } catch (error) {
            console.error('❌ Error inesperado al copiar:', error);
            showError('Error inesperado al copiar al portapapeles');
        } finally {
            setOperationLoading(false);
        }
    }, [copyToClipboard, showSuccess, showError]);

    // ============ MANEJADORES DE CONFIRMACIÓN DE MODALES ============

    /**
     * Manejador para confirmar la carga de un nuevo elemento
     * Procesa los datos del formulario y crea el elemento
     * 
     * @param {FormData} formData - Datos del formulario de carga
     */
    const handleConfirmUpload = useCallback(async (formData) => {
        console.log('📤 Procesando carga de nuevo elemento multimedia...');
        
        if (!formData) {
            console.error('❌ No se recibieron datos para la carga');
            showError('Error: No se recibieron datos del formulario');
            return;
        }

        try {
            setOperationLoading(true);
            
            // Debug: Mostrar contenido del FormData
            console.log('📋 Procesando FormData:');
            for (let [key, value] of formData.entries()) {
                if (value instanceof File) {
                    console.log(`  ${key}: ${value.name} (${formatFileSize(value.size)})`);
                } else {
                    console.log(`  ${key}: ${value}`);
                }
            }

            // Crear el elemento mediante el hook
            const result = await createMediaItem(formData);
            
            if (result.success) {
                console.log('✅ Elemento creado exitosamente:', result.data?.title);
                
                // Cerrar modal y mostrar éxito
                closeModal('upload');
                showSuccess(`Multimedia "${result.data?.title || 'Sin título'}" agregada exitosamente`);
                
                // Actualizar operación realizada
                setLastOperation({ 
                    type: 'upload_success', 
                    itemId: result.data?._id, 
                    timestamp: new Date() 
                });
                
            } else {
                console.error('❌ Error en la creación:', result.error);
                showError(result.error || 'Error al crear el elemento multimedia');
            }
            
        } catch (error) {
            console.error('❌ Error inesperado en la carga:', error);
            showError('Error inesperado al procesar la carga');
        } finally {
            setOperationLoading(false);
        }
    }, [createMediaItem, closeModal, showSuccess, showError, formatFileSize]);

    /**
     * Manejador para confirmar la edición de un elemento
     * Procesa los cambios y actualiza el elemento
     * 
     * @param {FormData} formData - Datos del formulario de edición
     */
    const handleConfirmEdit = useCallback(async (formData) => {
        if (!selectedItem) {
            console.error('❌ No hay elemento seleccionado para editar');
            showError('Error: No se ha seleccionado ningún elemento para editar');
            return;
        }
        
        console.log('✏️ Procesando edición del elemento:', selectedItem.title);
        
        if (!formData) {
            console.error('❌ No se recibieron datos para la edición');
            showError('Error: No se recibieron datos del formulario');
            return;
        }

        try {
            setOperationLoading(true);
            
            // Debug: Mostrar contenido del FormData para edición
            console.log('📋 Procesando edición con FormData:');
            for (let [key, value] of formData.entries()) {
                if (value instanceof File) {
                    console.log(`  ${key}: ${value.name} (${formatFileSize(value.size)}) [NUEVO]`);
                } else {
                    console.log(`  ${key}: ${value}`);
                }
            }

            // Actualizar el elemento mediante el hook
            const result = await updateMediaItem(selectedItem._id, formData);
            
            if (result.success) {
                console.log('✅ Elemento editado exitosamente:', result.data?.title);
                
                // Cerrar modal y mostrar éxito
                closeModal('edit');
                showSuccess(`Multimedia "${result.data?.title || selectedItem.title}" editada exitosamente`);
                
                // Actualizar operación realizada
                setLastOperation({ 
                    type: 'edit_success', 
                    itemId: selectedItem._id, 
                    timestamp: new Date() 
                });
                
            } else {
                console.error('❌ Error en la edición:', result.error);
                showError(result.error || 'Error al editar el elemento multimedia');
            }
            
        } catch (error) {
            console.error('❌ Error inesperado en la edición:', error);
            showError('Error inesperado al procesar la edición');
        } finally {
            setOperationLoading(false);
        }
    }, [selectedItem, updateMediaItem, closeModal, showSuccess, showError, formatFileSize]);

    /**
     * Manejador para confirmar la eliminación de un elemento
     * Elimina el elemento del servidor y actualiza la UI
     */
    const handleConfirmDelete = useCallback(async () => {
        if (!selectedItem) {
            console.error('❌ No hay elemento seleccionado para eliminar');
            showError('Error: No se ha seleccionado ningún elemento para eliminar');
            return;
        }
        
        console.log('🗑️ Procesando eliminación del elemento:', selectedItem.title);

        try {
            setOperationLoading(true);
            
            // Guardar información del elemento antes de eliminarlo
            const itemTitle = selectedItem.title || 'Sin título';
            const itemId = selectedItem._id;

            // Eliminar el elemento mediante el hook
            const result = await deleteMediaItem(itemId);
            
            if (result.success) {
                console.log('✅ Elemento eliminado exitosamente:', itemTitle);
                
                // Cerrar modal y mostrar éxito
                closeModal('delete');
                showSuccess(`Multimedia "${itemTitle}" eliminada exitosamente`);
                
                // Actualizar operación realizada
                setLastOperation({ 
                    type: 'delete_success', 
                    itemId: itemId, 
                    timestamp: new Date() 
                });
                
            } else {
                console.error('❌ Error en la eliminación:', result.error);
                showError(result.error || 'Error al eliminar el elemento multimedia');
            }
            
        } catch (error) {
            console.error('❌ Error inesperado en la eliminación:', error);
            showError('Error inesperado al procesar la eliminación');
        } finally {
            setOperationLoading(false);
        }
    }, [selectedItem, deleteMediaItem, closeModal, showSuccess, showError]);

    // ============ MANEJADORES DE CIERRE DE MODALES ============

    /**
     * Manejador para cerrar modales con limpieza de estado
     * Incluye confirmación si hay operaciones en curso
     * 
     * @param {string} modalType - Tipo de modal a cerrar
     */
    const handleCloseModal = useCallback((modalType) => {
        console.log(`🔒 Cerrando modal: ${modalType}`);
        
        // Verificar si hay operaciones en curso
        if (operationLoading) {
            const shouldClose = window.confirm(
                'Hay una operación en curso. ¿Estás seguro de que quieres cerrar?'
            );
            if (!shouldClose) {
                console.log('ℹ️ Cierre de modal cancelado por el usuario');
                return;
            }
        }

        try {
            closeModal(modalType);
            
            // Limpiar estado de operación si es necesario
            if (operationLoading) {
                setOperationLoading(false);
            }
            
            // Mostrar información de cancelación si aplica
            if (modalType === 'upload') {
                showInfo('Carga de multimedia cancelada');
            } else if (modalType === 'edit') {
                showInfo('Edición cancelada');
            } else if (modalType === 'delete') {
                showInfo('Eliminación cancelada');
            }
            
        } catch (error) {
            console.error(`❌ Error al cerrar modal ${modalType}:`, error);
            showError(`Error al cerrar ${modalType}`);
        }
    }, [closeModal, operationLoading, showInfo, showError]);

    // ============ RENDER DEL COMPONENTE ============

    console.log('🎨 Renderizando MediaManager con', mediaItems.length, 'elementos');

    return (
        <AdminLayout>
            <div className="p-3 sm:p-6">
                {/* Sistema de notificaciones */}
                <NotificationContainer
                    notifications={notifications}
                    onRemove={removeNotification}
                />

                {/* Header principal con controles */}
                <MediaHeader
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    selectedType={selectedType}
                    onTypeChange={setSelectedType}
                    mediaTypes={mediaTypes}
                    onAddClick={handleOpenUploadModal}
                    stats={stats}
                />
                {/* Contenido principal de medios */}
                <MediaContent
                    items={mediaItems}
                    loading={loading || operationLoading}
                    totalItems={stats.total}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onCopyUrl={handleCopyUrl}
                />

                {/* Información de la última operación (solo en desarrollo) */}
                {process.env.NODE_ENV === 'development' && lastOperation && (
                    <div className="mt-4 text-xs text-gray-500 text-center">
                        Última operación: {lastOperation.type} a las {lastOperation.timestamp.toLocaleTimeString()}
                    </div>
                )}
            </div>

            {/* ============ MODALES ============ */}

            {/* Modal de carga de multimedia */}
            {modals.upload && (
                <MediaUploadModal
                    onClose={() => handleCloseModal('upload')}
                    onConfirm={handleConfirmUpload}
                />
            )}

            {/* Modal de edición de multimedia */}
            {modals.edit && selectedItem && (
                <MediaEditModal
                    item={selectedItem}
                    onClose={() => handleCloseModal('edit')}
                    onConfirm={handleConfirmEdit}
                />
            )}

            {/* Modal de confirmación de eliminación */}
            {modals.delete && selectedItem && (
                <DeleteConfirmModal
                    item={selectedItem}
                    onClose={() => handleCloseModal('delete')}
                    onConfirm={handleConfirmDelete}
                />
            )}
        </AdminLayout>
    );
};

export default MediaManager;