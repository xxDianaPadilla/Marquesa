import React, { useState, useEffect } from 'react';
import ramoFlores from '../assets/ramoFolores.png';
import Header from '../components/Header/Header';
import perfilUsuario from '../assets/perfilUsuario.png';
import editar from '../assets/editarP.png';
import guardar from '../assets/guardarP.png';
import carrito from '../assets/carritoP.png';
import Footer from '../components/Footer';
import Flower1 from "../assets/savesFlower1.png";
import Flower2 from "../assets/savesFlower2.png";
import Flower3 from "../assets/savesFlower3.png";
import CategoryNavigation from "../components/CategoryNavigation";
import { useNavigate, useLocation } from 'react-router-dom';

import { FaStar, FaRegStar, FaStarHalfAlt } from 'react-icons/fa';

const ProductDetail = () => {
  const sampleImages = [ramoFlores, ramoFlores, ramoFlores, ramoFlores];
  const [selectedImage, setSelectedImage] = useState(sampleImages[0]);
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState('description');
  const navigate = useNavigate();
  const location = useLocation();
  // Estado para la categoría activa en la navegación
  const [activeCategory, setActiveCategory] = useState('todos');
  // Estado para controlar la carga de datos
  const [isLoading, setIsLoading] = useState(true);

  const handleProductDetailClick = () => {
    navigate('/ProductDetail');
  };

  /**
   * Configuración de categorías disponibles
   */
  const categories = [
    { id: 'todos', name: 'Todos' },
    { id: 'flores-naturales', name: 'Arreglos con flores naturales' },
    { id: 'flores-secas', name: 'Arreglos con flores secas' },
    { id: 'cuadros-decorativos', name: 'Cuadros decorativos' },
    { id: 'giftboxes', name: 'Giftboxes' },
    { id: 'tarjetas', name: 'Tarjetas' }
  ];

  /**
   * Datos expandidos de productos por categoría (exactamente los mismos datos)
   * En una aplicación real, estos datos vendrían de una API
   */
  const productsByCategory = {
    'flores-naturales': [
      { id: 'fn1', name: 'Ramo de rosas amarillas', description: 'Hermoso ramo con rosas amarillas frescas', price: 23.00, image: Flower1 },
      { id: 'fn2', name: 'Ramo primaveral', description: 'Arreglo con flores de temporada', price: 30.00, image: Flower2 },
      { id: 'fn3', name: 'Ramo de rosas frescas', description: 'Rosas rojas recién cortadas', price: 35.00, image: Flower3 },
      { id: 'fn4', name: 'Bouquet de tulipanes', description: 'Coloridos tulipanes holandeses', price: 28.00, image: Flower1 },
      { id: 'fn5', name: 'Arreglo de gerberas', description: 'Vibrantes gerberas multicolor', price: 25.00, image: Flower2 },
      { id: 'fn6', name: 'Ramo de peonías', description: 'Elegantes peonías rosas', price: 45.00, image: Flower3 },
      { id: 'fn7', name: 'Bouquet mixto', description: 'Combinación de flores silvestres', price: 32.00, image: Flower1 },
      { id: 'fn8', name: 'Ramo de lirios', description: 'Lirios blancos perfumados', price: 38.00, image: Flower2 }
    ],
    'flores-secas': [
      { id: 'fs1', name: 'Ramo de flores secas lavanda', description: 'Aromática lavanda seca', price: 18.00, image: Flower1 },
      { id: 'fs2', name: 'Bouquet morado tulipán', description: 'Tulipanes secos preservados', price: 24.00, image: Flower2 },
      { id: 'fs3', name: 'Centro de mesa con flores secas', description: 'Elegante centro decorativo', price: 28.00, image: Flower3 },
      { id: 'fs4', name: 'Ramo de eucalipto', description: 'Eucalipto seco aromático', price: 22.00, image: Flower1 },
      { id: 'fs5', name: 'Flores de algodón', description: 'Suaves flores de algodón', price: 20.00, image: Flower2 },
      { id: 'fs6', name: 'Ramo de pampas', description: 'Hierba de pampas decorativa', price: 26.00, image: Flower3 },
      { id: 'fs7', name: 'Corona de flores secas', description: 'Corona decorativa para puerta', price: 35.00, image: Flower1 }
    ],
    'cuadros-decorativos': [
      { id: 'cd1', name: 'Cuadro de flores', description: 'Arte floral enmarcado', price: 25.00, image: Flower1 },
      { id: 'cd2', name: 'Girasoles', description: 'Pintura de girasoles', price: 30.00, image: Flower2 },
      { id: 'cd3', name: 'Cactus', description: 'Arte de cactus minimalista', price: 15.00, image: Flower3 },
      { id: 'cd4', name: 'Paisaje botánico', description: 'Cuadro de jardín vintage', price: 40.00, image: Flower1 },
      { id: 'cd5', name: 'Flores abstractas', description: 'Arte floral moderno', price: 35.00, image: Flower2 },
      { id: 'cd6', name: 'Herbario enmarcado', description: 'Plantas prensadas artísticas', price: 28.00, image: Flower3 },
      { id: 'cd7', name: 'Cuadro de rosas', description: 'Elegante composición de rosas', price: 32.00, image: Flower1 },
      { id: 'cd8', name: 'Arte de hojas', description: 'Composición de hojas naturales', price: 22.00, image: Flower2 },
      { id: 'cd9', name: 'Mandala floral', description: 'Diseño mandala con flores', price: 45.00, image: Flower3 }
    ],
    'giftboxes': [
      { id: 'gb1', name: 'Giftbox de vino', description: 'Caja regalo con vino premium', price: 60.00, image: Flower1 },
      { id: 'gb2', name: 'Giftbox Flores', description: 'Caja con flores y chocolates', price: 45.00, image: Flower2 },
      { id: 'gb3', name: 'Giftbox spa', description: 'Set de relajación completo', price: 55.00, image: Flower3 },
      { id: 'gb4', name: 'Giftbox dulces', description: 'Caja con dulces artesanales', price: 38.00, image: Flower1 },
      { id: 'gb5', name: 'Giftbox café', description: 'Set de café gourmet', price: 42.00, image: Flower2 },
      { id: 'gb6', name: 'Giftbox romántico', description: 'Kit romántico especial', price: 65.00, image: Flower3 }
    ],
    'tarjetas': [
      { id: 't1', name: 'Tarjeta floral', description: 'Tarjeta con diseño floral', price: 8.00, image: Flower1 },
      { id: 't2', name: 'Tarjeta roja', description: 'Tarjeta roja elegante', price: 10.00, image: Flower2 },
      { id: 't3', name: 'Bouquet como de girasol', description: 'Tarjeta con girasoles', price: 12.00, image: Flower3 },
      { id: 't4', name: 'Tarjeta vintage', description: 'Diseño retro romántico', price: 9.00, image: Flower1 },
      { id: 't5', name: 'Tarjeta minimalista', description: 'Diseño limpio y moderno', price: 7.00, image: Flower2 },
      { id: 't6', name: 'Tarjeta dorada', description: 'Acabados dorados elegantes', price: 15.00, image: Flower3 },
      { id: 't7', name: 'Tarjeta acuarela', description: 'Efectos de acuarela artística', price: 11.00, image: Flower1 },
      { id: 't8', name: 'Tarjeta pop-up', description: 'Tarjeta 3D interactiva', price: 18.00, image: Flower2 }
    ]
  };

  /**
   * useEffect para simular la carga inicial de datos
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  /**
   * Maneja el cambio de categoría en la navegación
   * @param {string} categoryId - ID de la categoría seleccionada
   */
  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);

    if (categoryId === 'todos') {
      // Si selecciona "todos", mostrar todas las categorías en scroll horizontal
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Si selecciona una categoría específica, navegar a la página individual
      navigate(`/categoria/${categoryId}`);
    }
  };

  /**
   * Maneja el click en un producto individual
   * @param {Object} product - Producto clickeado
   * @param {string} categoryId - ID de la categoría del producto
   */


  /**
   * Maneja el click en "Ver todos" de una categoría
   * @param {string} categoryId - ID de la categoría
   */
  const handleViewAll = (categoryId) => {
    console.log('Ver todos de categoría:', categoryId);
    // Navegar a la página de categoría individual
    navigate(`/categoria/${categoryId}`);
  };

  /**
   * Filtra las categorías a mostrar según la selección activa
   */
  const getCategoriesToShow = () => {
    if (activeCategory === 'todos') {
      return Object.keys(productsByCategory);
    }
    return [activeCategory];
  };

  /**
   * Obtiene el nombre de una categoría por su ID
   * @param {string} categoryId - ID de la categoría
   * @returns {string} Nombre de la categoría
   */
  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : categoryId;
  };

  const product = {
    name: 'Ramo de Rosas Frescas',
    price: '23,00$',
    category: 'Arreglos con flores naturales',
    description:
      'Nuestro ramo de rosas frescas está compuesto por las mejores variedades seleccionadas diariamente. Cada rosa es cuidadosamente elegida por su belleza, frescura y aroma. El ramo viene envuelto en papel de alta calidad y decorado con elementos que realzan su belleza natural.',
    details:
      'Las flores incluidas en este ramo son frescas y seleccionadas el mismo día del envío. El ramo mide aproximadamente 40cm de alto por 30cm de ancho.',
    shipping: 'Envío disponible a todo el país. Tiempo estimado de entrega: 2 a 4 días hábiles.',
  };

  const reviews = {
    average: 4.7,
    count: 3,
    comments: [
      {
        name: 'María González',
        year: 2024,
        comment:
          'El arreglo floral que compré para el cumpleaños de mi madre superó todas mis expectativas. La calidad y frescura de las flores fue excepcional.',
      },
      {
        name: 'Carlos Rodríguez',
        year: 2023,
        comment:
          'La giftbox personalizada que pedí para mi aniversario fue perfecta. El servicio al cliente fue excelente y me ayudaron a crear algo realmente especial.',
      },
      {
        name: 'Laura Martínez',
        year: 2025,
        comment:
          'Los cuadros decorativos que compré para mi nueva casa son preciosos. La calidad es excelente y el envío fue rápido y seguro.',
      },
    ],
  };

  const renderTab = () => {
    if (tab === 'description') return product.description;
    if (tab === 'details') return product.details;
    if (tab === 'shipping') return product.shipping;
  };

  return (
    <>
      <Header />

      <CategoryNavigation
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Imagen principal + miniaturas */}
          <div>
            <img src={selectedImage} alt="Producto" className="rounded-md w-full" />
            <br />
            <div className="flex gap-13 mt-2" style={{justifyContent: 'center', alignItems: 'center'}}>
              {sampleImages.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`Miniatura ${i}`}
                  onClick={() => setSelectedImage(img)}
                  className="object-contain rounded-md cursor-pointer"
                  style={{width: '110px', height: '110px'}}
                />
              ))}
            </div>
          </div>

          {/* Información del producto */}
          <div className="space-y-4">
            <span className="inline-block bg-[#F7E8F2] text-[#CD5277] text-xs font-medium italic px-2 py-1 rounded">
              {product.category}
            </span>
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <p className="text-lg font-semibold">{product.price}</p>

            <p className="text-sm text-gray-700">
              Hermoso ramo de rosas frescas en tonos amarillos y blancos, perfecto para regalar en
              ocasiones especiales.
            </p>

            {/* Cantidad */}
            <div>
              <label className="text-sm font-medium text-gray-700">Cantidad</label>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden text-sm w-fit mt-1">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                >
                  -
                </button>
                <span className="px-3 py-1 bg-white border-x border-gray-300">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>

            {/* Botones */}
            <div className="flex flex-wrap gap-2">
              <button className="bg-[#E8ACD2] hover:bg-pink-300 text-white px-4 py-2 rounded-md text-sm flex items-center gap-2">
                <img src={carrito} alt="Carrito" className="w-5 h-5" />
                Añadir al carrito
              </button>
              <button className="border border-[#c1c1c1] text-[#000000] px-4 py-2 rounded-md text-sm flex items-center gap-2">
                <img src={guardar} alt="Editar" className="w-5 h-5" />
                Añadir a favoritos
              </button>
              <button className="bg-[#BEF7FF] hover:bg-cyan-200 text-black px-4 py-2 rounded-md text-sm flex items-center gap-2">
                <img src={editar} alt="Guardar" className="w-5 h-5" />
                Personalizar
              </button>
            </div>

            {/* Línea separadora y Tabs */}
            <div className="border-t border-gray-200 mt-6 pt-4">
              <div className="flex gap-2 bg-gray-100 rounded-md text-sm font-medium overflow-hidden">
                {['description', 'details', 'shipping'].map((key) => (
                  <button
                    key={key}
                    onClick={() => setTab(key)}
                    className={`flex-1 px-4 py-2 text-center ${tab === key
                      ? 'bg-white text-[#000000] font-semibold shadow-sm'
                      : 'text-gray-500 hover:text-[#CD5277]'
                      }`}
                  >
                    {key === 'description'
                      ? 'Descripción'
                      : key === 'details'
                        ? 'Detalles'
                        : 'Envío'}
                  </button>
                ))}
              </div>
              <div className="bg-white p-4 rounded-b-md text-sm text-gray-700 mt-1 shadow-sm">
                {renderTab()}
              </div>
            </div>
          </div>
        </div>

        {/* Opiniones */}
        <div className="mt-12">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Opiniones de clientes</h3>
            <div className="flex items-center mt-1 text-gray-600 text-sm">
              <span className="text-yellow-400 mr-1 text-lg">★</span>
              <span className="font-medium text-gray-800">{reviews.average}</span>
              <span className="ml-2">Basado en {reviews.count} opiniones</span>
            </div>
          </div>

          {/* Formulario de opinión */}
          <div className="bg-gray-50 border border-gray-200 p-5 rounded-md mb-10">
            <h4 className="text-sm font-semibold text-gray-800 mb-4">Deja tu opinión</h4>

            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-1">Calificación</p>
              <div className="flex gap-1 text-yellow-400 text-xl cursor-pointer">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaRegStar key={star} />
                ))}
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-1">Comentario</p>
              <textarea
                className="w-full bg-white rounded-md p-2 text-sm outline-none focus:ring-2 focus:ring-pink-200"
                rows={3}
                placeholder="Comparte tu opinión con este producto..."
              />
            </div>

            <div className="text-left">
              <button className="mt-1 bg-[#E8ACD2] text-white px-5 py-2 rounded-md text-sm hover:bg-pink-300">
                Enviar opinión
              </button>
            </div>
          </div>
          {/* Lista de opiniones */}
          <div className="space-y-6">
            <h4 className="text-sm font-semibold text-gray-800 mb-1">{reviews.count} opiniones</h4>
            {reviews.comments.map((rev, i) => (
              <div key={i} className="border-t border-gray-200 pt-6 flex gap-4">
                <img src={perfilUsuario} alt="Usuario" className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <p className="font-semibold text-sm text-gray-800">{rev.name}</p>
                  <div className="flex items-center gap-3 mt-1 text-sm">
                    <div className="flex text-yellow-400">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <FaStar key={n} />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">Publicado en {rev.year}</span>
                  </div>
                  <p className="text-sm text-gray-700 mt-2">{rev.comment}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};
export default ProductDetail;
