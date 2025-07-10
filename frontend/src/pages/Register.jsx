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

// Iconos
import userIcon from "../assets/user.png";
import phoneIcon from "../assets/phone.png";
import emailIcon from "../assets/emailIcon.png";
import calendarIcon from "../assets/calendar.png";
import locationIcon from "../assets/location.png";
import lockIcon from "../assets/lockIcon.png";

/**
 * Página de registro de usuarios
 * Ahora incluye modal de verificación de email
 */
const Register = () => {
    // Estado para mostrar/ocultar contraseña
    const [showPassword, setShowPassword] = useState(false);
    
    // Navegación y autenticación
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();

    // Hook personalizado para el formulario de registro (ACTUALIZADO)
    const {
        formData,
        errors,
        isLoading,
        showEmailVerificationModal,
        handleInputChange,
        handleSubmit,
        handleEmailVerificationSuccess,
        closeEmailVerificationModal,
        clearErrors
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
                {/* Error general del servidor */}
                {errors.general && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-red-700 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                {errors.general}
                            </span>
                        </div>
                    </div>
                )}

                <Title>Regístrate</Title>

                {/* Campo de nombre completo */}
                <RegisterInput
                    name="fullName"
                    type="text"
                    placeholder="Nombre completo"
                    icon={userIcon}
                    value={formData.fullName}
                    onChange={handleInputChange}
                    error={errors.fullName}
                    disabled={isLoading}
                />

                {/* Campo de teléfono */}
                <RegisterInput
                    name="phone"
                    type="tel"
                    placeholder="Teléfono"
                    icon={phoneIcon}
                    value={formData.phone}
                    onChange={handleInputChange}
                    error={errors.phone}
                    disabled={isLoading}
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
                />

                {/* Campo de contraseña */}
                <RegisterInput
                    name="password"
                    type="password"
                    placeholder="Contraseña"
                    icon={lockIcon}
                    showPassword={showPassword}
                    onTogglePassword={() => setShowPassword(!showPassword)}
                    value={formData.password}
                    onChange={handleInputChange}
                    error={errors.password}
                    disabled={isLoading}
                />

                {/* Checkbox de términos y condiciones */}
                <TermsCheckbox
                    checked={formData.acceptTerms}
                    onChange={handleInputChange}
                    error={errors.acceptTerms}
                    disabled={isLoading}
                />

                <br />

                {/* Botón de registro */}
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

            {/* NUEVO - Modal de verificación de email */}
            <EmailVerificationModal
                isOpen={showEmailVerificationModal}
                onClose={closeEmailVerificationModal}
                email={formData.email}
                fullName={formData.fullName}
                userData={{
                    fullName: formData.fullName,
                    phone: formData.phone,
                    birthDate: formData.birthDate,
                    address: formData.address,
                    password: formData.password,
                    favorites: [],
                    discount: null
                }}
                onSuccess={handleEmailVerificationSuccess}
            />
        </PageContainer>
    );
};

export default Register;