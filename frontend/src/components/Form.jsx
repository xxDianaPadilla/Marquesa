import React from "react";

const Form = ({children}) => {
    return (
        <div className="bg-white bg-opacity-80 rounded-lg shadow-lg p-20 w-full max-w-xl mx-auto">
            {children}
        </div>
    );
};

export default Form;