import React, { useEffect, memo } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

// Componentes optimizados
import PageContainer from "../components/PageContainer";
import Form from "../components/Form";
import Title from "../components/Title";
import Button from "../components/Button";
import QuestionText from "../components/QuestionText";
import Separator from "../components/Separator";
import GoogleButton from "../components/GoogleButton";

// Hook personalizado optimizado
import useLoginForm from "../components/Clients/Hooks/useLoginForm";

// Iconos
import emailIcon from "../assets/emailIcon.png";
import lockIcon from "../assets/lockIcon.png";

/**
 * Página de inicio de sesión completamente optimizada
 * CARACTERÍSTICAS PRINCIPALES:
 * - Validación en tiempo real con feedback visual
 * - Manejo robusto de errores con mensajes específicos
 * - Integración completa con AuthContext
 * - Redirección automática según tipo de usuario
 * - Prevención de múltiples envíos
 * - Accesibilidad mejorada
 * - Optimización de rendimiento con memo y useCallback
 */
const Login = memo(() => {
    // ============ HOOKS Y ESTADO ============
    
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, user, authError, clearAuthError } = useAuth();

    // Hook personalizado que maneja toda la lógica del formulario
    const {
        formData,
        errors,
        isLoading,
        showPassword,
        isFormValid,
        hasErrors,
        handleInputChange,
        handleSubmit,
        togglePasswordVisibility,
        clearErrors,
        clearForm
    } = useLoginForm();

    // ============ EFECTOS ============
    
    /**
     * Redirección automática si ya está autenticado
     * Se ejecuta cada vez que cambia el estado de autenticación
     */
    useEffect(() => {
        if (isAuthenticated && user) {
            console.log('👤 Usuario ya autenticado, redirigiendo...', user);
            
            // Determinar ruta de redirección
            const redirectPath = location.state?.from || 
                                (user.userType === 'admin' ? '/dashboard' : '/home');
            
            console.log('🔄 Redirigiendo a:', redirectPath);
            navigate(redirectPath, { replace: true });
        }
    }, [isAuthenticated, user, navigate, location.state]);

    /**
     * Limpiar errores del AuthContext cuando el usuario interactúa
     * Mejora la UX al no mostrar errores obsoletos
     */
    useEffect(() => {
        if (authError && (formData.email || formData.password)) {
            console.log('🧹 Limpiando errores del AuthContext por interacción del usuario');
            clearAuthError();
        }
    }, [formData.email, formData.password, authError, clearAuthError]);

    /**
     * Limpiar formulario cuando se monta el componente
     * Asegura que no queden datos de sesiones anteriores
     */
    useEffect(() => {
        console.log('🔄 Inicializando página de login');
        clearForm();
        clearErrors();
        
        return () => {
            console.log('🧹 Limpiando componente de login');
        };
    }, [clearForm, clearErrors]);

    // ============ MANEJADORES DE EVENTOS ============
    
    /**
     * Maneja la navegación al registro
     * Limpia el formulario antes de navegar
     */
    const handleRegisterClick = (e) => {
        e.preventDefault();
        if (!isLoading) {
            console.log('📝 Navegando a registro');
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
        if (!isLoading) {
            console.log('🔑 Navegando a recuperación de contraseña');
            
            // Pasar el email si está disponible
            const state = formData.email ? { email: formData.email } : undefined;
            navigate('/recover-password', { state });
        }
    };

    // ============ RENDERIZADO DE ERRORES ============
    
    /**
     * Renderiza el mensaje de error principal
     * Prioriza errores del formulario sobre errores del AuthContext
     */
    const renderErrorMessage = () => {
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

    // ============ RENDERIZADO DEL COMPONENTE ============
    
    return (
        <PageContainer>
            <Form onSubmit={handleSubmit}>
                
                {/* Mensaje de error principal */}
                {renderErrorMessage()}

                {/* Título principal */}
                <Title>Inicia sesión</Title>

                {/* Campo de correo electrónico */}
                <div className="relative mb-4">
                    <div className={`flex items-center bg-white bg-opacity-50 border-2 rounded-lg px-4 py-3 transition-all duration-200 ${
                        errors.email 
                            ? 'border-red-400 bg-red-50 shadow-red-100 shadow-md' 
                            : 'border-[#FDB4B7] focus-within:border-pink-500 focus-within:shadow-pink-200 focus-within:shadow-md'
                    }`}>
                        <img
                            src={emailIcon}
                            alt="Email"
                            className="w-5 h-5 mr-3 opacity-60"
                        />
                        <input
                            name="email"
                            type="email"
                            placeholder="Correo electrónico"
                            value={formData.email}
                            onChange={handleInputChange}
                            disabled={isLoading}
                            autoComplete="email"
                            className={`flex-1 bg-transparent outline-none text-sm transition-colors duration-200 ${
                                errors.email 
                                    ? 'placeholder-red-400 text-red-700' 
                                    : 'placeholder-gray-400 text-gray-700'
                            }`}
                            style={{
                                fontWeight: '500',
                                fontFamily: 'Poppins, sans-serif',
                                fontStyle: 'italic'
                            }}
                        />
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
                            : 'border-[#FDB4B7] focus-within:border-pink-500 focus-within:shadow-pink-200 focus-within:shadow-md'
                    }`}>
                        <img
                            src={lockIcon}
                            alt="Password"
                            className="w-5 h-5 mr-3 opacity-60"
                        />
                        <input
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Contraseña"
                            value={formData.password}
                            onChange={handleInputChange}
                            disabled={isLoading}
                            autoComplete="current-password"
                            className={`flex-1 bg-transparent outline-none text-sm transition-colors duration-200 ${
                                errors.password 
                                    ? 'placeholder-red-400 text-red-700' 
                                    : 'placeholder-gray-400 text-gray-700'
                            }`}
                            style={{
                                fontWeight: '500',
                                fontFamily: 'Poppins, sans-serif',
                                fontStyle: 'italic'
                            }}
                        />
                        <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            disabled={isLoading}
                            className={`ml-3 transition-colors duration-200 ${
                                errors.password 
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
                        className="text-sm hover:text-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:underline" 
                        style={{ 
                            color: '#FF6A5F', 
                            fontWeight: '600', 
                            fontFamily: 'Poppins, sans-serif', 
                            fontStyle: 'italic'
                        }} 
                        onClick={handleRecoverPasswordClick}
                        disabled={isLoading}
                    >
                        ¿Olvidaste tu contraseña?
                    </button>
                </div>

                {/* Botón de inicio de sesión */}
                <Button
                    text={isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                    variant="primary"
                    type="submit"
                    disabled={isLoading || !isFormValid}
                />

                {/* Indicador de carga */}
                {isLoading && (
                    <div className="text-center mt-2">
                        <div className="inline-flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-500 mr-2"></div>
                            <p className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Verificando credenciales...
                            </p>
                        </div>
                    </div>
                )}

                {/* Pregunta para registro */}
                <QuestionText
                    question="¿No tienes una cuenta aún?"
                    linkText="Regístrate"
                    onLinkClick={handleRegisterClick}
                />

                {/* Separador */}
                <Separator text="o" />

                {/* Botón de Google */}
                <GoogleButton disabled={isLoading} />

                {/* Términos y condiciones */}
                <div className="text-center mt-4">
                    <p className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Al iniciar sesión, aceptas nuestros{" "}
                        <button
                            type="button"
                            className="text-pink-500 hover:text-pink-600 underline disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-pink-300 rounded"
                            onClick={() => navigate('/terms-and-conditions')}
                            disabled={isLoading}
                        >
                            Términos y Condiciones
                        </button>
                        {" "}y{" "}
                        <button
                            type="button"
                            className="text-pink-500 hover:text-pink-600 underline disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-pink-300 rounded"
                            onClick={() => navigate('/privacy-policies')}
                            disabled={isLoading}
                        >
                            Política de Privacidad
                        </button>
                    </p>
                </div>

            </Form>
        </PageContainer>
    );
});


export default Login;