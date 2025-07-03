import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
// Iconos desde lucide-react 
import { Menu, X } from "lucide-react";
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
  // Estado para controlar si el menú móvil está abierto o cerrado
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  //Navegación para configuración
  const handleProfileClick = (e) => {
    e.preventDefault();
    navigate('/profile');
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

            <div className="col-span-6 flex justify-center">
              <div className="search-container max-w-lg">
                <input
                  type="text"
                  placeholder="¿Qué estás buscando?"
                  className="search-input"
                />
                <button className="search-button">
                  <img src={iconSearch} alt="Buscar" className="w-5 h-5" />
                </button>
              </div>
            </div>

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
                alt="Configuración"
                className="icon-style"
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
                    alt="Configuración"
                    className="icon-style mb-1"
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
    </>
  );
};

export default Header;