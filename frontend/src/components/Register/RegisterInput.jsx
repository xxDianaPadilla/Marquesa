import React, { useState, useCallback, memo } from "react";
import { Eye, EyeOff } from "lucide-react";
import PasswordRequirements from "../PasswordRequirements";

/**
 * Componente de input personalizado para el formulario de registro
 * COMPLETAMENTE OPTIMIZADO: Uso de memo, useCallback y manejo mejorado de estado
 * Incluye validación visual con bordes rojos cuando hay errores y feedback en tiempo real
 * 
 * @param {string} name - Nombre del campo para identificación
 * @param {string} type - Tipo de input (text, email, password, tel, date, etc.)
 * @param {string} placeholder - Texto placeholder a mostrar
 * @param {string} icon - URL del icono a mostrar en el lado izquierdo
 * @param {boolean} showPassword - Si mostrar/ocultar contraseña (solo para type="password")
 * @param {Function} onTogglePassword - Función para toggle de contraseña
 * @param {string} value - Valor actual del input
 * @param {Function} onChange - Función para manejar cambios en el input
 * @param {string} error - Mensaje de error a mostrar debajo del input
 * @param {boolean} disabled - Si el input está deshabilitado
 * @param {number} maxLength - Longitud máxima permitida del input
 * @param {Function} onFocus - Función para manejar evento focus (opcional)
 * @param {Function} onBlur - Función para manejar evento blur (opcional)
 * @param {boolean} required - Si el campo es requerido (para accesibilidad)
 * @param {string} autoComplete - Valor de autocompletado para el navegador
 */
