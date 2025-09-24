import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Image,
  TextInput,
  StyleSheet,
} from "react-native";
// Importación de imágenes utilizadas en la pantalla
import backIcon from "../images/backIcon.png";
import sideBgFlower from "../images/sideBgFlower.png";
import PinkButton from "../components/PinkButton";

// Importación de componentes personalizados para alertas y carga
import { CustomAlert, LoadingDialog } from "../components/CustomDialogs";

// Importación del hook personalizado para recuperación de contraseña
import usePasswordReset from "../hooks/usePasswordReset";

// Componente para la pantalla de verificación de código de recuperación
const RecoveryCodeScreen = ({ navigation, route }) => {
  // Obtener el email desde los parámetros de navegación
  const { email } = route.params || {};

  // Estado para almacenar los 6 dígitos del código de verificación
  const [code, setCode] = useState(["", "", "", "", "", ""]);

  // Referencias para los TextInput
  const inputRefs = useRef([]);

  // Estados para controlar las alertas personalizadas
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  // Estado para el contador de reenvío
  const [resendTimer, setResendTimer] = useState(0);

  // Hook personalizado para recuperación de contraseña
  const {
    isVerifying,
    isRequesting,
    verifyCode,
    requestPasswordReset,
    clearError,
  } = usePasswordReset();

  // Efecto para manejar la cuenta regresiva del botón de reenvío (10 minutos = 600 segundos)
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Efecto para inicializar el timer cuando se monta el componente
  useEffect(() => {
    // Iniciar timer de 10 minutos (600 segundos) al montar el componente
    setResendTimer(600);
  }, []);

  // Función para formatear tiempo en MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Función para manejar cambios en cada dígito del código
  const handleCodeChange = (value, index) => {
    // Solo permitir números
    if (!/^\d*$/.test(value)) return;

    // Crear una copia del array de código actual
    const newCode = [...code];
    // Actualizar el dígito en la posición específica
    newCode[index] = value;
    // Actualizar el estado con el nuevo código
    setCode(newCode);

    // Si se ingresó un número, pasar al siguiente campo
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Función para manejar la tecla de borrar
  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace') {
      // Si el campo actual está vacío y no es el primero, ir al anterior
      if (code[index] === '' && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  // Función para procesar el código completo y continuar
  const handleContinue = async () => {
    // Unir todos los dígitos en un string completo
    const fullCode = code.join("");
    console.log("Código ingresado: ", fullCode);

    // Validar que el código esté completo
    if (fullCode.length !== 6) {
      setAlertMessage("Por favor ingresa el código completo de 6 dígitos");
      setShowErrorAlert(true);
      return;
    }

    // Limpiar errores previos
    clearError();

    // Verificar código
    const result = await verifyCode(email, fullCode);

    if (result.success) {
      // Mostrar alerta de éxito
      setAlertMessage("Código verificado correctamente");
      setShowSuccessAlert(true);
    } else {
      // Mostrar alerta de error y limpiar código
      setAlertMessage(result.message);
      setShowErrorAlert(true);
      setCode(["", "", "", "", "", ""]); // Limpiar código
    }
  };

  // Función para manejar la confirmación de éxito
  const handleSuccessConfirm = () => {
    setShowSuccessAlert(false);
    // Navegar a la pantalla de cambio de contraseña pasando email y código
    navigation.navigate("ChangePassword", {
      email,
      verificationCode: code.join(""),
    });
  };

  // Función para cerrar alerta de error
  const handleErrorConfirm = () => {
    setShowErrorAlert(false);
  };

  // Función para reenviar el código de verificación
  const handleResendCode = async () => {
    if (resendTimer > 0) {
      return; // No permitir reenvío si aún hay tiempo restante
    }

    console.log("Reenviar código");

    // Limpiar errores previos
    clearError();

    // Solicitar nuevo código
    const result = await requestPasswordReset(email);

    if (result.success) {
      // Reiniciar timer y mostrar mensaje
      setResendTimer(600); // 10 minutos
      setAlertMessage("Nuevo código enviado a tu correo");
      setShowSuccessAlert(true);
      setCode(["", "", "", "", "", ""]); // Limpiar código anterior
    } else {
      // Mostrar error
      setAlertMessage(result.message);
      setShowErrorAlert(true);
    }
  };

  // Función para manejar confirmación de reenvío exitoso
  const handleResendSuccessConfirm = () => {
    setShowSuccessAlert(false);
  };

  // Función para regresar a la pantalla anterior
  const handleGoBack = () => {
    console.log("Regresar");
    // Navegar de vuelta a la pantalla de recuperación de contraseña
    navigation.navigate("RecoveryPassword");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Imagen decorativa de fondo */}
      <Image source={sideBgFlower} style={styles.backgroundFlower} />

      {/* Header con botón de navegación hacia atrás */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleGoBack}
          style={styles.backButton}
          disabled={isVerifying || isRequesting} // Deshabilitar durante operaciones
        >
          <Image source={backIcon} style={styles.backIcon} />
        </TouchableOpacity>
      </View>

      {/* Contenido principal de la pantalla */}
      <View style={styles.content}>
        {/* Título principal */}
        <Text style={styles.title}>Confirma tu cuenta</Text>

        {/* Subtítulo con instrucción */}
        <Text style={styles.subtitle}>Ingresa el código</Text>

        {/* Contenedor de los campos de entrada del código */}
        <View style={styles.codeContainer}>
          {/* Mapear cada dígito y crear un input individual */}
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={styles.codeInput}
              value={digit}
              onChangeText={(value) => handleCodeChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              maxLength={1} // Solo permitir un carácter por campo
              keyboardType="numeric" // Mostrar teclado numérico
              textAlign="center" // Centrar el texto
              placeholder="" // Sin placeholder para mantener limpio el diseño
              editable={!isVerifying && !isRequesting} // Deshabilitar durante operaciones
            />
          ))}
        </View>

        {/* Descripción explicativa del proceso */}
        <Text style={styles.description}>
          Enviamos un código por gmail. Ingrésalo para confirmar tu cuenta.
        </Text>

        {/* Contenedor del botón principal */}
        <View style={styles.buttonContainer}>
          <PinkButton
            title={isVerifying ? "Verificando..." : "Continuar"}
            onPress={handleContinue}
            style={styles.continueButton}
            disabled={isVerifying || isRequesting} // Deshabilitar durante operaciones
          />
        </View>

        {/* Botón secundario para reenviar código */}
        <TouchableOpacity
          onPress={handleResendCode}
          style={[
            styles.resendButton,
            (resendTimer > 0 || isRequesting || isVerifying) &&
              styles.resendButtonDisabled,
          ]}
          disabled={resendTimer > 0 || isRequesting || isVerifying}
        >
          <Text
            style={[
              styles.resendText,
              (resendTimer > 0 || isRequesting || isVerifying) &&
                styles.resendTextDisabled,
            ]}
          >
            {resendTimer > 0
              ? `Reenviar código en ${formatTime(resendTimer)}`
              : "Reenviar código"}
          </Text>
        </TouchableOpacity>

        {/* Alertas personalizadas */}
        <CustomAlert
          visible={showSuccessAlert}
          type="success"
          title="¡Éxito!"
          message={alertMessage}
          confirmText="Continuar"
          onConfirm={handleSuccessConfirm}
        />

        <CustomAlert
          visible={showErrorAlert}
          type="error"
          title="Error"
          message={alertMessage}
          confirmText="Entendido"
          onConfirm={handleErrorConfirm}
        />

        {/* Diálogo de carga */}
        <LoadingDialog
          visible={isVerifying || isRequesting}
          title={isVerifying ? "Verificando código..." : "Enviando código..."}
          message={
            isVerifying
              ? "Validando el código ingresado..."
              : "Enviando nuevo código de verificación..."
          }
          color="#FDB4B7"
        />
      </View>
    </SafeAreaView>
  );
};

