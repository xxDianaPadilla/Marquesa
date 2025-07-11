import React, { useState, useEffect } from "react";
import PageContainer from "../components/PageContainer"; // Componente contenedor de la página
import Form from "../components/Form"; // Componente de formulario
import Title from "../components/Title"; // Componente para el título
import Input from "../components/Input"; // Componente para los inputs del formulario
import emailIcon from "../assets/emailIcon.png"; // Icono para el campo de correo
import lockIcon from "../assets/lockIcon.png"; // Icono para el campo de contraseña
import Button from "../components/Button"; // Componente de botón
import QuestionText from "../components/QuestionText"; // Componente para mostrar texto y enlace
import Separator from "../components/Separator"; // Componente separador
import GoogleButton from "../components/GoogleButton"; // Componente para el botón de Google
import { useForm } from 'react-hook-form'; // Hook para manejo de formularios
import { useAuth } from '../context/AuthContext'; // Hook personalizado para autenticación
import { useNavigate } from 'react-router-dom'; // Hook para la navegación entre páginas

const Login = () => {
    // Estado para mostrar u ocultar la contraseña
    const [showPassword, setShowPassword] = useState(false);
    
    // Desestructuración del hook useAuth para acceder a la autenticación
    const { isAuthenticated, user, login } = useAuth();
    
    // Hook para la navegación entre páginas
    const navigate = useNavigate();

    // Hook useForm para manejar la validación y el envío del formulario
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
        clearErrors
    } = useForm({
        mode: 'onChange',
        defaultValues: {
            email: '',
            password: '',
            rememberMe: false
        }
    });

    // useEffect que redirige al usuario dependiendo del tipo (admin o usuario normal)
    useEffect(() => {
        if (isAuthenticated && user) {
            if (user.userType === 'admin') {
                navigate('/dashboard'); // Si es admin, redirige al dashboard
            } else {
                navigate('/home'); // Si no es admin, redirige a la página principal
            }
        }
    }, [isAuthenticated, user, navigate]);

    // Reglas de validación para los campos del formulario
    const validationRules = {
        email: {
            required: 'El correo electrónico es requerido',
            pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'El correo electrónico no es válido'
            }
        },
        password: {
            required: 'La contraseña es requerida',
            minLength: {
                value: 6,
                message: 'La contraseña debe tener al menos 6 caracteres'
            }
        }
    };

    // Función para manejar el envío del formulario
    const onSubmit = async (data) => {
        try {
            clearErrors(); // Limpiar errores previos

            // Intenta hacer login con las credenciales
            const result = await login(data.email, data.password);

            if (!result.success) {
                const errorMessage = result.message || 'Error en la autenticación';

                // Si el error es relacionado con el correo
                if (errorMessage.toLowerCase().includes('email') ||
                    errorMessage.toLowerCase().includes('correo') ||
                    errorMessage.toLowerCase().includes('user not found')) {
                    setError('email', {
                        type: 'server',
                        message: 'Usuario no encontrado'
                    });
                } 
                // Si el error es relacionado con la contraseña
                else if (errorMessage.toLowerCase().includes('password') ||
                    errorMessage.toLowerCase().includes('contraseña') ||
                    errorMessage.toLowerCase().includes('invalid password')) {
                    setError('password', {
                        type: 'server',
                        message: 'Contraseña incorrecta'
                    });
                } 
                // Para cualquier otro error
                else {
                    setError('root.serverError', {
                        type: 'server',
                        message: errorMessage
                    });
                }
            }

        } catch (error) {
            console.error('Error durante el login:', error);
            setError('root.serverError', {
                type: 'server',
                message: 'Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.'
            });
        }
    };

    // Función para manejar el clic en el enlace de registro
    const handleRegisterClick = (e) => {
        e.preventDefault();
        navigate('/register'); // Redirige a la página de registro
    };

    // Función para manejar el clic en el enlace de recuperación de contraseña
    const handleRecuperarContrasenaClick = (e) => {
        e.preventDefault();
        navigate('/recover-password'); // Redirige a la página de recuperación de contraseña
    };

    return (
        <PageContainer>
            {/* Formulario de inicio de sesión */}
            <Form onSubmit={handleSubmit(onSubmit)}>
                {/* Muestra el error general del servidor si existe */}
                {errors.root?.serverError && (
                    <div className="auth-error-message">
                        <span>{errors.root.serverError.message}</span>
                    </div>
                )}

                {/* Título de la página */}
                <Title>Inicia Sesión</Title>

                {/* Input para el correo electrónico */}
                <Input
                    name="email" 
                    type="email"
                    placeholder="Correo"
                    icon={emailIcon}
                    register={register}
                    validationRules={validationRules.email}
                    error={errors.email?.message}
                    disabled={isSubmitting} // Deshabilita el campo mientras se envía el formulario
                />

                {/* Input para la contraseña */}
                <Input
                    name="password" 
                    type="password"
                    placeholder="Contraseña"
                    icon={lockIcon}
                    showPassword={showPassword}
                    onTogglePassword={() => setShowPassword(!showPassword)} // Muestra u oculta la contraseña
                    register={register}
                    validationRules={validationRules.password}
                    error={errors.password?.message}
                    disabled={isSubmitting} // Deshabilita el campo mientras se envía el formulario
                />

                {/* Enlace para recuperar la contraseña */}
                <div className="text-left mb-4">
                    <button 
                        type="button" 
                        className="text-sm hover:text-pink-600 transition-colors" 
                        style={{ 
                            color: '#FF6A5F', 
                            fontWeight: '600', 
                            fontFamily: 'Poppins, sans-serif', 
                            fontStyle: 'italic', 
                            cursor: 'pointer'
                        }} 
                        onClick={handleRecuperarContrasenaClick}
                    >
                        ¿Olvidaste tu contraseña?
                    </button>
                </div>

                {/* Botón de inicio de sesión */}
                <Button
                    text={isSubmitting ? "Iniciando sesión..." : "Iniciar Sesión"}
                    variant="primary"
                    type="submit"
                    disabled={isSubmitting} // Deshabilita el botón mientras se envía el formulario
                />

                {/* Enlace a la página de registro */}
                <QuestionText
                    question="¿No tienes una cuenta aún?"
                    linkText="Regístrate"
                    onLinkClick={handleRegisterClick} 
                />

                {/* Separador */}
                <Separator text="o" />

                {/* Botón de Google */}
                <GoogleButton />
            </Form>
        </PageContainer>
    );
};

export default Login;
