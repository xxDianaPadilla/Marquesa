import React, { useState } from "react";
import { View, TextInput, StyleSheet, Image, TouchableOpacity, Platform, Modal, Text } from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';

// Componente de input reutilizable con estilo rosa, soporte para fechas y contraseñas
export default function PinkInputs({
    placeholder = "", // Texto placeholder del input, por defecto vacío
    value = "", // Valor actual del input, por defecto vacío
    onChangeText, // Función callback que se ejecuta cuando cambia el texto
    icon, // Icono que se muestra a la izquierda del input
    secureTextEntry = false, // Si es true, oculta el texto (para contraseñas)
    showPasswordToggle = false, // Si es true, muestra el botón para mostrar/ocultar contraseña
    onTogglePassword, // Función callback para alternar la visibilidad de la contraseña
    eyeIcon, // Icono de ojo abierto (mostrar contraseña)
    eyeOffIcon, // Icono de ojo cerrado (ocultar contraseña)
    keyboardType = "default", // Tipo de teclado a mostrar
    autoCapitalize = "sentences", // Configuración de capitalización automática
    style = {}, // Estilos personalizados para el contenedor
    inputStyle = {}, // Estilos personalizados para el TextInput
    iconStyle = {}, // Estilos personalizados para el icono
    isDateInput = false, // Si es true, el input funciona como selector de fecha
    dateFormat = "DD/MM/YYYY", // Formato de fecha a mostrar
    editable = true, // Si es true, el input es editable
}) {
    // Estado para controlar la visibilidad del selector de fecha
    const [showDatePicker, setShowDatePicker] = useState(false);
    // Estado para almacenar la fecha seleccionada
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Función para formatear una fecha según el formato especificado
    const formatDate = (date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();

        // Selecciona el formato de fecha basado en el prop dateFormat
        switch (dateFormat) {
            case "MM/DD/YYYY":
                return `${month}/${day}/${year}`;
            case "YYYY-MM-DD":
                return `${year}-${month}-${day}`;
            default: // DD/MM/YYYY por defecto
                return `${day}/${month}/${year}`;
        }
    };

    // Función para parsear una cadena de fecha y convertirla en objeto Date
    const parseDateFromString = (dateString) => {
        if (!dateString) return new Date();
        
        try {
            // Si el formato incluye barras diagonales (DD/MM/YYYY)
            if (dateString.includes('/')) {
                const [day, month, year] = dateString.split('/');
                return new Date(year, month - 1, day); // month - 1 porque los meses van de 0-11
            }
            // Si es formato ISO o cualquier otro formato válido
            return new Date(dateString);
        } catch (error) {
            return new Date(); // Retorna fecha actual si hay error
        }
    };

    // Función que maneja el cambio de fecha en el selector
    const handleDateChange = (event, date) => {
        // En Android, cerrar el picker inmediatamente
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }

        // Si se seleccionó una fecha válida
        if (date) {
            setSelectedDate(date);
            const formattedDate = formatDate(date);
            onChangeText(formattedDate); // Actualiza el valor del input padre
        }
    };

    // Función que maneja el press en el input de fecha
    const handleDateInputPress = () => {
        if (isDateInput && editable) {
            // Parsea la fecha actual del valor para mostrarla en el picker
            if (value) {
                setSelectedDate(parseDateFromString(value));
            }
            setShowDatePicker(true);
        }
    };

    // Renderiza un input de fecha (no editable directamente, solo por picker)
    const renderDateInput = () => (
        <TouchableOpacity
            style={styles.dateInputContainer}
            onPress={handleDateInputPress}
            activeOpacity={editable ? 0.7 : 1} // Reduce opacidad solo si es editable
            disabled={!editable}
        >
            <TextInput
                style={[
                    styles.textInput, 
                    inputStyle,
                    !editable && styles.disabledTextInput // Aplica estilo deshabilitado
                ]}
                placeholder={placeholder}
                placeholderTextColor="#999999"
                value={value}
                editable={false} // Siempre false para inputs de fecha
                pointerEvents="none" // Evita interacciones directas con el TextInput
            />
        </TouchableOpacity>
    );

    // Renderiza un input de texto regular
    const renderRegularInput = () => (
        <TextInput
            style={[
                styles.textInput, 
                inputStyle,
                !editable && styles.disabledTextInput // Aplica estilo deshabilitado
            ]}
            placeholder={placeholder}
            placeholderTextColor="#999999"
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={secureTextEntry} // Para ocultar texto en contraseñas
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            autoCorrect={false} // Desactiva corrección automática
            editable={editable}
        />
    );

    return (
        // Contenedor principal del input con estilos condicionales
        <View style={[
            styles.inputContainer, 
            style,
            !editable && styles.disabledContainer // Aplica estilo deshabilitado al contenedor
        ]}>
            {/* Icono izquierdo (opcional) */}
            {icon && (
                <Image 
                    source={icon} 
                    style={[
                        styles.inputIcon, 
                        iconStyle,
                        !editable && styles.disabledIcon // Aplica tinte deshabilitado al icono
                    ]} 
                />
            )}

            {/* Campo de texto o selector de fecha según el tipo */}
            {isDateInput ? renderDateInput() : renderRegularInput()}

            {/* Botón toggle para mostrar/ocultar contraseña (solo si está habilitado y es editable) */}
            {showPasswordToggle && editable && (
                <TouchableOpacity
                    onPress={onTogglePassword}
                    style={styles.eyeButton}
                    activeOpacity={0.7}
                >
                    <Image
                        source={secureTextEntry ? eyeIcon : eyeOffIcon} // Cambia icono según estado
                        style={styles.eyeIconImage}
                    />
                </TouchableOpacity>
            )}

            {/* Modal del Date Picker para iOS */}
            {Platform.OS === 'ios' && showDatePicker && (
                <Modal
                    transparent={true} // Permite ver el fondo
                    animationType="slide" // Animación de deslizamiento desde abajo
                    visible={showDatePicker}
                    onRequestClose={() => setShowDatePicker(false)} // Maneja el botón back de Android
                >
                    {/* Fondo semitransparente */}
                    <View style={styles.modalContainer}>
                        {/* Contenedor del picker */}
                        <View style={styles.pickerContainer}>
                            {/* Header con botones de cancelar y listo */}
                            <View style={styles.pickerHeader}>
                                {/* Botón cancelar */}
                                <TouchableOpacity
                                    onPress={() => setShowDatePicker(false)}
                                    style={styles.cancelButton}
                                >
                                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                                </TouchableOpacity>
                                {/* Botón listo */}
                                <TouchableOpacity
                                    onPress={() => {
                                        const formattedDate = formatDate(selectedDate);
                                        onChangeText(formattedDate);
                                        setShowDatePicker(false);
                                    }}
                                    style={styles.doneButton}
                                >
                                    <Text style={styles.doneButtonText}>Listo</Text>
                                </TouchableOpacity>
                            </View>
                            {/* Componente selector de fecha */}
                            <DateTimePicker
                                value={selectedDate}
                                mode="date"
                                display="spinner" // Estilo spinner para iOS
                                onChange={handleDateChange}
                                maximumDate={new Date()} // No permite fechas futuras
                                textColor="#3C3550"
                            />
                        </View>
                    </View>
                </Modal>
            )}

            {/* Date Picker nativo para Android */}
            {Platform.OS === 'android' && showDatePicker && (
                <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display="default" // Estilo nativo de Android
                    onChange={handleDateChange}
                    maximumDate={new Date()} // No permite fechas futuras
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    // Contenedor principal del input con bordes redondeados y sombra
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 25,
        borderWidth: 2,
        borderColor: '#FDB4B7', // Borde rosa característico
        paddingHorizontal: 20,
        paddingVertical: 4,
        width: '100%',
        // Sombra para iOS
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        // Elevación para Android
        elevation: 2,
    },
    // Estilo del contenedor cuando está deshabilitado
    disabledContainer: {
        backgroundColor: '#F8F8F8', // Fondo gris claro
        borderColor: '#E0E0E0', // Borde gris
        shadowOpacity: 0, // Sin sombra en iOS
        elevation: 0, // Sin elevación en Android
    },
    // Estilo del icono izquierdo
    inputIcon: {
        width: 20,
        height: 20,
        marginRight: 12,
        tintColor: '#999999', // Tinte gris
        resizeMode: 'contain',
    },
    // Estilo del icono cuando está deshabilitado
    disabledIcon: {
        tintColor: '#CCCCCC', // Tinte gris más claro
    },
    // Estilo del TextInput principal
    textInput: {
        flex: 1, // Ocupa todo el espacio disponible
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: '#3C3550', // Color de texto principal
        paddingVertical: 12,
        paddingHorizontal: 0,
    },
    // Estilo del TextInput cuando está deshabilitado
    disabledTextInput: {
        color: '#999999', // Texto gris
        backgroundColor: 'transparent',
    },
    // Contenedor específico para inputs de fecha
    dateInputContainer: {
        flex: 1,
    },
    // Estilo del botón de toggle de contraseña
    eyeButton: {
        padding: 8, // Área táctil más grande
        marginLeft: 8,
    },
    // Estilo del icono del ojo
    eyeIconImage: {
        width: 20,
        height: 20,
        tintColor: '#999999',
        resizeMode: 'contain',
    },
    // Contenedor del modal (fondo semitransparente)
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end', // Modal aparece desde abajo
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo oscuro semitransparente
    },
    // Contenedor del picker dentro del modal
    pickerContainer: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 20,
    },
    // Header del picker con botones
    pickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0', // Línea separadora
    },
    // Botón de cancelar
    cancelButton: {
        paddingHorizontal: 15,
        paddingVertical: 8,
    },
    // Texto del botón cancelar
    cancelButtonText: {
        fontSize: 16,
        color: '#999999',
        fontFamily: 'Poppins-Regular',
    },
    // Botón de confirmar con fondo rosa
    doneButton: {
        backgroundColor: '#FBB4B7',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 15,
    },
    // Texto del botón confirmar
    doneButtonText: {
        fontSize: 16,
        color: '#FFFFFF',
        fontFamily: 'Poppins-Medium',
    },
});