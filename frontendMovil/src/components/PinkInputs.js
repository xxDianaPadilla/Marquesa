import React, { useState } from "react";
import { View, TextInput, StyleSheet, Image, TouchableOpacity, Platform, Modal, Text } from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';

export default function PinkInputs({
    placeholder = "",
    value = "",
    onChangeText,
    icon,
    secureTextEntry = false,
    showPasswordToggle = false,
    onTogglePassword,
    eyeIcon,
    eyeOffIcon,
    keyboardType = "default",
    autoCapitalize = "sentences",
    style = {},
    inputStyle = {},
    iconStyle = {},
    isDateInput = false,
    dateFormat = "DD/MM/YYYY",
    editable = true,
}) {
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());

    const formatDate = (date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();

        switch (dateFormat) {
            case "MM/DD/YYYY":
                return `${month}/${day}/${year}`;
            case "YYYY-MM-DD":
                return `${year}-${month}-${day}`;
            default:
                return `${day}/${month}/${year}`;
        }
    };

    const parseDateFromString = (dateString) => {
        if (!dateString) return new Date();
        
        try {
            // Si es formato DD/MM/YYYY
            if (dateString.includes('/')) {
                const [day, month, year] = dateString.split('/');
                return new Date(year, month - 1, day);
            }
            // Si es formato ISO o otro
            return new Date(dateString);
        } catch (error) {
            return new Date();
        }
    };

    const handleDateChange = (event, date) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }

        if (date) {
            setSelectedDate(date);
            const formattedDate = formatDate(date);
            onChangeText(formattedDate);
        }
    };

    const handleDateInputPress = () => {
        if (isDateInput && editable) {
            // Parseamos la fecha actual del valor para mostrarla en el picker
            if (value) {
                setSelectedDate(parseDateFromString(value));
            }
            setShowDatePicker(true);
        }
    };

    const renderDateInput = () => (
        <TouchableOpacity
            style={styles.dateInputContainer}
            onPress={handleDateInputPress}
            activeOpacity={editable ? 0.7 : 1}
            disabled={!editable}
        >
            <TextInput
                style={[
                    styles.textInput, 
                    inputStyle,
                    !editable && styles.disabledTextInput
                ]}
                placeholder={placeholder}
                placeholderTextColor="#999999"
                value={value}
                editable={false}
                pointerEvents="none"
            />
        </TouchableOpacity>
    );

    const renderRegularInput = () => (
        <TextInput
            style={[
                styles.textInput, 
                inputStyle,
                !editable && styles.disabledTextInput
            ]}
            placeholder={placeholder}
            placeholderTextColor="#999999"
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            autoCorrect={false}
            editable={editable}
        />
    );

    return (
        <View style={[
            styles.inputContainer, 
            style,
            !editable && styles.disabledContainer
        ]}>
            {/* Icono izquierdo */}
            {icon && (
                <Image 
                    source={icon} 
                    style={[
                        styles.inputIcon, 
                        iconStyle,
                        !editable && styles.disabledIcon
                    ]} 
                />
            )}

            {/* Campo de texto o selector de fecha */}
            {isDateInput ? renderDateInput() : renderRegularInput()}

            {/* Botón toggle para contraseña */}
            {showPasswordToggle && editable && (
                <TouchableOpacity
                    onPress={onTogglePassword}
                    style={styles.eyeButton}
                    activeOpacity={0.7}
                >
                    <Image
                        source={secureTextEntry ? eyeIcon : eyeOffIcon}
                        style={styles.eyeIconImage}
                    />
                </TouchableOpacity>
            )}

            {/* Date Picker Modal para iOS */}
            {Platform.OS === 'ios' && showDatePicker && (
                <Modal
                    transparent={true}
                    animationType="slide"
                    visible={showDatePicker}
                    onRequestClose={() => setShowDatePicker(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.pickerContainer}>
                            <View style={styles.pickerHeader}>
                                <TouchableOpacity
                                    onPress={() => setShowDatePicker(false)}
                                    style={styles.cancelButton}
                                >
                                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                                </TouchableOpacity>
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
                            <DateTimePicker
                                value={selectedDate}
                                mode="date"
                                display="spinner"
                                onChange={handleDateChange}
                                maximumDate={new Date()}
                                textColor="#3C3550"
                            />
                        </View>
                    </View>
                </Modal>
            )}

            {/* Date Picker para Android */}
            {Platform.OS === 'android' && showDatePicker && (
                <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 25,
        borderWidth: 2,
        borderColor: '#FDB4B7',
        paddingHorizontal: 20,
        paddingVertical: 4,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    disabledContainer: {
        backgroundColor: '#F8F8F8',
        borderColor: '#E0E0E0',
        shadowOpacity: 0,
        elevation: 0,
    },
    inputIcon: {
        width: 20,
        height: 20,
        marginRight: 12,
        tintColor: '#999999',
        resizeMode: 'contain',
    },
    disabledIcon: {
        tintColor: '#CCCCCC',
    },
    textInput: {
        flex: 1,
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: '#3C3550',
        paddingVertical: 12,
        paddingHorizontal: 0,
    },
    disabledTextInput: {
        color: '#999999',
        backgroundColor: 'transparent',
    },
    dateInputContainer: {
        flex: 1,
    },
    eyeButton: {
        padding: 8,
        marginLeft: 8,
    },
    eyeIconImage: {
        width: 20,
        height: 20,
        tintColor: '#999999',
        resizeMode: 'contain',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    pickerContainer: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 20,
    },
    pickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    cancelButton: {
        paddingHorizontal: 15,
        paddingVertical: 8,
    },
    cancelButtonText: {
        fontSize: 16,
        color: '#999999',
        fontFamily: 'Poppins-Regular',
    },
    doneButton: {
        backgroundColor: '#FBB4B7',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 15,
    },
    doneButtonText: {
        fontSize: 16,
        color: '#FFFFFF',
        fontFamily: 'Poppins-Medium',
    },
});