import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Importación de componentes 
import Header from "../components/Header/Header";
import Footer from "../components/Footer";
import CategoryNavigation from "../components/CategoryNavigation";

// Imágenes utilizadas
import heroImage from "../assets/postfebruaryhome.png";
import cat1 from "../assets/naturalcatflowers.png";
import cat2 from "../assets/driedflowerscat.png";
import cat3 from "../assets/decorativepaintings.png";
import cat4 from "../assets/giftboxescat.png";
import cat5 from "../assets/cardscat.png";
import flower1 from "../assets/savesFlower1.png";
import flower2 from "../assets/savesFlower2.png";
import flower3 from "../assets/savesFlower3.png";
import iconchat from "../assets/iconchat.png"
// Iconos de favoritos desde la carpeta "assets"
import iconFavorites from '../assets/favoritesIcon.png';

const HomePage = () => {
  const navigate = useNavigate();

  // Estados para funcionalidades
  const [favorites, setFavorites] = useState(new Set());
  const [cart, setCart] = useState([]);
  const [showCartMessage, setShowCartMessage] = useState(false);
  const [showFavoriteMessage, setShowFavoriteMessage] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessage, setChatMessage] = useState("");

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

  const categories = [
    { id: "todos", name: "Todos" },
    { id: "flores-naturales", name: "Arreglos con flores naturales" },
    { id: "flores-secas", name: "Arreglos con flores secas" },
    { id: "cuadros-decorativos", name: "Cuadros decorativos" },
    { id: "giftboxes", name: "Giftboxes" },
    { id: "tarjetas", name: "Tarjetas" },
  ];

  // Mapeo de categorías con imágenes
  const categoryData = [
    { id: "flores-naturales", name: "Arreglos con flores naturales", image: cat1 },
    { id: "flores-secas", name: "Arreglos con flores secas", image: cat2 },
    { id: "cuadros-decorativos", name: "Cuadros decorativos", image: cat3 },
    { id: "giftboxes", name: "Giftboxes", image: cat4 },
    { id: "tarjetas", name: "Tarjetas", image: cat5 },
  ];

  // Función para mostrar mensajes temporales
  const showTemporaryMessage = (setter) => {
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  // Manejo de navegación de categorías
  const handleCategoryChange = (newCategoryId) => {
        if (newCategoryId === 'todos') {
            // Si selecciona "todos", regresar al home
            navigate('/categoryProducts');
        } else {
            // Si selecciona otra categoría, navegar a esa página
            navigate(`/categoria/${newCategoryId}`);
        }
    };

  // Manejo de favoritos
  const handleToggleFavorite = (productId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId);
    } else {
      newFavorites.add(productId);
      showTemporaryMessage(setShowFavoriteMessage);
    }
    setFavorites(newFavorites);
  };

  // Manejo del carrito
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
    showTemporaryMessage(setShowCartMessage);
  };

  // Navegación a ver todos los productos
  const handleViewAll = () => {
    // Podrías navegar a una página de todos los productos o a la primera categoría
    navigate('/categoria/flores-naturales');
  };

  // Navegación desde el botón "Comprar ahora"
  const handleShopNow = () => {
    const productsSection = document.getElementById('productos-destacados');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Componente de notificación
  const Notification = ({ show, message, type = 'success' }) => {
    if (!show) return null;
    
    return (
      <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
        type === 'success' ? 'bg-green-500 text-white' : 'bg-pink-500 text-white'
      }`}>
        <div className="flex items-center">
          {type === 'success' ? (
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          )}
          {message}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-pink-50">

     {/* Botón de Chat Flotante */}
{showChatModal && (
  <div className="fixed bottom-6 right-6 z-40">
    <div className="bg-white rounded-lg shadow-xl max-w-sm w-full max-h-[80vh] overflow-hidden">
      {/* Header del chat */}
      <div className="bg-white p-4 flex items-center justify-between border-b border-gray-300">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-gray-900" style={{ fontFamily: "Poppins" }}>
              Atención al cliente
            </h3>
          </div>
        </div>
        <button
          onClick={() => setShowChatModal(false)}
          className="text-gray-500 hover:text-gray-700 p-1"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Área de mensajes */}
      <div className="p-4 h-80 overflow-y-auto bg-gray-50">
        {/* Mensaje del bot */}
        <div className="mb-4">
          <div className="bg-gray-200 rounded-lg p-3 max-w-xs">
            <p className="text-sm text-gray-800" style={{ fontFamily: "Poppins" }}>
              ¡Hola! Bienvenido a MARQUESA. ¿En qué podemos ayudarte hoy?
            </p>
          </div>
        </div>

        {/* Mensaje del usuario */}
        <div className="mb-4 flex justify-end">
          <div className="bg-pink-100 rounded-lg p-3 max-w-xs">
            <p className="text-sm text-gray-800" style={{ fontFamily: "Poppins" }}>
              Hola, estoy interesada en un arreglo floral para un cumpleaños
            </p>
          </div>
        </div>

        {/* Respuesta del bot */}
        <div className="mb-4">
          <div className="bg-gray-200 rounded-lg p-3 max-w-xs">
            <p className="text-sm text-gray-800" style={{ fontFamily: "Poppins" }}>
              ¡Claro! Tenemos varias opciones de arreglos florales para cumpleaños. ¿Prefieres flores naturales o secas? También tenemos giftboxes que incluyen flores y otros detalles.
            </p>
          </div>
        </div>

        {/* Mensaje del usuario */}
        <div className="mb-4 flex justify-end">
          <div className="bg-pink-100 rounded-lg p-3 max-w-xs">
            <p className="text-sm text-gray-800" style={{ fontFamily: "Poppins" }}>
              Me gustaría ver opciones de flores naturales, preferiblemente algo con rosas
            </p>
          </div>
        </div>

        {/* Respuesta del bot */}
        <div className="mb-4">
          <div className="bg-gray-200 rounded-lg p-3 max-w-xs">
            <p className="text-sm text-gray-800" style={{ fontFamily: "Poppins" }}>
              ¡Perfecto! Te recomiendo nuestro 'Ramo de rosas frescas'
            </p>
          </div>
        </div>
      </div>

      {/* Input para escribir mensaje */}
      <div className="p-4 bg-white">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none text-sm"
            style={{ fontFamily: "Poppins" }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                console.log("Mensaje enviado:", chatMessage);
                setChatMessage("");
              }
            }}
          />
          <button
            onClick={() => {
              console.log("Mensaje enviado:", chatMessage);
              setChatMessage("");
            }}
            className="bg-pink-200 hover:bg-pink-300 text-white p-2 rounded-full transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
)}

{/* Botón de Chat Flotante - Solo aparece cuando el modal está cerrado */}
{!showChatModal && (
  <div className="fixed bottom-6 right-6 z-40">
    <button
      onClick={() => setShowChatModal(true)}
      className="bg-[#E8ACD2] hover:bg-[#E096C8] text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 group"
      title="Abrir chat"
    >
      <img 
        src={iconchat} 
        alt="Chat" 
        className="w-8 h-8 transition-transform duration-300 group-hover:scale-110"
      />
    </button>
  </div>
)}
      {/* Notificaciones */}
      <Notification 
        show={showCartMessage} 
        message="¡Producto añadido al carrito!" 
        type="success" 
      />
      <Notification 
        show={showFavoriteMessage} 
        message="¡Añadido a favoritos!" 
        type="favorite" 
      />

      <div className="bg-white">
        <Header />
      </div>

      {/* Navegación de categorías arriba del todo */}
      <section className="bg-white pt-4 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CategoryNavigation 
            categories={categories}
            activeCategory="todos"
            onCategoryChange={handleCategoryChange}
          />
        </div>
      </section>

      {/* Hero Section */}
      <section className="bg-pink-50 py-8 sm:py-14 -mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col-reverse md:flex-row items-center gap-8 lg:gap-12">
          {/* Texto */}
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
            <button 
              onClick={handleShopNow}
              className="bg-[#E8ACD2] hover:bg-[#E096C8] text-white py-3 px-6 sm:py-2 sm:px-6 rounded-lg font-medium text-sm shadow-md transition-all w-full sm:w-auto hover:scale-105 cursor-pointer"
            >
              Comprar ahora 🡢
            </button>
          </div>
          {/* Imagen con overlay de texto */}
          <div className="md:w-1/2 relative w-full">
            <img
              src={heroImage}
              alt="Hero"
              className="rounded-lg shadow-xl w-full h-64 sm:h-80 lg:h-120 object-cover"
            />
          </div>
        </div>
      </section>

{/* Categorías visuales */}
      <section className="bg-white py-8 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2
            className="text-2xl sm:text-3xl lg:text-4xl font-medium text-gray-900 text-center mb-2"
            style={{ fontFamily: "Poppins" }}
          >
            Nuestras categorías
          </h2>
          <p className="text-center text-gray-600 mb-8 sm:mb-10 text-sm sm:text-base lg:text-lg max-w-xs sm:max-w-2xl lg:max-w-4xl mx-auto" style={{ fontFamily: "Poppins" }}>
          Explora nuestra selección de productos cuidadosamente curados para cada ocasión.
         </p>

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
        </div>
      </section>
      {/* Categorías visuales */}
      
      {/* Productos destacados */}
      <section id="productos-destacados" className="bg-pink-50 py-8 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="text-2xl sm:text-3xl lg:text-4xl font-medium text-gray-900 text-center mb-2"
            style={{ fontFamily: "Poppins" }}
          >
            Productos destacados
          </h2>
          
          <p className="text-center text-gray-600 mb-8 sm:mb-10 text-base sm:text-lg max-w-2xl mx-auto" style={{ fontFamily: "Poppins" }}>
            Descubre nuestros productos más populares y mejor valorados.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
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
                  {/* Badge de precio */}
                  <div className="absolute top-3 right-3 bg-white bg-opacity-90 rounded-full px-3 py-1 shadow-md">
                    <span className="text-sm font-bold text-gray-800">
                      {product.price.toFixed(2)}$
                    </span>
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
                    <span className="font-bold text-gray-800">
                      {product.price.toFixed(2)}$              
                    </span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(product.id);
                      }}
                      className={`p-1 rounded-full transition-all duration-200 transform hover:scale-110 ${
                        favorites.has(product.id) 
                          ? 'bg-red-100 hover:bg-red-200' 
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <img 
                        src={iconFavorites} 
                        alt="Agregar a favoritos" 
                        className={`w-5 h-6 transition-all duration-200 ${
                          favorites.has(product.id) ? 'filter-red' : ''
                        }`}
                        style={favorites.has(product.id) ? {filter: 'hue-rotate(320deg) saturate(2)'} : {}}
                      />
                    </button>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product);
                    }}
                    className="bg-[#E8ACD2] hover:bg-[#E096C8] text-white py-2 px-4 rounded-lg text-sm font-medium w-full transition-all duration-200 hover:scale-105"
                  >
                    Añadir al carrito
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-8 sm:mt-10">
            <button
              onClick={handleViewAll}
              className="text-[#E8ACD2] border border-[#E8ACD2] hover:bg-[#E8ACD2] hover:text-white py-3 px-6 sm:py-2 sm:px-6 rounded-lg text-sm font-medium transition-all w-full sm:w-auto hover:scale-105"
            >
              Ver todos los productos 🡢
            </button>
          </div>
        </div>
      </section>

      {/* ¿Por qué elegirnos? */}
      <section className="bg-white py-8 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Título y subtítulo */}
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

          {/* Tarjetas de características */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Calidad Garantizada */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 sm:p-8 text-center hover:shadow-lg transition-shadow duration-300 group">
              <div className="flex justify-center mb-4 sm:mb-6">
                <div className="p-3 sm:p-4 bg-pink-50 rounded-full group-hover:bg-[#F2C6C2] group-hover:bg-opacity-10 transition-colors duration-300">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-[#CD5277]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
              <h3 
                className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4"
                style={{ fontFamily: "Poppins" }}
              >
                Calidad Garantizada
              </h3>
              <p 
                className="text-gray-600 leading-relaxed text-sm sm:text-base"
                style={{ fontFamily: "Poppins" }}
              >
                Todos nuestros productos son cuidadosamente seleccionados y elaborados con los mejores materiales.
              </p>
            </div>

            {/* Diseños únicos */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 sm:p-8 text-center hover:shadow-lg transition-shadow duration-300 group">
              <div className="flex justify-center mb-4 sm:mb-6">
                <div className="p-3 sm:p-4 bg-pink-50 rounded-full group-hover:bg-[#F2C6C2] group-hover:bg-opacity-10 transition-colors duration-300">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-[#CD5277]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                    <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                  </svg>
                </div>
              </div>
              <h3 
                className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4"
                style={{ fontFamily: "Poppins" }}
              >
                Diseños únicos
              </h3>
              <p 
                className="text-gray-600 leading-relaxed text-sm sm:text-base"
                style={{ fontFamily: "Poppins" }}
              >
                Adaptamos nuestros productos a tus necesidades y preferencias para crear algo único.
              </p>
            </div>

            {/* Amplia Variedad */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 sm:p-8 text-center hover:shadow-lg transition-shadow duration-300 group md:col-span-2 lg:col-span-1">
              <div className="flex justify-center mb-4 sm:mb-6">
                <div className="p-3 sm:p-4 bg-pink-50 rounded-full group-hover:bg-[#F2C6C2] group-hover:bg-opacity-10 transition-colors duration-300">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-[#CD5277]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </div>
              </div>
              <h3 
                className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4"
                style={{ fontFamily: "Poppins" }}
              >
                Amplia Variedad
              </h3>
              <p 
                className="text-gray-600 leading-relaxed text-sm sm:text-base"
                style={{ fontFamily: "Poppins" }}
              >
                Ofrecemos una extensa gama de productos para todas las ocasiones y gustos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonios de clientes */}
      <section className="bg-pink-50 py-8 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Título y subtítulo */}
          <div className="text-center mb-8 sm:mb-12">
            <h2 
              className="text-2xl sm:text-3xl lg:text-4xl font-medium text-gray-900 mb-4"
              style={{ fontFamily: "Poppins" }}
            >
              Lo que dicen nuestros clientes
            </h2>
            <p 
           className="text-gray-600 mx-auto text-sm sm:text-base lg:text-lg max-w-xs sm:max-w-2xl lg:max-w-4xl"
           style={{ fontFamily: "Poppins" }}
           >
           Descubre por qué nuestros clientes confían en nosotros para sus momentos especiales.
          </p>
          </div>

          {/* Grid de testimonios */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Testimonio 1 */}
            <div className="bg-white rounded-lg p-6 sm:p-8 shadow-md hover:shadow-lg transition-shadow duration-300">
              {/* Estrellas */}
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>
              
              {/* Comentario */}
              <p 
                className="text-gray-600 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base"
                style={{ fontFamily: "Poppins" }}
              >
                "El arreglo floral que compré para el cumpleaños de mi madre superó todas mis expectativas. La calidad y frescura de las flores fue excepcional."
              </p>
              
              {/* Información del cliente */}
              <div className="flex items-center">
                <img 
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                  alt="María González"
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover mr-3 sm:mr-4"
                />
                <div>
                  <h4 
                    className="font-semibold text-gray-900 text-sm sm:text-base"
                    style={{ fontFamily: "Poppins" }}
                  >
                    María González
                  </h4>
                  <p 
                    className="text-xs sm:text-sm text-gray-500"
                    style={{ fontFamily: "Poppins" }}
                  >
                    Publicado en 2024
                  </p>
                </div>
              </div>
            </div>

            {/* Testimonio 2 */}
            <div className="bg-white rounded-lg p-6 sm:p-8 shadow-md hover:shadow-lg transition-shadow duration-300">
              {/* Estrellas */}
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>
              
              {/* Comentario */}
              <p 
                className="text-gray-600 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base"
                style={{ fontFamily: "Poppins" }}
              >
                "La Giftbox personalizada que pedí para mi aniversario fue perfecta. El servicio al cliente fue excelente y me ayudaron a crear algo realmente especial."
              </p>
              
              {/* Información del cliente */}
              <div className="flex items-center">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                  alt="Carlos Rodríguez"
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover mr-3 sm:mr-4"
                />
                <div>
                  <h4
                    className="font-semibold text-gray-900 text-sm sm:text-base"
                    style={{ fontFamily: "Poppins" }}
                  >
                    Carlos Rodríguez
                  </h4>
                  <p 
                    className="text-xs sm:text-sm text-gray-500"
                    style={{ fontFamily: "Poppins" }}
                  >
                    Publicado en 2023
                  </p>
                </div>
              </div>
            </div>

            {/* Testimonio 3 */}
            <div className="bg-white rounded-lg p-6 sm:p-8 shadow-md hover:shadow-lg transition-shadow duration-300 md:col-span-2 lg:col-span-1">
              {/* Estrellas */}
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>
              
              {/* Comentario */}
              <p 
                className="text-gray-600 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base"
                style={{ fontFamily: "Poppins" }}
              >
                "Los cuadros decorativos que compré para mi nueva casa son preciosos. La calidad es excelente y el envío fue rápido y seguro."
              </p>
              
              {/* Información del cliente */}
              <div className="flex items-center">
                <img 
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                  alt="Laura Martínez"
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover mr-3 sm:mr-4"
                />
                <div>
                  <h4 
                    className="font-semibold text-gray-900 text-sm sm:text-base"
                    style={{ fontFamily: "Poppins" }}
                  >
                    Laura Martínez
                  </h4>
                  <p 
                    className="text-xs sm:text-sm text-gray-500"
                    style={{ fontFamily: "Poppins" }}
                  >
                    Publicado en 2025
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default HomePage;