import React from "react";
import { View, TouchableOpacity, Image, StyleSheet, Text, ScrollView } from "react-native";
import { useAuth } from "../context/AuthContext";
import PinkInputs from "../components/PinkInputs";
import PinkButton from "../components/PinkButton";
import { useAlert } from "../hooks/useAlert"; 
import { CustomAlert, LoadingDialog, ConfirmationDialog } from "../components/CustomAlerts"; 
import backIcon from "../images/backIcon.png";
import phoneIcon from "../images/phoneIcon.png";
import emailIcon from "../images/emailIcon.png";
import editIcon from "../images/editIcon.png";
import useEditProfile from "../hooks/useEditProfile";

export default function EditProfileScreen({ navigation }) {
    const { userInfo } = useAuth();
    const { 
        alertState, 
        showConfirmation, 
        hideConfirmation,
        showError,
        showSuccess,
        showLoading,
        hideLoading
    } = useAlert();
    
    // Usar el hook personalizado pasándole las funciones de alert
    const {
        formData,
        isEditing,
        loading,
        initialLoad,
        handleInputChange,
        handleEditToggle,
        cancelEdit,
        handleBackPress
    } = useEditProfile({
        showConfirmation,
        hideConfirmation,
        showError,
        showSuccess,
        showLoading,
        hideLoading
    });

    // Mostrar pantalla de carga inicial
    if (initialLoad) {
        return (
            <View style={[styles.container, styles.centered]}>
                <Text style={styles.loadingText}>Cargando perfil...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => handleBackPress(navigation)}
                >
                    <Image source={backIcon} style={styles.backIcon} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Perfil</Text>
            </View>

            <ScrollView 
                style={styles.content} 
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Profile Picture Section */}
                <View style={styles.profileSection}>
                    <View style={styles.profileImageContainer}>
                        {userInfo?.profilePicture ? (
                            <Image
                                source={{ uri: userInfo.profilePicture }}
                                style={styles.profileImage}
                            />
                        ) : (
                            <View style={styles.defaultProfileImage}>
                                <Text style={styles.defaultProfileText}>
                                    {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : 'U'}
                                </Text>
                            </View>
                        )}
                        <TouchableOpacity style={styles.editProfileButton}>
                            <Image source={editIcon} style={styles.editProfileIcon} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.userName}>
                        {formData.fullName || 'Usuario'}
                    </Text>
                </View>

                {/* Form Section */}
                <View style={styles.formSection}>
                    <Text style={styles.sectionLabel}>Teléfono:</Text>
                    <PinkInputs
                        placeholder="7777-7777"
                        value={formData.phone}
                        onChangeText={(value) => handleInputChange('phone', value)}
                        icon={phoneIcon}
                        keyboardType="phone-pad"
                        style={styles.inputStyle}
                        inputStyle={[
                            styles.textInput,
                            !isEditing && styles.disabledInput
                        ]}
                        editable={isEditing}
                    />

                    <Text style={styles.sectionLabel}>Correo electrónico:</Text>
                    <PinkInputs
                        placeholder="ejemplo@gmail.com"
                        value={formData.email}
                        onChangeText={(value) => handleInputChange('email', value)}
                        icon={emailIcon}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        style={styles.inputStyle}
                        inputStyle={[
                            styles.textInput,
                            !isEditing && styles.disabledInput
                        ]}
                        editable={isEditing}
                    />

                    <Text style={styles.sectionLabel}>Dirección:</Text>
                    <PinkInputs
                        placeholder="Calle 5A, Número 123, San Salvador"
                        value={formData.address}
                        onChangeText={(value) => handleInputChange('address', value)}
                        style={styles.inputStyle}
                        inputStyle={[
                            styles.textInput,
                            !isEditing && styles.disabledInput
                        ]}
                        editable={isEditing}
                    />
                </View>

                {/* Button Section */}
                <View style={styles.buttonSection}>
                    <PinkButton
                        title={loading ? "Guardando..." : (isEditing ? "Guardar" : "Editar")}
                        onPress={handleEditToggle}
                        disabled={loading}
                        style={styles.editButton}
                    />
                    
                    {isEditing && (
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={cancelEdit}
                            disabled={loading}
                        >
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>

            {/* Componentes de Alertas Personalizadas */}
            <CustomAlert
                visible={alertState.basicAlert.visible}
                title={alertState.basicAlert.title}
                message={alertState.basicAlert.message}
                type={alertState.basicAlert.type}
                onConfirm={alertState.basicAlert.onConfirm}
                onCancel={alertState.basicAlert.onCancel}
                confirmText={alertState.basicAlert.confirmText}
                cancelText={alertState.basicAlert.cancelText}
                showCancel={alertState.basicAlert.showCancel}
            />

            <LoadingDialog
                visible={alertState.loading.visible}
                title={alertState.loading.title}
                message={alertState.loading.message}
                color={alertState.loading.color}
            />

            <ConfirmationDialog
                visible={alertState.confirmation.visible}
                title={alertState.confirmation.title}
                message={alertState.confirmation.message}
                onConfirm={alertState.confirmation.onConfirm}
                onCancel={alertState.confirmation.onCancel}
                confirmText={alertState.confirmation.confirmText}
                cancelText={alertState.confirmation.cancelText}
                isDangerous={alertState.confirmation.isDangerous}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        paddingTop: 50,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    backButton: {
        width: 24,
        height: 24,
        marginRight: 20,
    },
    backIcon: {
        width: "100%",
        height: "100%",
        resizeMode: "contain",
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: 'Poppins-SemiBold',
        color: '#333333',
        flex: 1,
        textAlign: 'center',
        marginRight: 44, 
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    loadingText: {
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
        color: '#999999',
        textAlign: 'center',
    },
    profileSection: {
        alignItems: 'center',
        marginBottom: 40,
    },
    profileImageContainer: {
        position: 'relative',
        marginBottom: 15,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#F0F0F0',
    },
    defaultProfileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#E8E8FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    defaultProfileText: {
        fontSize: 40,
        fontFamily: 'Poppins-SemiBold',
        color: '#6B73FF',
    },
    editProfileButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        backgroundColor: '#FDB4B7',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFFFFF',
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    editProfileIcon: {
        width: 16,
        height: 16,
        tintColor: '#FFFFFF',
        resizeMode: 'contain',
    },
    userName: {
        fontSize: 24,
        fontFamily: 'Poppins-SemiBold',
        color: '#333333',
        textAlign: 'center',
    },
    formSection: {
        marginBottom: 40,
        marginTop: -20,
    },
    sectionLabel: {
        fontSize: 14,
        fontFamily: 'Poppins-Medium',
        color: '#666666',
        marginBottom: 8,
        marginLeft: 20,
    },
    inputStyle: {
        marginBottom: 20,
    },
    textInput: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: '#333333',
    },
    disabledInput: {
        color: '#999999',
        backgroundColor: '#FFFFFF',
    },
    buttonSection: {
        alignItems: 'center',
        paddingBottom: 40,
    },
    editButton: {
        marginBottom: 15,
    },
    cancelButton: {
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#FDB4B7',
        backgroundColor: 'transparent',
        marginBottom: 20,
    },
    cancelButtonText: {
        color: '#FDB4B7',
        fontSize: 16,
        fontFamily: 'Poppins-Medium',
        textAlign: 'center',
    },
});