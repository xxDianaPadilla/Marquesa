import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMediaUtils } from './useMediaUtils';

// Hook para manejar la lógica del formulario de medios
// Permite crear, editar, validar y enviar elementos multimedia
export const useMediaForm = (initialData = null) => {
    const { validateFile, getFileInfo } = useMediaUtils();
    
    // Configuración de react-hook-form
    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
        setValue,
        watch,
        reset,
        setError,
        clearErrors,
        getValues,
        trigger
    } = useForm({
        defaultValues: {
            type: initialData?.type || "Dato Curioso",
            title: initialData?.title || "",
            description: initialData?.description || "",
            image: null,
            video: null
        },
        mode: 'onChange'
    });

    // Estado para archivos (react-hook-form no maneja archivos directamente muy bien)
    const [files, setFiles] = useState({
        image: null,
        video: null
    });

    // Watch para detectar cambios
    const watchedValues = watch();

    // Efecto para cargar datos iniciales cuando cambien
    useEffect(() => {
        if (initialData) {
            reset({
                type: initialData.type || "Dato Curioso",
                title: initialData.title || "",
                description: initialData.description || "",
                image: null,
                video: null
            });
            
            // Limpiar archivos al cambiar el item
            setFiles({
                image: null,
                video: null
            });
        }
    }, [initialData, reset]);

    // Validación personalizada para archivos
    const validateFiles = useCallback((isEdit = false) => {
        // Para creación, requiere al menos un archivo
        // Para edición, los archivos son completamente opcionales
        if (!isEdit && !files.image && !files.video) {
            setError('files', { 
                type: 'required', 
                message: 'Se requiere al menos una imagen o un video' 
            });
            return false;
        }

        // Para edición, si no hay archivos nuevos, es válido
        if (isEdit && !files.image && !files.video) {
            // Limpiar cualquier error previo de archivos
            clearErrors(['files', 'image', 'video']);
            return true;
        }

        // Validar archivo de imagen si existe
        if (files.image) {
            const validation = validateFile(files.image, 'image');
            if (!validation.valid) {
                setError('image', { 
                    type: 'validation', 
                    message: validation.error 
                });
                return false;
            }
        }

        // Validar archivo de video si existe
        if (files.video) {
            const validation = validateFile(files.video, 'video');
            if (!validation.valid) {
                setError('video', { 
                    type: 'validation', 
                    message: validation.error 
                });
                return false;
            }
        }

        return true;
    }, [files, validateFile, setError, clearErrors]);

    // Reglas de validación para los campos de texto
    const validationRules = {
        title: {
            required: "El título es requerido",
            validate: value => value.trim() !== "" || "El título no puede estar vacío"
        },
        description: {
            required: "La descripción es requerida",
            validate: value => value.trim() !== "" || "La descripción no puede estar vacía"
        }
    };

    // Manejar cambios en archivos
    const handleFileChange = useCallback((e) => {
        const { name, files: selectedFiles } = e.target;
        if (selectedFiles && selectedFiles[0]) {
            const file = selectedFiles[0];
            const fileType = name === 'image' ? 'image' : 'video';
            const validation = validateFile(file, fileType);
            
            if (!validation.valid) {
                setError(name, { 
                    type: 'validation', 
                    message: validation.error 
                });
                return;
            }

            setFiles(prev => ({
                ...prev,
                [name]: file
            }));

            // Actualizar el valor en react-hook-form
            setValue(name, file);

            // Limpiar errores relacionados
            clearErrors([name, 'files']);
        }
    }, [validateFile, setError, setValue, clearErrors]);

    // Validar formulario completo
    const validateForm = useCallback(async (isEdit = false) => {
        // Validar campos de texto
        const isValid = await trigger();
        
        // Validar archivos
        const filesValid = validateFiles(isEdit);
        
        return isValid && filesValid;
    }, [trigger, validateFiles]);

    // Preparar datos para envío
    const prepareFormData = useCallback(() => {
        const formValues = getValues();
        const submitData = new FormData();
        
        // Agregar datos del formulario
        submitData.append('type', formValues.type);
        submitData.append('title', formValues.title);
        submitData.append('description', formValues.description);
        
        // Agregar archivos solo si existen
        if (files.image) {
            submitData.append('image', files.image);
        }
        
        if (files.video) {
            submitData.append('video', files.video);
        }

        return submitData;
    }, [getValues, files]);

    // Resetear formulario
    const resetForm = useCallback(() => {
        reset({
            type: "Dato Curioso",
            title: "",
            description: "",
            image: null,
            video: null
        });
        setFiles({
            image: null,
            video: null
        });
    }, [reset]);

    // Cargar datos iniciales (para edición)
    const loadInitialData = useCallback((data) => {
        if (data) {
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
        }
    }, [reset]);

    // Obtener información de archivos para mostrar
    const getFilesInfo = useCallback(() => {
        return {
            image: files.image ? getFileInfo(files.image) : null,
            video: files.video ? getFileInfo(files.video) : null
        };
    }, [files, getFileInfo]);

    // Verificar si hay cambios en el formulario
    const hasChanges = useCallback((originalData = null) => {
        if (!originalData) return true;
        
        const currentValues = getValues();
        const hasTextChanges = 
            currentValues.type !== originalData.type ||
            currentValues.title !== originalData.title ||
            currentValues.description !== originalData.description;
            
        const hasFileChanges = files.image || files.video;
        
        return hasTextChanges || hasFileChanges;
    }, [getValues, files]);

    // Función para verificar si hay archivos antes de enviar
    const hasFiles = useCallback(() => {
        return files.image || files.video;
    }, [files]);

    // Función para establecer errores específicos
    const setFieldError = useCallback((fieldName, message) => {
        setError(fieldName, { 
            type: 'manual', 
            message 
        });
    }, [setError]);

    // Función para limpiar errores específicos
    const clearFieldErrors = useCallback((fieldNames = null) => {
        if (fieldNames) {
            const fields = Array.isArray(fieldNames) ? fieldNames : [fieldNames];
            clearErrors(fields);
        } else {
            clearErrors();
        }
    }, [clearErrors]);

    return {
        // React Hook Form - RETORNAR EL handleSubmit ORIGINAL
        control,
        handleSubmit, // <- Este es el handleSubmit original de react-hook-form
        formState: { errors, isSubmitting },
        setValue,
        watch,
        reset,
        getValues,
        trigger,
        
        // Estado personalizado
        files,
        watchedValues,
        
        // Acciones
        handleFileChange,
        validateForm,
        prepareFormData,
        resetForm,
        loadInitialData,
        setFieldError,
        clearFieldErrors: clearFieldErrors,
        
        // Utilidades
        getFilesInfo,
        hasChanges,
        hasFiles,
        validationRules
    };
};