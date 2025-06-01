import React from "react";

const Title = ({ children }) => {
    return (
        <h1 className="text-black text-4xl font-bold italic text-center mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {children}
        </h1>
    );
};

export default Title;