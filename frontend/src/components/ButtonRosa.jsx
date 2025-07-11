// esto sirve para el componente Button.jsx
export const Button = ({ children, onClick, className = '', variant = 'solid', ...props }) => {
  return (
    <button
      onClick={onClick}
      className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition ${variant === 'ghost'
          ? 'bg-transparent hover:bg-gray-100'
          : 'bg-pink-300 hover:bg-pink-400 text-white'
        } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};