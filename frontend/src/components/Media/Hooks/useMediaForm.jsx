import { useState, useCallback } from 'react';
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
        submitData.append('type', formData.type);
        submitData.append('title', formData.title);
        submitData.append('description', formData.description);
        
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
        
        // Utilidades
        getFilesInfo,
        hasChanges
    };
};