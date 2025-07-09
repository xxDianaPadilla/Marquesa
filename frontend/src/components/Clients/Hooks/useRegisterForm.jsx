import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

/**
 * Hook personalizado para manejar el formulario de registro
 * Maneja la lógica de validación, envío de datos y navegación
 */
const useRegisterForm = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        email: '',
        birthDate: '',
        address: '',
        password: '',
        acceptTerms: false
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    /**
     * Maneja los cambios en los inputs del formulario
     * @param {Event} e - Evento del input
     */
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Limpiar error específico cuando el usuario empiece a escribir
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    /**
     * Valida todos los campos del formulario
     * @returns {boolean} true si es válido, false si hay errores
     */
    const validateForm = () => {
        const newErrors = {};

        // Validar nombre completo
        if (!formData.fullName.trim()) {
            newErrors.fullName = 'El nombre completo es requerido';
        } else if (formData.fullName.trim().length < 2) {
            newErrors.fullName = 'El nombre debe tener al menos 2 caracteres';
        }

        // Validar teléfono
        if (!formData.phone.trim()) {
            newErrors.phone = 'El teléfono es requerido';
        } else if (!/^[0-9+\-\s()]+$/.test(formData.phone)) {
            newErrors.phone = 'Ingresa un número de teléfono válido';
        }

        // Validar email
        if (!formData.email.trim()) {
            newErrors.email = 'El correo electrónico es requerido';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'El correo electrónico no es válido';
        }

        // Validar fecha de nacimiento
        if (!formData.birthDate) {
            newErrors.birthDate = 'La fecha de nacimiento es requerida';
        }

        // Validar dirección
        if (!formData.address.trim()) {
            newErrors.address = 'La dirección es requerida';
        }

        // Validar contraseña
        if (!formData.password) {
            newErrors.password = 'La contraseña es requerida';
        } else if (formData.password.length < 6) {
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
        }

        // Validar términos y condiciones
        if (!formData.acceptTerms) {
            newErrors.acceptTerms = 'Debes aceptar los términos y condiciones';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /**
     * Maneja el envío del formulario de registro
     * @param {Event} e - Evento del formulario
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            // Preparar datos para enviar al backend
            const registrationData = {
                fullName: formData.fullName.trim(),
                phone: formData.phone.trim(),
                email: formData.email.trim().toLowerCase(),
                birthDate: formData.birthDate,
                address: formData.address.trim(),
                password: formData.password,
                favorites: [], // Array vacío como default
                discount: null // Sin descuento inicial
            };

            // Enviar datos al backend
            const response = await fetch('http://localhost:4000/api/registerCustomers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(registrationData),
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Registro exitoso
                toast.success('¡Registro exitoso! Ya puedes iniciar sesión', {
                    duration: 4000,
                    style: {
                        background: '#10B981',
                        color: '#FFFFFF',
                        fontFamily: 'Poppins, sans-serif',
                        borderRadius: '8px',
                        fontSize: '14px'
                    },
                    iconTheme: {
                        primary: '#FFFFFF',
                        secondary: '#10B981',
                    },
                });

                // Navegar al login después de un breve delay
                setTimeout(() => {
                    navigate('/login');
                }, 1000);

            } else {
                // Error del servidor
                if (data.message === 'El cliente ya existe') {
                    // Usuario ya existe
                    setErrors({ email: 'Este correo ya está registrado' });
                    toast.error('Este correo electrónico ya está registrado', {
                        duration: 4000,
                        style: {
                            background: '#EF4444',
                            color: '#FFFFFF',
                            fontFamily: 'Poppins, sans-serif',
                            borderRadius: '8px',
                            fontSize: '14px'
                        },
                        iconTheme: {
                            primary: '#FFFFFF',
                            secondary: '#EF4444',
                        },
                    });
                } else {
                    // Otros errores del servidor
                    setErrors({ general: data.message || 'Error en el registro' });
                    toast.error(data.message || 'Error en el registro', {
                        duration: 4000,
                        style: {
                            background: '#EF4444',
                            color: '#FFFFFF',
                            fontFamily: 'Poppins, sans-serif',
                            borderRadius: '8px',
                            fontSize: '14px'
                        },
                    });
                }
            }
        } catch (error) {
            console.error('Error en registro:', error);
            setErrors({ general: 'Error de conexión. Intente nuevamente' });
            toast.error('Error de conexión. Verifica tu internet e intenta nuevamente', {
                duration: 4000,
                style: {
                    background: '#EF4444',
                    color: '#FFFFFF',
                    fontFamily: 'Poppins, sans-serif',
                    borderRadius: '8px',
                    fontSize: '14px'
                },
            });
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Limpia todos los errores del formulario
     */
    const clearErrors = () => {
        setErrors({});
    };

    /**
     * Resetea el formulario a su estado inicial
     */
    const resetForm = () => {
        setFormData({
            fullName: '',
            phone: '',
            email: '',
            birthDate: '',
            address: '',
            password: '',
            acceptTerms: false
        });
        setErrors({});
    };

    return {
        formData,
        errors,
        isLoading,
        handleInputChange,
        handleSubmit,
        clearErrors,
        resetForm,
        setFormData
    };
};

export default useRegisterForm;