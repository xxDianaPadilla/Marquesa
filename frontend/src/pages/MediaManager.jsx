import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "../components/AdminLayout"; // Layout principal para el panel de administración
import MediaUploadModal from "../components/MediaUploadModal"; // Modal para cargar archivos multimedia
import MediaEditModal from "../components/MediaEditModal"; // Modal para editar archivos multimedia
import DeleteConfirmModal from "../components/DeleteConfirmModal"; // Modal para confirmar la eliminación de un archivo multimedia
import MediaHeader from "../components/MediaHeader"; // Encabezado con controles para búsqueda y filtros
import MediaContent from "../components/MediaContent"; // Contenido que muestra la lista de archivos multimedia
import NotificationContainer from "../components/NotificationContainer"; // Componente para mostrar notificaciones

import { useMediaManager } from "../components/Media/Hooks/useMediaManager"; // Hook personalizado para gestionar medios
import { useNotifications } from "../components/Media/Hooks/useNotifications"; // Hook personalizado para gestionar notificaciones
import { useMediaUtils } from "../components/Media/Hooks/useMediaUtils"; // Hook personalizado con utilidades relacionadas con medios

const MediaManager = () => {
    // Extraemos el estado y las funciones del hook useMediaManager
    const {
        mediaItems, // Lista de archivos multimedia
        loading, // Estado de carga
        error, // Error en la carga
        searchTerm, // Término de búsqueda
        selectedType, // Tipo de archivo multimedia seleccionado
        modals, // Modales abiertos
        selectedItem, // Elemento seleccionado para editar o eliminar
        stats, // Estadísticas sobre los medios (total, etc.)
        createMediaItem, // Función para crear un nuevo archivo multimedia
        updateMediaItem, // Función para actualizar un archivo multimedia existente
        deleteMediaItem, // Función para eliminar un archivo multimedia
        setSearchTerm, // Función para actualizar el término de búsqueda
        setSelectedType, // Función para cambiar el tipo de medio
        openModal, // Función para abrir un modal
        closeModal // Función para cerrar un modal
    } = useMediaManager();

    // Extraemos las funciones de notificación
    const {
        notifications, // Lista de notificaciones
        showSuccess, // Función para mostrar una notificación de éxito
        showError, // Función para mostrar una notificación de error
        removeNotification // Función para eliminar una notificación
    } = useNotifications();

    // Extraemos las utilidades relacionadas con los medios
    const {
        mediaTypes, // Tipos de medios disponibles
        copyToClipboard // Función para copiar una URL al portapapeles
    } = useMediaUtils();

    // Hook useEffect que muestra un error si hay un fallo en la carga de medios
    useEffect(() => {
        if (error) {
            showError(`Error al cargar multimedia: ${error}`);
        }
    }, [error, showError]);

    // Función para manejar la edición de un archivo multimedia
    const handleEdit = useCallback((item) => {
        openModal('edit', item); // Abre el modal de edición
    }, [openModal]);

    // Función para manejar la eliminación de un archivo multimedia
    const handleDelete = useCallback((item) => {
        openModal('delete', item); // Abre el modal de confirmación de eliminación
    }, [openModal]);

    // Función para abrir el modal de carga de un nuevo archivo multimedia
    const handleOpenUploadModal = useCallback(() => {
        openModal('upload'); // Abre el modal de carga
    }, [openModal]);

    // Función para copiar una URL al portapapeles y mostrar una notificación
    const handleCopyUrl = useCallback(async (url) => {
        const result = await copyToClipboard(url);
        if (result.success) {
            showSuccess("URL copiada al portapapeles"); // Muestra mensaje de éxito
        } else {
            showError(result.error || "Error al copiar URL"); // Muestra mensaje de error si algo falla
        }
    }, [copyToClipboard, showSuccess, showError]);

    // Función que maneja la confirmación de la carga de un nuevo archivo multimedia
    const handleConfirmUpload = useCallback(async (formData) => {
        try {
            const result = await createMediaItem(formData); // Crea el nuevo archivo multimedia
            if (result.success) {
                closeModal('upload'); // Cierra el modal de carga
                showSuccess("Multimedia agregada exitosamente"); // Muestra mensaje de éxito
            } else {
                showError(result.error); // Muestra el error si la creación falla
            }
        } catch {
            showError("Error inesperado al crear multimedia"); // Muestra un mensaje de error inesperado
        }
    }, [createMediaItem, closeModal, showSuccess, showError]);

    // Función que maneja la confirmación de la edición de un archivo multimedia
    const handleConfirmEdit = useCallback(async (formData) => {
        if (!selectedItem) return; // Si no hay un elemento seleccionado, no hace nada
        
        try {
            const result = await updateMediaItem(selectedItem._id, formData); // Actualiza el archivo multimedia
            if (result.success) {
                closeModal('edit'); // Cierra el modal de edición
                showSuccess("Multimedia editada exitosamente"); // Muestra mensaje de éxito
            } else {
                showError(result.error); // Muestra el error si la edición falla
            }
        } catch {
            showError("Error inesperado al editar multimedia"); // Muestra un mensaje de error inesperado
        }
    }, [selectedItem, updateMediaItem, closeModal, showSuccess, showError]);

    // Función que maneja la confirmación de la eliminación de un archivo multimedia
    const handleConfirmDelete = useCallback(async () => {
        if (!selectedItem) return; // Si no hay un elemento seleccionado, no hace nada
        
        try {
            const result = await deleteMediaItem(selectedItem._id); // Elimina el archivo multimedia
            if (result.success) {
                closeModal('delete'); // Cierra el modal de eliminación
                showSuccess("Multimedia eliminada exitosamente"); // Muestra mensaje de éxito
            } else {
                showError(result.error); // Muestra el error si la eliminación falla
            }
        } catch {
            showError("Error inesperado al eliminar multimedia"); // Muestra un mensaje de error inesperado
        }
    }, [selectedItem, deleteMediaItem, closeModal, showSuccess, showError]);

    return (
        <AdminLayout>
            <div className="p-3 sm:p-6">
                {/* Muestra las notificaciones actuales */}
                <NotificationContainer
                    notifications={notifications}
                    onRemove={removeNotification} // Elimina la notificación cuando se hace clic
                />

                {/* Encabezado de medios con controles de búsqueda y filtros */}
                <MediaHeader
                    searchTerm={searchTerm} // El término de búsqueda actual
                    onSearchChange={setSearchTerm} // Función que se llama cuando cambia el término de búsqueda
                    selectedType={selectedType} // El tipo de medio seleccionado
                    onTypeChange={setSelectedType} // Función que se llama cuando cambia el tipo de medio
                    mediaTypes={mediaTypes} // Los tipos de medios disponibles
                    onAddClick={handleOpenUploadModal} // Función que se llama cuando se hace clic en "Agregar"
                    stats={stats} // Estadísticas sobre los medios
                />

                {/* Contenido de medios con los elementos multimedia y las acciones */}
                <MediaContent
                    items={mediaItems} // Elementos multimedia a mostrar
                    loading={loading} // Estado de carga
                    totalItems={stats.total} // Número total de elementos multimedia
                    onEdit={handleEdit} // Función para editar un medio
                    onDelete={handleDelete} // Función para eliminar un medio
                    onCopyUrl={handleCopyUrl} // Función para copiar la URL de un medio
                />
            </div>

            {/* Modal para cargar un archivo multimedia */}
            {modals.upload && (
                <MediaUploadModal
                    onClose={() => closeModal('upload')} // Cierra el modal de carga
                    onConfirm={handleConfirmUpload} // Función que se llama al confirmar la carga
                />
            )}

            {/* Modal para editar un archivo multimedia */}
            {modals.edit && selectedItem && (
                <MediaEditModal
                    item={selectedItem} // Elemento multimedia a editar
                    onClose={() => closeModal('edit')} // Cierra el modal de edición
                    onConfirm={handleConfirmEdit} // Función que se llama al confirmar la edición
                />
            )}

            {/* Modal para confirmar la eliminación de un archivo multimedia */}
            {modals.delete && selectedItem && (
                <DeleteConfirmModal
                    item={selectedItem} // Elemento multimedia a eliminar
                    onClose={() => closeModal('delete')} // Cierra el modal de eliminación
                    onConfirm={handleConfirmDelete} // Función que se llama al confirmar la eliminación
                />
            )}
        </AdminLayout>
    );
};

export default MediaManager;