import React, { useState, useEffect } from "react";
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import PageContainer from "../components/PageContainer";
import BackButton from "../components/BackButton";
import Form from "../components/Form";
import Title from "../components/Title";
import InfoText from "../components/InfoText";
import Input from "../components/Input";
import Button from "../components/Button";
import QuestionText from "../components/QuestionText";
// NUEVA IMPORTACIÓN - Hook para recuperación de contraseña
import { usePasswordReset } from "../components/PasswordReset/Hooks/usePasswordReset";

const VerificationCode = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isResending, setIsResending] = useState(false);
    const [resendTimer, setResendTimer] = useState(60); // NUEVO - Iniciar con 60 segundos

    // NUEVO - Hook para manejar verificación
    const { verifyCode, requestPasswordReset, isLoading } = usePasswordReset();

    // Obtener el email de la navegación anterior si está disponible
    const email = location.state?.email || "tu correo";

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
        clearErrors,
        setValue
    } = useForm({
        mode: 'onChange',
        defaultValues: {
            verificationCode: ''
        }
    });

    // Timer para reenvío de código
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    // NUEVO - Verificar que tenemos el email al cargar
    useEffect(() => {
        if (!email || email === "tu correo") {
            navigate('/recover-password', {
                state: {
                    message: 'Por favor, inicia el proceso de recuperación de contraseña.'
                }
            });
        }
    }, [email, navigate]);

    const validationRules = {
        verificationCode: {
            required: 'El código de verificación es requerido',
            pattern: {
                value: /^[0-9]{6}$/,
                message: 'El código debe tener exactamente 6 dígitos'
            }
        }
    };

    // NUEVA FUNCIÓN - Manejar verificación con backend
    const onSubmit = async (data) => {
        try {
            clearErrors();
            
            // Verificar código usando el hook
            const result = await verifyCode(email, data.verificationCode);
            
            if (result.success) {
                // Si es exitoso, navegar a actualizar contraseña
                navigate('/update-password', { 
                    state: { 
                        email: email,
                        verificationCode: data.verificationCode 
                    } 
                });
            } else {
                // Si hay error, mostrar en el formulario
                setError('verificationCode', {
                    type: 'server',
                    message: result.message
                });
            }
        } catch (error) {
            console.error('Error durante la verificación:', error);
            setError('root.serverError', {
                type: 'server',
                message: 'Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.'
            });
        }
    };

    // NUEVA FUNCIÓN - Manejar reenvío de código
    const handleResendCode = async () => {
        if (resendTimer > 0) return;
        
        try {
            setIsResending(true);
            
            // Reenviar código usando el hook
            const result = await requestPasswordReset(email);
            
            if (result.success) {
                setResendTimer(60); // Reiniciar timer a 60 segundos
            }
            
        } catch (error) {
            console.error('Error al reenviar código:', error);
            setError('root.serverError', {
                type: 'server',
                message: 'No se pudo reenviar el código. Inténtalo de nuevo.'
            });
        } finally {
            setIsResending(false);
        }
    };

    const handleLoginClick = (e) => {
        e.preventDefault();
        navigate('/login');
    };

    // Función para limpiar el input y permitir solo números
    const handleCodeChange = (e) => {
        const value = e.target.value.replace(/\D/g, ''); 
        setValue('verificationCode', value);
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

                <Title>Verificar código</Title>

                <InfoText>
                    Te hemos enviado un código de verificación a{" "}
                    <span className="font-semibold text-pink-600">{email}</span>.
                    Escribe correctamente el código para poder actualizar tu contraseña.
                </InfoText>

                <Input
                    name="verificationCode"
                    type="text"
                    placeholder="Código de verificación"
                    register={register}
                    validationRules={validationRules.verificationCode}
                    error={errors.verificationCode?.message}
                    disabled={isSubmitting || isLoading}
                    maxLength={6}
                    onChange={handleCodeChange}
                    style={{ 
                        textAlign: 'center', 
                        fontSize: '18px', 
                        letterSpacing: '2px',
                        fontWeight: 'bold'
                    }}
                />

                <Button
                    text={(isSubmitting || isLoading) ? "Verificando..." : "Verificar código"}
                    variant="primary"
                    type="submit"
                    disabled={isSubmitting || isLoading}
                />

                <button 
                    type="button"
                    onClick={handleResendCode}
                    disabled={resendTimer > 0 || isResending || isLoading}
                    className="w-full mt-4 py-3 px-4 text-sm font-medium bg-transparent border border-pink-300 rounded-lg hover:bg-pink-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed" 
                    style={{
                        fontFamily: 'Poppins, sans-serif', 
                        color: '#CD5277'
                    }}
                >
                    {isResending || isLoading
                        ? "Reenviando..." 
                        : resendTimer > 0 
                            ? `Reenviar código en ${resendTimer}s`
                            : "¿No has recibido el código aún? Reenviar"
                    }
                </button>

                <QuestionText
                    question="¿Recuerdas tu contraseña?"
                    linkText="Inicia sesión"
                    onLinkClick={handleLoginClick}
                />
            </Form>
        </PageContainer>
    );
};

export default VerificationCode;