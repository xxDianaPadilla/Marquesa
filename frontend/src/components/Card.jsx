//esto es para el componente Card.jsx
export const Card = ({ children, className = '' }) => {
    return <div className={`rounded-2xl shadow-md bg-white ${className}`}>{children}</div>;
  };
  