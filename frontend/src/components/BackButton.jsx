import React from "react";
import backIcon from "../assets/backIcon.png";

const BackButton = ({ onClick }) => {
    return (
        <button
            style={{ cursor: 'pointer' }}
            onClick={onClick}
            className="absolute top-6 left-6 flex items-center gap-2 text-pink-400 hover:text-pink-500 transition-colors duration-200 z-10"
        >
            <img
                src={backIcon}
                alt="Regresar"
                style={{ width: '25px', height: '25px' }}
            />
            <span
                className="text-lg font-medium"
                style={{ fontFamily: 'Poppins, sans-serif', color: "#FDB4B7" }}
            >
                Regresar
            </span>
        </button>
    );
};

export default BackButton;