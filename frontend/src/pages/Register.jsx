import React, { useState } from "react";
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import PageContainer from "../components/PageContainer";
import Form from "../components/Form";
import Title from "../components/Title";
import Input from "../components/Input";
import Button from "../components/Button";
import QuestionText from "../components/QuestionText";
import Separator from "../components/Separator";
import GoogleButton from "../components/GoogleButton";
import BackButton from "../components/BackButton";
import userIcon from "../assets/user.png";
import phoneIcon from "../assets/phone.png";
import emailIcon from "../assets/emailIcon.png";
import calendarIcon from "../assets/calendar.png";
import locationIcon from "../assets/location.png";
import lockIcon from "../assets/lockIcon.png";

const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

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
            name: '',
            phone: '',
            email: '',
            birthDate: '',
            address: '',
            password: '',
            acceptTerms: false
        }
    });

    const acceptTerms = watch('acceptTerms');

    const validationRules = {
        name: {
            required: 'El nombre es requerido',
            minLength: {
                value: 2,
                message: 'El nombre debe tener al menos 2 caracteres'
            }
        },
        phone: {
            required: 'El teléfono es requerido',
            pattern: {
                value: /^[0-9+\-\s()]+$/,
                message: 'Ingresa un número de teléfono válido'
            }
        },
        email: {
            required: 'El correo electrónico es requerido',
            pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'El correo electrónico no es válido'
            }
        },
        birthDate: {
            required: 'La fecha de nacimiento es requerida'
        },
        address: {
            required: 'La dirección es requerida'
        },
        password: {
            required: 'La contraseña es requerida',
            minLength: {
                value: 6,
                message: 'La contraseña debe tener al menos 6 caracteres'
            }
        },
        acceptTerms: {
            required: 'Debes aceptar los términos y condiciones'
        }
    };

    const onSubmit = async (data) => {
        try {
            clearErrors();
            console.log('Datos del registro:', data);
        
            alert('Registro exitoso!');
            navigate('/login');
            
        } catch (error) {
            console.error('Error durante el registro:', error);
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
            <BackButton onClick={handleLoginClick} />
            
            <Form onSubmit={handleSubmit(onSubmit)}>
                {/* Error general del servidor */}
                {errors.root?.serverError && (
                    <div className="auth-error-message">
                        <span>{errors.root.serverError.message}</span>
                    </div>
                )}

                <Title>Regístrate</Title>

                <Input
                    name="name"
                    type="text"
                    placeholder="Nombre"
                    icon={userIcon}
                    register={register}
                    validationRules={validationRules.name}
                    error={errors.name?.message}
                    disabled={isSubmitting}
                />

                <Input
                    name="phone"
                    type="tel"
                    placeholder="Teléfono"
                    icon={phoneIcon}
                    register={register}
                    validationRules={validationRules.phone}
                    error={errors.phone?.message}
                    disabled={isSubmitting}
                />

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
                    name="birthDate"
                    type="date"
                    placeholder="Fecha de nacimiento"
                    icon={calendarIcon}
                    register={register}
                    validationRules={validationRules.birthDate}
                    error={errors.birthDate?.message}
                    disabled={isSubmitting}
                />

                <Input
                    name="address"
                    type="text"
                    placeholder="Dirección"
                    icon={locationIcon}
                    register={register}
                    validationRules={validationRules.address}
                    error={errors.address?.message}
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

                {/* Checkbox de términos y condiciones */}
                <div className="flex items-start gap-3 mt-4">
                    <input
                        {...register('acceptTerms', validationRules.acceptTerms)}
                        type="checkbox"
                        id="terms"
                        className="w-4 h-4 mt-1 rounded border border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                        disabled={isSubmitting}
                    />
                    <label htmlFor="terms" className="text-sm text-gray-700 leading-relaxed"
                        style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Al registrarme, acepto los{" "}
                        <span className="text-pink-500 underline cursor-pointer" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Términos y Condiciones
                        </span>{" "}
                        y la{" "}
                        <span className="text-pink-500 underline cursor-pointer" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Política de Privacidad
                        </span>{" "}
                        de MARQUESA.
                    </label>
                </div>
                {errors.acceptTerms && (
                    <div className="text-red-500 text-sm mt-1 italic">
                        {errors.acceptTerms.message}
                    </div>
                )}
                <br />

                <Button
                    text={isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
                    variant="primary"
                    type="submit"
                    disabled={isSubmitting || !acceptTerms}
                />

                <QuestionText
                    question="¿Ya tienes una cuenta?"
                    linkText="Inicia sesión"
                    onLinkClick={handleLoginClick}
                />

                <Separator text="o" />

                <GoogleButton />
            </Form>
        </PageContainer>
    );
};

export default Register;