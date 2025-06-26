import React, { useState, useEffect } from "react";
import OverlayBackdrop from "./OverlayBackdrop";

const MediaEditModal = ({ item, onClose, onConfirm }) => {
    const [formData, setFormData] = useState({
        type: "",
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

    // Cargar datos del item al abrir el modal
    useEffect(() => {
        if (item) {
            setFormData({
                type: item.type || "Dato Curioso",
                title: item.title || "",
                description: item.description || ""
            });
        }
    }, [item]);

    // Manejar cambios en los inputs de texto
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
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

            const response = await fetch(`http://localhost:4000/api/media/${item._id}`, {
                method: 'PUT',
                body: submitData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al actualizar multimedia');
            }

            const result = await response.json();
            onConfirm(result.media);
            
        } catch (error) {
            console.error("Error al actualizar multimedia:", error);
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

    if (!item) return null;

    return (
        <OverlayBackdrop isVisible={true} onClose={onClose}>
            <div className="flex items-center justify-center min-h-screen p-2 sm:p-4">
                {/* Modal con estructura idéntica al MediaUploadModal */}
                <div 
                    className="bg-white rounded-lg sm:rounded-xl shadow-2xl w-full max-w-xl h-[90vh] sm:h-[85vh] flex flex-col overflow-hidden transform transition-all duration-300 ease-out border border-gray-200 mx-2 sm:mx-0"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header fijo */}
                    <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-white flex-shrink-0">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-800 pr-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Editar Multimedia
                        </h2>
                        <button
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                        >
                            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Contenido scrolleable */}
                    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4" style={{ scrollbarWidth: 'thin', scrollbarColor: '#d1d5db #f8f9fa' }}>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Tipo */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    Tipo *
                                </label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7260] focus:border-transparent transition-colors"
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
                                    className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-[#FF7260] focus:border-transparent transition-colors ${
                                        errors.title ? 'border-red-500' : 'border-gray-300'
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
                                    rows={3}
                                    className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-[#FF7260] focus:border-transparent resize-none transition-colors ${
                                        errors.description ? 'border-red-500' : 'border-gray-300'
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

                            {/* Archivos actuales */}
                            <div className="bg-gray-50 p-4 rounded-lg border">
                                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Archivos actuales
                                </h4>
                                <div className="space-y-2">
                                    {item.imageURL && (
                                        <div className="bg-white p-3 rounded border flex items-center gap-2">
                                            <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-sm text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                Imagen actual
                                            </span>
                                        </div>
                                    )}
                                    {item.videoURL && (
                                        <div className="bg-white p-3 rounded border flex items-center gap-2">
                                            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                            </svg>
                                            <span className="text-sm text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                Video actual
                                            </span>
                                        </div>
                                    )}
                                    {!item.imageURL && !item.videoURL && (
                                        <div className="text-center py-4">
                                            <p className="text-sm text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                No hay archivos multimedia asociados
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Reemplazar archivos */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    Reemplazar archivos (opcional)
                                </h3>

                                {/* Nueva imagen */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        Nueva imagen
                                    </label>
                                    <input
                                        type="file"
                                        name="image"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-[#FF7260] focus:border-transparent transition-colors ${
                                            errors.image ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    />
                                    {files.image && (
                                        <p className="text-sm text-gray-600 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            {getFileInfo(files.image)}
                                        </p>
                                    )}
                                    {!files.image && (
                                        <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            Reemplaza la imagen actual
                                        </p>
                                    )}
                                    {errors.image && (
                                        <p className="text-red-500 text-sm mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            {errors.image}
                                        </p>
                                    )}
                                </div>

                                {/* Nuevo video */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        Nuevo video
                                    </label>
                                    <input
                                        type="file"
                                        name="video"
                                        accept="video/*"
                                        onChange={handleFileChange}
                                        className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-[#FF7260] focus:border-transparent transition-colors ${
                                            errors.video ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    />
                                    {files.video && (
                                        <p className="text-sm text-gray-600 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            {getFileInfo(files.video)}
                                        </p>
                                    )}
                                    {!files.video && (
                                        <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            Reemplaza el video actual
                                        </p>
                                    )}
                                    {errors.video && (
                                        <p className="text-red-500 text-sm mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            {errors.video}
                                        </p>
                                    )}
                                </div>
                            </div>

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
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                                <div className="flex items-start gap-2">
                                    <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div>
                                        <p className="text-yellow-800 text-sm font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            Información importante
                                        </p>
                                        <ul className="text-yellow-700 text-sm mt-1 space-y-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            <li>• Solo sube nuevos archivos si deseas reemplazar los existentes</li>
                                            <li>• Los archivos anteriores se eliminarán permanentemente</li>
                                            <li>• ID del elemento: {item._id}</li>
                                            <li>• Creado: {new Date(item.createdAt).toLocaleDateString('es-ES')}</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Footer con botones fijos - MISMO ORDEN QUE MediaUploadModal */}
                    <div className="bg-white border-t border-gray-200 p-4 sm:p-6 flex-shrink-0">
                        <div className="flex flex-col sm:flex-row justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="w-full sm:w-auto px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ fontFamily: 'Poppins, sans-serif' }}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                style={{ fontFamily: 'Poppins, sans-serif' }}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span className="hidden sm:inline">Guardando...</span>
                                        <span className="sm:hidden">...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Guardar cambios
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Estilos CSS inline para scrollbar */}
                <style jsx>{`
                    /* Scrollbar personalizado para webkit */
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

export default MediaEditModal