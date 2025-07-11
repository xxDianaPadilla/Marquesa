import React from "react";
import { useNavigate } from "react-router-dom";

// Importar los iconos disponibles
import instagram from '../assets/instagramIcon.png';
import facebook from '../assets/facebookIcon.png';
import footerFlowerIcon from '../assets/footerFlowerIcon.png';
import locationIcon from '../assets/locationIcon.png';
import emailIcon from '../assets/emailIcon.png';
import telephoneIcon from '../assets/telephoneIcon.png';

// Componente para el pie de página
const Footer = () => {
  // Hook para la navegación
  const navigate = useNavigate();

// Función para navegar a la página de medios
  const handleMediaClick = () => {
    navigate('/mediaPage');
  };

  // Función para navegar a la página de la ruleta
  const handleConcursosClick = () => {
    navigate('/ruleta');
  };

// Función para navegar a las condiciones de promociones
  const handleConditionsPromotionsClick = () => {
    navigate('/conditionsPromotions');
  };

// Función para navegar a la información de envío
  const handleShippingInformationClick = () => {
    navigate('/shippingInformation');
  };

// Función para navegar a la página "Sobre nosotros"
  const handleAboutUsClick = () => {
    navigate('/aboutUs');
  };

// Función para navegar a la página de políticas de privacidad
  const handlePrivacyPoliciesClick = () => {
    navigate('/privacyPolicies');
  };

// Función para navegar a la página de términos y condiciones
  const handleTermsandConditionsClick = () => {
    navigate('/termsandConditions');
  };

// Función para navegar a la página de servicios
  const handleServicesClick = () => {
    navigate('/home');
  };

  return (
    <footer className="bg-white border-t border-gray-200 py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 font-poppins">
      {/* Logo y decoración superior */}
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold tracking-widest text-gray-800 mb-2">
            ● M A R Q U E S A ●
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 tracking-wide">TIENDA DE REGALOS</p>
          <div className="flex justify-center items-center mt-4">
            <div className="h-px bg-gray-300 flex-1 max-w-[150px] sm:max-w-[200px] lg:max-w-[400px]"></div>
            <div className="mx-3 sm:mx-4 text-gray-400">
              <img src={footerFlowerIcon} alt="Flores" className="w-3 h-3 sm:w-4 sm:h-4" />
            </div>
            <div className="h-px bg-gray-300 flex-1 max-w-[150px] sm:max-w-[200px] lg:max-w-[400px]"></div>
          </div>
        </div>

        {/* Contenido principal del footer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12">

          {/* Información de contacto */}
          <div className="text-center sm:text-left">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 sm:mb-6 italic">Información</h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-start justify-center sm:justify-start space-x-3">
                <img src={locationIcon} alt="Ubicación" className="w-4 h-4 mt-1 flex-shrink-0" />
                <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                  <p>Antigua Calle Ferrocarril,</p>
                  <p>Colonia La Sultana 1, Antiguo</p>
                  <p>Cuscatlán</p>
                </div>
              </div>
              <div className="flex items-center justify-center sm:justify-start space-x-3">
                <img src={emailIcon} alt="Email" className="w-4 h-4 flex-shrink-0" />
                <p className="text-xs sm:text-sm text-gray-600 break-all">marquesasv@gmail.com</p>
              </div>
              <div className="flex items-center justify-center sm:justify-start space-x-3">
                <img src={telephoneIcon} alt="Teléfono" className="w-4 h-4 flex-shrink-0" />
                <p className="text-xs sm:text-sm text-gray-600">+503 7867-9434</p>
              </div>
            </div>
          </div>

          {/* Categorías */}
          <div className="text-center sm:text-left">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 sm:mb-6 italic">Categorías</h3>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-center sm:justify-start space-x-3">
                <img src={footerFlowerIcon} alt="Flores" className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <p className="text-xs sm:text-sm text-gray-600 hover:text-gray-800 cursor-pointer transition-colors">
                  Arreglos con flores naturales
                </p>
              </div>
              <div className="flex items-center justify-center sm:justify-start space-x-3">
                <img src={footerFlowerIcon} alt="Flores secas" className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <p className="text-xs sm:text-sm text-gray-600 hover:text-gray-800 cursor-pointer transition-colors">
                  Arreglos con flores secas
                </p>
              </div>
              <div className="flex items-center justify-center sm:justify-start space-x-3">
                <img src={footerFlowerIcon} alt="Cuadros" className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <p className="text-xs sm:text-sm text-gray-600 hover:text-gray-800 cursor-pointer transition-colors">
                  Cuadros Decorativos
                </p>
              </div>
              <div className="flex items-center justify-center sm:justify-start space-x-3">
                <img src={footerFlowerIcon} alt="Giftboxes" className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <p className="text-xs sm:text-sm text-gray-600 hover:text-gray-800 cursor-pointer transition-colors">
                  Giftboxes
                </p>
              </div>
              <div className="flex items-center justify-center sm:justify-start space-x-3">
                <img src={footerFlowerIcon} alt="Tarjetas" className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <p className="text-xs sm:text-sm text-gray-600 hover:text-gray-800 cursor-pointer transition-colors">
                  Tarjetas
                </p>
              </div>
            </div>
          </div>

          {/* Avisos y políticas */}
          <div className="text-center sm:text-left">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 sm:mb-6 italic">Avisos y políticas</h3>
            <div className="space-y-2 sm:space-y-3">
              <p
                className="text-xs sm:text-sm text-gray-600 hover:text-gray-800 cursor-pointer transition-colors"
                onClick={handleTermsandConditionsClick}
              >
                Términos y Condiciones
              </p>
              <p
                className="text-xs sm:text-sm text-gray-600 hover:text-gray-800 cursor-pointer transition-colors"
                onClick={handleConditionsPromotionsClick}
              >
                Condiciones Ofertas
              </p>
              <p
                className="text-xs sm:text-sm text-gray-600 hover:text-gray-800 cursor-pointer transition-colors duration-200"
                onClick={handleConcursosClick}
                style={{ cursor: 'pointer' }}
              >
                Concursos y Rifas
              </p>
              <p
                className="text-xs sm:text-sm text-gray-600 hover:text-gray-800 cursor-pointer transition-colors"
                onClick={handleShippingInformationClick}
              >
                Delivery info
              </p>
              <p
                className="text-xs sm:text-sm text-gray-600 hover:text-gray-800 cursor-pointer transition-colors"
                onClick={handlePrivacyPoliciesClick}
              >
                Políticas de Privacidad
              </p>
            </div>
          </div>

          {/* Sobre nosotros */}
          <div className="text-center sm:text-left">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 sm:mb-6 italic">Sobre nosotros</h3>
            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
              <p
                className="text-xs sm:text-sm text-gray-600 hover:text-gray-800 cursor-pointer transition-colors"
                onClick={handleServicesClick}
              >
                Servicios
              </p>
              <p
                className="text-xs sm:text-sm text-gray-600 hover:text-gray-800 cursor-pointer transition-colors"
                onClick={handleAboutUsClick}
              >
                Historia
              </p>
              <p
                className="text-xs sm:text-sm text-gray-600 hover:text-gray-800 cursor-pointer transition-colors"
                onClick={handleMediaClick}
              >
                Blogs
              </p>
            </div>

            {/* Redes sociales */}
            <div>
              <h4 className="text-sm sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 italic">Síguenos</h4>
              <div className="flex justify-center sm:justify-start space-x-3">
                <a
                  href="https://www.facebook.com/share/1C5F39CLta/?mibextid=wwXIfr"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                >
                  <img src={facebook} alt="Facebook" className="w-4 h-4 sm:w-5 sm:h-5" />
                </a>
                <a
                  href="https://www.instagram.com/marquesasv?igsh=MW9oNmxldWFxZXpnMw=="
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-600 to-pink-500 rounded-full flex items-center justify-center hover:from-purple-700 hover:to-pink-600 transition-colors"
                >
                  <img src={instagram} alt="Instagram" className="w-4 h-4 sm:w-5 sm:h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer inferior */}
        <div className="border-t border-gray-400 mt-8 sm:mt-10 lg:mt-12 pt-6 sm:pt-8">
          <div className="text-center">
            <p className="text-xs sm:text-sm text-gray-500">
              © 2025 MARQUESA. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;