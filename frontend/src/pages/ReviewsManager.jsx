import React, { useState } from "react";
import NavbarAdmin from "../components/NavbarAdmin";

const ReviewsManagerLayout = ({ children }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar con control de expansión */}
      <NavbarAdmin isExpanded={isExpanded} setIsExpanded={setIsExpanded} />

      {/* Contenido principal con margen dinámico */}
      <div
        style={{ marginLeft: isExpanded ? "12rem" : "4rem" }}
        className="transition-margin duration-300"
      >
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

const ReviewsManager = () => {
  return (
    <ReviewsManagerLayout>
      {/* Aquí puedes agregar el contenido de ReviewsManager cuando lo tengas */}
      <h1 className="text-2xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
        Gestión de Reseñas
      </h1>
    </ReviewsManagerLayout>
  );
};

export default ReviewsManager;
