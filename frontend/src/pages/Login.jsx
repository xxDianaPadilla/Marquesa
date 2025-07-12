import React, { useState } from "react";
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
    const { login } = useAuth();
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
                value: 8,
                message: 'La contraseña debe tener al menos 8 caracteres'
            }
        }
    };

    const onSubmit = async (data) => {
        try {
            clearErrors();
            console.log('=== INICIANDO LOGIN ===');

            const result = await login(data.email, data.password);
            console.log('Resultado del login:', result);

            if (result.success) {
                console.log('✅ Login exitoso! Redirigiendo inmediatamente...');
                
                // USAR USERTYPE DEL RESULTADO O RESPONSE
                const userType = result.user?.userType || result.userType;
                console.log('UserType para redirección:', userType);
                
                // REDIRECCIÓN INMEDIATA Y FORZADA
                if (userType === 'admin') {
                    console.log('Redirigiendo a dashboard...');
                    window.location.replace('/dashboard');
                } else {
                    console.log('Redirigiendo a home...');
                    window.location.replace('/home');
                }
                
            } else {
                console.log('❌ Login falló:', result.message);
                
                // Manejar errores específicos
                const errorMessage = result.message || 'Error en la autenticación';
                
                if (errorMessage === 'user not found') {
                    setError('email', {
                        type: 'server',
                        message: 'Usuario no encontrado'
                    });
                } else if (errorMessage === 'Invalid password') {
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
            console.error('💥 Error durante el login:', error);
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
                {errors.root?.serverError && (
                    <div className="auth-error-message">
                        <span>{errors.root.serverError.message}</span>
                    </div>
                )}

                <Title>Inicia sesión</Title>

                <Input
                    name="email" 
                    type="email"
                    placeholder="Correo electrónico"
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