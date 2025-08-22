import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
// Iconos desde lucide-react 
import { Menu, X, User, LogIn } from "lucide-react";
// Iconos de favoritos desde la carpeta "assets"
import iconFavorites from './../../assets/favoritesIcon.png';
// Icono del carrito desde la carpeta "assets"
import iconCart from './../../assets/cartIcon.png';
// Icono de configuraciones desde la carpeta "assets"
import iconSettings from './../../assets/settingsIcon.png';
// Icono de la lupa desde la carpeta "assets"
import iconSearch from './../../assets/searchIcon.png';
// Importe el css del header
import './../../components/Header/Header.css';

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth(); // Obtener estado de autenticación
  
  // Estado para controlar si el menú móvil está abierto o cerrado
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Estado para controlar el modal de autenticación
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Navegación para configuración con verificación de autenticación
  const handleProfileClick = (e) => {
    e.preventDefault();
    
    // Si está cargando, no hacer nada
    if (loading) {
      return;
    }
    
    // Si el usuario está autenticado, ir al perfil
    if (isAuthenticated) {
      navigate('/profile');
    } else {
      // Si no está autenticado, mostrar modal
      setShowAuthModal(true);
    }
  };

  // Función para manejar el clic en "Iniciar Sesión" del modal
  const handleLoginRedirect = () => {
    setShowAuthModal(false);
    navigate('/login');
  };

  // Función para cerrar el modal
  const closeAuthModal = () => {
    setShowAuthModal(false);
  };

  //Navegación para favoritos
  const handleSavesClick = (e) => {
    e.preventDefault();
    navigate('/saves');
  };

  //Navegación para inicio
  const handleCategoryProductsClick = (e) => {
    e.preventDefault();
    navigate('/');
  };

  const handleShoppingCartClick = (e) => {
    e.preventDefault();
    navigate('/shoppingCart');
  };

  // Función para abrir/cerrar el menú hamburguesa en móvil
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="w-full border-b border-gray-300 py-4 px-6">
        <div className="w-full max-w-screen-xl mx-auto">

          {/* Diseño para pantallas grandes (Desktop) */}
          <div className="hidden md:grid grid-cols-12 items-center gap-4">
            <div className="col-span-3 flex flex-col items-start cursor-pointer" onClick={handleCategoryProductsClick}>
              <h1 className="header-title">● MARQUESA ●</h1>
              <p className="slogan">TIENDA DE REGALOS</p>
            </div>

            <div className="col-span-6 flex justify-center"></div>

            <div className="col-span-3 flex items-center justify-end gap-8">
              <img
                src={iconFavorites}
                alt="Favoritos"
                className="icon-style"
                onClick={handleSavesClick}
              />
              <img
                src={iconCart}
                alt="Carrito"
                className="icon-style"
                onClick={handleShoppingCartClick}
              />
              <img
                src={iconSettings}
                alt="Perfil"
                className={`icon-style ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                onClick={handleProfileClick}
              />
            </div>
          </div>

          {/* Diseño para móvil */}
          <div className="md:hidden flex items-center justify-between">
            <div className="flex flex-col items-start cursor-pointer flex-1" onClick={handleCategoryProductsClick}>
              <h1 className="header-title">● MARQUESA ●</h1>
              <p className="slogan">TIENDA DE REGALOS</p>
            </div>

            {/* Botón hamburguesa */}
            <button
              className="hamburger-button"
              onClick={toggleMenu}
              aria-label="Menú"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-gray-800" />
              ) : (
                <Menu className="w-6 h-6 text-gray-800" />
              )}
            </button>
          </div>

          {/* Menú móvil desplegable */}
          <div className={`mobile-menu md:hidden ${isMenuOpen ? 'open' : ''}`}>
            <div className="px-6 space-y-4">
              {/* Buscador en menú móvil */}
              <div className="search-container">
                <input
                  type="text"
                  placeholder="¿Qué estás buscando?"
                  className="search-input"
                />
                <button className="search-button">
                  <img src={iconSearch} alt="Buscar" className="w-4 h-4" />
                </button>
              </div>

              {/* Iconos en menú móvil */}
              <div className="flex items-center justify-center gap-8 pt-2">
                <div className="flex flex-col items-center">
                  <img
                    src={iconFavorites}
                    alt="Favoritos"
                    className="icon-style mb-1"
                    onClick={(e) => {
                      handleSavesClick(e);
                      closeMenu();
                    }}
                  />
                </div>

                <div className="flex flex-col items-center">
                  <img
                    src={iconCart}
                    alt="Carrito"
                    className="icon-style mb-1"
                    onClick={(e) => {
                      handleShoppingCartClick(e);
                      closeMenu();
                    }}
                  />
                </div>

                <div className="flex flex-col items-center">
                  <img
                    src={iconSettings}
                    alt="Perfil"
                    className={`icon-style mb-1 ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    onClick={(e) => {
                      handleProfileClick(e);
                      closeMenu();
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Modal de Autenticación */}
      {showAuthModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="bg-white rounded-lg shadow-xl p-6 mx-4 max-w-sm w-full">
            {/* Header del modal */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <User className="w-6 h-6 text-gray-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-800">
                  Acceso Requerido
                </h2>
              </div>
              <button
                onClick={closeAuthModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                style={{cursor: 'pointer'}}
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="mb-6">
              <p className="text-gray-600 text-center">
                Para acceder a tu perfil necesitas iniciar sesión
              </p>
            </div>

            {/* Botones del modal */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleLoginRedirect}
                style={{cursor: 'pointer'}}
                className="w-full bg-pink-300 hover:bg-pink-400 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Iniciar Sesión
              </button>
              
              <button
                onClick={closeAuthModal}
                style={{cursor: 'pointer'}}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 px-4 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay para cerrar el modal al hacer clic fuera */}
      {showAuthModal && (
        <div
          className="fixed inset-0 z-40"
          onClick={closeAuthModal}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default Header;