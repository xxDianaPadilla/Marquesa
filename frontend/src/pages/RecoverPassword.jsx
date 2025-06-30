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

const RecoverPassword = () => {
    const navigate = useNavigate();

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

    const onSubmit = async (data) => {
        try {
            clearErrors();
            console.log('Solicitud de recuperación para:', data.email);
            alert(`Se ha enviado un correo de recuperación a: ${data.email}`);
            
        } catch (error) {
            console.error('Error durante la recuperación:', error);
            
            // Manejar diferentes tipos de errores
            if (error.message?.toLowerCase().includes('not found') || 
                error.message?.toLowerCase().includes('no encontrado')) {
                setError('email', {
                    type: 'server',
                    message: 'No se encontró una cuenta con este correo electrónico'
                });
            } else {
                setError('root.serverError', {
                    type: 'server',
                    message: 'Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.'
                });
            }
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
                    placeholder="Correo"
                    icon={emailIcon}
                    register={register}
                    validationRules={validationRules.email}
                    error={errors.email?.message}
                    disabled={isSubmitting}
                />

                <Button
                    text={isSubmitting ? "Enviando..." : "Enviar correo"}
                    variant="primary"
                    type="submit"
                    disabled={isSubmitting}
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