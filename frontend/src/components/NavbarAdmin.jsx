import React from "react";
import marquesaMiniLogo from '../assets/marquesaMiniLogo.png';
import statisticsIcon from '../assets/statisticsIcon.png';
import flowerIcon from '../assets/flowerIcon.png';
import shoppingCartIcon from '../assets/ShoppingCartIcon.png';
import mediaIcon from '../assets/mediaIcon.png';
import reviewsIcon from '../assets/reviewsIcon.png';
import categoriesIcon from '../assets/categoriesIcon.png';
import logoutIcon from '../assets/logout.png';

const NavbarAdmin = () => {
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
                    <button className="w-10 h-10 flex items-center justify-center hover:bg-white/20 rounded-lg transition-colors duration-200 group">
                        <img
                            src={statisticsIcon}
                            alt="Estadísticas"
                            className="w-5 h-5 object-contain filter brightness-0 invert group-hover:scale-110 transition-transform duration-200"
                        />
                    </button>

                    {/* Flower Icon */}
                    <button className="w-10 h-10 flex items-center justify-center hover:bg-white/20 rounded-lg transition-colors duration-200 group">
                        <img
                            src={flowerIcon}
                            alt="Flores"
                            className="w-5 h-5 object-contain filter brightness-0 invert group-hover:scale-110 transition-transform duration-200"
                        />
                    </button>

                    {/* Shopping Cart Icon */}
                    <button className="w-10 h-10 flex items-center justify-center hover:bg-white/20 rounded-lg transition-colors duration-200 group">
                        <img
                            src={shoppingCartIcon}
                            alt="Carrito"
                            className="w-5 h-5 object-contain filter brightness-0 invert group-hover:scale-110 transition-transform duration-200"
                        />
                    </button>

                    {/* Media Icon */}
                    <button className="w-10 h-10 flex items-center justify-center hover:bg-white/20 rounded-lg transition-colors duration-200 group">
                        <img
                            src={mediaIcon}
                            alt="Media"
                            className="w-5 h-5 object-contain filter brightness-0 invert group-hover:scale-110 transition-transform duration-200"
                        />
                    </button>

                    {/* Reviews Icon */}
                    <button className="w-10 h-10 flex items-center justify-center hover:bg-white/20 rounded-lg transition-colors duration-200 group">
                        <img
                            src={reviewsIcon}
                            alt="Reseñas"
                            className="w-5 h-5 object-contain filter brightness-0 invert group-hover:scale-110 transition-transform duration-200"
                        />
                    </button>

                    {/* Categories Icon */}
                    <button className="w-10 h-10 flex items-center justify-center hover:bg-white/20 rounded-lg transition-colors duration-200 group">
                        <img
                            src={categoriesIcon}
                            alt="Categorías"
                            className="w-5 h-5 object-contain filter brightness-0 invert group-hover:scale-110 transition-transform duration-200"
                        />
                    </button>
                </nav>

                {/* Logout Icon - Bottom */}
                <div className="mt-auto">
                    <button className="w-10 h-10 flex items-center justify-center hover:bg-white/20 rounded-lg transition-colors duration-200 group">
                        <img
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