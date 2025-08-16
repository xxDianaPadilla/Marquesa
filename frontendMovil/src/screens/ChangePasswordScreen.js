import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView } from "react-native";
import backIcon from '../images/backIcon.png';
import sideBgFlower from "../images/sideBgFlower.png";
import eyeIcon from "../images/eyeIcon.png";
import eyeOffIcon from "../images/eyeOffIcon.png";
import PinkInputs from "../components/PinkInputs";
import PinkButton from "../components/PinkButton";

const ChangePasswordScreen = ({ navigation }) => {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleBack = () => {
        console.log("Back pressed");
        navigation.navigate("RecoveryCode");
    };

    const handleContinue = () => {
        console.log("Continue pressed");
        navigation.navigate("Login");
    };

    const toggleNewPasswordVisibility = () => {
        setShowNewPassword(!showNewPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Background flower decoration */}
            <Image source={sideBgFlower} style={styles.backgroundFlower} />

            <View style={styles.content}>
                {/* Header with back button */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                        <Image source={backIcon} style={styles.backIcon} />
                    </TouchableOpacity>
                </View>

                {/* Title and description */}
                <View style={styles.titleSection}>
                    <Text style={styles.title}>Crea una nueva contraseña</Text>
                    <Text style={styles.description}>
                        Crea una contraseña que contenga al menos 12 dígitos. Debes incluir caracteres especiales, mayúsculas y minúsculas.
                    </Text>
                </View>

                {/* Password inputs */}
                <View style={styles.inputsContainer}>
                    <PinkInputs
                        placeholder="Contraseña nueva"
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry={!showNewPassword}
                        showPasswordToggle={true}
                        onTogglePassword={toggleNewPasswordVisibility}
                        eyeIcon={eyeIcon}
                        eyeOffIcon={eyeOffIcon}
                        style={styles.inputSpacing}
                    />

                    <PinkInputs
                        placeholder="Confirmar contraseña"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showConfirmPassword}
                        showPasswordToggle={true}
                        onTogglePassword={toggleConfirmPasswordVisibility}
                        eyeIcon={eyeIcon}
                        eyeOffIcon={eyeOffIcon}
                        style={styles.inputSpacing}
                    />
                </View>

                {/* Continue button */}
                <View style={styles.buttonContainer}>
                    <PinkButton
                        title="Continuar"
                        onPress={handleContinue}
                        style={styles.continueButton}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    backgroundFlower: {
        position: 'absolute',
        top: 40,
        right: 0,
        width: 100,
        height: 100,
        resizeMode: 'contain',
        opacity: 0.6,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 40,
    },
    backButton: {
        padding: 8,
        marginTop: 20,
    },
    backIcon: {
        width: 24,
        height: 24,
        tintColor: '#3C3550',
        resizeMode: 'contain',
    },
    titleSection: {
        marginBottom: 40,
    },
    title: {
        fontSize: 24,
        fontFamily: 'Poppins-SemiBold',
        color: '#3C3550',
        marginBottom: 16,
        lineHeight: 32,
    },
    description: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: '#666666',
        lineHeight: 22,
    },
    inputsContainer: {
        marginBottom: 40,
    },
    inputSpacing: {
        marginBottom: 20,
    },
    buttonContainer: {
        width: '100%',
        maxWidth: 300,
    },
});

export default ChangePasswordScreen;