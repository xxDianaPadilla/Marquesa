import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { View, TextInput, StyleSheet, Dimensions } from 'react-native';

// Obtener dimensiones de la pantalla para responsive design
const { width: screenWidth } = Dimensions.get('window');

// Componente para insertar código de verificación de 6 dígitos en móvil
// Maneja la entrada automática entre campos y validación
const CodeInputMobile = forwardRef(({ onCodeChange, onComplete, disabled = false, error = '', onFocus, onBlur }, ref) => {
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef([]);

    // Calcular tamaño de input basado en el ancho de pantalla de forma más precisa
    const getInputSize = () => {
        // Ancho máximo del modal (400px o screenWidth - 40px)
        const modalMaxWidth = Math.min(400, screenWidth - 40);
        
        // Padding horizontal del modal (24px * 2)
        const modalPadding = 48;
        
        // Padding horizontal del container de inputs (10px * 2)
        const containerPadding = 20;
        
        // Gaps entre inputs (12px * 5)
        const totalGaps = 12 * 5;
        
        // Ancho disponible para los inputs
        const availableWidth = modalMaxWidth - modalPadding - containerPadding - totalGaps;
        
        // Dividir entre 6 inputs y limitar tamaño
        const calculatedSize = Math.floor(availableWidth / 6);
        
        // Establecer límites mínimos y máximos
        const minSize = 35;
        const maxSize = 50;
        
        return Math.max(minSize, Math.min(maxSize, calculatedSize));
    };

    // Efecto para notificar cambios en el código
    useEffect(() => {
        const codeString = code.join('');
        onCodeChange(codeString);

        // Si el código está completo, notificar
        if (codeString.length === 6 && onComplete) {
            onComplete(codeString);
        }
    }, [code, onCodeChange, onComplete]);

    // Resetea el código (función pública)
    const resetCode = () => {
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
    };

    // Exponer función reset correctamente
    useImperativeHandle(ref, () => ({
        resetCode
    }));

    // Maneja el cambio en un input específico
    const handleChange = (index, value) => {
        // Solo permitir números
        if (!/^\d*$/.test(value)) return;

        // Actualizar el código
        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        // Mover al siguiente input si hay un valor
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    // Maneja las teclas especiales (backspace)
    const handleKeyPress = (index, key) => {
        if (key === 'Backspace') {
            if (!code[index] && index > 0) {
                // Si el campo está vacío, ir al anterior
                inputRefs.current[index - 1]?.focus();
            } else {
                // Limpiar el campo actual
                const newCode = [...code];
                newCode[index] = '';
                setCode(newCode);
            }
        }
    };

    // Maneja cuando un input recibe el foco
    const handleFocus = () => {
        if (onFocus) {
            onFocus();
        }
    };

    // Maneja cuando un input pierde el foco
    const handleBlur = () => {
        if (onBlur) {
            onBlur();
        }
    };

    const inputSize = getInputSize();

    return (
        <View style={styles.container}>
            {/* Contenedor de inputs con mejor responsive */}
            <View style={[styles.inputsContainer, { paddingHorizontal: 10 }]}>
                {code.map((digit, index) => (
                    <TextInput
                        key={index}
                        ref={el => inputRefs.current[index] = el}
                        keyboardType="numeric"
                        maxLength={1}
                        value={digit}
                        onChangeText={(value) => handleChange(index, value)}
                        onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        editable={!disabled}
                        style={[
                            styles.input,
                            {
                                width: inputSize,
                                height: inputSize,
                                fontSize: inputSize > 45 ? 18 : 16, 
                            },
                            error ? styles.inputError : null,
                            disabled ? styles.inputDisabled : null
                        ]}
                        textAlign="center"
                        autoFocus={index === 0}
                    />
                ))}
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
        paddingVertical: 8,
    },
    inputsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'nowrap',
        gap: 12,
        marginBottom: 16,
        width: '100%',
    },
    input: {
        borderWidth: 2,
        borderColor: '#FDB4B7',
        borderRadius: 8,
        fontFamily: 'Poppins-SemiBold',
        color: '#333333',
        backgroundColor: '#FFFFFF',
        textAlignVertical: 'center',
        includeFontPadding: false, 
        paddingVertical: 0,
    },
    inputError: {
        borderColor: '#E53E3E',
        backgroundColor: '#FEF2F2',
    },
    inputDisabled: {
        borderColor: '#E0E0E0',
        backgroundColor: '#F8F8F8',
        color: '#999999',
    },
});

CodeInputMobile.displayName = 'CodeInputMobile';

export default CodeInputMobile;