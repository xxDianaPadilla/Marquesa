import { useState, useCallback, useEffect } from 'react';
import { useMediaUtils } from './useMediaUtils';

export const useMediaForm = (initialData = null) => {
    const { validateFile, getFileInfo } = useMediaUtils();
    
    // Estado del formulario
    const [formData, setFormData] = useState({
        type: initialData?.type || "Dato Curioso",
        title: initialData?.title || "",
        description: initialData?.description || ""
    });

    // Estado de archivos
    const [files, setFiles] = useState({
        image: null,
        video: null
    });

    // Estado de errores
    const [errors, setErrors] = useState({});

    // Estado de carga
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Efecto para cargar datos iniciales cuando cambien
    useEffect(() => {
        if (initialData) {
            setFormData({
                type: initialData.type || "Dato Curioso",
                title: initialData.title || "",
                description: initialData.description || ""
            });
            // Limpiar archivos al cambiar el item
            setFiles({
                image: null,
                video: null
            });
            // Limpiar errores
            setErrors({});
        }
    }, [initialData]);

    // Manejar cambios en inputs de texto
    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Limpiar error del campo si existe
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    }, [errors]);

    // Manejar cambios en archivos
    const handleFileChange = useCallback((e) => {
        const { name, files: selectedFiles } = e.target;
        if (selectedFiles && selectedFiles[0]) {
            const file = selectedFiles[0];
            const fileType = name === 'image' ? 'image' : 'video';
            const validation = validateFile(file, fileType);
            
            if (!validation.valid) {
                setErrors(prev => ({
                    ...prev,
                    [name]: validation.error
                }));
                return;
            }

            setFiles(prev => ({
                ...prev,
                [name]: file
            }));

            // Limpiar error del campo si existe
            if (errors[name]) {
                setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors[name];
                    return newErrors;
                });
            }

            // Limpiar error general de archivos si existe
            if (errors.files) {
                setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.files;
                    return newErrors;
                });
            }
        }
    }, [validateFile, errors]);

    // Validar formulario completo
    const validateForm = useCallback((isEdit = false) => {
        const newErrors = {};

        // Validar título
        if (!formData.title.trim()) {
            newErrors.title = "El título es requerido";
        }

        // Validar descripción
        if (!formData.description.trim()) {
            newErrors.description = "La descripción es requerida";
        }

        // Para creación, requiere al menos un archivo
        // Para edición, si no hay archivos nuevos, asumimos que mantendrá los existentes
        if (!isEdit && !files.image && !files.video) {
            newErrors.files = "Se requiere al menos una imagen o un video";
        }

        // Validar archivos si están presentes
        if (files.image) {
            const validation = validateFile(files.image, 'image');
            if (!validation.valid) {
                newErrors.image = validation.error;
            }
        }

        if (files.video) {
            const validation = validateFile(files.video, 'video');
            if (!validation.valid) {
                newErrors.video = validation.error;
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData, files, validateFile]);

    // Preparar datos para envío
    const prepareFormData = useCallback(() => {
        const submitData = new FormData();
        
        // Agregar datos del formulario
        submitData.append('type', formData.type);
        submitData.append('title', formData.title);
        submitData.append('description', formData.description);
        
        // Agregar archivos solo si existen
        if (files.image) {
            submitData.append('image', files.image);
        }
        
        if (files.video) {
            submitData.append('video', files.video);
        }

        return submitData;
    }, [formData, files]);

    // Resetear formulario
    const resetForm = useCallback(() => {
        setFormData({
            type: "Dato Curioso",
            title: "",
            description: ""
        });
        setFiles({
            image: null,
            video: null
        });
        setErrors({});
        setIsSubmitting(false);
    }, []);

    // Cargar datos iniciales (para edición)
    const loadInitialData = useCallback((data) => {
        if (data) {
            setFormData({
                type: data.type || "Dato Curioso",
                title: data.title || "",
                description: data.description || ""
            });
            // Resetear archivos al cargar nuevos datos
            setFiles({
                image: null,
                video: null
            });
            setErrors({});
        }
    }, []);

    // Obtener información de archivos para mostrar
    const getFilesInfo = useCallback(() => {
        return {
            image: files.image ? getFileInfo(files.image) : null,
            video: files.video ? getFileInfo(files.video) : null
        };
    }, [files, getFileInfo]);

    // Verificar si hay cambios en el formulario
    const hasChanges = useCallback((originalData = null) => {
        if (!originalData) return true; // Si no hay datos originales, considera que hay cambios
        
        const hasTextChanges = 
            formData.type !== originalData.type ||
            formData.title !== originalData.title ||
            formData.description !== originalData.description;
            
        const hasFileChanges = files.image || files.video;
        
        return hasTextChanges || hasFileChanges;
    }, [formData, files]);

    // Función para verificar si hay archivos antes de enviar
    const hasFiles = useCallback(() => {
        return files.image || files.video;
    }, [files]);

    // Función para limpiar errores específicos
    const clearErrors = useCallback((fieldNames = null) => {
        if (fieldNames) {
            const fields = Array.isArray(fieldNames) ? fieldNames : [fieldNames];
            setErrors(prev => {
                const newErrors = { ...prev };
                fields.forEach(field => delete newErrors[field]);
                return newErrors;
            });
        } else {
            setErrors({});
        }
    }, []);

    // Función para establecer errores específicos
    const setFieldError = useCallback((fieldName, message) => {
        setErrors(prev => ({
            ...prev,
            [fieldName]: message
        }));
    }, []);

    return {
        // Estado
        formData,
        files,
        errors,
        isSubmitting,
        
        // Acciones
        handleInputChange,
        handleFileChange,
        validateForm,
        prepareFormData,
        resetForm,
        loadInitialData,
        setIsSubmitting,
        setErrors,
        clearErrors,
        setFieldError,
        
        // Utilidades
        getFilesInfo,
        hasChanges,
        hasFiles
    };
};