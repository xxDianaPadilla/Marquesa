import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import marquesaMiniLogo from "../assets/marquesaMiniLogo.png";
import statisticsIcon from "../assets/statisticsIcon.png";
import flowerIcon from "../assets/flowerIcon.png";
import shoppingCartIcon from "../assets/ShoppingCartIcon.png";
import mediaIcon from "../assets/mediaIcon.png";
import reviewsIcon from "../assets/reviewsIcon.png";
import categoriesIcon from "../assets/categoriesIcon.png";
import logoutIcon from "../assets/logout.png";

// Componente para la barra de navegación del administrador
// Permite navegar entre diferentes secciones del panel de administración
const NavbarAdmin = ({ isExpanded, setIsExpanded }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  // Función para manejar el toggle del menú y guardarlo en localStorage
  const handleToggleMenu = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    localStorage.setItem("adminMenuExpanded", JSON.stringify(newExpandedState));
  };

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      console.log("Sesión cerrada correctamente");
      navigate("/login");
    } else {
      console.error("Error al cerrar sesión:", result.error);
    }
  };

  const isActive = (path) => location.pathname === path;

  const navItems = [
    // Aquí agregamos el toggle/logo como primer botón:
    {
      path: null,
      icon: marquesaMiniLogo,
      label: isExpanded ? "" : "Expandir menú",
      onClick: handleToggleMenu,
      isToggle: true,
    },
    { path: "/dashboard", icon: statisticsIcon, label: "Dashboard" },
    { path: "/products", icon: flowerIcon, label: "Productos" },
    { path: "/sales", icon: shoppingCartIcon, label: "Ventas" },
    { path: "/media", icon: mediaIcon, label: "Media" },
    { path: "/reviews", icon: reviewsIcon, label: "Reseñas" },
    { path: "/categories", icon: categoriesIcon, label: "Categorías" },
  ];

  return (
    <div
      className={`fixed top-5 bottom-5 left-0 z-30 bg-gradient-to-b from-[#FF7260] via-[#FF9A8B] to-[#FF7260] rounded-r-2xl shadow-lg transition-all duration-300
            ${isExpanded ? "w-48" : "w-16"}`}
    >
      <div className="flex flex-col h-full py-4 px-2">
        {/* Nav Items */}
        <nav className="flex flex-col space-y-2 flex-1">
          {navItems.map(({ path, icon, label, onClick, isToggle }) => {
            const handleClick = onClick ? onClick : () => navigate(path);
            const activeClass = isToggle
              ? ""
              : isActive(path)
              ? "bg-white/30 shadow-inner"
              : "";
            return (
              <button
                key={label}
                onClick={handleClick}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 group
                ${activeClass} hover:bg-white/20`}
                aria-label={label}
              >
                <img
                  src={icon}
                  alt={label}
                  className={`object-contain transition-transform duration-200 ${
                    isToggle
                      ? "w-7 h-7"
                      : `w-5 h-5 filter brightness-0 invert ${
                          isActive(path) ? "scale-110" : "group-hover:scale-110"
                        }`
                  }`}
                />
                {isExpanded && (
                  <span className="text-white text-sm">{label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div>
          <button
            onClick={handleLogout}
            className={`flex items-center gap-2 hover:bg-white/20 rounded-lg transition-all duration-200 group
      ${isExpanded ? "px-3 py-2" : "p-3 justify-center w-full"}`}
            aria-label="Cerrar sesión"
          >
            <img
              src={logoutIcon}
              alt="Cerrar sesión"
              className="w-5 h-5 object-contain filter brightness-0 invert transition-transform duration-200 group-hover:scale-110"
            />
            {isExpanded && (
              <span className="text-white text-sm">Cerrar sesión</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NavbarAdmin;
