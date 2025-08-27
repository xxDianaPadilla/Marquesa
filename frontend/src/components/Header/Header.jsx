import React, { useState, useEffect, useRef, useCallback } from "react";
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
// Componente de dropdown de búsqueda
import SearchDropdown from '../SearchDropdown';
// Importe el css del header
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth(); // Obtener estado de autenticación

  // Estado para controlar si el menú móvil está abierto o cerrado
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Estado para controlar el modal de autenticación
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Estados para la funcionalidad de búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  
  // Referencias para manejo del dropdown de búsqueda
  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // URL base del API
  const API_BASE_URL = 'https://marquesa.onrender.com/api';

  // Mapeo de categorías para mostrar nombres legibles
  const categoryMap = {
    '688175a69579a7cde1657aaa': 'Arreglos con flores naturales',
    '688175d89579a7cde1657ac2': 'Arreglos con flores secas',
    '688175fd9579a7cde1657aca': 'Cuadros decorativos',
    '688176179579a7cde1657ace': 'Giftboxes',
    '688175e79579a7cde1657ac6': 'Tarjetas'
  };

  // Función para realizar búsqueda de productos
  const searchProducts = useCallback(async (term) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Realizar búsqueda en todos los productos
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      let productsData = [];

      // Extraer productos de diferentes estructuras de respuesta
      if (Array.isArray(data)) {
        productsData = data;
      } else if (data.success && Array.isArray(data.data)) {
        productsData = data.data;
      } else if (data.products && Array.isArray(data.products)) {
        productsData = data.products;
      } else if (data.data && Array.isArray(data.data)) {
        productsData = data.data;
      }

      // Filtrar productos por nombre y categoría
      const filteredProducts = productsData.filter(product => {
        const productName = (product.name || '').toLowerCase();
        const searchLower = term.toLowerCase();
        
        // Buscar por nombre del producto
        const nameMatch = productName.includes(searchLower);
        
        // Buscar por categoría
        let categoryMatch = false;
        if (typeof product.categoryId === 'object' && product.categoryId?.name) {
          categoryMatch = product.categoryId.name.toLowerCase().includes(searchLower);
        } else if (product.categoryId && categoryMap[product.categoryId]) {
          categoryMatch = categoryMap[product.categoryId].toLowerCase().includes(searchLower);
        }

        return nameMatch || categoryMatch;
      });

      // Formatear productos para mostrar en el dropdown
      const formattedProducts = filteredProducts.map(product => {
        let categoryName = 'Sin categoría';
        if (typeof product.categoryId === 'object' && product.categoryId?.name) {
          categoryName = product.categoryId.name;
        } else if (product.categoryId && categoryMap[product.categoryId]) {
          categoryName = categoryMap[product.categoryId];
        }

        // Determinar imagen del producto
        let image = '/placeholder-image.jpg';
        if (product.image) {
          image = product.image;
        } else if (product.images && Array.isArray(product.images) && product.images.length > 0) {
          if (product.images[0]?.image) {
            image = product.images[0].image;
          } else if (typeof product.images[0] === 'string') {
            image = product.images[0];
          }
        }

        return {
          ...product,
          category: categoryName,
          image: image,
          _id: product._id || product.id
        };
      });

      setSearchResults(formattedProducts);
    } catch (error) {
      console.error('Error al buscar productos:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [API_BASE_URL, categoryMap]);

  // Función para manejar cambios en el input de búsqueda con debounce
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
    setShowSearchDropdown(true);

    // Limpiar timeout anterior
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Configurar nuevo timeout para debounce
    searchTimeoutRef.current = setTimeout(() => {
      searchProducts(value);
    }, 300); // Esperar 300ms después de que el usuario deje de escribir
  }, [searchProducts]);

  // Función para manejar envío del formulario de búsqueda (Enter)
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setShowSearchDropdown(false);
      navigate(`/buscar?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  // Función para manejar selección de producto desde el dropdown - MEJORADA
  const handleProductSelect = useCallback((product) => {
    console.log('Header - Product selected:', product);
    
    // Cerrar el dropdown primero
    setShowSearchDropdown(false);
    
    // Limpiar el término de búsqueda si es necesario
    // setSearchTerm('');
    
    // Usar setTimeout para asegurar que la navegación ocurre después del cierre del dropdown
    setTimeout(() => {
      console.log('Header - Navigating to product:', product._id);
      navigate(`/ProductDetail/${product._id}`);
    }, 100);
  }, [navigate]);

  // Función para cerrar el dropdown de búsqueda
  const closeSearchDropdown = useCallback(() => {
    setShowSearchDropdown(false);
  }, []);

  // Effect para manejar clics fuera del área de búsqueda - MEJORADO
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        // Agregar un pequeño delay para permitir que los clics en el dropdown se procesen primero
        setTimeout(() => {
          setShowSearchDropdown(false);
        }, 150);
      }
    };

    if (showSearchDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSearchDropdown]);

  // Limpiar timeout al desmontar componente
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

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
      <header className="w-full border-b border-gray-300 py-4 px-6 relative">
        <div className="w-full max-w-screen-xl mx-auto">

          {/* Diseño para pantallas grandes (Desktop) */}
          <div className="hidden md:grid grid-cols-12 items-center gap-4">
            <div className="col-span-3 flex flex-col items-start cursor-pointer" onClick={handleCategoryProductsClick}>
              <h1 className="header-title">● MARQUESA ●</h1>
              <p className="slogan">TIENDA DE REGALOS</p>
            </div>

            <div className="col-span-6 flex justify-center">
              <div className="search-container max-w-lg relative" ref={searchContainerRef} style={{ zIndex: 9999 }}>
                <form onSubmit={handleSearchSubmit}>
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="¿Qué estás buscando?"
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onFocus={() => searchTerm && setShowSearchDropdown(true)}
                  />
                  <button type="submit" className="search-button">
                    <img src={iconSearch} alt="Buscar" className="w-5 h-5" />
                  </button>
                </form>
                
                {/* Dropdown de resultados de búsqueda */}
                <SearchDropdown
                  searchResults={searchResults}
                  isVisible={showSearchDropdown}
                  onClose={closeSearchDropdown}
                  onProductSelect={handleProductSelect}
                  searchTerm={searchTerm}
                  isLoading={isSearching}
                />
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
              <div className="search-container relative" ref={searchContainerRef} style={{ zIndex: 9999 }}>
                <form onSubmit={handleSearchSubmit}>
                  <input
                    type="text"
                    placeholder="¿Qué estás buscando?"
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onFocus={() => searchTerm && setShowSearchDropdown(true)}
                  />
                  <button type="submit" className="search-button">
                    <img src={iconSearch} alt="Buscar" className="w-4 h-4" />
                  </button>
                </form>
                
                {/* Dropdown de resultados de búsqueda para móvil */}
                <SearchDropdown
                  searchResults={searchResults}
                  isVisible={showSearchDropdown}
                  onClose={closeSearchDropdown}
                  onProductSelect={handleProductSelect}
                  searchTerm={searchTerm}
                  isLoading={isSearching}
                />
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
                style={{ cursor: 'pointer' }}
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
                style={{ cursor: 'pointer' }}
                className="w-full bg-pink-300 hover:bg-pink-400 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Iniciar Sesión
              </button>

              <button
                onClick={closeAuthModal}
                style={{ cursor: 'pointer' }}
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