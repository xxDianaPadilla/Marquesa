// frontend/src/components/ButtonRosa.jsx

/**
 * Componente Button - Botón reutilizable con tema rosa
 * 
 * Este componente sirve como complemento/alternativa al componente Button.jsx principal
 * Proporciona un botón con estilos específicos del tema rosa de la aplicación
 * 
 * @param {React.ReactNode} children - Contenido del botón (texto, iconos, etc.)
 * @param {function} onClick - Función que se ejecuta al hacer clic en el botón
 * @param {string} className - Clases CSS adicionales
 * @param {string} variant - Variante del botón ('solid' para fondo sólido, 'ghost' para transparente)
 * @param {object} props - Props adicionales que se pasan al elemento button
 */
export const Button = ({ children, onClick, className = '', variant = 'solid', ...props }) => {
  return (
    <button
      onClick={onClick}
      className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition ${
        variant === 'ghost'
          ? 'bg-transparent hover:bg-gray-100'  // Estilo ghost: fondo transparente
          : 'bg-pink-300 hover:bg-pink-400 text-white'  // Estilo sólido: fondo rosa
        } ${className}`}
      {...props}
    >
      {/* Renderiza el contenido del botón */}
      {children}
    </button>
  );
};