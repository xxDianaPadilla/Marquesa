import React, { useState } from "react";
import { View, TouchableOpacity, Image, StyleSheet, Text, ScrollView, Platform } from "react-native";
import * as ImagePicker from 'expo-image-picker';

// Importación de contextos y hooks personalizados
import { useAuth } from "../context/AuthContext";
import { useAlert } from "../hooks/useAlert"; 
import useEditProfile from "../hooks/useEditProfile";

// Importación de componentes personalizados
import PinkInputs from "../components/PinkInputs";
import PinkButton from "../components/PinkButton";
import { CustomAlert, LoadingDialog, ConfirmationDialog } from "../components/CustomAlerts";
import { ImagePickerDialog } from "../components/ImagePickerDialog"; // Nuevo componente

// Importación de iconos y elementos gráficos
import backIcon from "../images/backIcon.png";
import phoneIcon from "../images/phoneIcon.png";
import userIcon from "../images/userIcon.png"; 
import editIcon from "../images/editIcon.png";

export default function EditProfileScreen({ navigation }) {
    const { userInfo } = useAuth();
    
    // Estado para controlar el diálogo de selección de imagen
    const [showImagePicker, setShowImagePicker] = useState(false);
    
    const { 
        alertState,
        showConfirmation,
        hideConfirmation,
        showError,
        showSuccess,
        showLoading,
        hideLoading
    } = useAlert();
    
    const {
        formData,
        isEditing,
        loading,
        initialLoad,
        profileImageUri,
        handleInputChange,
        handleEditToggle,
        cancelEdit,
        handleBackPress,
        handleImagePicker
    } = useEditProfile({
        showConfirmation,
        hideConfirmation,
        showError,
        showSuccess,
        showLoading,
        hideLoading
    });

    // Función para solicitar permisos de cámara
    const requestCameraPermission = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            return status === 'granted';
        } catch (error) {
            console.error('Error solicitando permisos de cámara:', error);
            return false;
        }
    };

    // Función para solicitar permisos de galería
    const requestMediaLibraryPermission = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            return status === 'granted';
        } catch (error) {
            console.error('Error solicitando permisos de galería:', error);
            return false;
        }
    };

    // Función para mostrar el diálogo personalizado de selección de imagen
    const showImagePickerOptions = () => {
        setShowImagePicker(true);
    };

    // Función para ocultar el diálogo de selección de imagen
    const hideImagePickerOptions = () => {
        setShowImagePicker(false);
    };

    // Función para abrir la cámara
    const openCamera = async () => {
        hideImagePickerOptions();
        
        const hasPermission = await requestCameraPermission();
        
        if (!hasPermission) {
            showError('Se necesitan permisos de cámara para tomar una foto');
            return;
        }

        try {
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
                base64: false
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const imageUri = result.assets[0].uri;
                handleImagePicker(imageUri);
            }
        } catch (error) {
            console.error('Error abriendo cámara:', error);
            showError('Error al abrir la cámara');
        }
    };

    // Función para abrir la galería
    const openImageLibrary = async () => {
        hideImagePickerOptions();
        
        const hasPermission = await requestMediaLibraryPermission();
        
        if (!hasPermission) {
            showError('Se necesitan permisos de galería para seleccionar una imagen');
            return;
        }

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
                base64: false
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const imageUri = result.assets[0].uri;
                handleImagePicker(imageUri);
            }
        } catch (error) {
            console.error('Error abriendo galería:', error);
            showError('Error al abrir la galería');
        }
    };

    if (initialLoad) {
        return (
            <View style={[styles.container, styles.centered]}>
                <Text style={styles.loadingText}>Cargando perfil...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header unificado con Blog */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => handleBackPress(navigation)}
                >
                    <Image source={backIcon} style={styles.backIcon} />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Perfil</Text>

                <View style={styles.placeholder} />
            </View>

            {/* Contenido principal con scroll */}
            <ScrollView 
                style={styles.content} 
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Sección de foto de perfil */}
                <View style={styles.profileSection}>
                    <View style={styles.profileImageContainer}>
                        {profileImageUri ? (
                            <Image
                                source={{ uri: profileImageUri }}
                                style={styles.profileImage}
                            />
                        ) : userInfo?.profilePicture ? (
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
                        
                        <TouchableOpacity 
                            style={styles.editProfileButton}
                            onPress={showImagePickerOptions}
                            disabled={loading}
                        >
                            <Image source={editIcon} style={styles.editProfileIcon} />
                        </TouchableOpacity>
                    </View>
                    
                    <Text style={styles.userName}>
                        {formData.fullName || 'Usuario'}
                    </Text>
                </View>

                {/* Formulario de datos personales */}
                <View style={styles.formSection}>
                    <Text style={styles.sectionLabel}>Nombre:</Text>
                    <PinkInputs
                        placeholder="Ingresa tu nombre completo"
                        value={formData.fullName}
                        onChangeText={(value) => handleInputChange('fullName', value)}
                        icon={userIcon}
                        keyboardType="default"
                        autoCapitalize="words"
                        style={styles.inputStyle}
                        inputStyle={[
                            styles.textInput,
                            !isEditing && styles.disabledInput
                        ]}
                        editable={isEditing}
                    />

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

                {/* Botones de acción */}
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

            {/* Alertas personalizadas */}
            <CustomAlert {...alertState.basicAlert} />
            <LoadingDialog {...alertState.loading} />
            <ConfirmationDialog {...alertState.confirmation} />
            
            {/* Diálogo personalizado de selección de imagen */}
            <ImagePickerDialog
                visible={showImagePicker}
                onCamera={openCamera}
                onGallery={openImageLibrary}
                onCancel={hideImagePickerOptions}
            />
        </View>
    );
}

// Los estilos permanecen igual que en la versión anterior
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Header igual que Blog
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
        paddingBottom: 15,
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginBottom: 20, 
    },
    backButton: {
        padding: 8,
    },
    backIcon: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
        marginTop: 20,
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: 'Poppins-SemiBold',
        color: '#1f2937',
        marginTop: 20,
    },
    placeholder: {
        width: 40,
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
        shadowOffset: { width: 0, height: 2 },
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
        fontSize: 22,
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