// Importa React y hooks necesarios desde React
import React, { useState, useEffect } from 'react';
// Importa funciones de React Router para obtener parámetros de la URL y navegar entre rutas
import { useParams, useNavigate } from 'react-router-dom';
// Importa el encabezado del sitio
import Header from '../components/Header/Header';
// Importa el pie de página
import Footer from '../components/Footer';
// Importa el componente de navegación por categorías
import CategoryNavigation from "../components/CategoryNavigation";
// Importa el componente de imágenes del producto
import ProductImages from '../components/ProductDetail/ProductImages';
// Importa la información básica del producto (nombre, precio, etc.)
import ProductInfo from '../components/ProductDetail/ProductInfo';
// Importa las pestañas con descripción, detalles, envío
import ProductTabs from '../components/ProductDetail/ProductTabs';
// Importa el componente de reseñas del producto
import ProductReviews from '../components/ProductDetail/ProductReviews';
// Importa el componente de productos recomendados
import RecommendedProducts from '../components/RecommendedProducts ';
// Importa el hook personalizado que obtiene los detalles del producto
import useDataBaseProductsDetail from '../components/ProductDetail/hooks/useDataProductDetail';

const ProductDetail = () => {
  // Obtiene el parámetro "id" de la URL (el ID del producto)
  const { id } = useParams();
  // Hook para navegar entre rutas del sitio
  const navigate = useNavigate();

  // Debug: muestra el ID recibido y la URL actual
  console.log('=== COMPONENT RENDER ===');
  console.log('ID from useParams:', id);
  console.log('Type of ID:', typeof id);
  console.log('URL actual:', window.location.href);

  // Estado para la imagen seleccionada del producto
  const [selectedImage, setSelectedImage] = useState(null);
  // Estado para la cantidad seleccionada del producto
  const [quantity, setQuantity] = useState(1);
  // Estado para la pestaña activa (descripción, detalles, envío)
  const [tab, setTab] = useState('description');
  // Estado para la categoría activa en el componente de navegación
  const [activeCategory, setActiveCategory] = useState('todos');

  // Hook personalizado que obtiene los datos del producto usando el ID
  const { product, loading, error } = useDataBaseProductsDetail(id);

  // Debug: muestra el estado general del componente (producto, carga y error)
  console.log('🏗️ Estado del componente:', { product, loading, error });

  // Si hay producto y no está cargando, mostrar algunos datos en consola
  if (product && !loading) {
    console.log('🎯 PRODUCTO RECIBIDO EN COMPONENTE:', product);
    console.log('🔍 Nombre en componente:', product.name);
    console.log('🔍 Precio en componente:', product.price);
    console.log('🔍 Descripción en componente:', product.description);
  }

  // useEffect para establecer la primera imagen como imagen seleccionada
  useEffect(() => {
    if (product && product.images && product.images.length > 0 && !selectedImage) {
      setSelectedImage(product.images[0]);
    }
  }, [product, selectedImage]);

  // Función que cambia la categoría activa y navega según el ID
  const handleCategoryChange = (newCategoryId) => {
    setActiveCategory(newCategoryId);
    if (newCategoryId === 'todos') {
      navigate('/categoryProducts'); // Si es "todos", va a la vista general
    } else {
      navigate(`/categoria/${newCategoryId}`); // Si es específica, va a la ruta con ID
    }
  };

  // Función que maneja el clic en el botón de producto personalizado
  const handleCustomProductClick = (e) => {
    e.preventDefault(); // Previene comportamiento por defecto
    navigate('/customProducts'); // Navega a la página de productos personalizados
  };

  // Debug del renderizado del componente
  console.log('🎬 RENDERIZANDO COMPONENTE CON:', { 
    hasProduct: !!product, 
    productName: product?.name,
    loading, 
    error 
  });

  // Muestra el producto en consola si está disponible
  if (product) {
    console.log('✅ PRODUCTO PARA RENDERIZAR:', product);
  }

  // Si está cargando, muestra pantalla de carga con animación
  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando producto...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Si hay error, muestra pantalla de error con mensaje y botón para regresar
  if (error) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error al cargar el producto</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => navigate(-1)} // Navega una página atrás
              className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-md transition-colors"
            >
              Regresar
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Si no hay producto (producto no existe), muestra mensaje de "no encontrado"
  if (!product) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Producto no encontrado</h2>
            <p className="text-gray-600 mb-4">El producto que buscas no existe o ha sido eliminado.</p>
            <button
              onClick={() => navigate('/categoryProducts')} // Regresa a la lista general
              className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-md transition-colors"
            >
              Ver todos los productos
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Render principal del producto cuando todo está cargado correctamente
  return (
    <div>
      <Header />
      
      {/* Navegación de categorías arriba del producto */}
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
            activeCategory={product.categoryId || "todos"} // Marca la categoría actual
            onCategoryChange={handleCategoryChange} // Maneja cambios de categoría
          />
        </div>
      </section>

      {/* Contenedor principal del detalle del producto */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Layout en dos columnas: imágenes e info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Muestra las imágenes del producto con posibilidad de selección */}
          <ProductImages 
            sampleImages={product.images || []}
            selectedImage={selectedImage} 
            setSelectedImage={setSelectedImage} 
          />
          
          <div>
            {/* Información del producto: nombre, precio, stock, botón, etc. */}
            <ProductInfo 
              product={product} 
              quantity={quantity} 
              setQuantity={setQuantity} 
              handleCustomProductClick={handleCustomProductClick} 
            />
            {/* Pestañas de descripción, detalles y envío */}
            <ProductTabs 
              tab={tab} 
              setTab={setTab} 
              product={product} 
            />
          </div>
        </div>

        {/* Reseñas del producto: promedio, cantidad y comentarios */}
        <ProductReviews reviews={product.reviews || { average: 0, count: 0, comments: [] }} />
      </div>

      {/* Muestra productos recomendados al final */}
      <RecommendedProducts />

      {/* Pie de página del sitio */}
      <Footer />
    </div>
  );
};

// Exporta el componente para que pueda ser utilizado en las rutas
export default ProductDetail;
