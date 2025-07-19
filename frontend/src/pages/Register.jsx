import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Componentes generales
import PageContainer from "../components/PageContainer";
import Form from "../components/Form";
import Title from "../components/Title";
import Button from "../components/Button";
import QuestionText from "../components/QuestionText";
import Separator from "../components/Separator";
import GoogleButton from "../components/GoogleButton";
import BackButton from "../components/BackButton";

// Componentes específicos del registro
import RegisterInput from "../components/Register/RegisterInput";
import TermsCheckbox from "../components/Register/TermsCheckbox";

// NUEVO - Componente de verificación de email
import EmailVerificationModal from "../components/EmailVerification/EmailVerificationModal";

// Hook personalizado
import useRegisterForm from "../components/Clients/Hooks/useRegisterForm";

// NUEVO - Importar estilos de requisitos de contraseña
import '../styles/PasswordRequirements.css';

// Iconos
import userIcon from "../assets/user.png";
import phoneIcon from "../assets/phone.png";
import emailIcon from "../assets/emailIcon.png";
import calendarIcon from "../assets/calendar.png";
import locationIcon from "../assets/location.png";
import lockIcon from "../assets/lockIcon.png";

/**
 * VALIDACIONES - Ahora bloquean el envío cuando son inválidas
 */
const validateEmail = (email) => {
    if (!email) return { isValid: false, error: 'El correo electrónico es requerido' };
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(email.trim())) {
        return { isValid: false, error: 'El formato del correo electrónico no es válido' };
    }
    return { isValid: true, error: null };
};

const validateSalvadoranPhone = (phone) => {
    if (!phone) return { isValid: false, error: 'El teléfono es requerido' };
    // Formato esperado: 7XXX-XXXX
    const phoneRegex = /^7\d{3}-\d{4}$/;
    if (!phoneRegex.test(phone.trim())) {
        return { isValid: false, error: 'Formato: 7XXX-XXXX (ej: 7123-4567)' };
    }
    return { isValid: true, error: null };
};

const validateFullName = (name) => {
    if (!name) return { isValid: false, error: 'El nombre completo es requerido' };
    const trimmedName = name.trim();
    if (trimmedName.length < 3) {
        return { isValid: false, error: 'El nombre debe tener al menos 3 caracteres' };
    }
    if (!trimmedName.includes(' ')) {
        return { isValid: false, error: 'Ingresa tu nombre completo (nombre y apellido)' };
    }
    return { isValid: true, error: null };
};

const validatePassword = (password) => {
    if (!password) return { isValid: false, error: 'La contraseña es requerida' };
    if (password.length < 8) {
        return { isValid: false, error: 'La contraseña debe tener al menos 8 caracteres' };
    }
    return { isValid: true, error: null };
};

const validateBirthDate = (dateString) => {
    if (!dateString) return { isValid: false, error: 'La fecha de nacimiento es requerida' };
    const date = new Date(dateString);
    const today = new Date();
    const age = today.getFullYear() - date.getFullYear();
    if (age < 13) {
        return { isValid: false, error: 'Debes ser mayor de 13 años' };
    }
    if (age > 120) {
        return { isValid: false, error: 'Fecha de nacimiento inválida' };
    }
    return { isValid: true, error: null };
};

const validateAddress = (address) => {
    if (!address) return { isValid: false, error: 'La dirección es requerida' };
    if (address.trim().length < 10) {
        return { isValid: false, error: 'La dirección debe tener al menos 10 caracteres' };
    }
    return { isValid: true, error: null };
};

/**
 * Página de registro de usuarios
 * ACTUALIZADA: Ahora bloquea el envío si hay errores de validación
 */
