import React from "react";
import NavbarAdmin from "../components/NavbarAdmin";
import MediaUploadModal from "../components/MediaUploadModal";
import MediaEditModal from "../components/MediaEditModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";

// Componentes optimizados
import MediaHeader from "../components/MediaHeader";
import MediaContent from "../components/MediaContent";
import NotificationContainer from "../components/NotificationContainer";

// Hooks optimizados
import { useMediaManager } from "../components/Media/Hooks/useMediaManager";
import { useNotifications } from "../components/Media/Hooks/useNotifications";
import { useMediaUtils } from "../components/Media/Hooks/useMediaUtils";

const MediaManager = () => {
    // Hook principal de gestión de medios
    const {
        mediaItems,
        loading,
        error,
        searchTerm,
        selectedType,
        modals,
        selectedItem,
        stats,
        createMediaItem,
        updateMediaItem,
        deleteMediaItem,
        setSearchTerm,
        setSelectedType,
        openModal,
        closeModal
    } = useMediaManager();

    // Hook de notificaciones
    const {
        notifications,
        showSuccess,
        showError,
        removeNotification
    } = useNotifications();

    // Hook de utilidades
    const {
        mediaTypes,
        copyToClipboard
    } = useMediaUtils();

    // Mostrar error inicial si existe
    React.useEffect(() => {
        if (error) {
            showError(`Error al cargar multimedia: ${error}`);
        }
    }, [error, showError]);

    // Handlers simplificados para modales
    const handleEdit = (item) => openModal('edit', item);
    const handleDelete = (item) => openModal('delete', item);
    const handleOpenUploadModal = () => openModal('upload');

    const handleCopyUrl = async (url) => {
        const result = await copyToClipboard(url);
        if (result.success) {
            showSuccess("URL copiada al portapapeles");
        } else {
            showError(result.error || "Error al copiar URL");
        }
    };

    // Handlers para confirmaciones de modales con manejo de errores unificado
    const handleConfirmUpload = async (newItem) => {
        const result = await createMediaItem(newItem);
        if (result.success) {
            closeModal('upload');
            showSuccess("Multimedia agregada exitosamente");
        } else {
            showError(result.error);
        }
    };

    const handleConfirmEdit = async (editedItem) => {
        const result = await updateMediaItem(selectedItem._id, editedItem);
        if (result.success) {
            closeModal('edit');
            showSuccess("Multimedia editada exitosamente");
        } else {
            showError(result.error);
        }
    };

    const handleConfirmDelete = async () => {
        const result = await deleteMediaItem(selectedItem._id);
        if (result.success) {
            closeModal('delete');
            showSuccess("Multimedia eliminada exitosamente");
        } else {
            showError(result.error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar Admin */}
            <NavbarAdmin />

            {/* Componente de notificaciones */}
            <NotificationContainer
                notifications={notifications}
                onRemove={removeNotification}
            />

            {/* Contenido principal */}
            <div className="ml-16 p-3 sm:p-6">
                {/* Header con filtros y estadísticas */}
                <MediaHeader
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    selectedType={selectedType}
                    onTypeChange={setSelectedType}
                    mediaTypes={mediaTypes}
                    onAddClick={handleOpenUploadModal}
                    stats={stats}
                />

                {/* Contenido principal con tabla/lista */}
                <MediaContent
                    items={mediaItems}
                    loading={loading}
                    totalItems={stats.total}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onCopyUrl={handleCopyUrl}
                />
            </div>

            {/* Modales */}
            {modals.upload && (
                <MediaUploadModal
                    onClose={() => closeModal('upload')}
                    onConfirm={handleConfirmUpload}
                />
            )}

            {modals.edit && selectedItem && (
                <MediaEditModal
                    item={selectedItem}
                    onClose={() => closeModal('edit')}
                    onConfirm={handleConfirmEdit}
                />
            )}

            {modals.delete && selectedItem && (
                <DeleteConfirmModal
                    item={selectedItem}
                    onClose={() => closeModal('delete')}
                    onConfirm={handleConfirmDelete}
                />
            )}
        </div>
    );
};

export default MediaManager;