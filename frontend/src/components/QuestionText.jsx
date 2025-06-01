import React from "react";

const QuestionText = ({
    question = "¿No tienes una cuenta aún?",
    linkText = "Registrate",
    onLinkClick
}) => {
    return (
        <div className="text-center mt-6">
            <span
                className="text-sm text-gray-600 italic font-medium"
                style={{ fontFamily: 'Poppins, sans-serif' }}
            >
                {question}
            </span>
            <button
                onClick={onLinkClick}
                className="text-sm font-semibold italic ml-1 hover:underline transition-all duration-200"
                style={{
                    color: '#FF6A5F',
                    fontFamily: 'Poppins, sans-serif'
                }}
            >
                {linkText}
            </button>
        </div>
    );
};

export default QuestionText;