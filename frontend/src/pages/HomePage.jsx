import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Componentes principales existentes
import Header from "../components/Header/Header";
import Footer from "../components/Footer";
import CategoryNavigation from "../components/CategoryNavigation";
import ChatButton from "../components/Chat/ChatButton";

// Componentes nuevos reutilizables
import FeatureCard from "../components/FeatureCard";
import Container from "../components/Container";
import ActionButton from "../components/ActionButton";

// NUEVO: Carrusel de productos destacados dinámico
import FeaturedProductsCarousel from "../components/FeaturedProductsCarousel";

// NUEVO: Carrusel de testimonios
import TestimonialsCarousel from "../components/TestimonialCarousel";

// NUEVO: Sección de categorías
import CategoriesSection from '../components/CategoriesSectionHome';

// Recursos visuales
import heroImage from "../assets/postfebruaryhome.png";

const HomePage = () => {
  const navigate = useNavigate();

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
      description: "Todos nuestros productos contienen diversos materiales de calidad utilizando la renovación en los materiales orgánicos y siguiendo nuestro estilo en la transformación para crear cada uno de los detalles únicos."
    },
    {
      icon: (
        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-[#CD5277]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
          <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
        </svg>
      ),
      title: "Diseños únicos",
      description: "Cada producto que se realiza es único en su diseño utilizando diversos materiales adaptados a las necesidades de nuestros clientes"
    },
    {
      icon: (
        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-[#CD5277]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      ),
      title: "Amplia Variedad",
      description: "Contamos con una diversidad de productos que cumplen con las necesidades y requerimientos de nuestros clientes"
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
            activeCategory={null}
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
      <CategoriesSection
        maxCategories={5}
        onCategoryClick={(category) => {
          // Mapeo específico de categorías a sus rutas
          const categoryRoutes = {
            // Flores Naturales
            '688175a69579a7cde1657aaa': '/categoria/688175a69579a7cde1657aaa',
            // Flores Secas  
            '688175d89579a7cde1657ac2': '/categoria/688175d89579a7cde1657ac2',
            // Cuadros Decorativos
            '688175fd9579a7cde1657aca': '/categoria/688175fd9579a7cde1657aca',
            // Giftboxes
            '688176179579a7cde1657ace': '/categoria/688176179579a7cde1657ace',
            // Tarjetas
            '688175e79579a7cde1657ac6': '/categoria/688175e79579a7cde1657ac6'
          };

          const categoryRoute = categoryRoutes[category._id];

          if (categoryRoute) {
            console.log(`Navegando a: ${categoryRoute} para categoría: ${category.name}`);
            navigate(categoryRoute);
          } else {
            console.warn(`Ruta no encontrada para categoría: ${category.name} (ID: ${category._id})`);
            navigate(`/categoria/${category._id}`);
          }
        }}
        title="Nuestras Categorías"
        subtitle="Explora nuestra selección de productos para cada ocasión."
      />

      {/* SECCIÓN DE PRODUCTOS DESTACADOS ACTUALIZADA */}
      {/* Ahora usa productos reales de la base de datos con carrusel dinámico */}
      <div id="productos-destacados">
        <FeaturedProductsCarousel
          autoSlideInterval={5000}  // Cambio automático cada 5 segundos
          showArrows={true}         // Mostrar flechas de navegación
          showDots={true}          // Mostrar indicadores de posición
          className="scroll-mt-20"  // Margen superior para scroll suave
        />
      </div>

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
              Somos una marca que nos distinguimos por crear detalles únicos y personalizados,
              teniendo atención a cada uno de los detalles
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