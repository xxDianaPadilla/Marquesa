import React, { useEffect, memo } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Componentes generales optimizados
import PageContainer from "../components/PageContainer";
import Form from "../components/Form";
import Title from "../components/Title";
import Button from "../components/Button";
import QuestionText from "../components/QuestionText";
import Separator from "../components/Separator";
import GoogleButton from "../components/GoogleButton";
import BackButton from "../components/BackButton";

// Componentes específicos del registro optimizados
import RegisterInput from "../components/Register/RegisterInput";
import TermsCheckbox from "../components/Register/TermsCheckbox";

// Componente de verificación de email
import EmailVerificationModal from "../components/EmailVerification/EmailVerificationModal";

// Hook personalizado optimizado
import useRegisterForm from "../components/Clients/Hooks/useRegisterForm";

// Estilos para requisitos de contraseña
import '../styles/PasswordRequirements.css';

// Iconos
import userIcon from "../assets/user.png";
import phoneIcon from "../assets/phone.png";
import emailIcon from "../assets/emailIcon.png";
import calendarIcon from "../assets/calendar.png";
import locationIcon from "../assets/location.png";
import lockIcon from "../assets/lockIcon.png";

/**
 * Página de registro de usuarios completamente optimizada
 * CARACTERÍSTICAS PRINCIPALES:
 * - Validación en tiempo real con feedback visual inmediato
 * - Formateo automático de campos (teléfono, nombre, email)
 * - Validaciones específicas para datos salvadoreños
 * - Prevención de envíos duplicados con sistema robusto
 * - Integración completa con modal de verificación de email
 * - Indicadores visuales de progreso y seguridad de contraseña
 * - Manejo de errores específicos y mensajes amigables
 * - Optimización de rendimiento con memo y callbacks
 * - Accesibilidad mejorada con ARIA labels y roles
 */
