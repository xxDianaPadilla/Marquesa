import React from "react";
import { Controller } from "react-hook-form";
import OverlayBackdrop from "./OverlayBackdrop";
import { useMediaForm } from "./Media/Hooks/useMediaForm";

// Componente para el modal de carga de medios
// Permite al usuario subir imágenes y videos con validación de archivos
const MediaUploadModal = ({ onClose, onConfirm }) => {
    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
        handleFileChange,
        validationRules,
        getFilesInfo,
        setFieldError
    } = useMediaForm();

    // Tipos disponibles según el modelo
    const typeOptions = [
        { value: "Dato Curioso", label: "Dato Curioso" },
        { value: "Tip", label: "Tip" },
        { value: "Blog", label: "Blog" }
    ];

    // Manejar envío del formulario
    const onSubmit = async (data) => {
        try {
            // Los datos ya están validados por react-hook-form
            // prepareFormData se ejecuta dentro del hook
            await onConfirm(data);
        } catch (error) {
            console.error("Error en el formulario:", error);
            setFieldError("submit", error.message || "Error inesperado");
        }
    };

    const filesInfo = getFilesInfo();

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
                    <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
                        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4" style={{ scrollbarWidth: 'thin', scrollbarColor: '#d1d5db #f8f9fa' }}>
                            <div className="space-y-4">
                                {/* Tipo */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        Tipo *
                                    </label>
                                    <Controller
                                        name="type"
                                        control={control}
                                        render={({ field }) => (
                                            <select
                                                {...field}
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
                                        )}
                                    />
                                </div>

                                {/* Título */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        Título *
                                    </label>
                                    <Controller
                                        name="title"
                                        control={control}
                                        rules={validationRules.title}
                                        render={({ field }) => (
                                            <input
                                                {...field}
                                                type="text"
                                                disabled={isSubmitting}
                                                className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-[#FF7260] focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                                    errors.title ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                                placeholder="Ingresa el título"
                                                style={{ fontFamily: 'Poppins, sans-serif' }}
                                            />
                                        )}
                                    />
                                    {errors.title && (
                                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {errors.title.message}
                                        </p>
                                    )}
                                </div>

                                {/* Descripción */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        Descripción *
                                    </label>
                                    <Controller
                                        name="description"
                                        control={control}
                                        rules={validationRules.description}
                                        render={({ field }) => (
                                            <textarea
                                                {...field}
                                                disabled={isSubmitting}
                                                rows={3}
                                                className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-[#FF7260] focus:border-transparent resize-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                                    errors.description ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                                placeholder="Describe el contenido multimedia"
                                                style={{ fontFamily: 'Poppins, sans-serif' }}
                                            />
                                        )}
                                    />
                                    {errors.description && (
                                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {errors.description.message}
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
                                            className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-[#FF7260] focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                                errors.image ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        />
                                        {filesInfo.image && (
                                            <p className="text-sm text-gray-600 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                {filesInfo.image}
                                            </p>
                                        )}
                                        {!filesInfo.image && (
                                            <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                Máximo 5MB
                                            </p>
                                        )}
                                        {errors.image && (
                                            <p className="text-red-500 text-sm mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                {errors.image.message}
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
                                            className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-[#FF7260] focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                                errors.video ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        />
                                        {filesInfo.video && (
                                            <p className="text-sm text-gray-600 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                {filesInfo.video}
                                            </p>
                                        )}
                                        {!filesInfo.video && (
                                            <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                Máximo 50MB
                                            </p>
                                        )}
                                        {errors.video && (
                                            <p className="text-red-500 text-sm mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                {errors.video.message}
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
                                            {errors.files.message}
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
                                            {errors.submit.message}
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