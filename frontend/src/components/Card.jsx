// frontend/src/components/Card.jsx

/**
 * Componente Card - Contenedor visual reutilizable con estilo de tarjeta
 * 
 * Proporciona un contenedor con bordes redondeados, sombra y fondo blanco
 * para agrupar contenido relacionado de manera visualmente atractiva
 * 
 * @param {React.ReactNode} children - Contenido que se renderizará dentro de la tarjeta
 * @param {string} className - Clases CSS adicionales para personalizar el estilo
 */
export const Card = ({ children, className = '' }) => {
    return (
        <div className={`rounded-2xl shadow-md bg-white ${className}`}>
            {/* Renderiza el contenido pasado como children */}
            {children}
        </div>
    );
};