import React, { useEffect } from "react";
import { Controller } from 'react-hook-form';
import OverlayBackdrop from "./OverlayBackdrop";
import { useMediaForm } from "./Media/Hooks/useMediaForm";

// Componente para editar elementos multimedia
// Permite editar título, descripción, tipo, reemplazar archivos y ver información del elemento
const MediaEditModal = ({ item, onClose, onConfirm }) => {
    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
        setValue,
        watchedValues,
        files,
        handleFileChange,
        validateForm,
        prepareFormData,
        loadInitialData,
        setFieldError,
        clearFieldErrors,
        getFilesInfo,
        validationRules
    } = useMediaForm(item);

    // Tipos disponibles según el modelo
    const typeOptions = [
        { value: "Dato Curioso", label: "Dato Curioso" },
        { value: "Tip", label: "Tip" },
        { value: "Blog", label: "Blog" }
    ];

    // Cargar datos del item al abrir el modal
    useEffect(() => {
        if (item) {
            loadInitialData(item);
        }
    }, [item, loadInitialData]);

    // Función de envío corregida
    const onSubmit = async (data) => {
        try {
            console.log('Iniciando envío...', data);
            
            // Validar formulario completo indicando que es edición
            const isValid = await validateForm(true);
            
            if (!isValid) {
                console.log('Formulario no válido');
                return;
            }

            // Preparar datos para envío
            const submitData = prepareFormData();
            
            // Log para debug
            console.log('Datos preparados para envío:', {
                formData: submitData,
                files: files,
                formValues: data
            });

            // Enviar datos
            await onConfirm(submitData);
            
            console.log('Datos enviados exitosamente');
        } catch (error) {
            console.error("Error al actualizar multimedia:", error);
            setFieldError('submit', error.message || "Error inesperado al actualizar");
        }
    };

    if (!item) return null;

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
                            Editar Multimedia
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
                                        render={({ field, fieldState }) => (
                                            <input
                                                {...field}
                                                type="text"
                                                disabled={isSubmitting}
                                                className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-[#FF7260] focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                                    fieldState.error ? 'border-red-500' : 'border-gray-300'
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
                                        render={({ field, fieldState }) => (
                                            <textarea
                                                {...field}
                                                disabled={isSubmitting}
                                                rows={3}
                                                className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-[#FF7260] focus:border-transparent resize-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                                    fieldState.error ? 'border-red-500' : 'border-gray-300'
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

                                {/* Archivos actuales */}
                                <div className="bg-gray-50 p-4 rounded-lg border">
                                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Archivos actuales
                                    </h4>
                                    <div className="space-y-2">
                                        {item.imageURL && item.imageURL.trim() !== "" ? (
                                            <div className="bg-white p-3 rounded border flex items-center gap-2">
                                                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-sm text-gray-600 flex-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                    Imagen actual
                                                </span>
                                                <a
                                                    href={item.imageURL}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 text-xs"
                                                >
                                                    Ver
                                                </a>
                                            </div>
                                        ) : null}
                                        {item.videoURL && item.videoURL.trim() !== "" ? (
                                            <div className="bg-white p-3 rounded border flex items-center gap-2">
                                                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                                </svg>
                                                <span className="text-sm text-gray-600 flex-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                    Video actual
                                                </span>
                                                <a
                                                    href={item.videoURL}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 text-xs"
                                                >
                                                    Ver
                                                </a>
                                            </div>
                                        ) : null}
                                        {(!item.imageURL || item.imageURL.trim() === "") && (!item.videoURL || item.videoURL.trim() === "") && (
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
                                        <Controller
                                            name="image"
                                            control={control}
                                            render={({ field: { onChange, name, ...field } }) => (
                                                <input
                                                    {...field}
                                                    type="file"
                                                    name={name}
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files[0] || null;
                                                        handleFileChange(e);
                                                        onChange(file);
                                                    }}
                                                    disabled={isSubmitting}
                                                    className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-[#FF7260] focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                                        errors.image ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                    value=""
                                                />
                                            )}
                                        />
                                        {filesInfo.image && (
                                            <p className="text-sm text-gray-600 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                {filesInfo.image}
                                            </p>
                                        )}
                                        {!filesInfo.image && (
                                            <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                Reemplaza la imagen actual (máximo 5MB)
                                            </p>
                                        )}
                                        {errors.image && (
                                            <p className="text-red-500 text-sm mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                {errors.image.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Nuevo video */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            Nuevo video
                                        </label>
                                        <Controller
                                            name="video"
                                            control={control}
                                            render={({ field: { onChange, name, ...field } }) => (
                                                <input
                                                    {...field}
                                                    type="file"
                                                    name={name}
                                                    accept="video/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files[0] || null;
                                                        handleFileChange(e);
                                                        onChange(file);
                                                    }}
                                                    disabled={isSubmitting}
                                                    className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-[#FF7260] focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                                        errors.video ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                    value=""
                                                />
                                            )}
                                        />
                                        {filesInfo.video && (
                                            <p className="text-sm text-gray-600 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                {filesInfo.video}
                                            </p>
                                        )}
                                        {!filesInfo.video && (
                                            <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                Reemplaza el video actual (máximo 50MB)
                                            </p>
                                        )}
                                        {errors.video && (
                                            <p className="text-red-500 text-sm mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                {errors.video.message}
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
                                            {errors.submit.message}
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
                                    className="w-full sm:w-auto px-4 py-2 text-white rounded-lg hover:bg-pink-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    style={{ fontFamily: 'Poppins, sans-serif', backgroundColor: '#FDB4B7', cursor: 'pointer' }}
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
                    </form>
                </div>

                {/* Estilos CSS inline para scrollbar */}
                <style>{`
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

export default MediaEditModal;