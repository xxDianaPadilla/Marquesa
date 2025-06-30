import React, { useState, useEffect } from "react";
import PageContainer from "../components/PageContainer";
import Form from "../components/Form";
import Title from "../components/Title";
import Input from "../components/Input";
import emailIcon from "../assets/emailIcon.png";
import lockIcon from "../assets/lockIcon.png";
import Button from "../components/Button";
import QuestionText from "../components/QuestionText";
import Separator from "../components/Separator";
import GoogleButton from "../components/GoogleButton";
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const { isAuthenticated, user, login } = useAuth();
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
            email: '',
            password: '',
            rememberMe: false
        }
    });

    useEffect(() => {
        if (isAuthenticated && user) {
            if (user.userType === 'admin') {
                navigate('/dashboard');
            } else {
                navigate('/categoryProducts');
            }
        }
    }, [isAuthenticated, user, navigate]);

    const validationRules = {
        email: {
            required: 'El correo electrónico es requerido',
            pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'El correo electrónico no es válido'
            }
        },
        password: {
            required: 'La contraseña es requerida',
            minLength: {
                value: 6,
                message: 'La contraseña debe tener al menos 6 caracteres'
            }
        }
    };

    const onSubmit = async (data) => {
        try {
            clearErrors();

            const result = await login(data.email, data.password);

            if (!result.success) {
                const errorMessage = result.message || 'Error en la autenticación';

                if (errorMessage.toLowerCase().includes('email') ||
                    errorMessage.toLowerCase().includes('correo') ||
                    errorMessage.toLowerCase().includes('user not found')) {
                    setError('email', {
                        type: 'server',
                        message: 'Usuario no encontrado'
                    });
                } else if (errorMessage.toLowerCase().includes('password') ||
                    errorMessage.toLowerCase().includes('contraseña') ||
                    errorMessage.toLowerCase().includes('invalid password')) {
                    setError('password', {
                        type: 'server',
                        message: 'Contraseña incorrecta'
                    });
                } else {
                    setError('root.serverError', {
                        type: 'server',
                        message: errorMessage
                    });
                }
            }

        } catch (error) {
            console.error('Error durante el login:', error);
            setError('root.serverError', {
                type: 'server',
                message: 'Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.'
            });
        }
    };

    const handleRegisterClick = (e) => {
        e.preventDefault();
        navigate('/register');
    };

    const handleRecuperarContrasenaClick = (e) => {
        e.preventDefault();
        navigate('/recover-password');
    };

    return (
        <PageContainer>
            <Form onSubmit={handleSubmit(onSubmit)}>
                {/* Error general del servidor */}
                {errors.root?.serverError && (
                    <div className="auth-error-message">
                        <span>{errors.root.serverError.message}</span>
                    </div>
                )}
                <Title>Inicia Sesión</Title>

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

                <Input
                    name="password" 
                    type="password"
                    placeholder="Contraseña"
                    icon={lockIcon}
                    showPassword={showPassword}
                    onTogglePassword={() => setShowPassword(!showPassword)}
                    register={register}
                    validationRules={validationRules.password}
                    error={errors.password?.message}
                    disabled={isSubmitting}
                />

                <div className="text-left mb-4">
                    <button 
                        type="button" 
                        className="text-sm hover:text-pink-600 transition-colors" 
                        style={{ 
                            color: '#FF6A5F', 
                            fontWeight: '600', 
                            fontFamily: 'Poppins, sans-serif', 
                            fontStyle: 'italic', 
                            cursor: 'pointer'
                        }} 
                        onClick={handleRecuperarContrasenaClick}
                    >
                        ¿Olvidaste tu contraseña?
                    </button>
                </div>

                <Button
                    text={isSubmitting ? "Iniciando sesión..." : "Iniciar Sesión"}
                    variant="primary"
                    type="submit"
                    disabled={isSubmitting}
                />

                <QuestionText
                    question="¿No tienes una cuenta aún?"
                    linkText="Regístrate"
                    onLinkClick={handleRegisterClick} 
                />

                <Separator text="o" />

                <GoogleButton />
            </Form>
        </PageContainer>
    );
};

export default Login;