const Register = memo(() => {
    // ============ HOOKS Y NAVEGACIÓN ============
    
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();

    // Hook personalizado que maneja toda la lógica compleja del formulario
    const {
        // Estados principales
        formData,
        errors,
        isLoading,
        showPassword,
        showEmailVerificationModal,
        
        // Estados computados
        isFormValid,
        isPasswordStrong,
        passwordStrength,
        
        // Manejadores principales
        handleInputChange,
        handleSubmit,
        togglePasswordVisibility,
        
        // Manejadores del modal
        handleEmailVerificationSuccess,
        closeEmailVerificationModal,
        
        // Funciones de utilidad
        clearErrors,
        resetForm,
        getUserDataForRegistration,
        getFormProgress
    } = useRegisterForm();

    // ============ EFECTOS ============
    
    /**
     * Redirección automática si ya está autenticado
     * Evita que usuarios autenticados accedan al registro
     */
    useEffect(() => {
        if (isAuthenticated && user) {
            console.log('👤 Usuario ya autenticado, redirigiendo desde registro...', user);
            
            const redirectPath = user.userType === 'admin' ? '/dashboard' : '/home';
            console.log('🔄 Redirigiendo a:', redirectPath);
            
            navigate(redirectPath, { replace: true });
        }
    }, [isAuthenticated, user, navigate]);

    /**
     * Limpiar formulario cuando se monta el componente
     * Asegura un estado limpio al entrar a la página
     */
    useEffect(() => {
        console.log('🔄 Inicializando página de registro');
        clearErrors();
        
        return () => {
            console.log('🧹 Limpiando componente de registro');
        };
    }, [clearErrors]);

    // ============ MANEJADORES DE EVENTOS ============
    
    /**
     * Maneja la navegación al login
     * Limpia el formulario antes de navegar para seguridad
     */
    const handleLoginClick = (e) => {
        e.preventDefault();
        if (!isLoading) {
            console.log('🔑 Navegando a login');
            resetForm();
            navigate('/login');
        }
    };

    /**
     * Maneja el registro con Google (placeholder)
     * TODO: Implementar integración real con Google OAuth
     */
    const handleGoogleRegister = () => {
        if (!isLoading) {
            console.log('🌐 Registro con Google - Por implementar');
            // TODO: Implementar registro con Google OAuth
            alert('Funcionalidad de Google en desarrollo');
        }
    };

    // ============ FUNCIONES DE RENDERIZADO ============
    
    /**
     * Renderiza el mensaje de error principal del formulario
     * Muestra errores generales o del servidor
     */
    const renderErrorMessage = () => {
        if (!errors.general) return null;

        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 animate-slideDown">
                <div className="flex items-start">
                    <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <p className="text-red-700 text-sm font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Error en el registro
                        </p>
                        <p className="text-red-600 text-sm mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {errors.general}
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    // ============ RENDERIZADO DEL COMPONENTE ============
    
    return (
        <PageContainer>
            {/* Botón de regresar al login */}
            <BackButton onClick={handleLoginClick} disabled={isLoading} />
            
            <Form onSubmit={handleSubmit}>
                
                {/* Mensaje de error principal */}
                {renderErrorMessage()}

                {/* Título principal */}
                <Title>Regístrate</Title>

                {/* Campo de nombre completo */}
                <RegisterInput
                    name="fullName"
                    type="text"
                    placeholder="Nombre completo (ej: Juan Pérez)"
                    icon={userIcon}
                    value={formData.fullName}
                    onChange={handleInputChange}
                    error={errors.fullName}
                    disabled={isLoading}
                    maxLength={50}
                    autoComplete="name"
                    required
                />

                {/* Campo de teléfono con formateo automático */}
                <RegisterInput
                    name="phone"
                    type="tel"
                    placeholder="Teléfono (ej: 7123-4567)"
                    icon={phoneIcon}
                    value={formData.phone}
                    onChange={handleInputChange}
                    error={errors.phone}
                    disabled={isLoading}
                    maxLength={9}
                    autoComplete="tel"
                    required
                />

                {/* Campo de email */}
                <RegisterInput
                    name="email"
                    type="email"
                    placeholder="Correo electrónico"
                    icon={emailIcon}
                    value={formData.email}
                    onChange={handleInputChange}
                    error={errors.email}
                    disabled={isLoading}
                    autoComplete="email"
                    required
                />

                {/* Campo de fecha de nacimiento */}
                <RegisterInput
                    name="birthDate"
                    type="date"
                    placeholder="Fecha de nacimiento"
                    icon={calendarIcon}
                    value={formData.birthDate}
                    onChange={handleInputChange}
                    error={errors.birthDate}
                    disabled={isLoading}
                    max={new Date(Date.now() - 13 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} // Mínimo 13 años
                    autoComplete="bday"
                    required
                />

                {/* Campo de dirección */}
                <RegisterInput
                    name="address"
                    type="text"
                    placeholder="Dirección completa"
                    icon={locationIcon}
                    value={formData.address}
                    onChange={handleInputChange}
                    error={errors.address}
                    disabled={isLoading}
                    maxLength={100}
                    autoComplete="street-address"
                    required
                />

                {/* Campo de contraseña con indicadores */}
                <div className="relative">

                    <RegisterInput
                        name="password"
                        type="password"
                        placeholder="Contraseña segura"
                        icon={lockIcon}
                        showPassword={showPassword}
                        onTogglePassword={togglePasswordVisibility}
                        value={formData.password}
                        onChange={handleInputChange}
                        error={errors.password}
                        disabled={isLoading}
                        autoComplete="new-password"
                        required
                    />
                    
                    {/* Indicador visual de contraseña segura */}
                    {formData.password && (
                        <div className="absolute right-3 top-8 z-10">
                            <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                isPasswordStrong 
                                    ? 'bg-green-500 shadow-lg shadow-green-200 animate-pulse' 
                                    : passwordStrength >= 3
                                        ? 'bg-yellow-500 shadow-lg shadow-yellow-200'
                                        : 'bg-red-500 shadow-lg shadow-red-200'
                            }`} title={isPasswordStrong ? 'Contraseña segura' : 'Contraseña débil'}>
                                {isPasswordStrong && (
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Checkbox de términos y condiciones */}
                <TermsCheckbox
                    checked={formData.acceptTerms}
                    onChange={handleInputChange}
                    error={errors.acceptTerms}
                    disabled={isLoading}
                />

                {/* Espaciado adicional */}
                <div className="mt-6" />

                {/* Indicador de estado del formulario */}
                {!isFormValid && Object.keys(errors).length === 0 && (
                    <div className="text-center mb-4">
                        <p className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Complete todos los campos para continuar
                        </p>
                    </div>
                )}

                {/* Botón de registro principal */}
                <Button
                    text={isLoading ? "Verificando..." : "Crear cuenta"}
                    variant="primary"
                    type="submit"
                    disabled={isLoading || !isFormValid}
                />

                {/* Indicador de carga detallado */}
                {isLoading && (
                    <div className="text-center mt-2">
                        <div className="inline-flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-500 mr-2"></div>
                            <p className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Verificando disponibilidad del correo...
                            </p>
                        </div>
                    </div>
                )}

                {/* Pregunta para ir al login */}
                <QuestionText
                    question="¿Ya tienes una cuenta?"
                    linkText="Inicia sesión"
                    onLinkClick={handleLoginClick}
                />

                {/* Separador */}
                <Separator text="o" />

                {/* Botón de Google */}
                <GoogleButton 
                    onClick={handleGoogleRegister} 
                    disabled={isLoading}
                    text="Registrarse con Google"
                />

                {/* Información adicional */}
                <div className="text-center mt-4">
                    <p className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Al registrarte, recibirás un código de verificación en tu correo electrónico
                    </p>
                </div>
            </Form>

            {/* Modal de verificación de email */}
            <EmailVerificationModal
                isOpen={showEmailVerificationModal}
                onClose={closeEmailVerificationModal}
                email={formData.email}
                fullName={formData.fullName}
                userData={getUserDataForRegistration()}
                onSuccess={handleEmailVerificationSuccess}
            />
        </PageContainer>
    );
});
export default Register;