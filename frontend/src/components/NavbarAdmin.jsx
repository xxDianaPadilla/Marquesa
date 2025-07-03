import React, { useContext, useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import marquesaMiniLogo from '../assets/marquesaMiniLogo.png';
import statisticsIcon from '../assets/statisticsIcon.png';
import flowerIcon from '../assets/flowerIcon.png';
import shoppingCartIcon from '../assets/ShoppingCartIcon.png';
import mediaIcon from '../assets/mediaIcon.png';
import reviewsIcon from '../assets/reviewsIcon.png';
import categoriesIcon from '../assets/categoriesIcon.png';
import logoutIcon from '../assets/logout.png';

const NavbarAdmin = () => {
    const navigate = useNavigate();
    const location = useLocation(); 

    const handleMediaClick = (e) => {
        e.preventDefault();
        navigate('/media');
    };

    const handleDashboardClick = (e) => {
        e.preventDefault();
        navigate('/dashboard');
    };

    const handleProductsClick = (e) => {
        e.preventDefault();
        navigate('/products');
    };

    const handleSalesClick = (e) => {
        e.preventDefault();
        navigate('/sales');
    };

    const handleReviewsClick = (e) => {
        e.preventDefault();
        navigate('/reviews');
    };

    const handleCategoriesClick = (e) => {
        e.preventDefault();
        navigate('/categories');
    };

    const { logout, loading: authLoading } = useAuth();

    const handleLogout = async () => {
        const result = await logout();
        if (result.success) {
            console.log('Sesión cerrada correctamente');
            navigate('/login');
        } else {
            console.error('Error al cerrar sesión:', result.error);
        }
    };

    // Función para determinar si un botón está activo
    const isActive = (path) => {
        return location.pathname === path;
    };

    // Función para obtener las clases del botón
    const getButtonClasses = (path) => {
        const baseClasses = "w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 group";
        const activeClasses = "bg-white/30 shadow-inner";
        const hoverClasses = "hover:bg-white/20";
        
        return isActive(path) 
            ? `${baseClasses} ${activeClasses}` 
            : `${baseClasses} ${hoverClasses}`;
    };

    // Función para obtener las clases del icono
    const getIconClasses = (path) => {
        const baseClasses = "w-5 h-5 object-contain filter brightness-0 invert transition-transform duration-200";
        const activeClasses = "scale-110";
        const hoverClasses = "group-hover:scale-110";
        
        return isActive(path) 
            ? `${baseClasses} ${activeClasses}` 
            : `${baseClasses} ${hoverClasses}`;
    };

    return (
        <div className="fixed left-0 top-5 bottom-5 w-16 bg-gradient-to-b from-[#FF7260] via-[#FF9A8B] to-[#FF7260] shadow-lg z-30 rounded-r-2xl">
            <div className="flex flex-col items-center py-4 h-full">
                {/* Logo */}
                <div className="mb-6">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center">
                        <img
                            src={marquesaMiniLogo}
                            alt="Logo"
                            className="w-10 h-10 object-contain"
                        />
                    </div>
                </div>

                {/* Navigation Icons */}
                <nav className="flex flex-col space-y-4 flex-1">
                    {/* Statistics Icon */}
                    <button 
                        className={getButtonClasses('/dashboard')}
                        onClick={handleDashboardClick}
                    >
                        <img
                            src={statisticsIcon}
                            alt="Estadísticas"
                            className={getIconClasses('/dashboard')}
                        />
                    </button>

                    {/* Flower Icon */}
                    <button 
                        className={getButtonClasses('/products')}
                        onClick={handleProductsClick}
                    >
                        <img
                            src={flowerIcon}
                            alt="Flores"
                            className={getIconClasses('/products')}
                        />
                    </button>

                    {/* Shopping Cart Icon */}
                    <button 
                        className={getButtonClasses('/sales')}
                        onClick={handleSalesClick}
                    >
                        <img
                            src={shoppingCartIcon}
                            alt="Carrito"
                            className={getIconClasses('/sales')}
                        />
                    </button>

                    {/* Media Icon */}
                    <button 
                        className={getButtonClasses('/media')}
                        onClick={handleMediaClick}
                    >
                        <img
                            src={mediaIcon}
                            alt="Media"
                            className={getIconClasses('/media')}
                        />
                    </button>

                    {/* Reviews Icon */}
                    <button 
                        className={getButtonClasses('/reviews')}
                        onClick={handleReviewsClick}
                    >
                        <img
                            src={reviewsIcon}
                            alt="Reseñas"
                            className={getIconClasses('/reviews')}
                        />
                    </button>

                    {/* Categories Icon */}
                    <button 
                        className={getButtonClasses('/categories')}
                        onClick={handleCategoriesClick}
                    >
                        <img
                            src={categoriesIcon}
                            alt="Categorías"
                            className={getIconClasses('/categories')}
                        />
                    </button>
                </nav>

                {/* Logout Icon - Bottom */}
                <div className="mt-auto">
                    <button className="w-10 h-10 flex items-center justify-center hover:bg-white/20 rounded-lg transition-colors duration-200 group">
                        <img
                            onClick={handleLogout}
                            src={logoutIcon}
                            alt="Cerrar sesión"
                            className="w-5 h-5 object-contain filter brightness-0 invert group-hover:scale-110 transition-transform duration-200"
                        />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NavbarAdmin;