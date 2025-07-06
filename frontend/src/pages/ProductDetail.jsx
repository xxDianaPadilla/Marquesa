import React, { useState, useEffect } from 'react';
import ramoFlores from '../assets/ramoFolores.png';
import Header from '../components/Header/Header';
import Footer from '../components/Footer';
import CategoryNavigation from "../components/CategoryNavigation";
import ProductImages from '../components/ProductDetail/ProductImages';
import ProductInfo from '../components/ProductDetail/ProductInfo';
import ProductTabs from '../components/ProductDetail/ProductTabs';
import ProductReviews from '../components/ProductDetail/ProductReviews';
import { useNavigate } from 'react-router-dom';
import RecommendedProducts from '../components/RecommendedProducts ';
const ProductDetail = () => {
  const [selectedImage, setSelectedImage] = useState(ramoFlores);
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState('description');
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('todos');

  const sampleImages = [ramoFlores, ramoFlores, ramoFlores];

  const product = {
    name: 'Ramo de Rosas Frescas',
    price: '23,00$',
    category: 'Arreglos con flores naturales',
    description: 'Nuestro ramo de rosas frescas...',
    details: 'Las flores incluidas...',
    shipping: 'Envío disponible...',
  };

  const reviews = {
  average: 4.7,
  count: 3,
  comments: [
    { name: 'María González', year: 2024, comment: 'El arreglo floral fue excepcional.' },
    { name: 'Carlos Rodríguez', year: 2023, comment: 'Giftbox personalizada perfecta.' },
    { name: 'Laura Martínez', year: 2025, comment: 'Cuadros decorativos hermosos.' }
  ]
};

const categories = [
  { id: 'todos', name: 'Todos' },
  { id: 'flores-naturales', name: 'Arreglos con flores naturales' },
  { id: 'flores-secas', name: 'Arreglos con flores secas' },
  { id: 'cuadros-decorativos', name: 'Cuadros decorativos' },
  { id: 'giftboxes', name: 'Giftboxes' },
  { id: 'tarjetas', name: 'Tarjetas' }
];

  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
    if (categoryId === 'todos') window.scrollTo({ top: 0, behavior: 'smooth' });
    else navigate(`/categoria/${categoryId}`);
  };

  const handleCustomProductClick = (e) => {
    e.preventDefault();
    navigate('/customProducts');
  };

  return (
    <>
      <Header />
      <CategoryNavigation categories={categories} activeCategory={activeCategory} onCategoryChange={handleCategoryChange} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <ProductImages sampleImages={sampleImages} selectedImage={selectedImage} setSelectedImage={setSelectedImage} />
          <div>
            <ProductInfo product={product} quantity={quantity} setQuantity={setQuantity} handleCustomProductClick={handleCustomProductClick} />
            <ProductTabs tab={tab} setTab={setTab} product={product} />
          </div>
        </div>
        <ProductReviews reviews={reviews} />
      </div>
      <RecommendedProducts />

      <Footer />
    </>
  );
};

export default ProductDetail;
