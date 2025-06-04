import React from "react";
import PageContainer from "../components/PageContainer";
import BackButton from "../components/BackButton";
import Form from "../components/Form";
import Title from "../components/Title";
import InfoText from "../components/InfoText";
import Input from "../components/Input";
import Button from "../components/Button";
import QuestionText from "../components/QuestionText";

const VerificationCode = () => {
    return (
        <PageContainer>
            <BackButton />

            <Form>
                <Title>Recuperar contraseña</Title>

                <InfoText>
                    Te hemos enviado un código de verificación a tu
                    correo, escribe correctamente el código para
                    poder actualizar su contraseña correctamente
                </InfoText>

                <Input
                    type="number"
                    placeholder="Código de verificación"
                />

                <Button
                    text="Verificar código"
                    variant="primary"
                />

                <button className="w-full mt-4 py-3 px-4 text-sm font-medium bg-transparent border border-pink-300 rounded-lg hover:bg-pink-50 transition-colors duration-200" style={{fontFamily: 'Poppins, sans-serfi', color: '#CD5277'}}>
                    ¿No has recibido el código aún?
                </button>

                <QuestionText
                    question="¿Recuerdas tu contraseña?"
                    linkText="Inicia sesión" />
            </Form>
        </PageContainer>
    );
};

export default VerificationCode;