const RegisterInput = memo(({
    name,
    type = "text",
    placeholder,
    icon,
    showPassword,
    onTogglePassword,
    value,
    onChange,
    error,
    disabled = false,
    maxLength,
    onFocus,
    onBlur,
    required = false,
    autoComplete,
    ...props
}) => {
    // ============ ESTADOS LOCALES ============
    
    /**
     * Estado para controlar si mostrar el popup de requisitos de contraseña
     * Solo se activa para campos de tipo password cuando están enfocados
     */
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    
    /**
     * Estado para controlar si el campo ha sido tocado por el usuario
     * Útil para mostrar validaciones solo después de interacción
     */
    const [isTouched, setIsTouched] = useState(false);

    // ============ MANEJADORES DE EVENTOS OPTIMIZADOS ============
    
    /**
     * Maneja el evento focus del input
     * Para campos de contraseña, muestra el popup de requisitos
     * Memoizada para evitar re-creaciones innecesarias
     */
    const handleFocus = useCallback((e) => {
        console.log(`📍 Focus en campo: ${name}`);
        
        // Marcar como tocado cuando el usuario interactúa
        setIsTouched(true);
        
        // Para campos de contraseña, mostrar popup de requisitos
        if (type === "password" && !disabled) {
            setIsPasswordFocused(true);
        }
        
        // Llamar función onFocus externa si existe
        if (onFocus) {
            onFocus(e);
        }
    }, [type, disabled, onFocus, name]);

    /**
     * Maneja el evento blur del input
     * Para campos de contraseña, oculta el popup de requisitos
     * Memoizada para evitar re-creaciones innecesarias
     */
    const handleBlur = useCallback((e) => {
        console.log(`📍 Blur en campo: ${name}`);
        
        // Para campos de contraseña, ocultar popup de requisitos
        if (type === "password") {
            setIsPasswordFocused(false);
        }
        
        // Llamar función onBlur externa si existe
        if (onBlur) {
            onBlur(e);
        }
    }, [type, onBlur, name]);

    /**
     * Maneja el toggle de mostrar/ocultar contraseña
     * Memoizada para evitar re-creaciones innecesarias
     */
    const handleTogglePassword = useCallback(() => {
        if (onTogglePassword && !disabled) {
            console.log(`👁️ Toggle password visibility para: ${name}`);
            onTogglePassword();
        }
    }, [onTogglePassword, disabled, name]);

    /**
     * Maneja los cambios en el input con validaciones adicionales
     * Incluye formateo automático para ciertos tipos de campos
     */
    const handleChange = useCallback((e) => {
        let { value: inputValue } = e.target;
        
        // Formateo específico según el tipo de campo
        if (name === 'phone') {
            // Formateo automático para teléfono salvadoreño
            let cleanValue = inputValue.replace(/\D/g, ''); // Solo números
            
            // Aplicar formato 7XXX-XXXX automáticamente
            if (cleanValue.length > 4) {
                cleanValue = cleanValue.slice(0, 4) + '-' + cleanValue.slice(4, 8);
            }
            
            // Limitar a 9 caracteres (7XXX-XXXX)
            if (cleanValue.length > 9) {
                cleanValue = cleanValue.slice(0, 9);
            }
            
            // Crear evento modificado con el valor formateado
            const syntheticEvent = {
                ...e,
                target: {
                    ...e.target,
                    value: cleanValue,
                    name: name
                }
            };
            
            onChange(syntheticEvent);
            return;
        }
        
        // Para otros campos, pasar el evento directamente
        onChange(e);
    }, [name, onChange]);

    // ============ CÁLCULOS Y ESTADOS DERIVADOS ============
    
    /**
     * Determina el tipo de input a mostrar
     * Para campos de contraseña, alterna entre 'password' y 'text'
     */
    const inputType = type === "password" && showPassword ? "text" : type;
    
    /**
     * Determina si debe mostrar indicador de error
     * Solo muestra error si el campo ha sido tocado y hay un error
     */
    const shouldShowError = error && isTouched;
    
    /**
     * Calcula las clases CSS para el contenedor del input
     * Incluye estados de error, focus y disabled
     */
    const containerClasses = `
        flex items-center bg-white bg-opacity-50 border-2 rounded-lg px-4 py-3 
        transition-all duration-200 relative
        ${shouldShowError 
            ? 'border-red-400 bg-red-50 shadow-red-100 shadow-md' 
            : 'border-[#FDB4B7] focus-within:border-pink-500 focus-within:shadow-pink-200 focus-within:shadow-md'
        }
        ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-text'}
    `.trim();
    
    /**
     * Calcula las clases CSS para el icono
     * Incluye estados de error y disabled
     */
    const iconClasses = `
        w-5 h-5 mr-3 transition-opacity duration-200 
        ${shouldShowError 
            ? 'opacity-70 filter brightness-75' 
            : 'opacity-60'
        }
    `.trim();
    
    /**
     * Calcula las clases CSS para el input
     * Incluye estados de error y estilos de texto
     */
    const inputClasses = `
        flex-1 bg-transparent outline-none text-sm transition-colors duration-200 
        ${shouldShowError 
            ? 'placeholder-red-400 text-red-700' 
            : 'placeholder-gray-400 text-gray-700'
        }
    `.trim();

    // ============ RENDERIZADO DEL COMPONENTE ============
    
    return (
        <div className="relative mb-4">
            {/* Container principal del input con estilos dinámicos */}
            <div className={containerClasses}>
                
                {/* Icono izquierdo (opcional) */}
                {icon && (
                    <img 
                        src={icon} 
                        alt={`Icono para ${placeholder || name}`}
                        className={iconClasses}
                    />
                )}
                
                {/* Input principal con todas las funcionalidades */}
                <input
                    name={name}
                    type={inputType}
                    placeholder={placeholder}
                    value={value || ''}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    maxLength={maxLength}
                    disabled={disabled}
                    required={required}
                    autoComplete={autoComplete}
                    className={inputClasses}
                    style={{ 
                        fontWeight: '500', 
                        fontFamily: 'Poppins, sans-serif', 
                        fontStyle: 'italic' 
                    }}
                    aria-invalid={shouldShowError ? 'true' : 'false'}
                    aria-describedby={shouldShowError ? `${name}-error` : undefined}
                    {...props}
                />
                
                {/* Botón para mostrar/ocultar contraseña */}
                {type === "password" && onTogglePassword && (
                    <button
                        type="button"
                        onClick={handleTogglePassword}
                        disabled={disabled}
                        className={`ml-3 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-pink-300 rounded p-1 ${
                            shouldShowError 
                                ? 'text-red-500 hover:text-red-600' 
                                : 'text-gray-400 hover:text-gray-600'
                        } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                        {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                        ) : (
                            <Eye className="w-5 h-5" />
                        )}
                    </button>
                )}

                {/* Indicador visual de error en el lado derecho */}
                {shouldShowError && (
                    <div className="ml-2 text-red-500" aria-hidden="true">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                )}
            </div>
            
            {/* Popup de requisitos de contraseña */}
            {type === "password" && isPasswordFocused && value && (
                <div className="relative z-50">
                    <PasswordRequirements
                        password={value || ''}
                        isVisible={true}
                        className="password-requirements-container mt-2"
                    />
                </div>
            )}
            
            {/* Mensaje de error con animación */}
            {shouldShowError && (
                <div 
                    id={`${name}-error`}
                    className="text-red-500 text-sm mt-2 italic flex items-start animate-fadeIn" 
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                    role="alert"
                    aria-live="polite"
                >
                    <svg className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="leading-tight">{error}</span>
                </div>
            )}

            {/* Indicador de caracteres restantes para campos con maxLength */}
            {maxLength && value && !shouldShowError && (
                <div className="text-xs text-gray-400 mt-1 text-right" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {value.length}/{maxLength} caracteres
                </div>
            )}
        </div>
    );
});

// Establecer displayName para debugging
RegisterInput.displayName = 'RegisterInput';

export default RegisterInput;