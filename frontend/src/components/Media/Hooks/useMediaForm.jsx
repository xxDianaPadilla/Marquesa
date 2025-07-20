import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMediaUtils } from './useMediaUtils';

/**
 * Hook personalizado para manejar formularios de multimedia
 * Proporciona validación en tiempo real, manejo de archivos y estado del formulario
 * 
 * @param {Object} initialData - Datos iniciales para edición (opcional)
 * @param {boolean} isEditMode - Indica si el formulario está en modo edición
 * @returns {Object} Estado y funciones del formulario
 */
export const useMediaForm = (initialData = null, isEditMode = false) => {
    const { validateFile, getFileInfo } = useMediaUtils();
    
    // Configuración de react-hook-form con validaciones y valores por defecto
    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting, isValid, isDirty },
        setValue,
        watch,
        reset,
        setError,
        clearErrors,
        getValues,
        trigger
    } = useForm({
        // Valores por defecto del formulario
        defaultValues: {
            type: initialData?.type || "Dato Curioso",
            title: initialData?.title || "",
            description: initialData?.description || "",
            image: null,
            video: null
        },
        // Modo de validación: onChange para validación en tiempo real
        mode: 'onChange',
        // Criterios de validación para envío del formulario
        criteriaMode: 'all',
        // Revalidar en blur para mejor UX
        reValidateMode: 'onBlur'
    });

    // Estado local para archivos (react-hook-form no maneja archivos File directamente)
    const [files, setFiles] = useState({
        image: null,
        video: null
    });

    // Estado para validaciones personalizadas de archivos
    const [fileValidationErrors, setFileValidationErrors] = useState({
        image: null,
        video: null,
        general: null
    });

    // Estado para indicar si se está validando
    const [isValidating, setIsValidating] = useState(false);

    // Watch para detectar cambios en tiempo real
    const watchedValues = watch();

    /**
     * Efecto para cargar datos iniciales cuando cambian
     * Se ejecuta al montar el componente o cuando cambian los datos iniciales
     */
    useEffect(() => {
        if (initialData && isEditMode) {
            console.log('🔄 Cargando datos iniciales para edición:', initialData);
            
            // Resetear formulario con datos iniciales
            reset({
                type: initialData.type || "Dato Curioso",
                title: initialData.title || "",
                description: initialData.description || "",
                image: null,
                video: null
            });
            
            // Limpiar archivos y errores al cambiar el item
            setFiles({
                image: null,
                video: null
            });
            
            setFileValidationErrors({
                image: null,
                video: null,
                general: null
            });
        }
    }, [initialData, isEditMode, reset]);

    /**
     * Reglas de validación para los campos de texto
     * Definidas como constante para evitar recreación innecesaria
     */
    const validationRules = {
        type: {
            required: "El tipo es requerido",
            validate: value => {
                const allowedTypes = ["Dato Curioso", "Tip", "Blog"];
                return allowedTypes.includes(value) || "Tipo no válido";
            }
        },
        title: {
            required: "El título es requerido",
            minLength: {
                value: 3,
                message: "El título debe tener al menos 3 caracteres"
            },
            maxLength: {
                value: 100,
                message: "El título no puede exceder 100 caracteres"
            },
            validate: {
                notEmpty: value => {
                    const trimmed = value?.trim();
                    return trimmed && trimmed.length > 0 || "El título no puede estar vacío";
                },
                noSpecialChars: value => {
                    const regex = /^[a-zA-Z0-9\s\-.,!?ñáéíóúÑÁÉÍÓÚ]+$/;
                    return regex.test(value) || "El título contiene caracteres no permitidos";
                }
            }
        },
        description: {
            required: "La descripción es requerida",
            minLength: {
                value: 10,
                message: "La descripción debe tener al menos 10 caracteres"
            },
            maxLength: {
                value: 500,
                message: "La descripción no puede exceder 500 caracteres"
            },
            validate: {
                notEmpty: value => {
                    const trimmed = value?.trim();
                    return trimmed && trimmed.length > 0 || "La descripción no puede estar vacía";
                }
            }
        }
    };

    /**
     * Función para validar archivos individuales
     * 
     * @param {File} file - Archivo a validar
     * @param {string} fileType - Tipo de archivo ('image' o 'video')
     * @returns {Object} Resultado de la validación
     */
    const validateSingleFile = useCallback((file, fileType) => {
        console.log(`🔍 Validando archivo ${fileType}:`, file?.name);
        
        if (!file) {
            return { isValid: true, error: null }; // Los archivos son opcionales individualmente
        }

        // Usar la función de validación del hook de utilidades
        const validation = validateFile(file, fileType);
        
        if (!validation.valid) {
            console.error(`❌ Error en validación de ${fileType}:`, validation.error);
            return { isValid: false, error: validation.error };
        }

        console.log(`✅ Archivo ${fileType} válido`);
        return { isValid: true, error: null };
    }, [validateFile]);

    /**
     * Función para validar que al menos un archivo esté presente (solo para creación)
     * 
     * @returns {Object} Resultado de la validación general de archivos
     */
    const validateFileRequirement = useCallback(() => {
        // En modo edición, los archivos son completamente opcionales
        if (isEditMode) {
            console.log('📝 Modo edición: archivos opcionales');
            return { isValid: true, error: null };
        }

        // En modo creación, se requiere al menos un archivo
        if (!files.image && !files.video) {
            const error = 'Se requiere al menos una imagen o un video';
            console.error('❌ Error de requisito de archivos:', error);
            return { isValid: false, error };
        }

        console.log('✅ Requisito de archivos cumplido');
        return { isValid: true, error: null };
    }, [files.image, files.video, isEditMode]);

    /**
     * Función principal de validación de archivos
     * Valida archivos individuales y requisitos generales
     * 
     * @returns {boolean} True si todos los archivos son válidos
     */
    const validateFiles = useCallback(async () => {
        console.log('🔍 Iniciando validación completa de archivos...');
        setIsValidating(true);
        
        try {
            let hasErrors = false;
            const newErrors = {
                image: null,
                video: null,
                general: null
            };

            // Validar archivo de imagen si existe
            if (files.image) {
                const imageValidation = validateSingleFile(files.image, 'image');
                if (!imageValidation.isValid) {
                    newErrors.image = imageValidation.error;
                    hasErrors = true;
                }
            }

            // Validar archivo de video si existe
            if (files.video) {
                const videoValidation = validateSingleFile(files.video, 'video');
                if (!videoValidation.isValid) {
                    newErrors.video = videoValidation.error;
                    hasErrors = true;
                }
            }

            // Validar requisito general de archivos
            const requirementValidation = validateFileRequirement();
            if (!requirementValidation.isValid) {
                newErrors.general = requirementValidation.error;
                hasErrors = true;
            }

            // Actualizar estado de errores de archivos
            setFileValidationErrors(newErrors);

            // Limpiar o establecer errores en react-hook-form
            if (hasErrors) {
                if (newErrors.image) setError('image', { type: 'validation', message: newErrors.image });
                if (newErrors.video) setError('video', { type: 'validation', message: newErrors.video });
                if (newErrors.general) setError('files', { type: 'validation', message: newErrors.general });
            } else {
                clearErrors(['image', 'video', 'files']);
            }

            console.log(hasErrors ? '❌ Validación de archivos falló' : '✅ Validación de archivos exitosa');
            return !hasErrors;

        } catch (error) {
            console.error('❌ Error durante validación de archivos:', error);
            setFileValidationErrors({
                image: null,
                video: null,
                general: 'Error interno de validación'
            });
            setError('files', { type: 'validation', message: 'Error interno de validación' });
            return false;
        } finally {
            setIsValidating(false);
        }
    }, [files, validateSingleFile, validateFileRequirement, setError, clearErrors]);

    /**
     * Manejador de cambios en archivos
     * Se ejecuta cuando el usuario selecciona un archivo
     * 
     * @param {Event} e - Evento del input file
     */
    const handleFileChange = useCallback(async (e) => {
        const { name, files: selectedFiles } = e.target;
        
        console.log(`📁 Cambio en archivo ${name}:`, selectedFiles?.[0]?.name);
        
        if (selectedFiles && selectedFiles[0]) {
            const file = selectedFiles[0];
            const fileType = name === 'image' ? 'image' : 'video';
            
            // Validar archivo inmediatamente
            const validation = validateSingleFile(file, fileType);
            
            if (!validation.isValid) {
                // Establecer error y no guardar el archivo
                setFileValidationErrors(prev => ({
                    ...prev,
                    [name]: validation.error
                }));
                setError(name, { 
                    type: 'validation', 
                    message: validation.error 
                });
                
                // Limpiar el input
                e.target.value = '';
                return;
            }

            // Si la validación es exitosa, guardar el archivo
            setFiles(prev => ({
                ...prev,
                [name]: file
            }));

            // Actualizar el valor en react-hook-form para tracking
            setValue(name, file, { shouldValidate: true, shouldDirty: true });

            // Limpiar errores relacionados con este archivo
            setFileValidationErrors(prev => ({
                ...prev,
                [name]: null,
                general: null // Limpiar error general también
            }));
            clearErrors([name, 'files']);

            console.log(`✅ Archivo ${name} guardado exitosamente`);
        } else {
            // Si no hay archivo, limpiar
            setFiles(prev => ({
                ...prev,
                [name]: null
            }));
            setValue(name, null);
            
            // Limpiar errores de este archivo específico
            setFileValidationErrors(prev => ({
                ...prev,
                [name]: null
            }));
            clearErrors([name]);
        }
    }, [validateSingleFile, setValue, setError, clearErrors]);

    /**
     * Función para validar todo el formulario
     * Combina validación de campos de texto y archivos
     * 
     * @returns {boolean} True si el formulario completo es válido
     */
    const validateForm = useCallback(async () => {
        console.log('🔍 Validando formulario completo...');
        setIsValidating(true);
        
        try {
            // Validar campos de texto
            const fieldsValid = await trigger();
            console.log('📝 Validación de campos de texto:', fieldsValid ? '✅' : '❌');
            
            // Validar archivos
            const filesValid = await validateFiles();
            console.log('📁 Validación de archivos:', filesValid ? '✅' : '❌');
            
            const isFormValid = fieldsValid && filesValid;
            console.log('📋 Validación completa del formulario:', isFormValid ? '✅' : '❌');
            
            return isFormValid;
        } catch (error) {
            console.error('❌ Error en validación del formulario:', error);
            return false;
        } finally {
            setIsValidating(false);
        }
    }, [trigger, validateFiles]);

    /**
     * Función para preparar datos para envío
     * Convierte los datos del formulario a FormData
     * 
     * @returns {FormData} Datos preparados para envío al servidor
     */
    const prepareFormData = useCallback(() => {
        console.log('📦 Preparando datos para envío...');
        
        const formValues = getValues();
        const submitData = new FormData();
        
        // Agregar datos del formulario
        submitData.append('type', formValues.type);
        submitData.append('title', formValues.title.trim());
        submitData.append('description', formValues.description.trim());
        
        // Agregar archivos solo si existen
        if (files.image) {
            submitData.append('image', files.image);
            console.log('📷 Imagen agregada:', files.image.name);
        }
        
        if (files.video) {
            submitData.append('video', files.video);
            console.log('🎥 Video agregado:', files.video.name);
        }

        // Log para debugging
        console.log('📦 FormData preparado:', {
            type: formValues.type,
            title: formValues.title,
            description: formValues.description,
            hasImage: !!files.image,
            hasVideo: !!files.video
        });

        return submitData;
    }, [getValues, files]);

    /**
     * Función para resetear el formulario completamente
     * Limpia todos los campos, archivos y errores
     */
    const resetForm = useCallback(() => {
        console.log('🧹 Reseteando formulario completo...');
        
        // Resetear formulario a valores iniciales
        reset({
            type: "Dato Curioso",
            title: "",
            description: "",
            image: null,
            video: null
        });
        
        // Limpiar archivos
        setFiles({
            image: null,
            video: null
        });
        
        // Limpiar errores de archivos
        setFileValidationErrors({
            image: null,
            video: null,
            general: null
        });
        
        console.log('✅ Formulario reseteado');
    }, [reset]);

    /**
     * Función para cargar datos iniciales (para edición)
     * 
     * @param {Object} data - Datos a cargar en el formulario
     */
    const loadInitialData = useCallback((data) => {
        if (data) {
            console.log('📥 Cargando datos iniciales:', data);
            
            reset({
                type: data.type || "Dato Curioso",
                title: data.title || "",
                description: data.description || "",
                image: null,
                video: null
            });
            
            // Resetear archivos al cargar nuevos datos
            setFiles({
                image: null,
                video: null
            });
            
            // Limpiar errores
            setFileValidationErrors({
                image: null,
                video: null,
                general: null
            });
        }
    }, [reset]);

    /**
     * Función para obtener información de archivos para mostrar en UI
     * 
     * @returns {Object} Información formateada de los archivos
     */
    const getFilesInfo = useCallback(() => {
        return {
            image: files.image ? getFileInfo(files.image) : null,
            video: files.video ? getFileInfo(files.video) : null
        };
    }, [files, getFileInfo]);

    /**
     * Función para verificar si hay cambios en el formulario
     * 
     * @param {Object} originalData - Datos originales para comparar
     * @returns {boolean} True si hay cambios
     */
    const hasChanges = useCallback((originalData = null) => {
        if (!originalData) return isDirty || files.image || files.video;
        
        const currentValues = getValues();
        const hasTextChanges = 
            currentValues.type !== originalData.type ||
            currentValues.title !== originalData.title ||
            currentValues.description !== originalData.description;
            
        const hasFileChanges = files.image || files.video;
        
        return hasTextChanges || hasFileChanges;
    }, [getValues, files, isDirty]);

    /**
     * Función para verificar si hay archivos antes de enviar
     * 
     * @returns {boolean} True si hay al menos un archivo
     */
    const hasFiles = useCallback(() => {
        return !!(files.image || files.video);
    }, [files]);

    /**
     * Función para establecer errores específicos de campo
     * 
     * @param {string} fieldName - Nombre del campo
     * @param {string} message - Mensaje de error
     */
    const setFieldError = useCallback((fieldName, message) => {
        console.log(`❌ Estableciendo error en ${fieldName}:`, message);
        setError(fieldName, { 
            type: 'manual', 
            message 
        });
    }, [setError]);

    /**
     * Función para limpiar errores específicos
     * 
     * @param {string|Array} fieldNames - Nombre(s) del campo a limpiar
     */
    const clearFieldErrors = useCallback((fieldNames = null) => {
        if (fieldNames) {
            const fields = Array.isArray(fieldNames) ? fieldNames : [fieldNames];
            console.log('🧹 Limpiando errores de campos:', fields);
            clearErrors(fields);
        } else {
            console.log('🧹 Limpiando todos los errores');
            clearErrors();
            setFileValidationErrors({
                image: null,
                video: null,
                general: null
            });
        }
    }, [clearErrors]);

    /**
     * Función para eliminar un archivo específico
     * 
     * @param {string} fileType - Tipo de archivo a eliminar ('image' o 'video')
     */
    const removeFile = useCallback((fileType) => {
        console.log(`🗑️ Eliminando archivo ${fileType}`);
        
        setFiles(prev => ({
            ...prev,
            [fileType]: null
        }));
        
        setValue(fileType, null);
        
        // Limpiar errores de este archivo
        setFileValidationErrors(prev => ({
            ...prev,
            [fileType]: null
        }));
        
        clearErrors([fileType]);
    }, [setValue, clearErrors]);

    // Retorno del hook con todas las funcionalidades
    return {
        // React Hook Form - API principal
        control,
        handleSubmit, // ⚠️ IMPORTANTE: Este es el handleSubmit de react-hook-form
        formState: { 
            errors, 
            isSubmitting, 
            isValid, 
            isDirty 
        },
        setValue,
        watch,
        reset,
        getValues,
        trigger,
        
        // Estado personalizado del formulario
        files,
        watchedValues,
        fileValidationErrors,
        isValidating,
        isEditMode,
        
        // Funciones de validación
        validateForm,
        validateFiles,
        validateSingleFile,
        validationRules,
        
        // Manejo de archivos
        handleFileChange,
        removeFile,
        getFilesInfo,
        hasFiles,
        
        // Utilidades del formulario
        prepareFormData,
        resetForm,
        loadInitialData,
        hasChanges,
        
        // Manejo de errores
        setFieldError,
        clearFieldErrors
    };
};