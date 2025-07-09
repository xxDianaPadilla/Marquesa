import React, { useState } from "react";
import OverlayBackdrop from "./OverlayBackdrop";

const MediaUploadModal = ({ onClose, onConfirm }) => {
    const [formData, setFormData] = useState({
        type: "Dato Curioso",
        title: "",
        description: ""
    });
    const [files, setFiles] = useState({
        image: null,
        video: null
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Tipos disponibles según el modelo
    const typeOptions = [
        { value: "Dato Curioso", label: "Dato Curioso" },
        { value: "Tip", label: "Tip" },
        { value: "Blog", label: "Blog" }
    ];

    // Manejar cambios en los inputs de texto
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Limpiar error del campo editado
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    // Manejar cambios en los archivos
    const handleFileChange = (e) => {
        const { name, files: selectedFiles } = e.target;
        if (selectedFiles && selectedFiles[0]) {
            setFiles(prev => ({
                ...prev,
                [name]: selectedFiles[0]
            }));

            // Limpiar error del campo editado
            if (errors[name]) {
                setErrors(prev => ({
                    ...prev,
                    [name]: ""
                }));
            }
        }
    };

    // Validar formulario
    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = "El título es requerido";
        }

        if (!formData.description.trim()) {
            newErrors.description = "La descripción es requerida";
        }

        if (!files.image && !files.video) {
            newErrors.files = "Se requiere al menos una imagen o un video";
        }

        if (files.image && files.image.size > 5 * 1024 * 1024) {
            newErrors.image = "La imagen no debe superar los 5MB";
        }

        if (files.video && files.video.size > 50 * 1024 * 1024) {
            newErrors.video = "El video no debe superar los 50MB";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Manejar envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            // Crear FormData para enviar al hook
            const submitData = new FormData();
            submitData.append('type', formData.type);
            submitData.append('title', formData.title);
            submitData.append('description', formData.description);

            if (files.image) {
                submitData.append('image', files.image);
            }

            if (files.video) {
                submitData.append('video', files.video);
            }

            // Llamar al hook a través del callback onConfirm
            // El hook se encargará de hacer el fetch y manejar errores
            await onConfirm(submitData);

        } catch (error) {
            console.error("Error en el formulario:", error);
            setErrors({ submit: error.message || "Error inesperado" });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Obtener información del archivo
    const getFileInfo = (file) => {
        if (!file) return "";
        const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
        return `${file.name} (${sizeInMB} MB)`;
    };

    return (
        <OverlayBackdrop isVisible={true} onClose={onClose}>
            <div className="flex items-center justify-center min-h-screen p-2 sm:p-4">
                <div
                    className="bg-white rounded-lg sm:rounded-xl shadow-2xl w-full max-w-xl h-[90vh] sm:h-[85vh] flex flex-col overflow-hidden transform transition-all duration-300 ease-out border border-gray-200 mx-2 sm:mx-0"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header fijo */}
                    <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-white flex-shrink-0">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-800 pr-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Añadir Multimedia
                        </h2>
                        <button
                            style={{ cursor: 'pointer' }}
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                        >
                            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Contenido scrolleable con formulario */}
                    <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4" style={{ scrollbarWidth: 'thin', scrollbarColor: '#d1d5db #f8f9fa' }}>
                            <div className="space-y-4">
                                {/* Tipo */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        Tipo *
                                    </label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                        disabled={isSubmitting}
                                        className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7260] focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{ fontFamily: 'Poppins, sans-serif' }}
                                    >
                                        {typeOptions.map((type) => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Título */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        Título *
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        disabled={isSubmitting}
                                        className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-[#FF7260] focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${errors.title ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        placeholder="Ingresa el título"
                                        style={{ fontFamily: 'Poppins, sans-serif' }}
                                    />
                                    {errors.title && (
                                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {errors.title}
                                        </p>
                                    )}
                                </div>

                                {/* Descripción */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        Descripción *
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        disabled={isSubmitting}
                                        rows={3}
                                        className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-[#FF7260] focus:border-transparent resize-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${errors.description ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        placeholder="Describe el contenido multimedia"
                                        style={{ fontFamily: 'Poppins, sans-serif' }}
                                    />
                                    {errors.description && (
                                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {errors.description}
                                        </p>
                                    )}
                                </div>

                                {/* Archivos multimedia */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        Archivos multimedia
                                    </h3>

                                    {/* Imagen */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            Imagen
                                        </label>
                                        <input
                                            type="file"
                                            name="image"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            disabled={isSubmitting}
                                            className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-[#FF7260] focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${errors.image ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                        />
                                        {files.image && (
                                            <p className="text-sm text-gray-600 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                {getFileInfo(files.image)}
                                            </p>
                                        )}
                                        {!files.image && (
                                            <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                Máximo 5MB
                                            </p>
                                        )}
                                        {errors.image && (
                                            <p className="text-red-500 text-sm mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                {errors.image}
                                            </p>
                                        )}
                                    </div>

                                    {/* Video */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            Video
                                        </label>
                                        <input
                                            type="file"
                                            name="video"
                                            accept="video/*"
                                            onChange={handleFileChange}
                                            disabled={isSubmitting}
                                            className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-[#FF7260] focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${errors.video ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                        />
                                        {files.video && (
                                            <p className="text-sm text-gray-600 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                {getFileInfo(files.video)}
                                            </p>
                                        )}
                                        {!files.video && (
                                            <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                Máximo 50MB
                                            </p>
                                        )}
                                        {errors.video && (
                                            <p className="text-red-500 text-sm mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                {errors.video}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Error de archivos */}
                                {errors.files && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                        <p className="text-red-600 text-sm flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {errors.files}
                                        </p>
                                    </div>
                                )}

                                {/* Error de envío */}
                                {errors.submit && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                        <p className="text-red-600 text-sm flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {errors.submit}
                                        </p>
                                    </div>
                                )}

                                {/* Información adicional */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                                    <div className="flex items-start gap-2">
                                        <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div>
                                            <p className="text-blue-800 text-sm font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                Requisitos de archivos
                                            </p>
                                            <ul className="text-blue-700 text-sm mt-1 space-y-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                <li>• Se requiere al menos una imagen o un video</li>
                                                <li>• Imágenes: máximo 5MB (JPG, PNG, GIF)</li>
                                                <li>• Videos: máximo 50MB (MP4, MOV, AVI)</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer con botones fijos */}
                        <div className="bg-white border-t border-gray-200 p-4 sm:p-6 flex-shrink-0">
                            <div className="flex flex-col sm:flex-row justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={isSubmitting}
                                    className="w-full sm:w-auto px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full sm:w-auto px-4 py-2 bg-[#FF7260] text-white rounded-lg hover:bg-[#FF6A54] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    style={{ fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            <span className="hidden sm:inline">Subiendo...</span>
                                            <span className="sm:hidden">...</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            Añadir multimedia
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Estilos CSS inline para scrollbar */}
                <style jsx>{`
                    .overflow-y-auto::-webkit-scrollbar {
                        width: 8px;
                    }

                    .overflow-y-auto::-webkit-scrollbar-track {
                        background: #f8f9fa;
                        border-radius: 4px;
                    }

                    .overflow-y-auto::-webkit-scrollbar-thumb {
                        background: #d1d5db;
                        border-radius: 4px;
                        border: 1px solid #f8f9fa;
                    }

                    .overflow-y-auto::-webkit-scrollbar-thumb:hover {
                        background: #9ca3af;
                    }
                `}</style>
            </div>
        </OverlayBackdrop>
    );
};

export default MediaUploadModal;