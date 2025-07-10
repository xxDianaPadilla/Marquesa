import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

/**
 * Componente para insertar código de verificación de 6 dígitos
 * Maneja la entrada automática entre campos y validación
 */
const CodeInput = forwardRef(({ onCodeChange, onComplete, disabled = false, error = '' }, ref) => {
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef([]);

    // Efecto para notificar cambios en el código
    useEffect(() => {
        const codeString = code.join('');
        onCodeChange(codeString);

        // Si el código está completo, notificar
        if (codeString.length === 6 && onComplete) {
            onComplete(codeString);
        }
    }, [code, onCodeChange, onComplete]);

    /**
     * Resetea el código (función pública)
     */
    const resetCode = () => {
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
    };

    // Exponer función reset correctamente
    useImperativeHandle(ref, () => ({
        resetCode
    }));

    /**
     * Maneja el cambio en un input específico
     * @param {number} index - Índice del input
     * @param {string} value - Valor ingresado
     */
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

    /**
     * Maneja las teclas especiales (backspace, paste, etc.)
     * @param {number} index - Índice del input
     * @param {KeyboardEvent} e - Evento de teclado
     */
    const handleKeyDown = (index, e) => {
        // Manejar backspace
        if (e.key === 'Backspace') {
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
        
        // Manejar flechas
        if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        if (e.key === 'ArrowRight' && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    /**
     * Maneja el pegado de código completo
     * @param {ClipboardEvent} e - Evento de pegado
     */
    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text');
        
        // Validar que sean solo números y de 6 dígitos
        if (/^\d{6}$/.test(pastedData)) {
            const newCode = pastedData.split('');
            setCode(newCode);
            
            // Enfocar el último input
            inputRefs.current[5]?.focus();
        }
    };

    return (
        <div className="w-full">
            {/* Contenedor de inputs */}
            <div className="flex justify-center gap-3 mb-4">
                {code.map((digit, index) => (
                    <input
                        key={index}
                        ref={el => inputRefs.current[index] = el}
                        type="text"
                        inputMode="numeric"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        disabled={disabled}
                        className={`w-12 h-12 text-center text-lg font-bold border-2 rounded-lg 
                                  transition-all duration-200 focus:outline-none
                                  ${error 
                                    ? 'border-red-400 bg-red-50 text-red-800' 
                                    : disabled
                                      ? 'border-gray-200 bg-gray-100 text-gray-400'
                                      : 'border-gray-300 bg-white text-gray-800 focus:border-pink-400 focus:ring-2 focus:ring-pink-200'
                                  }`}
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                    />
                ))}
            </div>

            {/* Mensaje de error */}
            {error && (
                <div className="text-center">
                    <p className="text-red-500 text-sm flex items-center justify-center" 
                       style={{ fontFamily: 'Poppins, sans-serif' }}>
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {error}
                    </p>
                </div>
            )}

            {/* Instrucciones */}
            <div className="text-center mt-2">
                <p className="text-gray-500 text-xs" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Ingresa el código de 6 dígitos enviado a tu correo
                </p>
            </div>
        </div>
    );
});

CodeInput.displayName = 'CodeInput';

export default CodeInput;