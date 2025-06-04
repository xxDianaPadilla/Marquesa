import React from "react";
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
    return (
        <PageContainer>
            <BackButton />

            <Form>
                <Title>Recuperar contraseña</Title>

                <InfoText>
                    Introduce tu correo electrónico y te enviaremos
                    un código de verificación para restablecer tu
                    contraseña
                </InfoText>

                <Input
                    type="email"
                    placeholder="Correo"
                    icon={emailIcon}
                />

                <Button
                    text="Enviar correo"
                    variant="primary"
                />

                <QuestionText
                    question="¿Recuerdas tu contraseña?"
                    linkText="Inicia sesión" />
            </Form>
        </PageContainer>
    );
};

export default RecoverPassword;