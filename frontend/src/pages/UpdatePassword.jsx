import React, {useState} from "react";
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

    return(
        <PageContainer>
            <BackButton/>

            <Form>
                <Title>Actualizar contraseña</Title>

                <InfoText>
                    Hemos verificado correctamente tu código, en
                    estos momentos puedes actualizar la
                    contraseña de tu cuenta
                </InfoText>

                <Input
                    type="password"
                    placeholder="Nueva contraseña"
                    icon={lockIcon}
                    showPassword={showPassword}
                    onTogglePassword={() => setShowPassword(!showPassword)}
                />

                <InfoText>
                    La contraseña debe tener al menos 8 caracteres, incluir una
                    letra mayúscula y un número.
                </InfoText>

                <Input
                    type="password"
                    placeholder="Confirmar contraseña"
                    icon={lockIcon}
                    showPassword={showPassword}
                    onTogglePassword={() => setShowPassword(!showPassword)}
                />

                <Button
                    text="Cambiar contraseña"
                    variant="primary"
                />

                <QuestionText
                    question="¿Recuerdas tu contraseña?"
                    linkText="Inicia sesión" />
            </Form>
        </PageContainer>
    );
};

export default UpdatePassword;