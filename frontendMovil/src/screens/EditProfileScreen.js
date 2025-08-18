import React from "react";
import { View, TouchableOpacity, Image, StyleSheet, Text, ScrollView } from "react-native";

// Importación de contextos y hooks personalizados
import { useAuth } from "../context/AuthContext";
import { useAlert } from "../hooks/useAlert"; 
import useEditProfile from "../hooks/useEditProfile";

// Importación de componentes personalizados
import PinkInputs from "../components/PinkInputs";
import PinkButton from "../components/PinkButton";
import { CustomAlert, LoadingDialog, ConfirmationDialog } from "../components/CustomAlerts"; 

// Importación de iconos y elementos gráficos
import backIcon from "../images/backIcon.png";
import phoneIcon from "../images/phoneIcon.png";
import emailIcon from "../images/emailIcon.png";
import editIcon from "../images/editIcon.png";

/**
 * Pantalla de edición de perfil de usuario
 * Permite visualizar y editar información personal como teléfono, email y dirección
 * Integra sistema de alertas personalizadas y manejo de estados de carga
 * @param {object} navigation - Objeto de navegación de React Navigation
 */
export default function EditProfileScreen({ navigation }) {
    // Obtiene información del usuario desde el contexto de autenticación
    const { userInfo } = useAuth();
    
    // Hook personalizado para manejar diferentes tipos de alertas y notificaciones
    const { 
        alertState,           // Estado actual de todas las alertas
        showConfirmation,     // Función para mostrar diálogos de confirmación
        hideConfirmation,     // Función para ocultar confirmaciones
        showError,           // Función para mostrar alertas de error
        showSuccess,         // Función para mostrar alertas de éxito
        showLoading,         // Función para mostrar indicadores de carga
        hideLoading          // Función para ocultar indicadores de carga
    } = useAlert();
    
    /**
     * Hook personalizado para manejar la lógica de edición de perfil
     * Recibe las funciones de alert como dependencias para mostrar notificaciones
     */
    const {
        formData,           // Datos del formulario (phone, email, address, fullName)
        isEditing,          // Estado que indica si está en modo edición
        loading,            // Estado de carga para operaciones async
        initialLoad,        // Estado de carga inicial de datos
        handleInputChange,  // Función para manejar cambios en los inputs
        handleEditToggle,   // Función para alternar entre modo vista/edición
        cancelEdit,         // Función para cancelar la edición
        handleBackPress     // Función para manejar el botón de retroceso
    } = useEditProfile({
        showConfirmation,
        hideConfirmation,
        showError,
        showSuccess,
        showLoading,
        hideLoading
    });

    /**
     * Pantalla de carga inicial mientras se obtienen los datos del perfil
     * Se muestra antes de renderizar el contenido principal
     */
    if (initialLoad) {
        return (
            <View style={[styles.container, styles.centered]}>
                <Text style={styles.loadingText}>Cargando perfil...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header con título y botón de retroceso */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => handleBackPress(navigation)} // Maneja confirmación si hay cambios pendientes
                >
                    <Image source={backIcon} style={styles.backIcon} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Perfil</Text>
            </View>

            {/* Contenido principal con scroll */}
            <ScrollView 
                style={styles.content} 
                showsVerticalScrollIndicator={false} // Oculta barra de scroll
                keyboardShouldPersistTaps="handled" // Permite tocar botones cuando el teclado está visible
            >
                {/* Sección de foto de perfil */}
                <View style={styles.profileSection}>
                    <View style={styles.profileImageContainer}>
                        {/* Renderizado condicional de imagen de perfil */}
                        {userInfo?.profilePicture ? (
                            // Si existe imagen de perfil, la muestra
                            <Image
                                source={{ uri: userInfo.profilePicture }}
                                style={styles.profileImage}
                            />
                        ) : (
                            // Si no existe, muestra un avatar por defecto con inicial
                            <View style={styles.defaultProfileImage}>
                                <Text style={styles.defaultProfileText}>
                                    {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : 'U'}
                                </Text>
                            </View>
                        )}
                        
                        {/* Botón para editar foto de perfil */}
                        <TouchableOpacity style={styles.editProfileButton}>
                            <Image source={editIcon} style={styles.editProfileIcon} />
                        </TouchableOpacity>
                    </View>
                    
                    {/* Nombre del usuario */}
                    <Text style={styles.userName}>
                        {formData.fullName || 'Usuario'}
                    </Text>
                </View>

                {/* Sección del formulario de datos personales */}
                <View style={styles.formSection}>
                    {/* Campo de teléfono */}
                    <Text style={styles.sectionLabel}>Teléfono:</Text>
                    <PinkInputs
                        placeholder="7777-7777"
                        value={formData.phone}
                        onChangeText={(value) => handleInputChange('phone', value)}
                        icon={phoneIcon}
                        keyboardType="phone-pad" // Teclado numérico para teléfono
                        style={styles.inputStyle}
                        inputStyle={[
                            styles.textInput,
                            !isEditing && styles.disabledInput // Aplica estilo deshabilitado si no está editando
                        ]}
                        editable={isEditing} // Solo editable en modo edición
                    />

                    {/* Campo de correo electrónico */}
                    <Text style={styles.sectionLabel}>Correo electrónico:</Text>
                    <PinkInputs
                        placeholder="ejemplo@gmail.com"
                        value={formData.email}
                        onChangeText={(value) => handleInputChange('email', value)}
                        icon={emailIcon}
                        keyboardType="email-address" // Teclado optimizado para email
                        autoCapitalize="none" // No capitaliza automáticamente
                        style={styles.inputStyle}
                        inputStyle={[
                            styles.textInput,
                            !isEditing && styles.disabledInput
                        ]}
                        editable={isEditing}
                    />

                    {/* Campo de dirección */}
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

                {/* Sección de botones de acción */}
                <View style={styles.buttonSection}>
                    {/* Botón principal que cambia según el estado */}
                    <PinkButton
                        title={loading ? "Guardando..." : (isEditing ? "Guardar" : "Editar")}
                        onPress={handleEditToggle}
                        disabled={loading} // Deshabilitado durante carga
                        style={styles.editButton}
                    />
                    
                    {/* Botón de cancelar - solo visible en modo edición */}
                    {isEditing && (
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={cancelEdit}
                            disabled={loading} // Deshabilitado durante carga
                        >
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>

            {/* Sistema de alertas personalizadas - renderizadas condicionalmente */}
            
            {/* Alerta básica para mensajes informativos, de éxito, error, etc. */}
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

            {/* Diálogo de carga para operaciones que requieren tiempo */}
            <LoadingDialog
                visible={alertState.loading.visible}
                title={alertState.loading.title}
                message={alertState.loading.message}
                color={alertState.loading.color}
            />

            {/* Diálogo de confirmación para acciones importantes */}
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
    // Contenedor principal - ocupa toda la pantalla
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        paddingTop: 50, // Espaciado superior para área segura
    },
    
    // Estilo para centrar contenido (usado en pantalla de carga)
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    
    // Header con título y navegación
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    
    // Área clickeable del botón de retroceso
    backButton: {
        width: 24,
        height: 24,
        marginRight: 20,
    },
    
    // Icono de retroceso
    backIcon: {
        width: "100%",
        height: "100%",
        resizeMode: "contain",
    },
    
    // Título del header centrado
    headerTitle: {
        fontSize: 20,
        fontFamily: 'Poppins-SemiBold',
        color: '#333333',
        flex: 1,
        textAlign: 'center',
        marginRight: 44, // Compensación para centrar considerando el botón de retroceso
    },
    
    // Contenido principal con scroll
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    
    // Texto de carga inicial
    loadingText: {
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
        color: '#999999',
        textAlign: 'center',
    },
    
    // Sección de perfil con foto y nombre
    profileSection: {
        alignItems: 'center',
        marginBottom: 40,
    },
    
    // Contenedor de la imagen de perfil con posicionamiento relativo
    profileImageContainer: {
        position: 'relative', // Permite posicionar el botón de edición encima
        marginBottom: 15,
    },
    
    // Imagen de perfil del usuario
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50, // Hace la imagen circular
        backgroundColor: '#F0F0F0', // Fondo de respaldo
    },
    
    // Avatar por defecto cuando no hay imagen
    defaultProfileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#E8E8FF', // Fondo azul claro
        justifyContent: 'center',
        alignItems: 'center',
    },
    
    // Texto del avatar por defecto (inicial del nombre)
    defaultProfileText: {
        fontSize: 40,
        fontFamily: 'Poppins-SemiBold',
        color: '#6B73FF', // Color azul
    },
    
    // Botón de edición de foto posicionado sobre la imagen
    editProfileButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        backgroundColor: '#FDB4B7', // Color rosa
        borderRadius: 16, // Circular
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFFFFF', // Borde blanco para destacar
        
        // Sombra para elevación
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3, // Sombra en Android
    },
    
    // Icono dentro del botón de edición de foto
    editProfileIcon: {
        width: 16,
        height: 16,
        tintColor: '#FFFFFF', // Blanco para contrastar con fondo rosa
        resizeMode: 'contain',
    },
    
    // Nombre de usuario debajo de la foto
    userName: {
        fontSize: 24,
        fontFamily: 'Poppins-SemiBold',
        color: '#333333',
        textAlign: 'center',
    },
    
    // Sección que contiene todos los campos del formulario
    formSection: {
        marginBottom: 40,
        marginTop: -20, // Ajuste para reducir espaciado con la sección anterior
    },
    
    // Labels de cada campo del formulario
    sectionLabel: {
        fontSize: 14,
        fontFamily: 'Poppins-Medium',
        color: '#666666', // Gris medio
        marginBottom: 8,
        marginLeft: 20,
    },
    
    // Espaciado entre campos de entrada
    inputStyle: {
        marginBottom: 20,
    },
    
    // Estilo base para texto de inputs
    textInput: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: '#333333',
    },
    
    // Estilo para inputs deshabilitados (modo solo lectura)
    disabledInput: {
        color: '#999999', // Color gris para indicar que no es editable
        backgroundColor: '#FFFFFF',
    },
    
    // Sección que contiene los botones de acción
    buttonSection: {
        alignItems: 'center',
        paddingBottom: 40, // Espaciado inferior para evitar corte
    },
    
    // Botón principal de edición/guardado
    editButton: {
        marginBottom: 15,
    },
    
    // Botón de cancelar edición
    cancelButton: {
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25, // Forma redondeada
        borderWidth: 1,
        borderColor: '#FDB4B7', // Borde rosa
        backgroundColor: 'transparent', // Fondo transparente
        marginBottom: 20,
    },
    
    // Texto del botón de cancelar
    cancelButtonText: {
        color: '#FDB4B7', // Color rosa para contrastar con fondo transparente
        fontSize: 16,
        fontFamily: 'Poppins-Medium',
        textAlign: 'center',
    },
});