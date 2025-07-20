import React, { useEffect } from "react";
import { Controller } from "react-hook-form";
import OverlayBackdrop from "./OverlayBackdrop";
import { useMediaForm } from "./Media/Hooks/useMediaForm";

/**
 * Componente modal para cargar nuevos archivos multimedia
 * Incluye validación en tiempo real, manejo de errores y preview de archivos
 * 
 * @param {Function} onClose - Función para cerrar el modal
 * @param {Function} onConfirm - Función para confirmar la carga
 */
const MediaUploadModal = ({ onClose, onConfirm }) => {
    // Hook personalizado para manejar el formulario (modo creación)
    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting, isValid },
        files,
        fileValidationErrors,
        isValidating,
        validationRules,
        handleFileChange,
        validateForm,
        prepareFormData,
        getFilesInfo,
        hasFiles,
        setFieldError,
        clearFieldErrors,
        removeFile
    } = useMediaForm(null, false); // false = modo creación

    // Tipos disponibles para multimedia según el modelo de datos
    const typeOptions = [
        { value: "Dato Curioso", label: "Dato Curioso" },
        { value: "Tip", label: "Tip" },
        { value: "Blog", label: "Blog" }
    ];

    /**
     * Manejador del envío del formulario
     * Valida todos los campos antes de enviar y maneja errores
     * 
     * @param {Object} data - Datos del formulario validados por react-hook-form
     */
    const onSubmit = async (data) => {
        console.log('📤 Iniciando envío del formulario de carga...', data);
        
        try {
            // Limpiar errores previos
            clearFieldErrors();
            
            // Validar formulario completo (campos + archivos)
            const isFormValid = await validateForm();
            
            if (!isFormValid) {
                console.log('❌ Formulario no válido, cancelando envío');
                return;
            }

            // Preparar datos para envío
            const formData = prepareFormData();
            
            // Log para debugging (no mostrar contenido de archivos por seguridad)
            console.log('📦 Datos preparados para envío:', {
                type: data.type,
                title: data.title,
                description: data.description,
                hasImage: !!files.image,
                hasVideo: !!files.video
            });

            // Llamar a la función de confirmación del componente padre
            await onConfirm(formData);
            
            console.log('✅ Formulario enviado exitosamente');
            
        } catch (error) {
            console.error('❌ Error al procesar el formulario:', error);
            
            // Mostrar error específico o genérico
            const errorMessage = error?.message || "Error inesperado al procesar el formulario";
            setFieldError('submit', errorMessage);
        }
    };

    /**
     * Manejador para cerrar el modal
     * Incluye confirmación si hay cambios sin guardar
     */
    const handleClose = () => {
        // Si hay archivos seleccionados o datos en el formulario, pedir confirmación
        if (hasFiles() || isValid) {
            const shouldClose = window.confirm(
                '¿Estás seguro de que quieres cerrar? Se perderán los datos no guardados.'
            );
            if (!shouldClose) return;
        }
        
        console.log('🔒 Cerrando modal de carga');
        onClose();
    };

    /**
     * Obtener información de archivos para mostrar en la UI
     */
    const filesInfo = getFilesInfo();

    /**
     * Función para obtener el texto del botón de envío
     * Cambia según el estado del formulario
     */
    const getSubmitButtonText = () => {
        if (isSubmitting) return "Subiendo...";
        if (isValidating) return "Validando...";
        return "Añadir multimedia";
    };

    /**
     * Función para verificar si el botón de envío debe estar deshabilitado
     */
    const isSubmitDisabled = () => {
        return isSubmitting || isValidating || !isValid;
    };

    return (
        <OverlayBackdrop isVisible={true} onClose={handleClose}>
            <div className="flex items-center justify-center min-h-screen p-2 sm:p-4">
                <div
                    className="bg-white rounded-lg sm:rounded-xl shadow-2xl w-full max-w-xl h-[90vh] sm:h-[85vh] flex flex-col overflow-hidden transform transition-all duration-300 ease-out border border-gray-200 mx-2 sm:mx-0"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header fijo del modal */}
                    <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-white flex-shrink-0">
                        <div className="flex items-center gap-3">
                            {/* Icono de carga */}
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-lg sm:text-xl font-bold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    Añadir Multimedia
                                </h2>
                                <p className="text-sm text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    Sube imágenes y videos para tu contenido
                                </p>
                            </div>
                        </div>
                        
                        {/* Botón de cerrar */}
                        <button
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                            title="Cerrar modal"
                        >
                            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Formulario con contenido scrolleable */}
                    <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
                        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4" style={{ scrollbarWidth: 'thin', scrollbarColor: '#d1d5db #f8f9fa' }}>
                            <div className="space-y-6">
                                
                                {/* Campo: Tipo de multimedia */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        Tipo de contenido *
                                    </label>
                                    <Controller
                                        name="type"
                                        control={control}
                                        rules={validationRules.type}
                                        render={({ field, fieldState }) => (
                                            <select
                                                {...field}
                                                disabled={isSubmitting}
                                                className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-[#FF7260] focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                                    fieldState.error ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                                }`}
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
                                    {/* Error del campo tipo */}
                                    {errors.type && (
                                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1 animate-pulse" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {errors.type.message}
                                        </p>
                                    )}
                                </div>

                                {/* Campo: Título */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        Título *
                                    </label>
                                    <Controller
                                        name="title"
                                        control={control}
                                        rules={validationRules.title}
                                        render={({ field, fieldState }) => (
                                            <div className="relative">
                                                <input
                                                    {...field}
                                                    type="text"
                                                    disabled={isSubmitting}
                                                    className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-[#FF7260] focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                                        fieldState.error ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                                    }`}
                                                    placeholder="Ingresa un título descriptivo"
                                                    style={{ fontFamily: 'Poppins, sans-serif' }}
                                                    maxLength={100}
                                                />
                                                {/* Contador de caracteres */}
                                                <div className="absolute right-3 top-2 text-xs text-gray-400">
                                                    {field.value?.length || 0}/100
                                                </div>
                                            </div>
                                        )}
                                    />
                                    {/* Error del campo título */}
                                    {errors.title && (
                                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1 animate-pulse" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {errors.title.message}
                                        </p>
                                    )}
                                </div>

                                {/* Campo: Descripción */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        Descripción *
                                    </label>
                                    <Controller
                                        name="description"
                                        control={control}
                                        rules={validationRules.description}
                                        render={({ field, fieldState }) => (
                                            <div className="relative">
                                                <textarea
                                                    {...field}
                                                    disabled={isSubmitting}
                                                    rows={4}
                                                    className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-[#FF7260] focus:border-transparent resize-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                                        fieldState.error ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                                    }`}
                                                    placeholder="Describe el contenido multimedia"
                                                    style={{ fontFamily: 'Poppins, sans-serif' }}
                                                    maxLength={500}
                                                />
                                                {/* Contador de caracteres */}
                                                <div className="absolute right-3 bottom-2 text-xs text-gray-400">
                                                    {field.value?.length || 0}/500
                                                </div>
                                            </div>
                                        )}
                                    />
                                    {/* Error del campo descripción */}
                                    {errors.description && (
                                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1 animate-pulse" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {errors.description.message}
                                        </p>
                                    )}
                                </div>

                                {/* Sección de archivos multimedia */}
                                <div className="space-y-6 bg-gray-50 p-4 rounded-lg border">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V17a4 4 0 01-4 4H7z" />
                                        </svg>
                                        <h3 className="text-sm font-medium text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            Archivos multimedia *
                                        </h3>
                                    </div>
                                    
                                    <p className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        Selecciona al menos una imagen o un video para el contenido.
                                    </p>

                                    {/* Campo: Imagen */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            <span className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                                </svg>
                                                Imagen
                                            </span>
                                        </label>
                                        <div className="space-y-2">
                                            <input
                                                type="file"
                                                name="image"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                disabled={isSubmitting}
                                                className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-[#FF7260] focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${
                                                    fileValidationErrors.image ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                                }`}
                                            />
                                            
                                            {/* Información del archivo de imagen */}
                                            {filesInfo.image && (
                                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                                            </svg>
                                                            <span className="text-sm text-blue-800 font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                                {filesInfo.image}
                                                            </span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeFile('image')}
                                                            className="text-red-600 hover:text-red-800 transition-colors p-1"
                                                            title="Eliminar imagen"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {!filesInfo.image && (
                                                <p className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                    Formatos: JPG, PNG, GIF, WEBP (máximo 5MB)
                                                </p>
                                            )}
                                            
                                            {/* Error del archivo de imagen */}
                                            {fileValidationErrors.image && (
                                                <p className="text-red-500 text-sm flex items-center gap-1 animate-pulse" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    {fileValidationErrors.image}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Campo: Video */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            <span className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                                </svg>
                                                Video
                                            </span>
                                        </label>
                                        <div className="space-y-2">
                                            <input
                                                type="file"
                                                name="video"
                                                accept="video/*"
                                                onChange={handleFileChange}
                                                disabled={isSubmitting}
                                                className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-[#FF7260] focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 ${
                                                    fileValidationErrors.video ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                                }`}
                                            />
                                            
                                            {/* Información del archivo de video */}
                                            {filesInfo.video && (
                                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                                                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                                            </svg>
                                                            <span className="text-sm text-red-800 font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                                {filesInfo.video}
                                                            </span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeFile('video')}
                                                            className="text-red-600 hover:text-red-800 transition-colors p-1"
                                                            title="Eliminar video"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {!filesInfo.video && (
                                                <p className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                    Formatos: MP4, MOV, AVI, WEBM (máximo 50MB)
                                                </p>
                                            )}
                                            
                                            {/* Error del archivo de video */}
                                            {fileValidationErrors.video && (
                                                <p className="text-red-500 text-sm flex items-center gap-1 animate-pulse" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    {fileValidationErrors.video}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Error general de archivos */}
                                    {fileValidationErrors.general && (
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                            <p className="text-red-600 text-sm flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {fileValidationErrors.general}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Error de envío */}
                                {errors.submit && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <p className="text-red-600 text-sm flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {errors.submit.message}
                                        </p>
                                    </div>
                                )}

                                {/* Información de ayuda */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-start gap-2">
                                        <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div>
                                            <p className="text-blue-800 text-sm font-medium mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                Consejos para mejores resultados:
                                            </p>
                                            <ul className="text-blue-700 text-sm space-y-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                <li>• Usa títulos descriptivos y únicos</li>
                                                <li>• Las imágenes deben ser de buena calidad</li>
                                                <li>• Los videos se reproducirán automáticamente</li>
                                                <li>• Puedes incluir tanto imagen como video</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer con botones fijos */}
                        <div className="bg-white border-t border-gray-200 p-4 sm:p-6 flex-shrink-0">
                            <div className="flex flex-col sm:flex-row justify-end gap-3">
                                {/* Botón cancelar */}
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    disabled={isSubmitting}
                                    className="w-full sm:w-auto px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ fontFamily: 'Poppins, sans-serif' }}
                                >
                                    Cancelar
                                </button>
                                
                                {/* Botón enviar */}
                                <button
                                    type="submit"
                                    disabled={isSubmitDisabled()}
                                    className={`w-full sm:w-auto px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                                        isSubmitDisabled() 
                                            ? 'bg-gray-400' 
                                            : 'bg-[#FF7260] hover:bg-[#FF6A54]'
                                    }`}
                                    style={{ fontFamily: 'Poppins, sans-serif' }}
                                >
                                    {(isSubmitting || isValidating) ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            <span className="hidden sm:inline">{getSubmitButtonText()}</span>
                                            <span className="sm:hidden">...</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            {getSubmitButtonText()}
                                        </>
                                    )}
                                </button>
                            </div>
                            
                            {/* Indicador de estado del formulario */}
                            <div className="mt-3 text-center">
                                <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                                    <div className={`w-2 h-2 rounded-full ${isValid ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                    <span style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        {isValid ? 'Formulario válido' : 'Completa todos los campos'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Estilos CSS para scrollbar personalizada */}
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