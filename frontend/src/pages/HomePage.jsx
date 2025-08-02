/**
 * Componente HomePage - Página principal de la tienda La Marquesa
 * ACTUALIZADA: Implementa componentes reutilizables para mejorar la organización del código
 * 
 * Funcionalidades principales:
 * - Landing page con diseño atractivo y responsivo
 * - Navegación de categorías con filtros
 * - Productos destacados con sistema de favoritos
 * - Gestión de carrito de compras
 * - Sección de testimonios de clientes
 * - Chat button integrado para soporte
 * - Notificaciones toast para feedback del usuario
 * 
 * Componentes utilizados:
 * - Header/Footer (existentes)
 * - CategoryNavigation (existente)
 * - ChatButton (existente)
 * - FeatureCard (nuevo)
 * - TestimonialCard (nuevo)
 * - NotificationToast (nuevo)
 * - Container (nuevo)
 * - ActionButton (nuevo)
 * - PriceDisplay (nuevo)
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Componentes principales existentes
import Header from "../components/Header/Header";
import Footer from "../components/Footer";
import CategoryNavigation from "../components/CategoryNavigation";
import ChatButton from "../components/Chat/ChatButton";

// Componentes nuevos reutilizables
import FeatureCard from "../components/FeatureCard";
import NotificationToast from "../components/NotificationToast";
import Container from "../components/Container";
import ActionButton from "../components/ActionButton";
import PriceDisplay from "../components/PriceDisplay";

// NUEVO: Carrusel de testimonios
import TestimonialsCarousel from "../components/TestimonialCarousel";

// Recursos visuales
import heroImage from "../assets/postfebruaryhome.png";
import cat1 from "../assets/naturalcatflowers.png";
import cat2 from "../assets/driedflowerscat.png";
import cat3 from "../assets/decorativepaintings.png";
import cat4 from "../assets/giftboxescat.png";
import cat5 from "../assets/cardscat.png";
import flower1 from "../assets/savesFlower1.png";
import flower2 from "../assets/savesFlower2.png";
import flower3 from "../assets/savesFlower3.png";
import iconFavorites from '../assets/favoritesIcon.png';

const HomePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Estados para funcionalidades interactivas
  const [favorites, setFavorites] = useState(new Set());
  const [cart, setCart] = useState([]);
  const [showCartMessage, setShowCartMessage] = useState(false);
  const [showFavoriteMessage, setShowFavoriteMessage] = useState(false);

  /**
   * Datos de productos destacados
   */
  const featuredProducts = [
    {
      id: "p1",
      name: "Ramo de flores secas lavanda",
      description: "Arreglos con flores secas",
      price: 10.0,
      image: flower1,
      category: "flores-secas"
    },
    {
      id: "p2",
      name: "Cuadro sencillo de hogar",
      description: "Cuadros decorativos",
      price: 34.0,
      image: flower2,
      category: "cuadros-decorativos"
    },
    {
      id: "p3",
      name: "Ramo de rosas frescas",
      description: "Arreglos con flores naturales",
      price: 23.0,
      image: flower3,
      category: "flores-naturales"
    },
  ];

  /**
   * Categorías disponibles en la tienda
   */
  const categories = [
    { id: "todos", name: "Todos" },
    { id: "flores-naturales", name: "Arreglos con flores naturales" },
    { id: "flores-secas", name: "Arreglos con flores secas" },
    { id: "cuadros-decorativos", name: "Cuadros decorativos" },
    { id: "giftboxes", name: "Giftboxes" },
    { id: "tarjetas", name: "Tarjetas" },
  ];

  /**
   * Datos de características de la empresa
   */
  const features = [
    {
      icon: (
        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-[#CD5277]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: "Calidad Garantizada",
      description: "Todos nuestros productos son cuidadosamente seleccionados y elaborados con los mejores materiales."
    },
    {
      icon: (
        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-[#CD5277]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
          <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
        </svg>
      ),
      title: "Diseños únicos",
      description: "Adaptamos nuestros productos a tus necesidades y preferencias para crear algo único."
    },
    {
      icon: (
        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-[#CD5277]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      ),
      title: "Amplia Variedad",
      description: "Ofrecemos una extensa gama de productos para todas las ocasiones y gustos."
    }
  ];

  /**
   * Maneja el cambio de categoría en la navegación
   */
  const handleCategoryChange = (newCategoryId) => {
    if (newCategoryId === 'todos') {
      navigate('/categoryProducts');
    } else {
      navigate(`/categoria/${newCategoryId}`);
    }
  };

  /**
   * Maneja la funcionalidad de favoritos
   */
  const handleToggleFavorite = (productId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId);
    } else {
      newFavorites.add(productId);
      setShowFavoriteMessage(true);
    }
    setFavorites(newFavorites);
  };

  /**
   * Maneja la adición de productos al carrito
   */
  const handleAddToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    setShowCartMessage(true);
  };

  /**
   * Navegación a la página de todos los productos
   */
  const handleViewAll = () => {
    navigate('/categoria/flores-naturales');
  };

  /**
   * Scroll suave hacia la sección de productos
   */
  const handleShopNow = () => {
    const productsSection = document.getElementById('productos-destacados');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-pink-50">
      {/* Componentes de soporte */}
      <ChatButton />

      {/* Sistema de notificaciones usando el nuevo componente */}
      <NotificationToast
        show={showCartMessage}
        message="¡Producto añadido al carrito!"
        type="success"
        onClose={() => setShowCartMessage(false)}
      />
      <NotificationToast
        show={showFavoriteMessage}
        message="¡Añadido a favoritos!"
        type="favorite"
        onClose={() => setShowFavoriteMessage(false)}
      />

      {/* Header principal */}
      <div className="bg-white">
        <Header />
      </div>

      {/* Navegación de categorías funcionales debajo del Header */}
      <section className="bg-white pt-2 sm:pt-4 pb-4 sm:pb-6">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <CategoryNavigation
            categories={[
              { _id: 'todos', name: 'Todos' },
              { _id: '688175a69579a7cde1657aaa', name: 'Arreglos con flores naturales' },
              { _id: '688175d89579a7cde1657ac2', name: 'Arreglos con flores secas' },
              { _id: '688175fd9579a7cde1657aca', name: 'Cuadros decorativos' },
              { _id: '688176179579a7cde1657ace', name: 'Giftboxes' },
              { _id: '688175e79579a7cde1657ac6', name: 'Tarjetas' }
            ]}
            activeCategory="todos"
            onCategoryChange={handleCategoryChange}
          />
        </div>
      </section>

      {/* Hero Section */}
      <section className="bg-pink-50 py-8 sm:py-14 -mt-12">
        <Container className="flex flex-col-reverse md:flex-row items-center gap-8 lg:gap-12">
          {/* Contenido textual del hero */}
          <div className="md:w-1/2 text-center md:text-left">
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight"
              style={{ fontFamily: "Poppins" }}
            >
              Dedicados a Realizar <br className="hidden sm:block" /> Detalles Únicos
            </h1>
            <p className="text-gray-600 mb-8 sm:mb-10 text-base sm:text-lg max-w-md mx-auto md:mx-0" style={{ fontFamily: "Poppins" }}>
              Descubre nuestra colección de diseños que combinan forma y función a la perfección
            </p>
            <ActionButton
              onClick={handleShopNow}
              variant="primary"
              size="lg"
              className="w-full sm:w-auto"
            >
              Comprar ahora 🡢
            </ActionButton>
          </div>

          {/* Imagen hero */}
          <div className="md:w-1/2 relative w-full">
            <img
              src={heroImage}
              alt="Hero"
              className="rounded-lg shadow-xl w-full h-64 sm:h-80 lg:h-120 object-cover"
            />
          </div>
        </Container>
      </section>

      {/* Sección de categorías visuales */}
      <section className="bg-white py-8 sm:py-14">
        <Container className="text-center">
          <h2
            className="text-2xl sm:text-3xl lg:text-4xl font-medium text-gray-900 text-center mb-2"
            style={{ fontFamily: "Poppins" }}
          >
            Nuestras categorías
          </h2>
          <p className="text-center text-gray-600 mb-8 sm:mb-10 text-sm sm:text-base lg:text-lg max-w-xs sm:max-w-2xl lg:max-w-4xl mx-auto" style={{ fontFamily: "Poppins" }}>
            Explora nuestra selección de productos cuidadosamente curados para cada ocasión.
          </p>

          {/* Grid de categorías */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {[cat1, cat2, cat3, cat4, cat5].map((categoryImg, index) => (
              <div key={index} className="rounded-lg overflow-hidden shadow-sm group cursor-pointer">
                <img
                  src={categoryImg}
                  alt={`Categoría ${index + 1}`}
                  className="w-full h-32 sm:h-40 lg:h-57 object-cover"
                />
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Sección de productos destacados */}
      <section id="productos-destacados" className="bg-pink-50 py-8 sm:py-14">
        <Container>
          <h2
            className="text-2xl sm:text-3xl lg:text-4xl font-medium text-gray-900 text-center mb-2"
            style={{ fontFamily: "Poppins" }}
          >
            Productos destacados
          </h2>

          <p className="text-center text-gray-600 mb-8 sm:mb-10 text-base sm:text-lg max-w-2xl mx-auto" style={{ fontFamily: "Poppins" }}>
            Descubre nuestros productos más populares y mejor valorados.
          </p>

          {/* Grid de productos destacados */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8" style={{ cursor: 'pointer' }}>
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:scale-105 cursor-pointer"
                onClick={() => navigate(`/categoria/${product.category}`)}
              >
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 sm:h-64 lg:h-85 object-cover rounded-t-lg"
                  />

                  {/* Badge de precio usando componente nuevo */}
                  <div className="absolute top-3 right-3 bg-white bg-opacity-90 rounded-full px-3 py-1 shadow-md">
                    <PriceDisplay price={product.price} size="sm" />
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-1" style={{ fontFamily: "Poppins" }}>
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2" style={{ fontFamily: "Poppins" }}>
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between mb-3">
                    <PriceDisplay price={product.price} />

                    <button
                      style={{ cursor: 'pointer' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(product.id);
                      }}
                      className={`p-1 rounded-full transition-all duration-200 transform hover:scale-110 ${favorites.has(product.id)
                          ? 'bg-red-100 hover:bg-red-200'
                          : 'hover:bg-gray-100'
                        }`}
                    >
                      <img
                        src={iconFavorites}
                        alt="Agregar a favoritos"
                        className={`w-5 h-6 transition-all duration-200 ${favorites.has(product.id) ? 'filter-red' : ''
                          }`}
                        style={favorites.has(product.id) ? { filter: 'hue-rotate(320deg) saturate(2)' } : {}}
                      />
                    </button>
                  </div>

                  <ActionButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product);
                    }}
                    variant="primary"
                    size="md"
                    className="w-full"
                  >
                    Añadir al carrito
                  </ActionButton>
                </div>
              </div>
            ))}
          </div>

          {/* Botón para ver todos los productos */}
          <div className="flex justify-center mt-8 sm:mt-10">
            <ActionButton
              onClick={handleViewAll}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
            >
              Ver todos los productos 🡢
            </ActionButton>
          </div>
        </Container>
      </section>

      {/* Sección "¿Por qué elegirnos?" usando FeatureCard */}
      <section className="bg-white py-8 sm:py-14">
        <Container>
          <div className="text-center mb-8 sm:mb-12">
            <h2
              className="text-2xl sm:text-3xl lg:text-4xl font-medium text-gray-900 mb-4"
              style={{ fontFamily: "Poppins" }}
            >
              ¿Por qué elegirnos?
            </h2>
            <p
              className="text-gray-600 mx-auto text-sm sm:text-base lg:text-lg max-w-xs sm:max-w-2xl lg:max-w-4xl"
              style={{ fontFamily: "Poppins" }}
            >
              Nos distinguimos por nuestra calidad, atención al detalle y servicio personalizado.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </Container>
      </section>

      {/* NUEVO: Sección de testimonios con carrusel dinámico */}
      <TestimonialsCarousel
        maxReviews={6}
        autoSlideInterval={4000}
      />

      <Footer />
    </div>
  );
};

export default HomePage;