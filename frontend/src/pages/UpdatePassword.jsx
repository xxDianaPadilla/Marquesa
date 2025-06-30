import React, { useState } from "react";
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
import lockIcon from "../assets/lockIcon.png";

const UpdatePassword = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Obtener datos de la navegación anterior
    const email = location.state?.email;
    const verificationCode = location.state?.verificationCode;

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
        setError,
        clearErrors
    } = useForm({
        mode: 'onChange',
        defaultValues: {
            newPassword: '',
            confirmPassword: ''
        }
    });

    // Observar la nueva contraseña para validar la confirmación
    const newPassword = watch('newPassword');

    const validationRules = {
        newPassword: {
            required: 'La nueva contraseña es requerida',
            minLength: {
                value: 8,
                message: 'La contraseña debe tener al menos 8 caracteres'
            },
            pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/,
                message: 'La contraseña debe incluir al menos una letra minúscula, una mayúscula y un número'
            }
        },
        confirmPassword: {
            required: 'Confirma tu nueva contraseña',
            validate: (value) => {
                if (value !== newPassword) {
                    return 'Las contraseñas no coinciden';
                }
                return true;
            }
        }
    };

    const onSubmit = async (data) => {
        try {
            clearErrors();
            console.log('Actualizando contraseña para:', email);
            console.log('Código de verificación:', verificationCode);
            
            // Verificar que tenemos los datos necesarios
            if (!email || !verificationCode) {
                setError('root.serverError', {
                    type: 'server',
                    message: 'Sesión inválida. Por favor, inicia el proceso de recuperación nuevamente.'
                });
                return;
            }
            
            alert('¡Contraseña actualizada exitosamente!');
            
            // Navegar al login con mensaje de éxito
            navigate('/login', { 
                state: { 
                    message: 'Contraseña actualizada correctamente. Inicia sesión con tu nueva contraseña.' 
                } 
            });
            
        } catch (error) {
            console.error('Error al actualizar contraseña:', error);
            
            // Manejar diferentes tipos de errores
            if (error.message?.toLowerCase().includes('expired') || 
                error.message?.toLowerCase().includes('expirado')) {
                setError('root.serverError', {
                    type: 'server',
                    message: 'El código de verificación ha expirado. Inicia el proceso nuevamente.'
                });
            } else if (error.message?.toLowerCase().includes('invalid') || 
                       error.message?.toLowerCase().includes('inválido')) {
                setError('root.serverError', {
                    type: 'server',
                    message: 'Código de verificación inválido. Inicia el proceso nuevamente.'
                });
            } else if (error.message?.toLowerCase().includes('weak') || 
                       error.message?.toLowerCase().includes('débil')) {
                setError('newPassword', {
                    type: 'server',
                    message: 'La contraseña no cumple con los requisitos de seguridad'
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

    // Verificar que tenemos los datos necesarios al cargar el componente
    React.useEffect(() => {
        if (!email || !verificationCode) {
            // Si no tenemos los datos necesarios, redirigir al inicio del proceso
            navigate('/recover-password', {
                state: {
                    message: 'Por favor, inicia el proceso de recuperación de contraseña.'
                }
            });
        }
    }, [email, verificationCode, navigate]);

    // Función para evaluar la fortaleza de la contraseña
    const getPasswordStrength = (password) => {
        if (!password) return { strength: 0, text: '', color: '' };
        
        let strength = 0;
        const checks = {
            length: password.length >= 8,
            lowercase: /[a-z]/.test(password),
            uppercase: /[A-Z]/.test(password),
            number: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };
        
        strength = Object.values(checks).filter(Boolean).length;
        
        if (strength <= 2) return { strength, text: 'Débil', color: 'text-red-500' };
        if (strength <= 3) return { strength, text: 'Regular', color: 'text-yellow-500' };
        if (strength <= 4) return { strength, text: 'Buena', color: 'text-blue-500' };
        return { strength, text: 'Muy fuerte', color: 'text-green-500' };
    };

    const passwordStrength = getPasswordStrength(newPassword);

    return (
        <PageContainer>
            <BackButton />

            <Form onSubmit={handleSubmit(onSubmit)}>
                {/* Error general del servidor */}
                {errors.root?.serverError && (
                    <div className="auth-error-message">
                        <span>{errors.root.serverError.message}</span>
                    </div>
                )}

                <Title>Actualizar contraseña</Title>

                <InfoText>
                    Hemos verificado correctamente tu código. Ahora puedes 
                    actualizar la contraseña de tu cuenta de forma segura.
                </InfoText>

                <Input
                    name="newPassword"
                    type="password"
                    placeholder="Nueva contraseña"
                    icon={lockIcon}
                    showPassword={showPassword}
                    onTogglePassword={() => setShowPassword(!showPassword)}
                    register={register}
                    validationRules={validationRules.newPassword}
                    error={errors.newPassword?.message}
                    disabled={isSubmitting}
                />

                {/* Indicador de fortaleza de contraseña */}
                {newPassword && (
                    <div className="mb-2">
                        <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-gray-600">Fortaleza de contraseña:</span>
                            <span className={passwordStrength.color + " font-medium"}>
                                {passwordStrength.text}
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                                className={`h-2 rounded-full transition-all duration-300 ${
                                    passwordStrength.strength <= 2 ? 'bg-red-500' :
                                    passwordStrength.strength <= 3 ? 'bg-yellow-500' :
                                    passwordStrength.strength <= 4 ? 'bg-blue-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                )}

                <InfoText>
                    La contraseña debe tener al menos 8 caracteres, incluir una
                    letra minúscula, una mayúscula y un número.
                </InfoText>

                <Input
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirmar contraseña"
                    icon={lockIcon}
                    showPassword={showConfirmPassword}
                    onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                    register={register}
                    validationRules={validationRules.confirmPassword}
                    error={errors.confirmPassword?.message}
                    disabled={isSubmitting}
                />

                {/* Indicador visual de coincidencia */}
                {watch('confirmPassword') && newPassword && (
                    <div className="mb-2 text-xs">
                        {watch('confirmPassword') === newPassword ? (
                            <span className="text-green-600 flex items-center">
                                ✓ Las contraseñas coinciden
                            </span>
                        ) : (
                            <span className="text-red-600 flex items-center">
                                ✗ Las contraseñas no coinciden
                            </span>
                        )}
                    </div>
                )}

                <Button
                    text={isSubmitting ? "Actualizando..." : "Cambiar contraseña"}
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

export default UpdatePassword;