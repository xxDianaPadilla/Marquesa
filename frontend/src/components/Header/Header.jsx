import React from "react";
// Icono de favoritos desde la carpeta "assets"
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
  return (
    <header className="w-full border-b border-gray-300 py-4 px-6 flex items-center justify-center">
      <div className="w-full max-w-screen-xl flex items-center justify-between gap-6">

        {/* Logo con el slogan */}
        <div className="flex flex-col items-center justify-center flex-shrink-0">
          <h1 className="header-title">● M A R Q U E S A ●</h1>
          <p className="slogan">TIENDA DE REGALOS</p>
        </div>

        {/* Buscador */}
        <div className="search-container flex-grow max-w-md mx-4">
          <input
            type="text"
            placeholder="¿Qué estás buscando?"
            className="search-input"
          />
          <button className="search-button">
            <img src={iconSearch} alt="Buscar" className="w-5 h-5" />
          </button>
        </div>

        {/* Iconos importados arriba */}
        <div className="flex items-center gap-8 flex-shrink-0">
          <img src={iconFavorites} alt="Favoritos" className="icon-style" />
          <img src={iconCart} alt="Carrito" className="icon-style" />
          <img src={iconSettings} alt="Configuración" className="icon-style" />
        </div>
      </div>
    </header>
  );
};

export default Header;
