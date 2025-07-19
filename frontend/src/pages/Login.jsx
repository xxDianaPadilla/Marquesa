import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
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

/**
 * Validaciones básicas
 */
const validateEmail = (email) => {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    return emailRegex.test(email.trim());
};

const validatePassword = (password) => {
    if (!password || typeof password !== 'string') return false;
    return password.length >= 8; // Reducido a 8 caracteres para que sea menos restrictivo
};

const sanitizeInput = (input) => {
    if (!input || typeof input !== 'string') return '';
    return input.trim();
};

/**
 * Mapeo de errores más simple
 */
const ERROR_MESSAGES = {
    'user not found': 'No se encontró una cuenta con este correo electrónico',
    'usuario no encontrado': 'No se encontró una cuenta con este correo electrónico',
    'invalid password': 'La contraseña ingresada es incorrecta',
    'contraseña inválida': 'La contraseña ingresada es incorrecta',
    'invalid credentials': 'Correo electrónico o contraseña incorrectos',
    'credenciales inválidas': 'Correo electrónico o contraseña incorrectos',
    'network error': 'Error de conexión. Verifica tu internet.',
    'server error': 'Error del servidor. Inténtalo más tarde.',
    'timeout': 'La conexión tardó demasiado. Inténtalo nuevamente.'
};

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState(null); // Error visible para el usuario
    
    const { login, isAuthenticated, user, authError, clearAuthError } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
        clearErrors,
        watch
    } = useForm({
        mode: 'onChange',
        defaultValues: {
            email: '',
            password: ''
        }
    });

    const emailValue = watch('email');
    const passwordValue = watch('password');

    /**
     * Reglas de validación simplificadas
     */
    const validationRules = {
        email: {
            required: 'El correo electrónico es obligatorio',
            validate: {
                format: (value) => {
                    if (!value) return true;
                    return validateEmail(value) || 'El formato del correo electrónico no es válido';
                }
            }
        },
        password: {
            required: 'La contraseña es obligatoria',
            validate: {
                minLength: (value) => {
                    if (!value) return true;
                    return validatePassword(value) || 'La contraseña debe tener al menos 8 caracteres';
                }
            }
        }
    };

    /**
     * Redirección automática si ya está autenticado
     */
    useEffect(() => {
        if (isAuthenticated && user) {
            const redirectPath = location.state?.from || (user.userType === 'admin' ? '/dashboard' : '/home');
            navigate(redirectPath, { replace: true });
        }
    }, [isAuthenticated, user, navigate, location.state]);

    /**
     * Limpiar errores cuando cambian los valores
     */
    useEffect(() => {
        if (emailValue || passwordValue) {
            clearErrors(['root.serverError']);
            setFormError(null);
            if (authError) {
                clearAuthError();
            }
        }
    }, [emailValue, passwordValue, clearErrors, authError, clearAuthError]);

    /**
     * Mostrar error del AuthContext
     */
    useEffect(() => {
        if (authError) {
            setFormError(authError);
        }
    }, [authError]);

    /**
     * Obtener mensaje de error amigable
     */
    const getFriendlyErrorMessage = (serverMessage) => {
        if (!serverMessage) return 'Ha ocurrido un error inesperado';
        
        const lowerMessage = serverMessage.toLowerCase();
        
        for (const [key, friendlyMessage] of Object.entries(ERROR_MESSAGES)) {
            if (lowerMessage.includes(key.toLowerCase())) {
                return friendlyMessage;
            }
        }
        
        return serverMessage;
    };

    /**
     * Función de envío del formulario
     */
    const onSubmit = async (data) => {
        try {
            setIsSubmitting(true);
            setFormError(null);
            clearErrors();
            
            if (authError) {
                clearAuthError();
            }
            
            console.log('=== INICIANDO LOGIN ===');

            const sanitizedEmail = sanitizeInput(data.email);
            const sanitizedPassword = data.password;

            // Validación básica
            if (!validateEmail(sanitizedEmail)) {
                const errorMsg = 'El formato del correo electrónico no es válido';
                setFormError(errorMsg);
                setError('email', { type: 'validation', message: errorMsg });
                return;
            }

            if (!validatePassword(sanitizedPassword)) {
                const errorMsg = 'La contraseña debe tener al menos 8 caracteres';
                setFormError(errorMsg);
                setError('password', { type: 'validation', message: errorMsg });
                return;
            }

            // Llamada al login
            const result = await login(sanitizedEmail, sanitizedPassword);
            console.log('Resultado del login:', result);

            if (result.success) {
                console.log('✅ Login exitoso! Redirigiendo...');
                
                const userType = result.user?.userType || result.userType;
                console.log('UserType para redirección:', userType);
                
                const redirectPath = location.state?.from || (userType === 'admin' ? '/dashboard' : '/home');
                navigate(redirectPath, { replace: true });
                
            } else {
                console.log('❌ Login falló:', result.message);
                
                const errorMessage = getFriendlyErrorMessage(result.message);
                setFormError(errorMessage);
                
                // Mostrar error en campo específico si es posible
                const lowerMessage = (result.message || '').toLowerCase();
                
                if (lowerMessage.includes('usuario no encontrado') || 
                    lowerMessage.includes('user not found')) {
                    setError('email', { type: 'server', message: errorMessage });
                } else if (lowerMessage.includes('contraseña') || 
                          lowerMessage.includes('password')) {
                    setError('password', { type: 'server', message: errorMessage });
                } else {
                    setError('root.serverError', { type: 'server', message: errorMessage });
                }
            }

        } catch (error) {
            console.error('💥 Error durante el login:', error);
            
            const errorMessage = 'Ha ocurrido un error inesperado. Inténtalo nuevamente.';
            setFormError(errorMessage);
            setError('root.serverError', { type: 'network', message: errorMessage });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRegisterClick = (e) => {
        e.preventDefault();
        if (!isSubmitting) {
            navigate('/register');
        }
    };

    const handleRecuperarContrasenaClick = (e) => {
        e.preventDefault();
        if (!isSubmitting) {
            navigate('/recover-password');
        }
    };

    return (
        <PageContainer>
            <Form onSubmit={handleSubmit(onSubmit)}>
                {/* Error principal visible */}
                {(formError || errors.root?.serverError) && (
                    <div className="auth-error-message">
                        <div className="flex items-start">
                            <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{formError || errors.root?.serverError?.message}</span>
                        </div>
                    </div>
                )}

                {/* Error del AuthContext separado */}
                {authError && !formError && !errors.root?.serverError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-red-700 text-sm">{authError}</span>
                        </div>
                    </div>
                )}

                <Title>Inicia sesión</Title>

                <Input
                    name="email" 
                    type="email"
                    placeholder="Correo electrónico"
                    icon={emailIcon}
                    register={register}
                    validationRules={validationRules.email}
                    error={errors.email?.message}
                    disabled={isSubmitting}
                    autoComplete="email"
                />

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
                    autoComplete="current-password"
                />

                <div className="text-left mb-4">
                    <button 
                        type="button" 
                        className="text-sm hover:text-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                        style={{ 
                            color: '#FF6A5F', 
                            fontWeight: '600', 
                            fontFamily: 'Poppins, sans-serif', 
                            fontStyle: 'italic', 
                            cursor: isSubmitting ? 'not-allowed' : 'pointer'
                        }} 
                        onClick={handleRecuperarContrasenaClick}
                        disabled={isSubmitting}
                    >
                        ¿Olvidaste tu contraseña?
                    </button>
                </div>

                <Button
                    text={isSubmitting ? "Iniciando sesión..." : "Iniciar Sesión"}
                    variant="primary"
                    type="submit"
                    disabled={isSubmitting}
                />

                {isSubmitting && (
                    <div className="text-center mt-2">
                        <p className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Verificando credenciales...
                        </p>
                    </div>
                )}

                <QuestionText
                    question="¿No tienes una cuenta aún?"
                    linkText="Regístrate"
                    onLinkClick={handleRegisterClick} 
                    disabled={isSubmitting}
                />

                <Separator text="o" />

                <GoogleButton disabled={isSubmitting} />

                <div className="text-center mt-4">
                    <p className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Al iniciar sesión, aceptas nuestros{" "}
                        <button
                            type="button"
                            className="text-pink-500 hover:text-pink-600 underline disabled:opacity-50"
                            onClick={() => navigate('/terms-and-conditions')}
                            disabled={isSubmitting}
                        >
                            Términos y Condiciones
                        </button>
                        {" "}y{" "}
                        <button
                            type="button"
                            className="text-pink-500 hover:text-pink-600 underline disabled:opacity-50"
                            onClick={() => navigate('/privacy-policies')}
                            disabled={isSubmitting}
                        >
                            Política de Privacidad
                        </button>
                    </p>
                </div>
            </Form>
        </PageContainer>
    );
};

export default Login;