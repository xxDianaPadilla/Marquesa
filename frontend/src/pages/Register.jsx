import React, { useState } from "react";
import PageContainer from "../components/PageContainer";
import Form from "../components/Form";
import Title from "../components/Title";
import Input from "../components/Input";
import Button from "../components/Button";
import QuestionText from "../components/QuestionText";
import Separator from "../components/Separator";
import GoogleButton from "../components/GoogleButton";
import userIcon from "../assets/user.png";
import phoneIcon from "../assets/phone.png";
import emailIcon from "../assets/emailIcon.png";
import calendarIcon from "../assets/calendar.png";
import locationIcon from "../assets/location.png";
import lockIcon from "../assets/lockIcon.png";

const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);

    return (
        <PageContainer>
            <Form>
                <Title>Regístrate</Title>

                <Input
                    type="text"
                    placeholder="Nombre"
                    icon={userIcon}
                />

                <Input
                    type="number"
                    placeholder="Teléfono"
                    icon={phoneIcon}
                />

                <Input
                    type="email"
                    placeholder="Correo"
                    icon={emailIcon}
                />

                <Input
                    type="date"
                    placeholder="Fecha de nacimiento"
                    icon={calendarIcon}
                />

                <Input
                    type="text"
                    placeholder="Dirección"
                    icon={locationIcon}
                />

                <Input
                    type="password"
                    placeholder="Contraseña"
                    icon={lockIcon}
                    showPassword={showPassword}
                    onTogglePassword={() => setShowPassword(!showPassword)}
                />

                {/* Checkbox de términos y condiciones */}
                <div className="flex items-start gap-3 mt-4">
                    <input
                        type="checkbox"
                        id="terms"
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                        className="w-4 h-4 mt-1 rounded border border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
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
                <br />

                <Button
                    text="Crear cuenta"
                    variant="primary"
                />

                <QuestionText
                    question="¿Ya tienes una cuenta?"
                    linkText="Inicia sesión" />

                <Separator text="o" />

                <GoogleButton />
            </Form>
        </PageContainer>
    );
};

export default Register;