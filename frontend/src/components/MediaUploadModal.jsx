import React, { useState } from "react";

/**
 * Componente MediaUploadModal
 * Modal para subir nueva multimedia (imágenes y videos)
 */
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
    const types = [
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
        
        // Limpiar error del campo cuando el usuario empiece a escribir
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

            // Limpiar error del campo
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

        // Al menos un archivo debe ser seleccionado
        if (!files.image && !files.video) {
            newErrors.files = "Se requiere al menos una imagen o un video";
        }

        // Validar tamaño de imagen (5MB)
        if (files.image && files.image.size > 5 * 1024 * 1024) {
            newErrors.image = "La imagen no debe superar los 5MB";
        }

        // Validar tamaño de video (50MB)
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
            // Crear FormData para enviar archivos
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

            // Realizar petición a la API
            const response = await fetch('http://localhost:4000/api/media', {
                method: 'POST',
                body: submitData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al subir multimedia');
            }

            const result = await response.json();
            onConfirm(result.media);
            
        } catch (error) {
            console.error("Error al subir multimedia:", error);
            setErrors({ submit: error.message });
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                {/* Header del modal */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Añadir Multimedia
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={isSubmitting}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Contenido del modal */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Tipo */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Tipo *
                        </label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7260] focus:border-transparent"
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                            {types.map((type) => (
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
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#FF7260] focus:border-transparent ${
                                errors.title ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Ingresa el título"
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                        />
                        {errors.title && (
                            <p className="text-red-500 text-sm mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
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
                            rows={3}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#FF7260] focus:border-transparent resize-none ${
                                errors.description ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Describe el contenido multimedia"
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                        />
                        {errors.description && (
                            <p className="text-red-500 text-sm mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                {errors.description}
                            </p>
                        )}
                    </div>

                    {/* Imagen */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Imagen (opcional)
                        </label>
                        <input
                            type="file"
                            name="image"
                            accept="image/*"
                            onChange={handleFileChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#FF7260] focus:border-transparent ${
                                errors.image ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                        {files.image && (
                            <p className="text-sm text-gray-600 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                {getFileInfo(files.image)}
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
                            Video (opcional)
                        </label>
                        <input
                            type="file"
                            name="video"
                            accept="video/*"
                            onChange={handleFileChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#FF7260] focus:border-transparent ${
                                errors.video ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                        {files.video && (
                            <p className="text-sm text-gray-600 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                {getFileInfo(files.video)}
                            </p>
                        )}
                        {errors.video && (
                            <p className="text-red-500 text-sm mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                {errors.video}
                            </p>
                        )}
                    </div>

                    {/* Error de archivos */}
                    {errors.files && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-red-600 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                {errors.files}
                            </p>
                        </div>
                    )}

                    {/* Error de envío */}
                    {errors.submit && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-red-600 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                {errors.submit}
                            </p>
                        </div>
                    )}

                    {/* Información adicional */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-blue-700 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            <strong>Nota:</strong> Se requiere al menos una imagen o un video. 
                            Límite: 5MB para imágenes, 50MB para videos.
                        </p>
                    </div>

                    {/* Botones */}
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-[#FF7260] text-white rounded-lg hover:bg-[#FF6A54] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Subiendo...
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
                </form>
            </div>
        </div>
    );
};

export default MediaUploadModal;