import React from "react";

const InfoText = ({ children }) => {
    return (
        <p className="text-sm text-center px-4 mb-6 leading-relaxed" style={{fontFamily: 'Poppins, sans-serif', color: '#999999'}}>
            {children}
        </p>
    );
};

export default InfoText;