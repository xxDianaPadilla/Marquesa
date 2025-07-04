import React, { useState } from 'react';
import ramoFlores from '../assets/ramoFolores.png';
import Header from '../components/Header/Header';
import perfilUsuario from '../assets/perfilUsuario.png';
import editar from '../assets/editarP.png';
import guardar from '../assets/guardarP.png';
import carrito from '../assets/carritoP.png';
import Footer from '../components/Footer';
import CategoryNavigation from "../components/CategoryNavigation";

import { FaStar, FaRegStar, FaStarHalfAlt } from 'react-icons/fa';

const ProductDetail = () => {
  const sampleImages = [ramoFlores, ramoFlores, ramoFlores, ramoFlores];
  const [selectedImage, setSelectedImage] = useState(sampleImages[0]);
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState('description');

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
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Imagen principal + miniaturas */}
          <div>
            <img src={selectedImage} alt="Producto" className="rounded-md w-full" />
            <div className="flex gap-2 mt-2">
              {sampleImages.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`Miniatura ${i}`}
                  onClick={() => setSelectedImage(img)}
                  className="w-24 h-auto max-h-24 object-contain rounded-md cursor-pointer"
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
                    className={`flex-1 px-4 py-2 text-center ${
                      tab === key
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
