/**
 * Componente Login - Página de inicio de sesión
 * 
 * Funcionalidades principales:
 * - Autenticación de usuarios con email y contraseña
 * - Validación de formularios en tiempo real
 * - Redirección automática según el tipo de usuario (admin/customer)
 * - Manejo de errores específicos del servidor
 * - Integración con Google (preparado para futuro)
 * - Links de navegación a registro y recuperación de contraseña
 * 
 * Estados manejados:
 * - Validación de campos de entrada
 * - Estados de carga durante el proceso de login
 * - Manejo de errores del servidor y validación
 * - Visibilidad de contraseña
 * 
 * Flujo de autenticación:
 * 1. Usuario ingresa credenciales
 * 2. Validación del lado del cliente
 * 3. Envío de datos al servidor
 * 4. Procesamiento de respuesta y token
 * 5. Redirección según tipo de usuario
 */

import React, { useState } from "react";
import PageContainer from "../components/PageContainer";
import Form from "../components/Form";
import Title from "../components/Title";
import Input from "../components/Input";
import emailIcon from "../assets/emailIcon.png";
import lockIcon from "../assets/lockIcon.png";
import Button from "../components/Button";
import QuestionText from "../components/QuestionText";
import Separator from "../components/Separator";
import GoogleButton from "../components/GoogleButton";
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    // Estado para controlar la visibilidad de la contraseña
    const [showPassword, setShowPassword] = useState(false);
    
    // Hooks principales para autenticación y navegación
    const { login } = useAuth(); // Hook del contexto de autenticación
    const navigate = useNavigate(); // Hook para navegación programática

    // Configuración del formulario con react-hook-form
    const {
        register, // Función para registrar inputs
        handleSubmit, // Función para manejar el envío del formulario
        formState: { errors, isSubmitting }, // Estados del formulario
        setError, // Función para establecer errores manualmente
        clearErrors // Función para limpiar errores
    } = useForm({
        mode: 'onChange', // Validar en tiempo real al cambiar
        defaultValues: {
            email: '',
            password: '',
            rememberMe: false
        }
    });

    /**
     * Reglas de validación para los campos del formulario
     * Utiliza patrones regex y validaciones de longitud
     */
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
                value: 8,
                message: 'La contraseña debe tener al menos 8 caracteres'
            }
        }
    };

    /**
     * Función principal para manejar el envío del formulario de login
     * 
     * Proceso:
     * 1. Limpia errores previos
     * 2. Llama al servicio de login del contexto
     * 3. Procesa la respuesta del servidor
     * 4. Redirige según el tipo de usuario
     * 5. Maneja errores específicos
     * 
     * @param {Object} data - Datos del formulario (email, password)
     */
    const onSubmit = async (data) => {
        try {
            clearErrors(); // Limpiar errores previos
            console.log('=== INICIANDO LOGIN ===');

            // Llamada al servicio de login
            const result = await login(data.email, data.password);
            console.log('Resultado del login:', result);

            if (result.success) {
                console.log('✅ Login exitoso! Redirigiendo inmediatamente...');
                
                // Obtener tipo de usuario para redirección
                const userType = result.user?.userType || result.userType;
                console.log('UserType para redirección:', userType);
                
                // Redirección inmediata y forzada según tipo de usuario
                if (userType === 'admin') {
                    console.log('Redirigiendo a dashboard...');
                    window.location.replace('/dashboard'); // Admin -> Dashboard
                } else {
                    console.log('Redirigiendo a home...');
                    window.location.replace('/home'); // Cliente -> Home
                }
                
            } else {
                console.log('❌ Login falló:', result.message);
                
                // Manejo de errores específicos del servidor
                const errorMessage = result.message || 'Error en la autenticación';
                
                if (errorMessage === 'user not found') {
                    // Error específico para usuario no encontrado
                    setError('email', {
                        type: 'server',
                        message: 'Usuario no encontrado'
                    });
                } else if (errorMessage === 'Invalid password') {
                    // Error específico para contraseña incorrecta
                    setError('password', {
                        type: 'server',
                        message: 'Contraseña incorrecta'
                    });
                } else {
                    // Error genérico del servidor
                    setError('root.serverError', {
                        type: 'server',
                        message: errorMessage
                    });
                }
            }

        } catch (error) {
            // Manejo de errores inesperados
            console.error('💥 Error durante el login:', error);
            setError('root.serverError', {
                type: 'server',
                message: 'Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.'
            });
        }
    };

    /**
     * Maneja la navegación al formulario de registro
     * @param {Event} e - Evento del click
     */
    const handleRegisterClick = (e) => {
        e.preventDefault();
        navigate('/register');
    };

    /**
     * Maneja la navegación al formulario de recuperación de contraseña
     * @param {Event} e - Evento del click
     */
    const handleRecuperarContrasenaClick = (e) => {
        e.preventDefault();
        navigate('/recover-password');
    };

    return (
        <PageContainer>
            <Form onSubmit={handleSubmit(onSubmit)}>
                {/* Mensaje de error global del servidor */}
                {errors.root?.serverError && (
                    <div className="auth-error-message">
                        <span>{errors.root.serverError.message}</span>
                    </div>
                )}

                {/* Título principal del formulario */}
                <Title>Inicia sesión</Title>

                {/* Campo de email con validación */}
                <Input
                    name="email" 
                    type="email"
                    placeholder="Correo electrónico"
                    icon={emailIcon}
                    register={register}
                    validationRules={validationRules.email}
                    error={errors.email?.message}
                    disabled={isSubmitting}
                />

                {/* Campo de contraseña con toggle de visibilidad */}
                <Input
                    name="password" 
                    type="password"
                    placeholder="Contraseña"
                    icon={lockIcon}
                    showPassword={showPassword}
                    onTogglePassword={() => setShowPassword(!showPassword)}
                    register={register}
                    validationRules={validationRules.password}
                    error={errors.password?.message}
                    disabled={isSubmitting}
                />

                {/* Link para recuperar contraseña */}
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

                {/* Botón principal de login con estado de carga */}
                <Button
                    text={isSubmitting ? "Iniciando sesión..." : "Iniciar Sesión"}
                    variant="primary"
                    type="submit"
                    disabled={isSubmitting}
                />

                {/* Link para ir al registro */}
                <QuestionText
                    question="¿No tienes una cuenta aún?"
                    linkText="Regístrate"
                    onLinkClick={handleRegisterClick} 
                />

                {/* Separador visual */}
                <Separator text="o" />

                {/* Botón de Google (preparado para implementación futura) */}
                <GoogleButton />
            </Form>
        </PageContainer>
    );
};

export default Login;