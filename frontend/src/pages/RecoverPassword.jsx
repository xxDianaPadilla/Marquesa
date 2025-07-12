import React from "react";
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

const RecoverPassword = () => {
    const navigate = useNavigate();
    // NUEVO - Hook para manejar recuperación de contraseña
    const { requestPasswordReset, isLoading } = usePasswordReset();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
        clearErrors
    } = useForm({
        mode: 'onChange',
        defaultValues: {
            email: ''
        }
    });

    const validationRules = {
        email: {
            required: 'El correo electrónico es requerido',
            pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'El correo electrónico no es válido'
            }
        }
    };

    // NUEVA FUNCIÓN - Manejar envío con validación en backend
    const onSubmit = async (data) => {
        try {
            clearErrors();
            
            // Solicitar código de recuperación usando el hook
            const result = await requestPasswordReset(data.email);
            
            if (result.success) {
                // Si es exitoso, navegar a verificación con el email
                navigate('/verification-code', { 
                    state: { 
                        email: data.email 
                    } 
                });
            } else {
                // Si hay error, mostrar en el formulario
                if (result.message === 'Usuario no existe') {
                    setError('email', {
                        type: 'server',
                        message: 'No se encontró una cuenta con este correo electrónico'
                    });
                } else {
                    setError('root.serverError', {
                        type: 'server',
                        message: result.message
                    });
                }
            }
        } catch (error) {
            console.error('Error durante la recuperación:', error);
            setError('root.serverError', {
                type: 'server',
                message: 'Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.'
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
                {/* Error general del servidor */}
                {errors.root?.serverError && (
                    <div className="auth-error-message">
                        <span>{errors.root.serverError.message}</span>
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
                />

                <Button
                    text={(isSubmitting || isLoading) ? "Enviando..." : "Enviar correo"}
                    variant="primary"
                    type="submit"
                    disabled={isSubmitting || isLoading}
                />

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