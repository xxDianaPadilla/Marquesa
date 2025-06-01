import React from "react";

const Separator = ({ text = "o" }) => {
    return (
        <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-gray-300"></div>
            <div className="px-4">
                <span
                    className="text-gray-500 text-sm font-medium"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                    {text}
                </span>
            </div>
            <div className="flex-1 h-px bg-gray-300"></div>
        </div>
    );
};

export default Separator;