import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const useLoginForm = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth(); 

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Limpiar error específico cuando el usuario empiece a escribir
        if(errors[name]){
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Validar email
        if(!formData.email.trim()){
            newErrors.email = 'El correo electrónico es requerido';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)){
            newErrors.email = 'El correo electrónico no es válido';
        }

        // Validar contraseña
        if(!formData.password.trim()){
            newErrors.password = 'La contraseña es requerida';
        } else if(formData.password.length < 6){ 
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if(!validateForm()){
            return;
        }

        setIsLoading(true);
        setErrors({}); // Limpiar errores previos

        try {
            const result = await login(formData.email, formData.password);

            if(result.success){
                // El AuthContext maneja la redirección
                console.log('Login exitoso');
            } else {
                // Mapear errores específicos del backend
                let errorMessage = 'Error en el inicio de sesión';
                
                if(result.message === 'user not found'){
                    setErrors({ email: 'Usuario no encontrado' });
                } else if (result.message === 'Invalid password'){
                    setErrors({ password: 'Contraseña incorrecta' });
                } else {
                    setErrors({ general: result.message || errorMessage });
                }
            }
        } catch (error) {
            console.error('Error en login: ', error);
            setErrors({ general: 'Error de conexión. Intente nuevamente' });
        } finally {
            setIsLoading(false);
        }
    };

    const clearErrors = () => {
        setErrors({});
    };

    return {
        formData,
        errors,
        isLoading,
        handleInputChange,
        handleSubmit,
        clearErrors,
        setFormData
    };
};

export default useLoginForm;    