import React from "react";
import { Eye, EyeOff } from "lucide-react";

/**
 * Componente de input personalizado para el formulario de registro
 * Incluye validación visual, iconos y manejo de contraseñas
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
    ...props
}) => {
    return (
        <div className="relative mb-4">
            {/* Container del input con estilo de foco */}
            <div className={`flex items-center bg-white bg-opacity-50 border rounded-lg px-4 py-3 focus-within:border-pink-500 transition-colors ${
                error ? 'border-red-400' : 'border-[#FDB4B7]'
            }`}>
                {/* Ícono izquierdo */}
                {icon && (
                    <img 
                        src={icon} 
                        alt="Icon" 
                        className="w-5 h-5 mr-3 opacity-60"
                    />
                )}
                
                {/* Input principal */}
                <input
                    name={name}
                    type={type === "password" && showPassword ? "text" : type}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    maxLength={maxLength}
                    className="flex-1 bg-transparent outline-none placeholder-gray-400 text-sm"
                    style={{ 
                        color: '#999999', 
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
                        onClick={onTogglePassword}
                        className="ml-3 text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={disabled}
                    >
                        {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                        ) : (
                            <Eye className="w-5 h-5" />
                        )}
                    </button>
                )}
            </div>
            
            {/* Mensaje de error */}
            {error && (
                <div className="text-red-500 text-sm mt-1 italic flex items-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                </div>
            )}
        </div>
    );
};

export default RegisterInput;