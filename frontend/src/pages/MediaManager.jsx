import React, { useState, useEffect, useCallback } from "react";
import NavbarAdmin from "../components/NavbarAdmin";
import MediaUploadModal from "../components/MediaUploadModal";
import MediaEditModal from "../components/MediaEditModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import MediaHeader from "../components/MediaHeader";
import MediaContent from "../components/MediaContent";
import NotificationContainer from "../components/NotificationContainer";

import { useMediaManager } from "../components/Media/Hooks/useMediaManager";
import { useNotifications } from "../components/Media/Hooks/useNotifications";
import { useMediaUtils } from "../components/Media/Hooks/useMediaUtils";

const MediaManager = () => {
    const [isExpanded, setIsExpanded] = useState(false);

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

    const {
        notifications,
        showSuccess,
        showError,
        removeNotification
    } = useNotifications();

    const {
        mediaTypes,
        copyToClipboard
    } = useMediaUtils();

    useEffect(() => {
        if (error) {
            showError(`Error al cargar multimedia: ${error}`);
        }
    }, [error, showError]);

    const handleEdit = useCallback((item) => {
        openModal('edit', item);
    }, [openModal]);

    const handleDelete = useCallback((item) => {
        openModal('delete', item);
    }, [openModal]);

    const handleOpenUploadModal = useCallback(() => {
        openModal('upload');
    }, [openModal]);

    const handleCopyUrl = useCallback(async (url) => {
        const result = await copyToClipboard(url);
        if (result.success) {
            showSuccess("URL copiada al portapapeles");
        } else {
            showError(result.error || "Error al copiar URL");
        }
    }, [copyToClipboard, showSuccess, showError]);

    const handleConfirmUpload = useCallback(async (formData) => {
        try {
            const result = await createMediaItem(formData);
            if (result.success) {
                closeModal('upload');
                showSuccess("Multimedia agregada exitosamente");
            } else {
                showError(result.error);
            }
        } catch {
            showError("Error inesperado al crear multimedia");
        }
    }, [createMediaItem, closeModal, showSuccess, showError]);

    const handleConfirmEdit = useCallback(async (formData) => {
        if (!selectedItem) return;
        
        try {
            const result = await updateMediaItem(selectedItem._id, formData);
            if (result.success) {
                closeModal('edit');
                showSuccess("Multimedia editada exitosamente");
            } else {
                showError(result.error);
            }
        } catch {
            showError("Error inesperado al editar multimedia");
        }
    }, [selectedItem, updateMediaItem, closeModal, showSuccess, showError]);

    const handleConfirmDelete = useCallback(async () => {
        if (!selectedItem) return;
        
        try {
            const result = await deleteMediaItem(selectedItem._id);
            if (result.success) {
                closeModal('delete');
                showSuccess("Multimedia eliminada exitosamente");
            } else {
                showError(result.error);
            }
        } catch {
            showError("Error inesperado al eliminar multimedia");
        }
    }, [selectedItem, deleteMediaItem, closeModal, showSuccess, showError]);

    return (
        <div className="min-h-screen bg-gray-50">
            <NavbarAdmin isExpanded={isExpanded} setIsExpanded={setIsExpanded} />

            <div
                style={{ paddingLeft: isExpanded ? '12rem' : '4rem' }}
                className="p-3 sm:p-6 transition-padding duration-300"
            >
                <NotificationContainer
                    notifications={notifications}
                    onRemove={removeNotification}
                />

                <MediaHeader
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    selectedType={selectedType}
                    onTypeChange={setSelectedType}
                    mediaTypes={mediaTypes}
                    onAddClick={handleOpenUploadModal}
                    stats={stats}
                />

                <MediaContent
                    items={mediaItems}
                    loading={loading}
                    totalItems={stats.total}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onCopyUrl={handleCopyUrl}
                />
            </div>

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
