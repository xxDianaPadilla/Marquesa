import React from "react";
import iconFavorites from './../../assets/favoritesIcon.png';
import iconCart from './../../assets/cartIcon.png';
import iconSettings from './../../assets/settingsIcon.png';
import iconSearch from './../../assets/searchIcon.png';
import './../../components/Header/Header.css';

const Header = () => {
  return (
    <header className="w-full border-b border-gray-300 py-4 px-6 flex items-center justify-center">
      <div className="w-full max-w-screen-xl flex items-center justify-between gap-6">

        {/* Logo + Slogan */}
        <div className="flex flex-col items-center justify-center flex-shrink-0">
          <h1 className="header-title">● M A R Q U E S A ●</h1>
          <p className="slogan">TIENDA DE REGALOS</p>
        </div>

        {/* Search Bar */}
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

        {/* Icons */}
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