// Estilos adicionales necesarios
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  backgroundFlower: {
    position: "absolute",
    top: -55,
    right: -20,
    height: 120,
    opacity: 0.5,
    resizeMode: "contain",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 25,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: "#3C3550",
    resizeMode: "contain",
  },
  content: {
    flex: 1,
    paddingHorizontal: 40,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontFamily: "Poppins-Bold",
    color: "#3C3550",
    marginBottom: 30,
    textAlign: "left",
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: "#3C3550",
    marginBottom: 20,
    textAlign: "left",
  },
  description: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#666666",
    lineHeight: 20,
    marginBottom: 40,
    textAlign: "left",
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  codeInput: {
    width: 45,
    height: 50,
    borderWidth: 1,
    borderColor: "#FDB4B7",
    borderRadius: 8,
    fontSize: 20,
    fontFamily: "Poppins-Medium",
    backgroundColor: "#FFFFFF",
    color: "#3C3550",
  },
  buttonContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  continueButton: {
    width: "100%",
    maxWidth: 280,
  },
  resendButton: {
    alignItems: "center",
    paddingVertical: 10,
  },
  resendButtonDisabled: {
    opacity: 0.6,
  },
  resendText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "#FDB4B7",
    textDecorationLine: "underline",
  },
  resendTextDisabled: {
    color: "#999999",
  },
});

export default RecoveryCodeScreen;