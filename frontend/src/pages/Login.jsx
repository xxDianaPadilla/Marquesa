import React, { useEffect, memo } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Clock, Shield, AlertTriangle } from 'lucide-react';

// Componentes optimizados
import PageContainer from "../components/PageContainer";
import Form from "../components/Form";
import Title from "../components/Title";
import Button from "../components/Button";
import QuestionText from "../components/QuestionText";
import Separator from "../components/Separator";
import GoogleButton from "../components/GoogleButton";

// Hook personalizado optimizado con límite de intentos
import useLoginForm from "../components/Clients/Hooks/useLoginForm";

// Iconos
import emailIcon from "../assets/emailIcon.png";
import lockIcon from "../assets/lockIcon.png";

/**
 * Página de inicio de sesión con sistema de límite de intentos
 * MEJORADA: Incluye sistema completo de rate limiting y bloqueo temporal
 * CARACTERÍSTICAS NUEVAS:
 * - Contador de intentos restantes
 * - Bloqueo temporal con countdown en tiempo real
 * - Advertencias visuales sobre intentos
 * - Indicador de progreso hacia el bloqueo
 * - Mensajes contextuales según el estado
 */
const Login = memo(() => {
    // ============ HOOKS Y ESTADO ============
    
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, user, authError, clearAuthError, isLoggingIn } = useAuth();

    // Hook personalizado que maneja toda la lógica del formulario con límite de intentos
    const {
        formData,
        errors,
        isLoading,
        showPassword,
        isFormValid,
        attemptWarning,
        isAccountLocked,
        lockoutMessage,
        lockoutProgress,
        handleInputChange,
        handleSubmit,
        togglePasswordVisibility,
        clearErrors,
        clearForm,
        rateLimitConfig
    } = useLoginForm();

    // ============ EFECTOS ============
    
    /**
     * Redirección automática si ya está autenticado
     * Ahora redirige correctamente según el tipo de usuario
     */
    useEffect(() => {
        // Solo redirigir si está completamente autenticado y NO en proceso de login
        if (isAuthenticated && user && user.userType && !isLoggingIn) {
            console.log('Usuario ya autenticado, redirigiendo...', {
                userType: user.userType,
                isLoggingIn
            });
            
            let redirectPath;
            
            if (user.userType === 'admin') {
                redirectPath = '/dashboard';
                console.log('Redirigiendo admin al dashboard');
            } else if (user.userType === 'Customer') {
                redirectPath = '/';
                console.log('Redirigiendo cliente al HOME');
            } else {
                redirectPath = '/';
                console.log('Tipo desconocido, redirigiendo al home');
            }
            
            // Usar timeout para evitar race conditions
            setTimeout(() => {
                console.log('Ejecutando redirección a:', redirectPath);
                navigate(redirectPath, { replace: true });
            }, 100);
        }
    }, [isAuthenticated, user, navigate, isLoggingIn]);

    /**
     * Limpiar errores del AuthContext cuando el usuario interactúa
     * Mejora la UX al no mostrar errores obsoletos
     */
    useEffect(() => {
        if (authError && (formData.email || formData.password)) {
            console.log('Limpiando errores del AuthContext por interacción del usuario');
            clearAuthError();
        }
    }, [formData.email, formData.password, authError, clearAuthError]);

    /**
     * Limpiar formulario cuando se monta el componente
     * Asegura que no queden datos de sesiones anteriores
     */
    useEffect(() => {
        console.log('Inicializando página de login');
        clearForm();
        clearErrors();
        
        return () => {
            console.log('Limpiando componente de login');
        };
    }, [clearForm, clearErrors]);

    // ============ MANEJADORES DE EVENTOS ============
    
    /**
     * Maneja la navegación al registro
     * Limpia el formulario antes de navegar
     */
    const handleRegisterClick = (e) => {
        e.preventDefault();
        if (!isLoading && !isLoggingIn && !isAccountLocked) {
            console.log('Navegando a registro');
            clearForm();
            navigate('/register');
        }
    };

    /**
     * Maneja la navegación a recuperación de contraseña
     * Conserva el email si ya fue ingresado
     */
    const handleRecoverPasswordClick = (e) => {
        e.preventDefault();
        if (!isLoading && !isLoggingIn && !isAccountLocked) {
            console.log('Navegando a recuperación de contraseña');
            
            // Pasar el email si está disponible
            const state = formData.email ? { email: formData.email } : undefined;
            navigate('/recover-password', { state });
        }
    };

    // ============ COMPONENTES DE UI PARA LÍMITE DE INTENTOS ============
    
    /**
     * NUEVO: Componente para mostrar información de bloqueo de cuenta
     */
    const LockoutAlert = () => {
        if (!lockoutMessage) return null;

        return (
            <div className="bg-red-50 border border-red-300 rounded-lg p-4 mb-4 animate-slideDown">
                <div className="flex items-start">
                    <Shield className="w-6 h-6 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                        <h3 className="text-red-800 font-semibold text-sm mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Cuenta Temporalmente Bloqueada
                        </h3>
                        <p className="text-red-700 text-sm mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Tu cuenta ha sido bloqueada debido a múltiples intentos fallidos de inicio de sesión.
                        </p>
                        <div className="flex items-center bg-red-100 rounded-md p-2">
                            <Clock className="w-4 h-4 text-red-600 mr-2" />
                            <span className="text-red-800 text-sm font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Tiempo restante: {lockoutMessage.formattedTime}
                            </span>
                        </div>
                        <p className="text-red-600 text-xs mt-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Por tu seguridad, espera antes de intentar nuevamente.
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    /**
     * NUEVO: Componente para mostrar advertencias sobre intentos restantes
     */
    const AttemptWarning = () => {
        if (!attemptWarning || isAccountLocked) return null;

        return (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 animate-slideDown">
                <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                        <p className="text-amber-800 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {attemptWarning}
                        </p>
                        {lockoutProgress && (
                            <div className="mt-2">
                                <div className="flex justify-between text-xs text-amber-700 mb-1">
                                    <span>Intentos fallidos: {lockoutProgress.attempted}/{lockoutProgress.maxAttempts}</span>
                                    <span>{lockoutProgress.remaining} restantes</span>
                                </div>
                                <div className="w-full bg-amber-200 rounded-full h-2">
                                    <div 
                                        className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${lockoutProgress.percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    /**
     * NUEVO: Componente de información sobre el sistema de seguridad
     */
    const SecurityInfo = () => {
        if (isAccountLocked || attemptWarning) return null;

        return (
            <div className="bg-pink-50 border border-pink-200 rounded-lg p-3 mb-4">
                <div className="flex items-start">
                    <Shield className="w-4 h-4 text-pink-500 mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-pink-700 text-xs" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Por tu seguridad, tu cuenta se bloqueará temporalmente después de {rateLimitConfig.maxAttempts} intentos fallidos.
                    </p>
                </div>
            </div>
        );
    };

    // ============ RENDERIZADO DE ERRORES ============
    
    /**
     * Renderiza el mensaje de error principal
     * MEJORADO: Prioriza errores de bloqueo sobre otros errores
     */
    const renderErrorMessage = () => {
        // No mostrar errores generales si hay bloqueo (se muestra en LockoutAlert)
        if (isAccountLocked) return null;
        
        const errorMessage = errors.general || authError;
        
        if (!errorMessage) return null;

        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 animate-slideDown">
                <div className="flex items-start">
                    <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-red-700 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {errorMessage}
                    </span>
                </div>
            </div>
        );
    };

    // ============ LOGGING ADICIONAL PARA DEBUG ============
    
    // Debug del estado actual
    useEffect(() => {
        console.log('Estado actual Login:', {
            isAuthenticated,
            userType: user?.userType,
            isLoggingIn,
            isLoading,
            isAccountLocked,
            hasAttemptWarning: !!attemptWarning,
            currentPath: location.pathname
        });
    }, [isAuthenticated, user, isLoggingIn, isLoading, isAccountLocked, attemptWarning, location.pathname]);

    // ============ RENDERIZADO DEL COMPONENTE ============
    
    return (
        <PageContainer>
            <Form onSubmit={handleSubmit}>
                
                {/* Alerta de bloqueo de cuenta (prioridad máxima) */}
                <LockoutAlert />

                {/* Información de seguridad (solo si no hay bloqueo ni advertencias) */}
                <SecurityInfo />

                {/* Advertencia sobre intentos restantes */}
                <AttemptWarning />

                {/* Mensaje de error principal */}
                {renderErrorMessage()}

                <br />

                {/* Título principal */}
                <Title>Inicia sesión</Title>

                {/* Campo de correo electrónico */}
                <div className="relative mb-4">
                    <div className={`flex items-center bg-white bg-opacity-50 border-2 rounded-lg px-4 py-3 transition-all duration-200 ${
                        errors.email 
                            ? 'border-red-400 bg-red-50 shadow-red-100 shadow-md' 
                            : isAccountLocked
                            ? 'border-gray-300 bg-gray-100'
                            : 'border-[#FDB4B7] focus-within:border-pink-500 focus-within:shadow-pink-200 focus-within:shadow-md'
                    }`}>
                        <img
                            src={emailIcon}
                            alt="Email"
                            className={`w-5 h-5 mr-3 transition-opacity duration-200 ${
                                isAccountLocked ? 'opacity-40' : 'opacity-60'
                            }`}
                        />
                        <input
                            name="email"
                            type="email"
                            placeholder="Correo electrónico"
                            value={formData.email}
                            onChange={handleInputChange}
                            disabled={isLoading || isLoggingIn || isAccountLocked}
                            autoComplete="email"
                            className={`flex-1 bg-transparent outline-none text-sm transition-colors duration-200 ${
                                errors.email 
                                    ? 'placeholder-red-400 text-red-700' 
                                    : isAccountLocked
                                    ? 'placeholder-gray-400 text-gray-500'
                                    : 'placeholder-gray-400 text-gray-700'
                            } ${isAccountLocked ? 'cursor-not-allowed' : ''}`}
                            style={{
                                fontWeight: '500',
                                fontFamily: 'Poppins, sans-serif',
                                fontStyle: 'italic'
                            }}
                        />
                        {isAccountLocked && (
                            <Shield className="w-4 h-4 text-gray-400 ml-2" />
                        )}
                    </div>
                    {errors.email && (
                        <div className="text-red-500 text-sm mt-2 italic flex items-start">
                            <svg className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{errors.email}</span>
                        </div>
                    )}
                </div>

                {/* Campo de contraseña */}
                <div className="relative mb-4">
                    <div className={`flex items-center bg-white bg-opacity-50 border-2 rounded-lg px-4 py-3 transition-all duration-200 ${
                        errors.password 
                            ? 'border-red-400 bg-red-50 shadow-red-100 shadow-md' 
                            : isAccountLocked
                            ? 'border-gray-300 bg-gray-100'
                            : 'border-[#FDB4B7] focus-within:border-pink-500 focus-within:shadow-pink-200 focus-within:shadow-md'
                    }`}>
                        <img
                            src={lockIcon}
                            alt="Password"
                            className={`w-5 h-5 mr-3 transition-opacity duration-200 ${
                                isAccountLocked ? 'opacity-40' : 'opacity-60'
                            }`}
                        />
                        <input
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Contraseña"
                            value={formData.password}
                            onChange={handleInputChange}
                            disabled={isLoading || isLoggingIn || isAccountLocked}
                            autoComplete="current-password"
                            className={`flex-1 bg-transparent outline-none text-sm transition-colors duration-200 ${
                                errors.password 
                                    ? 'placeholder-red-400 text-red-700' 
                                    : isAccountLocked
                                    ? 'placeholder-gray-400 text-gray-500'
                                    : 'placeholder-gray-400 text-gray-700'
                            } ${isAccountLocked ? 'cursor-not-allowed' : ''}`}
                            style={{
                                fontWeight: '500',
                                fontFamily: 'Poppins, sans-serif',
                                fontStyle: 'italic'
                            }}
                        />
                        <button
                            type="button"
                            style={{cursor: 'pointer'}}
                            onClick={togglePasswordVisibility}
                            disabled={isLoading || isLoggingIn || isAccountLocked}
                            className={`ml-3 transition-colors duration-200 ${
                                isAccountLocked 
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : errors.password 
                                    ? 'text-red-500 hover:text-red-600' 
                                    : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            {showPassword ? (
                                <EyeOff className="w-5 h-5" />
                            ) : (
                                <Eye className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                    {errors.password && (
                        <div className="text-red-500 text-sm mt-2 italic flex items-start">
                            <svg className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{errors.password}</span>
                        </div>
                    )}
                </div>

                {/* Enlace para recuperar contraseña */}
                <div className="text-left mb-4">
                    <button 
                        type="button" 
                        className={`text-sm transition-colors focus:outline-none focus:underline ${
                            isAccountLocked 
                                ? 'text-gray-400 cursor-not-allowed' 
                                : 'hover:text-pink-600 text-[#FF6A5F]'
                        }`}
                        style={{ 
                            fontWeight: '600', 
                            fontFamily: 'Poppins, sans-serif', 
                            fontStyle: 'italic',
                            cursor: 'pointer'
                        }} 
                        onClick={handleRecoverPasswordClick}
                        disabled={isLoading || isLoggingIn || isAccountLocked}
                    >
                        ¿Olvidaste tu contraseña?
                    </button>
                </div>

                {/* Botón de inicio de sesión */}
                <Button
                    text={
                        isAccountLocked 
                            ? "Cuenta Bloqueada" 
                            : (isLoading || isLoggingIn) 
                            ? "Iniciando sesión..." 
                            : "Iniciar Sesión"
                    }
                    variant={isAccountLocked ? "disabled" : "primary"}
                    type="submit"
                    disabled={isLoading || isLoggingIn || !isFormValid || isAccountLocked}
                />

                {/* Indicador de carga o bloqueo */}
                {(isLoading || isLoggingIn) && !isAccountLocked && (
                    <div className="text-center mt-2">
                        <div className="inline-flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-500 mr-2"></div>
                            <p className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Verificando credenciales...
                            </p>
                        </div>
                    </div>
                )}

                {/* Información adicional durante el bloqueo */}
                {isAccountLocked && (
                    <div className="text-center mt-2">
                        <div className="inline-flex items-center text-red-600">
                            <Shield className="w-4 h-4 mr-2" />
                            <p className="text-xs" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Formulario deshabilitado por seguridad
                            </p>
                        </div>
                    </div>
                )}

                {/* Pregunta para registro */}
                <QuestionText
                    question="¿No tienes una cuenta aún?"
                    linkText="Regístrate"
                    onLinkClick={handleRegisterClick}
                    disabled={isAccountLocked}
                />

                {/* Separador */}
                <Separator text="o" />

                {/* Botón de Google */}
                <GoogleButton disabled={isLoading || isLoggingIn || isAccountLocked} />

                {/* Términos y condiciones */}
                <div className="text-center mt-4">
                    <p className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Al iniciar sesión, aceptas nuestros{" "}
                        <button
                            type="button"
                            style={{cursor: 'pointer'}}
                            className={`underline focus:outline-none focus:ring-2 focus:ring-pink-300 rounded ${
                                isAccountLocked 
                                    ? 'text-gray-400 cursor-not-allowed' 
                                    : 'text-pink-500 hover:text-pink-600'
                            }`}
                            onClick={() => !isAccountLocked && navigate('/termsandConditions')}
                            disabled={isLoading || isLoggingIn || isAccountLocked}
                        >
                            Términos y Condiciones
                        </button>
                        {" "}y{" "}
                        <button
                            type="button"
                            style={{cursor: 'pointer'}}
                            className={`underline focus:outline-none focus:ring-2 focus:ring-pink-300 rounded ${
                                isAccountLocked 
                                    ? 'text-gray-400 cursor-not-allowed' 
                                    : 'text-pink-500 hover:text-pink-600'
                            }`}
                            onClick={() => !isAccountLocked && navigate('/privacyPolicies')}
                            disabled={isLoading || isLoggingIn || isAccountLocked}
                        >
                            Política de Privacidad
                        </button>
                    </p>
                </div>

                {/* NUEVA: Información sobre el sistema de seguridad (pie de página) */}
                {!isAccountLocked && (
                    <div className="text-center mt-6 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-center text-gray-400 mb-2">
                            <Shield className="w-3 h-3 mr-1" />
                            <span className="text-xs" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Sistema de Seguridad Activo
                            </span>
                        </div>
                        <p className="text-xs text-gray-400" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Tu cuenta se protege automáticamente contra intentos de acceso no autorizados
                        </p>
                    </div>
                )}

            </Form>
        </PageContainer>
    );
});

export default Login;