import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Importación de imágenes de productos
import ramoFolores from '../assets/ramoFlores1.png';
import macetaFlores from '../assets/macetaFlores.png';
import giftboxVino from '../assets/giftboxVino.png';
import iconFavorites from '../assets/favoritesIcon.png';

// Array de productos recomendados con información completa
const recommended = [
  {
    id: 1,
    name: 'Ramo primavera',
    category: 'Arreglo con flores naturales',
    price: 30.00,
    image: ramoFolores,
    description: 'Un hermoso ramo de flores frescas.',
  },
  {
    id: 2,
    name: 'Maceta de flores',
    category: 'Cuadros decorativos',
    price: 21.00,
    image: macetaFlores,
    description: 'Maceta decorativa con flores naturales.',
  },
  {
    id: 3,
    name: 'Giftbox de vino',
    category: 'Giftboxes',
    price: 40.00,
    image: giftboxVino,
    description: 'Caja de regalo con vino y accesorios.',
  },
];

// Componente RecommendedProducts que muestra productos recomendados
const RecommendedProducts = () => {
  const navigate = useNavigate(); // Hook para navegación entre rutas
  const [favorites, setFavorites] = useState(new Set()); // Estado para manejar favoritos usando Set

  // Función para alternar el estado de favorito de un producto
  const handleToggleFavorite = (id) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id); // Remover de favoritos si ya existe
    } else {
      newFavorites.add(id);    // Agregar a favoritos si no existe
    }
    setFavorites(newFavorites);
  };

  // Función para agregar producto al carrito
  const handleAddToCart = (product) => {
    console.log('Añadir al carrito:', product);
    // Aquí puedes integrar lógica con contexto o estado global
  };

  // Función para navegar a la página de todos los productos
  const handleViewAll = () => {
    navigate('/productos');
  };

  return (
    // Sección principal con fondo rosa claro
    <section id="productos-destacados" className="bg-pink-50 py-8 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Título principal de la sección */}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-gray-900 text-center mb-2" style={{ fontFamily: "Poppins" }}>
          También te podrían gustar        </h2>
        
        {/* Subtítulo descriptivo */}
        <p className="text-center text-gray-600 mb-8 sm:mb-10 text-base sm:text-lg max-w-2xl mx-auto" style={{ fontFamily: "Poppins" }}>
          otros productos de nuestro catalogo que te puedan gustar        </p>

        {/* Grid responsivo para mostrar los productos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {recommended.map((product) => (
            // Tarjeta individual de producto
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:scale-105 cursor-pointer"
              onClick={() => navigate(`/categoria/${product.category}`)} // Navegación al hacer clic en la tarjeta
            >
              {/* Contenedor de la imagen */}
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 sm:h-64 lg:h-85 object-cover rounded-t-lg"
                />
                {/* Badge de precio posicionado absolutamente */}
                <div className="absolute top-3 right-3 bg-white bg-opacity-90 rounded-full px-3 py-1 shadow-md">
                  <span className="text-sm font-bold text-gray-800">
                    {product.price.toFixed(2)}$
                  </span>
                </div>
              </div>

              {/* Contenido de la tarjeta */}
              <div className="p-4">
                {/* Nombre del producto */}
                <h3 className="text-lg font-semibold mb-1" style={{ fontFamily: "Poppins" }}>
                  {product.name}
                </h3>
                
                {/* Descripción del producto */}
                <p className="text-sm text-gray-600 mb-2" style={{ fontFamily: "Poppins" }}>
                  {product.description}
                </p>
                
                {/* Contenedor para precio y botón de favoritos */}
                <div className="flex items-center justify-between mb-3">
                  {/* Precio del producto */}
                  <span className="font-bold text-gray-800">
                    {product.price.toFixed(2)}$
                  </span>
                  
                  {/* Botón de favoritos */}
                  <button
                    style={{ cursor: 'pointer' }}
                    onClick={(e) => {
                      e.stopPropagation(); // Evita que se propague el evento al div padre
                      handleToggleFavorite(product.id);
                    }}
                    className={`p-1 rounded-full transition-all duration-200 transform hover:scale-110 ${favorites.has(product.id)
                      ? 'bg-red-100 hover:bg-red-200'  // Estilo cuando está en favoritos
                      : 'hover:bg-gray-100'           // Estilo cuando no está en favoritos
                      }`}
                  >
                    <img
                      src={iconFavorites}
                      alt="Agregar a favoritos"
                      className={`w-5 h-6 transition-all duration-200 ${favorites.has(product.id) ? 'filter-red' : ''
                        }`}
                      style={
                        favorites.has(product.id)
                          ? { filter: 'hue-rotate(320deg) saturate(2)' } // Filtro para color rojo cuando está en favoritos
                          : {}
                      }
                    />
                  </button>
                </div>
                
                {/* Botón para agregar al carrito */}
                <button
                  style={{ cursor: 'pointer' }}
                  onClick={(e) => {
                    e.stopPropagation(); // Evita que se propague el evento al div padre
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

        {/* Botón para ver todos los productos */}
        <div className="flex justify-center mt-8 sm:mt-10">
          <button
            style={{ cursor: 'pointer' }}
            onClick={handleViewAll}
            className="text-[#E8ACD2] border border-[#E8ACD2] hover:bg-[#E8ACD2] hover:text-white py-3 px-6 sm:py-2 sm:px-6 rounded-lg text-sm font-medium transition-all w-full sm:w-auto hover:scale-105"
          >
            Ver todos los productos 🡢
          </button>
        </div>
      </div>
    </section>
  );
};

// Exporta el componente como default
export default RecommendedProducts;