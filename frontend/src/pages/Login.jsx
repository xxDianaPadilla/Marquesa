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

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    return (
        <PageContainer>
            <Form>
                <Title>Inicia Sesión</Title>

                <Input
                    type="email"
                    placeholder="Correo"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    icon={emailIcon}
                />

                <Input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    icon={lockIcon}
                    showPassword={showPassword}
                    onTogglePassword={() => setShowPassword(!showPassword)}
                />

                <div className="text-left mb-4">
                    <button className="text-sm hover:text-pink-600 transition-colors" style={{ color: '#FF6A5F', fontWeight: '600', fontFamily: 'Poppins, sans-serif', fontStyle: 'italic' }}>
                        ¿Olvidaste tu contraseña?
                    </button>
                </div>

                <Button
                    text="Iniciar Sesión"
                    variant="primary"
                />

                <QuestionText
                    question="¿No tienes una cuenta aún?"
                    linkText="Regístrate" />

                <Separator text="o" />

                <GoogleButton />
            </Form>
        </PageContainer>
    );
};

export default Login;