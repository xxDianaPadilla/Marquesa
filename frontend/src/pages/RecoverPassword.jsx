import React, { useState } from "react";
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import PageContainer from "../components/PageContainer";
import BackButton from "../components/BackButton";
import Form from "../components/Form";
import Title from "../components/Title";
import InfoText from "../components/InfoText";
import Input from "../components/Input";
import Button from "../components/Button";
import QuestionText from "../components/QuestionText";
import emailIcon from "../assets/emailIcon.png";
// NUEVA IMPORTACIÓN - Hook para recuperación de contraseña
import { usePasswordReset } from "../components/PasswordReset/Hooks/usePasswordReset";

/**
 * NUEVAS VALIDACIONES
 */
const validateEmail = (email) => {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    return emailRegex.test(email.trim());
};

const sanitizeInput = (input) => {
    if (!input || typeof input !== 'string') return '';
    return input.trim().slice(0, 254);
};

const RecoverPassword = () => {
    const navigate = useNavigate();
    const [formError, setFormError] = useState(null); // NUEVO - Error visible
    
    // NUEVO - Hook para manejar recuperación de contraseña
    const { requestPasswordReset, isLoading } = usePasswordReset();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
        clearErrors,
        watch
    } = useForm({
        mode: 'onChange',
        defaultValues: {
            email: ''
        }
    });

    const emailValue = watch('email');

    // NUEVO - Limpiar errores cuando el usuario escribe
    React.useEffect(() => {
        if (emailValue) {
            setFormError(null);
            clearErrors(['root.serverError']);
        }
    }, [emailValue, clearErrors]);

    const validationRules = {
        email: {
            required: 'El correo electrónico es requerido',
            validate: {
                format: (value) => {
                    if (!value) return true;
                    const sanitized = sanitizeInput(value);
                    return validateEmail(sanitized) || 'El correo electrónico no es válido';
                }
            }
        }
    };

    // NUEVA FUNCIÓN - Manejar envío con validación en backend
    const onSubmit = async (data) => {
        try {
            clearErrors();
            setFormError(null);
            
            // NUEVA - Validación del lado del cliente
            const sanitizedEmail = sanitizeInput(data.email);
            
            if (!validateEmail(sanitizedEmail)) {
                const errorMsg = 'El formato del correo electrónico no es válido';
                setFormError(errorMsg);
                setError('email', { type: 'validation', message: errorMsg });
                return;
            }
            
            // Solicitar código de recuperación usando el hook
            const result = await requestPasswordReset(sanitizedEmail);
            
            if (result.success) {
                // Si es exitoso, navegar a verificación con el email
                navigate('/verification-code', { 
                    state: { 
                        email: sanitizedEmail 
                    } 
                });
            } else {
                // Si hay error, mostrar en el formulario
                let errorMessage = result.message || 'Error al enviar el código de recuperación';
                
                // NUEVO - Mapeo de errores a español
                if (result.message === 'Usuario no existe' || result.message === 'user not found') {
                    errorMessage = 'No se encontró una cuenta con este correo electrónico';
                    setError('email', {
                        type: 'server',
                        message: errorMessage
                    });
                } else {
                    setError('root.serverError', {
                        type: 'server',
                        message: errorMessage
                    });
                }
                
                setFormError(errorMessage);
            }
        } catch (error) {
            console.error('Error durante la recuperación:', error);
            const errorMessage = 'Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.';
            setFormError(errorMessage);
            setError('root.serverError', {
                type: 'server',
                message: errorMessage
            });
        }
    };

    const handleLoginClick = (e) => {
        e.preventDefault();
        navigate('/login');
    };

    return (
        <PageContainer>
            <BackButton onClick={handleLoginClick}/>

            <Form onSubmit={handleSubmit(onSubmit)}>
                {/* NUEVO - Error visible del formulario */}
                {(formError || errors.root?.serverError) && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-red-700 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                {formError || errors.root?.serverError?.message}
                            </span>
                        </div>
                    </div>
                )}

                <Title>Recuperar contraseña</Title>

                <InfoText>
                    Introduce tu correo electrónico y te enviaremos
                    un código de verificación para restablecer tu
                    contraseña
                </InfoText>

                <Input
                    name="email"
                    type="email"
                    placeholder="Correo electrónico"
                    icon={emailIcon}
                    register={register}
                    validationRules={validationRules.email}
                    error={errors.email?.message}
                    disabled={isSubmitting || isLoading}
                    autoComplete="email"
                    maxLength={254}
                />

                <Button
                    text={(isSubmitting || isLoading) ? "Enviando..." : "Enviar correo"}
                    variant="primary"
                    type="submit"
                    disabled={isSubmitting || isLoading}
                />

                {/* NUEVO - Indicador de progreso */}
                {(isSubmitting || isLoading) && (
                    <div className="text-center mt-2">
                        <p className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Enviando código de recuperación...
                        </p>
                    </div>
                )}

                <QuestionText
                    question="¿Recuerdas tu contraseña?"
                    linkText="Inicia sesión"
                    onLinkClick={handleLoginClick}
                />
            </Form>
        </PageContainer>
    );
};

export default RecoverPassword;