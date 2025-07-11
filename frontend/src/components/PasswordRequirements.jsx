import React, { useMemo } from 'react';

/**
 * Componente que muestra los requisitos de la contraseña con validación visual
 * CORREGIDO: Uso de useMemo para optimizar renderizado y evitar errores de React
 * Se muestra como un popup flotante cuando el campo de contraseña está enfocado
 * 
 * @param {string} password - La contraseña actual para validar
 * @param {boolean} isVisible - Si el componente debe mostrarse
 * @param {string} className - Clases CSS adicionales
 */
const PasswordRequirements = ({ password = '', isVisible = false, className = "" }) => {
  /**
   * Función que valida todos los requisitos de la contraseña
   * Memoizada para evitar recálculos innecesarios
   */
  const validation = useMemo(() => {
    const pwd = password || '';
    return {
      minLength: pwd.length >= 8,
      hasUppercase: /[A-Z]/.test(pwd),
      hasLowercase: /[a-z]/.test(pwd),
      hasNumber: /\d/.test(pwd),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
    };
  }, [password]);

  // Array de requisitos con sus validaciones - memoizado
  const requirements = useMemo(() => [
    {
      label: "Al menos 8 caracteres",
      isValid: validation.minLength,
      icon: "📏"
    },
    {
      label: "Una letra mayúscula",
      isValid: validation.hasUppercase,
      icon: "🔤"
    },
    {
      label: "Una letra minúscula", 
      isValid: validation.hasLowercase,
      icon: "🔡"
    },
    {
      label: "Un número",
      isValid: validation.hasNumber,
      icon: "🔢"
    },
    {
      label: "Un carácter especial",
      isValid: validation.hasSpecialChar,
      icon: "🔣"
    }
  ], [validation]);

  // Calcular cuántos requisitos se cumplen - memoizado
  const { validCount, totalCount, isComplete } = useMemo(() => {
    const valid = requirements.filter(req => req.isValid).length;
    const total = requirements.length;
    return {
      validCount: valid,
      totalCount: total,
      isComplete: valid === total
    };
  }, [requirements]);

  // No renderizar si no es visible
  if (!isVisible) return null;

  return (
    <div className={`password-requirements-popup ${className}`}>
      {/* Header con título y progreso */}
      <div className="requirements-header">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🔐</span>
          <span className="requirements-title">Requisitos de seguridad</span>
          <div className="requirements-progress">
            <span className={`progress-text ${isComplete ? 'complete' : 'incomplete'}`}>
              {validCount}/{totalCount}
            </span>
          </div>
        </div>
      </div>

      {/* Lista de requisitos */}
      <div className="requirements-list">
        {requirements.map((requirement, index) => (
          <div
            key={`requirement-${index}`}
            className={`requirement-item ${requirement.isValid ? 'valid' : 'invalid'}`}
          >
            {/* Icono de estado */}
            <div className="requirement-icon">
              {requirement.isValid ? (
                <span className="check-icon">✓</span>
              ) : (
                <span className="x-icon">✗</span>
              )}
            </div>
            
            {/* Emoji del requisito */}
            <span className="requirement-emoji">{requirement.icon}</span>
            
            {/* Texto del requisito */}
            <span className="requirement-text">{requirement.label}</span>
          </div>
        ))}
      </div>

      {/* Barra de progreso visual */}
      <div className="progress-bar-container">
        <div className="progress-bar">
          <div 
            className={`progress-fill ${isComplete ? 'complete' : ''}`}
            style={{ width: `${(validCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      {/* Mensaje motivacional */}
      <div className="motivation-text">
        {isComplete ? (
          <span className="success-message">🎉 ¡Contraseña segura!</span>
        ) : (
          <span className="incomplete-message">
            {totalCount - validCount} requisito{totalCount - validCount !== 1 ? 's' : ''} restante{totalCount - validCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  );
};

export default PasswordRequirements;