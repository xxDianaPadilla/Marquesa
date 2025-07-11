import React from "react";

// Componente de formulario
// Este componente permite crear un formulario con un diseño estilizado
const Form = ({ children, onSubmit }) => {
    return (
        <form onSubmit={onSubmit} className="bg-white bg-opacity-80 rounded-lg shadow-lg p-20 w-full max-w-xl mx-auto">
            {children}
        </form>
    );
};

export default Form;