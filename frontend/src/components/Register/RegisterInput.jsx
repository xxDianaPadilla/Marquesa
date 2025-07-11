import React, { useState, useCallback } from "react";
import { Eye, EyeOff } from "lucide-react";
import PasswordRequirements from "../PasswordRequirements";

/**
 * Componente de input personalizado para el formulario de registro
 * CORREGIDO: Manejo mejorado de estado para evitar errores de React
 * Incluye validación visual con bordes rojos cuando hay errores
 * 
 * @param {string} name - Nombre del campo
 * @param {string} type - Tipo de input (text, email, password, etc.)
 * @param {string} placeholder - Texto placeholder
 * @param {string} icon - URL del icono a mostrar
 * @param {boolean} showPassword - Si mostrar/ocultar contraseña
 * @param {Function} onTogglePassword - Función para toggle de contraseña
 * @param {string} value - Valor actual del input
 * @param {Function} onChange - Función para manejar cambios
 * @param {string} error - Mensaje de error a mostrar
 * @param {boolean} disabled - Si el input está deshabilitado
 * @param {number} maxLength - Longitud máxima del input
 * @param {Function} onFocus - Función para manejar focus (opcional)
 * @param {Function} onBlur - Función para manejar blur (opcional)
 */
const RegisterInput = ({
    name,
    type = "text",
    placeholder,
    icon,
    showPassword,
    onTogglePassword,
    value,
    onChange,
    error,
    disabled,
    maxLength,
    onFocus,
    onBlur,
    ...props
}) => {
    // Estado para controlar si mostrar el popup de requisitos de contraseña
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);

    /**
     * Maneja el evento focus del input
     * Para campos de contraseña, muestra el popup de requisitos
     */
    const handleFocus = useCallback((e) => {
        if (type === "password" && !disabled) {
            setIsPasswordFocused(true);
        }
        // Llamar función onFocus externa si existe
        if (onFocus) {
            onFocus(e);
        }
    }, [type, disabled, onFocus]);

    /**
     * Maneja el evento blur del input
     * Para campos de contraseña, oculta el popup de requisitos
     */
    const handleBlur = useCallback((e) => {
        if (type === "password") {
            setIsPasswordFocused(false);
        }
        // Llamar función onBlur externa si existe
        if (onBlur) {
            onBlur(e);
        }
    }, [type, onBlur]);

    /**
     * Maneja el toggle de mostrar/ocultar contraseña
     */
    const handleTogglePassword = useCallback(() => {
        if (onTogglePassword && !disabled) {
            onTogglePassword();
        }
    }, [onTogglePassword, disabled]);

    // Determinar el tipo de input a mostrar
    const inputType = type === "password" && showPassword ? "text" : type;

    return (
        <div className="relative mb-4">
            {/* Container del input con borde condicional para errores */}
            <div className={`flex items-center bg-white bg-opacity-50 border-2 rounded-lg px-4 py-3 transition-all duration-200 ${
                error 
                    ? 'border-red-400 bg-red-50 shadow-red-100 shadow-md' 
                    : 'border-[#FDB4B7] focus-within:border-pink-500 focus-within:shadow-pink-200 focus-within:shadow-md'
            }`}>
                {/* Ícono izquierdo con color condicional */}
                {icon && (
                    <img 
                        src={icon} 
                        alt="Icon" 
                        className={`w-5 h-5 mr-3 transition-opacity duration-200 ${
                            error ? 'opacity-70 filter brightness-75' : 'opacity-60'
                        }`}
                    />
                )}
                
                {/* Input principal con estilos de error */}
                <input
                    name={name}
                    type={inputType}
                    placeholder={placeholder}
                    value={value || ''}
                    onChange={onChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    maxLength={maxLength}
                    className={`flex-1 bg-transparent outline-none text-sm transition-colors duration-200 ${
                        error 
                            ? 'placeholder-red-400 text-red-700' 
                            : 'placeholder-gray-400 text-gray-700'
                    }`}
                    style={{ 
                        fontWeight: '500', 
                        fontFamily: 'Poppins, sans-serif', 
                        fontStyle: 'italic' 
                    }}
                    disabled={disabled}
                    {...props}
                />
                
                {/* Ícono de mostrar/ocultar contraseña */}
                {type === "password" && onTogglePassword && (
                    <button
                        type="button"
                        onClick={handleTogglePassword}
                        className={`ml-3 transition-colors duration-200 ${
                            error 
                                ? 'text-red-500 hover:text-red-600' 
                                : 'text-gray-400 hover:text-gray-600'
                        }`}
                        disabled={disabled}
                    >
                        {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                        ) : (
                            <Eye className="w-5 h-5" />
                        )}
                    </button>
                )}

                {/* Indicador de error visual en el lado derecho */}
                {error && (
                    <div className="ml-2 text-red-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                )}
            </div>
            
            {/* POPUP de requisitos de contraseña */}
            {type === "password" && isPasswordFocused && (
                <PasswordRequirements
                    password={value || ''}
                    isVisible={true}
                    className="password-requirements-container"
                />
            )}
            
            {/* Mensaje de error con animación */}
            {error && (
                <div className="text-red-500 text-sm mt-2 italic flex items-start" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    <svg className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="leading-tight">{error}</span>
                </div>
            )}
        </div>
    );
};

export default RegisterInput;