const Register = () => {
    // Estado para mostrar/ocultar contraseña
    const [showPassword, setShowPassword] = useState(false);
    const [validationErrors, setValidationErrors] = useState({}); // NUEVO - Errores de validación
    const [formError, setFormError] = useState(null); // NUEVO - Error principal
    
    // Navegación y autenticación
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();

    // Hook personalizado para el formulario de registro - FUNCIONALIDAD ORIGINAL INTACTA
    const {
        formData,
        errors,
        isLoading,
        showEmailVerificationModal,
        handleInputChange,
        handleSubmit: originalHandleSubmit,
        handleEmailVerificationSuccess,
        closeEmailVerificationModal,
        clearErrors,
        getUserDataForRegistration
    } = useRegisterForm();

    /**
     * Redirigir si ya está autenticado
     */
    useEffect(() => {
        if (isAuthenticated && user) {
            if (user.userType === 'admin') {
                navigate('/dashboard');
            } else {
                navigate('/home');
            }
        }
    }, [isAuthenticated, user, navigate]);

    /**
     * NUEVA FUNCIÓN - Validar todos los campos antes del envío
     */
    const validateAllFields = () => {
        const errors = {};
        
        // Validar cada campo
        const nameValidation = validateFullName(formData.fullName);
        if (!nameValidation.isValid) errors.fullName = nameValidation.error;
        
        const phoneValidation = validateSalvadoranPhone(formData.phone);
        if (!phoneValidation.isValid) errors.phone = phoneValidation.error;
        
        const emailValidation = validateEmail(formData.email);
        if (!emailValidation.isValid) errors.email = emailValidation.error;
        
        const birthDateValidation = validateBirthDate(formData.birthDate);
        if (!birthDateValidation.isValid) errors.birthDate = birthDateValidation.error;
        
        const addressValidation = validateAddress(formData.address);
        if (!addressValidation.isValid) errors.address = addressValidation.error;
        
        const passwordValidation = validatePassword(formData.password);
        if (!passwordValidation.isValid) errors.password = passwordValidation.error;
        
        if (!formData.acceptTerms) {
            errors.acceptTerms = 'Debes aceptar los términos y condiciones';
        }
        
        return errors;
    };

    /**
     * NUEVA FUNCIÓN - Manejar envío con validación previa
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Limpiar errores previos
        setFormError(null);
        setValidationErrors({});
        
        // Validar todos los campos
        const errors = validateAllFields();
        
        // Si hay errores, no enviar el formulario
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            setFormError('Por favor corrige los errores en el formulario antes de continuar');
            
            // Scroll al primer error
            const firstErrorField = Object.keys(errors)[0];
            const element = document.querySelector(`[name="${firstErrorField}"]`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            
            return; // BLOQUEAR EL ENVÍO
        }
        
        // Si no hay errores, proceder con el envío original
        try {
            await originalHandleSubmit(e);
        } catch (error) {
            console.error('Error en el registro:', error);
            setFormError('Error al crear la cuenta. Inténtalo nuevamente.');
        }
    };

    /**
     * NUEVA FUNCIÓN - Solo para mostrar errores en tiempo real (no bloquea escritura)
     */
    const getDisplayErrors = () => {
        const displayErrors = {};
        
        // Solo mostrar errores si hay contenido en los campos
        if (formData.fullName && !validateFullName(formData.fullName).isValid) {
            displayErrors.fullName = validateFullName(formData.fullName).error;
        }
        
        if (formData.phone && !validateSalvadoranPhone(formData.phone).isValid) {
            displayErrors.phone = validateSalvadoranPhone(formData.phone).error;
        }
        
        if (formData.email && !validateEmail(formData.email).isValid) {
            displayErrors.email = validateEmail(formData.email).error;
        }
        
        if (formData.birthDate && !validateBirthDate(formData.birthDate).isValid) {
            displayErrors.birthDate = validateBirthDate(formData.birthDate).error;
        }
        
        if (formData.address && !validateAddress(formData.address).isValid) {
            displayErrors.address = validateAddress(formData.address).error;
        }
        
        if (formData.password && !validatePassword(formData.password).isValid) {
            displayErrors.password = validatePassword(formData.password).error;
        }
        
        return displayErrors;
    };

    const displayErrors = getDisplayErrors();

    /**
     * Función auxiliar para validar si la contraseña cumple requisitos básicos
     * Se usa para mostrar feedback visual en tiempo real
     */
    const isPasswordStrong = (password) => {
        if (!password) return false;
        
        const hasMinLength = password.length >= 8;
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        
        return hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
    };

    /**
     * NUEVA FUNCIÓN - Verificar si el formulario está listo para envío
     */
    const isFormValid = () => {
        const errors = validateAllFields();
        return Object.keys(errors).length === 0;
    };

    /**
     * Maneja la navegación al login
     */
    const handleLoginClick = (e) => {
        e.preventDefault();
        navigate('/login');
    };

    /**
     * Maneja el click en Google (placeholder)
     */
    const handleGoogleRegister = () => {
        console.log('Registro con Google - Por implementar');
        // TODO: Implementar registro con Google
    };

    return (
        <PageContainer>
            {/* Botón de regresar */}
            <BackButton onClick={handleLoginClick} />
            
            <Form onSubmit={handleSubmit}>
                {/* NUEVO - Error principal del formulario */}
                {(formError || errors.general) && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-red-700 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                {formError || errors.general}
                            </span>
                        </div>
                    </div>
                )}

                <Title>Regístrate</Title>

                {/* Campo de nombre completo - FUNCIONALIDAD ORIGINAL */}
                <RegisterInput
                    name="fullName"
                    type="text"
                    placeholder="Nombre completo"
                    icon={userIcon}
                    value={formData.fullName}
                    onChange={handleInputChange}
                    error={validationErrors.fullName || displayErrors.fullName || errors.fullName}
                    disabled={isLoading}
                />

                {/* Campo de teléfono - FUNCIONALIDAD ORIGINAL */}
                <RegisterInput
                    name="phone"
                    type="tel"
                    placeholder="Teléfono (ej: 7123-4567)"
                    icon={phoneIcon}
                    value={formData.phone}
                    onChange={handleInputChange}
                    error={validationErrors.phone || displayErrors.phone || errors.phone}
                    disabled={isLoading}
                />

                {/* Campo de email - FUNCIONALIDAD ORIGINAL */}
                <RegisterInput
                    name="email"
                    type="email"
                    placeholder="Correo electrónico"
                    icon={emailIcon}
                    value={formData.email}
                    onChange={handleInputChange}
                    error={validationErrors.email || displayErrors.email || errors.email}
                    disabled={isLoading}
                />

                {/* Campo de fecha de nacimiento - FUNCIONALIDAD ORIGINAL */}
                <RegisterInput
                    name="birthDate"
                    type="date"
                    placeholder="Fecha de nacimiento"
                    icon={calendarIcon}
                    value={formData.birthDate}
                    onChange={handleInputChange}
                    error={validationErrors.birthDate || displayErrors.birthDate || errors.birthDate}
                    disabled={isLoading}
                />

                {/* Campo de dirección - FUNCIONALIDAD ORIGINAL */}
                <RegisterInput
                    name="address"
                    type="text"
                    placeholder="Dirección completa"
                    icon={locationIcon}
                    value={formData.address}
                    onChange={handleInputChange}
                    error={validationErrors.address || displayErrors.address || errors.address}
                    disabled={isLoading}
                />

                {/* Campo de contraseña - ACTUALIZADO con validación visual */}
                <div className="relative">
                    <RegisterInput
                        name="password"
                        type="password"
                        placeholder="Contraseña"
                        icon={lockIcon}
                        showPassword={showPassword}
                        onTogglePassword={() => setShowPassword(!showPassword)}
                        value={formData.password}
                        onChange={handleInputChange}
                        error={validationErrors.password || displayErrors.password || errors.password}
                        disabled={isLoading}
                    />
                    
                    {/* Indicador visual de fortaleza de contraseña */}
                    {formData.password && (
                        <div className="absolute right-2 top-3 z-10">
                            <div className={`w-3 h-3 rounded-full ${
                                isPasswordStrong(formData.password) 
                                    ? 'bg-green-500 shadow-lg shadow-green-200' 
                                    : 'bg-orange-400 shadow-lg shadow-orange-200'
                            } transition-all duration-300`}>
                                {isPasswordStrong(formData.password) && (
                                    <div className="w-full h-full rounded-full bg-green-500 animate-pulse" />
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Checkbox de términos y condiciones - FUNCIONALIDAD ORIGINAL */}
                <TermsCheckbox
                    checked={formData.acceptTerms}
                    onChange={handleInputChange}
                    error={validationErrors.acceptTerms || errors.acceptTerms}
                    disabled={isLoading}
                />

                <br />

                {/* NUEVO - Mostrar estado del formulario */}
                {!isFormValid() && Object.keys(displayErrors).length > 0 && (
                    <div className="text-center mb-4">
                        <p className="text-xs text-orange-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Complete todos los campos correctamente para continuar
                        </p>
                    </div>
                )}

                {/* Botón de registro - ACTUALIZADO con validación */}
                <Button
                    text={isLoading ? "Verificando..." : "Crear cuenta"}
                    variant="primary"
                    type="submit"
                    disabled={isLoading || !formData.acceptTerms}
                />

                {/* Link para ir al login */}
                <QuestionText
                    question="¿Ya tienes una cuenta?"
                    linkText="Inicia sesión"
                    onLinkClick={handleLoginClick}
                />

                <Separator text="o" />

                {/* Botón de Google */}
                <GoogleButton onClick={handleGoogleRegister} />
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
};

export default Register;