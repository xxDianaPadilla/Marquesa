import React from 'react';
import { useNavigate } from 'react-router-dom';
import floresNaturales from '../assets/floresNaturales.jpg';
import floresSecas from '../assets/floresSecas.jpeg';
import giftbox from '../assets/giftbox.jpg';

const PersonalizableSection = () => {
    const navigate = useNavigate();

    // Datos estáticos de las 3 categorías personalizables según tu modelo
    const personalizableCategories = [
        {
            id: 'ramo-flores-naturales',
            title: 'Ramos de flores naturales',
            description: 'Arreglos únicos con flores frescas para cada ocasión especial',
            productType: 'Ramo de flores naturales',
            image: floresNaturales,
            color: 'from-rose-200 to-rose-300',
            gradientOverlay: 'bg-gradient-to-br from-rose-200/80 to-rose-300/60',
            icon: '🌸',
            bgColor: 'bg-rose-100',
            textColor: 'text-rose-700',
            buttonColor: 'bg-rose-300 hover:bg-rose-400',
            borderColor: 'border-rose-200',
            categories: ['Flores naturales', 'Envoltura', 'Liston']
        },
        {
            id: 'ramo-flores-secas',
            title: 'Ramos de flores secas',
            description: 'Diseños duraderos con flores secas de alta calidad y estilo',
            productType: 'Ramo de flores secas',
            image: floresSecas,
            color: 'from-cyan-200 to-cyan-300',
            gradientOverlay: 'bg-gradient-to-br from-cyan-200/80 to-cyan-300/60',
            icon: '🌾',
            bgColor: 'bg-cyan-100',
            textColor: 'text-cyan-700',
            buttonColor: 'bg-cyan-300 hover:bg-cyan-400',
            borderColor: 'border-cyan-200',
            categories: ['Flores secas', 'Envoltura', 'Liston']
        },
        {
            id: 'giftbox',
            title: 'Giftbox',
            description: 'Cajas sorpresa personalizadas con detalles únicos y especiales',
            productType: 'Giftbox',
            image: giftbox,
            color: 'from-red-300 to-red-400',
            gradientOverlay: 'bg-gradient-to-br from-red-300/80 to-red-400/60',
            icon: '🎁',
            bgColor: 'bg-red-100',
            textColor: 'text-red-700',
            buttonColor: 'bg-red-300 hover:bg-red-400',
            borderColor: 'border-red-200',
            categories: ['Base para giftbox', 'Comestibles para giftbox', 'Extras']
        }
    ];

    // Función para manejar el clic en personalizar
    const handlePersonalizeClick = (category) => {
        // Navegar a la página de personalización con el tipo de producto como parámetro
        navigate(`/customProducts?product=${encodeURIComponent(category.productType)}&categories=${encodeURIComponent(JSON.stringify(category.categories))}`);
    };

    return (
        <section className="mb-8 sm:mb-12">
            {/* Título de la sección */}
            <div className="mb-3 sm:mb-0">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">
                    Productos Personalizables
                </h2>
                <p className="text-xs sm:text-sm text-gray-500">
                    Crea algo único y especial. Personaliza cada detalle para hacer de tu regalo algo inolvidable
                </p>
            </div>
            <br />
            {/* Grid de cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                {personalizableCategories.map((category) => (
                    <PersonalizableCard
                        key={category.id}
                        category={category}
                        onPersonalizeClick={handlePersonalizeClick}
                    />
                ))}
            </div>
        </section>
    );
};

const PersonalizableCard = ({ category, onPersonalizeClick }) => {
    return (
        <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-gray-50 h-full">
            {/* Badge de personalizable */}
            <div className="absolute top-4 left-4 z-10">
                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${category.bgColor} ${category.textColor} ${category.borderColor} border-2 shadow-sm backdrop-blur-sm`}>
                    <svg
                        className="w-3 h-3 mr-1.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Personalizable
                </span>
            </div>

            {/* Imagen con overlay gradient suave */}
            <div className="relative h-48 sm:h-56 overflow-hidden">
                <img
                    src={category.image}
                    alt={category.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                        e.target.src = '/placeholder-image.jpg';
                    }}
                />
                {/* Gradient overlay más suave */}
                <div className={`absolute inset-0 ${category.gradientOverlay} opacity-30 group-hover:opacity-40 transition-opacity duration-300`}></div>

                {/* Botón personalizar que aparece en hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black bg-opacity-10">
                    <button
                        style={{ cursor: 'pointer' }}
                        onClick={() => onPersonalizeClick(category)}
                        className={`${category.buttonColor} text-white px-6 py-3 rounded-xl font-semibold transform -translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2 backdrop-blur-sm`}
                    >
                        <span className="text-lg">{category.icon}</span>
                        <span>Personalizar</span>
                    </button>
                </div>
            </div>

            {/* Contenido de la card */}
            <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors">
                        {category.title}
                    </h3>
                    <span className="text-2xl ml-2">{category.icon}</span>
                </div>

                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {category.description}
                </p>

                {/* Categorías disponibles */}
                <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Opciones disponibles:</p>
                    <div className="flex flex-wrap gap-1">
                        {category.categories.map((cat, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                {cat}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Características destacadas con colores suaves */}
                <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${category.bgColor} ${category.textColor}`}>
                        ✨ Único
                    </span>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-600">
                        🎨 Personalizable
                    </span>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-600">
                        💝 Especial
                    </span>
                </div>

                {/* Call to action */}
                <div className="text-center">
                    <button
                        onClick={() => onPersonalizeClick(category)}
                        className={`w-full ${category.buttonColor} text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 hover:transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center space-x-2`}
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>Comenzar personalización</span>
                    </button>
                </div>
            </div>

            {/* Línea decorativa inferior con gradiente suave */}
            <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${category.color} opacity-60 group-hover:opacity-100 transition-opacity duration-300`}></div>
        </div>
    );
};

export default PersonalizableSection;