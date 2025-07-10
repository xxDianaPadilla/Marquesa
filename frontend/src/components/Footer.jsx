import React from "react";
import { useNavigate } from "react-router-dom";

// Importar los iconos disponibles
import instagram from '../assets/instagramIcon.png';
import facebook from '../assets/facebookIcon.png';
import footerFlowerIcon from '../assets/footerFlowerIcon.png';
import locationIcon from '../assets/locationIcon.png';
import emailIcon from '../assets/emailIcon.png';
import telephoneIcon from '../assets/telephoneIcon.png';

const Footer = () => {
  const navigate = useNavigate();

  const handleMediaClick = () => {
    navigate('/mediaPage');
  };

  // Función para navegar a la página de la ruleta
  const handleConcursosClick = () => {
    navigate('/ruleta');
  };

  const handleConditionsPromotionsClick = () => {
    navigate('/conditionsPromotions');
  };

  const handleShippingInformationClick = () => {
    navigate('/shippingInformation');
  };

  return (
    <footer className="bg-white border-t border-gray-200 py-16 px-8 font-poppins">
      {/* Logo y decoración superior */}
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold tracking-widest text-gray-800 mb-2">
            ● M A R Q U E S A ●
          </h2>
          <p className="text-sm text-gray-600 tracking-wide">TIENDA DE REGALOS</p>
          <div className="flex justify-center mt-4">
            <div className="mt-2 h-px bg-gray-300" style={{ width: "400px" }}></div>
            <div className="mx-4 text-gray-400"><img src={footerFlowerIcon} alt="Flores" className="w-4 h-4" /></div>
            <div className="mt-2 h-px bg-gray-300" style={{ width: "400px" }}></div>
          </div>
        </div>

        {/* Contenido principal del footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Información de contacto */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-6 italic">Información</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <img src={locationIcon} alt="Ubicación" className="w-4 h-4 mt-1" />
                <div className="text-sm text-gray-600">
                  <p>Antigua Calle Ferrocarril,</p>
                  <p>Colonia La Sultana 1, Antiguo</p>
                  <p>Cuscatlán</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <img src={emailIcon} alt="Email" className="w-4 h-4" />
                <p className="text-sm text-gray-600">marquesasv@gmail.com</p>
              </div>
              <div className="flex items-center space-x-3">
                <img src={telephoneIcon} alt="Teléfono" className="w-4 h-4" />
                <p className="text-sm text-gray-600">+503 7867-9434</p>
              </div>
            </div>
          </div>

          {/* Categorías */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-6 italic">Categorías</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <img src={footerFlowerIcon} alt="Flores" className="w-4 h-4" />
                <p className="text-sm text-gray-600 hover:text-gray-800 cursor-pointer">
                  Arreglos con flores naturales
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <img src={footerFlowerIcon} alt="Flores secas" className="w-4 h-4" />
                <p className="text-sm text-gray-600 hover:text-gray-800 cursor-pointer">
                  Arreglos con flores secas
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <img src={footerFlowerIcon} alt="Cuadros" className="w-4 h-4" />
                <p className="text-sm text-gray-600 hover:text-gray-800 cursor-pointer">
                  Cuadros Decorativos
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <img src={footerFlowerIcon} alt="Giftboxes" className="w-4 h-4" />
                <p className="text-sm text-gray-600 hover:text-gray-800 cursor-pointer">
                  Giftboxes
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <img src={footerFlowerIcon} alt="Tarjetas" className="w-4 h-4" />
                <p className="text-sm text-gray-600 hover:text-gray-800 cursor-pointer">
                  Tarjetas
                </p>
              </div>
            </div>
          </div>

          {/* Avisos y políticas */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-6 italic">Avisos y políticas</h3>
            <div className="space-y-3">
              <p
                className="text-sm text-gray-600 hover:text-gray-800 cursor-pointer"
              // onClick={handleTermsConditionsClick}
              >
                Términos y Condiciones
              </p>
              <p
                className="text-sm text-gray-600 hover:text-gray-800 cursor-pointer"
                onClick={handleConditionsPromotionsClick}
              >
                Condiciones Ofertas
              </p>
              <p
                className="text-sm text-gray-600 hover:text-gray-800 cursor-pointer transition-colors duration-200"
                onClick={handleConcursosClick}
                style={{ cursor: 'pointer' }}
              >
                Concursos y Rifas
              </p>
              <p
                className="text-sm text-gray-600 hover:text-gray-800 cursor-pointer"
                onClick={handleShippingInformationClick}
              >
                Delivery info
              </p>
              <p
                className="text-sm text-gray-600 hover:text-gray-800 cursor-pointer"
              // onClick={handlePrivacyPoliciesClick}
              >
                Privacidad
              </p>
            </div>
          </div>

          {/* Sobre nosotros */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-6 italic">Sobre nosotros</h3>
            <div className="space-y-3 mb-6">
              <p
                className="text-sm text-gray-600 hover:text-gray-800 cursor-pointer"
              // onClick={handleServicesClick}
              >
                Servicios
              </p>
              <p
                className="text-sm text-gray-600 hover:text-gray-800 cursor-pointer"
              // onClick={handleHistoryClick}
              >
                Historia
              </p>
              <p
                className="text-sm text-gray-600 hover:text-gray-800 cursor-pointer"
                onClick={handleMediaClick}
              >
                Blogs
              </p>
            </div>

            {/* Redes sociales */}
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4 italic">Síguenos</h4>
              <div className="flex space-x-3">
                <a
                  href="https://www.facebook.com/share/1C5F39CLta/?mibextid=wwXIfr"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                >
                  <img src={facebook} alt="Facebook" className="w-5 h-5" />
                </a>
                <a
                  href="https://www.instagram.com/marquesasv?igsh=MW9oNmxldWFxZXpnMw=="
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-500 rounded-full flex items-center justify-center hover:from-purple-700 hover:to-pink-600 transition-colors"
                >
                  <img src={instagram} alt="Instagram" className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer inferior */}
        <div className="border-t border-gray-400 mt-12 pt-8">
          <div className="text-center">
            <p className="text-sm text-gray-500">
              © 2025 MARQUESA. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;