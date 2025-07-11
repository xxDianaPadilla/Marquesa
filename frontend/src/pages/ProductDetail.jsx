import React, { useState } from 'react';
import ramoFlores from '../assets/ramoFolores.png'; // Imagen por defecto del ramo de flores
import Header from '../components/Header/Header'; // Componente que renderiza el encabezado
import Footer from '../components/Footer'; // Componente para el pie de página
import CategoryNavigation from "../components/CategoryNavigation"; // Barra de navegación de categorías de productos
import ProductImages from '../components/ProductDetail/ProductImages'; // Componente que maneja las imágenes del producto
import ProductInfo from '../components/ProductDetail/ProductInfo'; // Muestra la información básica del producto
import ProductTabs from '../components/ProductDetail/ProductTabs'; // Componente para manejar las pestañas (Descripción, Detalles, Envío)
import ProductReviews from '../components/ProductDetail/ProductReviews'; // Muestra las opiniones del producto
import { useNavigate } from 'react-router-dom'; // Hook de React Router para la navegación
import RecommendedProducts from '../components/RecommendedProducts '; // Muestra los productos recomendados

const ProductDetail = () => {
  // Estado para controlar la imagen seleccionada del producto
  const [selectedImage, setSelectedImage] = useState(ramoFlores);

  // Estado para controlar la cantidad del producto a comprar
  const [quantity, setQuantity] = useState(1);

  // Estado para controlar la pestaña activa (Descripción, Detalles, Envío)
  const [tab, setTab] = useState('description');

  // Hook para navegar entre las páginas
  const navigate = useNavigate();

  // Estado para manejar la categoría activa
  const [activeCategory, setActiveCategory] = useState('todos');

  // Lista de imágenes del producto (en este caso solo tiene la misma imagen repetida)
  const sampleImages = [ramoFlores, ramoFlores, ramoFlores];

  // Información del producto
  const product = {
    name: 'Ramo de Rosas Frescas',
    price: '23,00$',
    category: 'Arreglos con flores naturales',
    description: 'Nuestro ramo de rosas frescas...',
    details: 'Las flores incluidas...',
    shipping: 'Envío disponible...',
  };

  // Reseñas del producto, con una calificación promedio y los comentarios de los usuarios
  const reviews = {
    average: 4.7,
    count: 3,
    comments: [
      { name: 'María González', year: 2024, comment: 'El arreglo floral fue excepcional.' },
      { name: 'Carlos Rodríguez', year: 2023, comment: 'Giftbox personalizada perfecta.' },
      { name: 'Laura Martínez', year: 2025, comment: 'Cuadros decorativos hermosos.' }
    ]
  };

  // Categorías de productos disponibles
  const categories = [
    { id: 'todos', name: 'Todos' },
    { id: 'flores-naturales', name: 'Arreglos con flores naturales' },
    { id: 'flores-secas', name: 'Arreglos con flores secas' },
    { id: 'cuadros-decorativos', name: 'Cuadros decorativos' },
    { id: 'giftboxes', name: 'Giftboxes' },
    { id: 'tarjetas', name: 'Tarjetas' }
  ];

  // Función para cambiar la categoría activa y navegar a la nueva categoría
  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
    // Si se selecciona la categoría 'todos', se realiza un desplazamiento hacia arriba de la página
    if (categoryId === 'todos') window.scrollTo({ top: 0, behavior: 'smooth' });
    // Si se selecciona otra categoría, navega a la página de la categoría
    else navigate(`/categoria/${categoryId}`);
  };

  // Función para manejar el clic en el botón "Producto personalizado"
  const handleCustomProductClick = (e) => {
    e.preventDefault();
    navigate('/customProducts'); // Redirige a la página de productos personalizados
  };

  return (
    <>
      <Header /> {/* Componente que muestra el encabezado de la página */}
      
      {/* Componente de navegación de categorías */}
      <CategoryNavigation 
        categories={categories} 
        activeCategory={activeCategory} 
        onCategoryChange={handleCategoryChange} 
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Diseño en dos columnas: una para las imágenes del producto y otra para la información */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Componente de imágenes del producto */}
          <ProductImages 
            sampleImages={sampleImages} 
            selectedImage={selectedImage} 
            setSelectedImage={setSelectedImage} 
          />
          
          <div>
            {/* Componente que muestra la información básica del producto */}
            <ProductInfo 
              product={product} 
              quantity={quantity} 
              setQuantity={setQuantity} 
              handleCustomProductClick={handleCustomProductClick} 
            />
            {/* Componente de pestañas para cambiar entre Descripción, Detalles y Envío */}
            <ProductTabs 
              tab={tab} 
              setTab={setTab} 
              product={product} 
            />
          </div>
        </div>

        {/* Componente que muestra las reseñas de los usuarios sobre el producto */}
        <ProductReviews reviews={reviews} />
      </div>

      {/* Componente que muestra productos recomendados */}
      <RecommendedProducts />

      <Footer /> {/* Pie de página */}
    </>
  );
};

export default ProductDetail;
