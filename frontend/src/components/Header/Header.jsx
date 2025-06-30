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
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  const handleProfileClick = (e) => {
    e.preventDefault();
    navigate('/profile');
  };

  const handleSavesClick = (e) => {
    e.preventDefault();
    navigate('/saves');
  };

  const handleCategoryProductsClick = (e) => {
    e.preventDefault();
    navigate('/categoryProducts');
  };

  return (
    <header className="w-full border-b border-gray-300 py-4 px-6">
      <div className="w-full max-w-screen-xl mx-auto">
        {/* Grid layout para mejor control del espacio */}
        <div className="grid grid-cols-12 items-center gap-4">

          {/* Logo - ocupa 3 columnas */}
          <div className="col-span-3 flex flex-col items-start" style={{ cursor: 'pointer' }} onClick={handleCategoryProductsClick}>
            <h1 className="header-title text-lg">● MARQUESA ●</h1>
            <p className="slogan text-xs ml-8">TIENDA DE REGALOS</p>
          </div>

          {/* Buscador - ocupa 6 columnas (centro) */}
          <div className="col-span-6 flex justify-center">
            <div className="search-container w-full max-w-lg">
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

          {/* Iconos - ocupa 3 columnas */}
          <div className="col-span-3 flex items-center justify-end gap-8">
            <img src={iconFavorites} alt="Favoritos" className="icon-style" onClick={handleSavesClick} style={{ cursor: 'pointer' }} />
            <img src={iconCart} alt="Carrito" className="icon-style" />
            <img src={iconSettings} alt="Configuración" className="icon-style" onClick={handleProfileClick} style={{ cursor: 'pointer' }} />
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;