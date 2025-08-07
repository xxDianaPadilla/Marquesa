// Importamos React para crear el componente funcional
import React from 'react';
// Importamos useNavigate para la navegación entre rutas
import { useNavigate } from 'react-router-dom'; 
// Importamos el componente CategoryCard que renderiza cada categoría individual
import CategoryCard from '../components/CategoriesCard';
// Importamos nuestro hook personalizado que maneja la lógica de categorías
import useDataCategories from '../components/Categories/hooks/useDataCategories';

// Definimos el componente CategoriesSection que recibe props configurables
const CategoriesSection = ({ 
    maxCategories = 8,    // Número máximo de categorías a mostrar (default: 8)
    onCategoryClick,      // Función opcional para manejar clicks en categorías
    title = "Nuestras Categorías",  // Título de la sección (configurable)
    subtitle = "Descubre nuestra amplia variedad de productos artesanales"  // Subtítulo (configurable)
}) => {
    // Extraemos categories y loading del hook personalizado
    const { categories, loading } = useDataCategories();
    // Hook de React Router para navegación programática
    const navigate = useNavigate(); 
    
    // Mapeo específico que conecta cada ID de categoría con su ruta correspondiente
    const categoryRoutes = {
        // Flores Naturales - ID específico mapeado a su URL
        '688175a69579a7cde1657aaa': '/categoria/688175a69579a7cde1657aaa',
        // Flores Secas - ID específico mapeado a su URL
        '688175d89579a7cde1657ac2': '/categoria/688175d89579a7cde1657ac2',
        // Cuadros Decorativos - ID específico mapeado a su URL
        '688175fd9579a7cde1657aca': '/categoria/688175fd9579a7cde1657aca',
        // Giftboxes - ID específico mapeado a su URL
        '688176179579a7cde1657ace': '/categoria/688176179579a7cde1657ace',
        // Tarjetas - ID específico mapeado a su URL
        '688175e79579a7cde1657ac6': '/categoria/688175e79579a7cde1657ac6'
    };
    
    // Limitamos el array de categorías al número máximo especificado
    const displayCategories = categories.slice(0, maxCategories);

    // Función que maneja el click en cada categoría
    const handleCategoryClick = (category) => {
        // Si se pasó una función personalizada como prop, la ejecutamos
        if (onCategoryClick) {
            onCategoryClick(category);
        } else {
            // Si no hay función personalizada, usamos la lógica por defecto
            // Buscamos la ruta específica para esta categoría en nuestro mapeo
            const categoryRoute = categoryRoutes[category._id];
            
            // Si encontramos la ruta en el mapeo, navegamos a ella
            if (categoryRoute) {
                console.log(`Navegando a: ${categoryRoute} para categoría: ${category.name}`);
                navigate(categoryRoute);
            } else {
                // Si no está en el mapeo, mostramos advertencia y usamos ruta genérica
                console.warn(`Ruta no encontrada para categoría: ${category.name} (ID: ${category._id})`);
                navigate(`/categoria/${category._id}`);
            }
        }
    };

    // ESTADO DE CARGA: Se muestra mientras se obtienen los datos del servidor
    if (loading) {
        return (
            // Contenedor principal de la sección con fondo blanco y padding vertical responsivo
            <section className="bg-white py-8 sm:py-14">
                {/* Contenedor con ancho máximo y padding horizontal responsivo */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header con título y subtítulo centrados */}
                    <div className="text-center mb-8 sm:mb-12">
                        {/* Título principal con tamaños responsivos y fuente Poppins */}
                        <h2 
                            className="text-2xl sm:text-3xl lg:text-4xl font-medium text-gray-900 mb-4"
                            style={{ fontFamily: "Poppins" }}
                        >
                            {title}
                        </h2>
                        {/* Subtítulo con tamaños responsivos y ancho máximo controlado */}
                        <p 
                            className="text-gray-600 mx-auto text-sm sm:text-base lg:text-lg max-w-xs sm:max-w-2xl lg:max-w-4xl"
                            style={{ fontFamily: "Poppins" }}
                        >
                            {subtitle}
                        </p>
                    </div>
                    
                    {/* Grid de loading skeletons que simula las categorías mientras cargan */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 lg:gap-8">
                        {/* Creamos 5 elementos de loading usando Array.from */}
                        {Array.from({ length: 5 }, (_, index) => (
                            // Cada skeleton tiene fondo gris y animación de pulso
                            <div 
                                key={index}
                                className="bg-gray-200 rounded-2xl animate-pulse"
                                style={{ aspectRatio: '4/3' }} // Mantiene proporción 4:3
                            >
                                {/* Contenedor centrado para el spinner */}
                                <div className="h-full flex items-center justify-center">
                                    {/* Spinner circular con animación de rotación */}
                                    <div className="w-16 h-16 bg-gray-300 rounded-full animate-spin">
                                        <div className="w-full h-full border-4 border-gray-400 border-t-transparent rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    // ESTADO SIN DATOS: Se muestra cuando no hay categorías disponibles
    if (!categories || categories.length === 0) {
        return (
            // Misma estructura que el loading pero con mensaje diferente
            <section className="bg-white py-8 sm:py-14">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8 sm:mb-12">
                        {/* Mismo título que en loading */}
                        <h2 
                            className="text-2xl sm:text-3xl lg:text-4xl font-medium text-gray-900 mb-4"
                            style={{ fontFamily: "Poppins" }}
                        >
                            {title}
                        </h2>
                        {/* Mensaje específico para cuando no hay datos */}
                        <p 
                            className="text-gray-600 mx-auto text-sm sm:text-base lg:text-lg max-w-xs sm:max-w-2xl lg:max-w-4xl"
                            style={{ fontFamily: "Poppins" }}
                        >
                            Pronto tendremos nuestras categorías disponibles
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    // ESTADO NORMAL: Se muestra cuando hay datos disponibles
    return (
        // Contenedor principal de la sección
        <section className="bg-white py-8 sm:py-14">
            {/* Contenedor con restricciones de ancho y centrado */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header de la sección con título y subtítulo */}
                <div className="text-center mb-8 sm:mb-12">
                    {/* Título principal */}
                    <h2 
                        className="text-2xl sm:text-3xl lg:text-4xl font-medium text-gray-900 mb-4"
                        style={{ fontFamily: "Poppins" }}
                    >
                        {title}
                    </h2>
                    {/* Subtítulo descriptivo */}
                    <p 
                        className="text-gray-600 mx-auto text-sm sm:text-base lg:text-lg max-w-xs sm:max-w-2xl lg:max-w-4xl"
                        style={{ fontFamily: "Poppins" }}
                    >
                        {subtitle}
                    </p>
                </div>

                {/* Grid responsivo que muestra las categorías */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 lg:gap-8">
                    {/* Mapeamos cada categoría a un CategoryCard */}
                    {displayCategories.map((category) => (
                        <CategoryCard
                            key={category._id}  // Key única usando el ID de la categoría
                            name={category.name}  // Pasamos el nombre de la categoría
                            image={category.image}  // Pasamos la imagen de la categoría
                            onClick={() => handleCategoryClick(category)}  // Manejador de click
                            className="transform transition-all duration-300 hover:-translate-y-1"  // Clases de animación hover
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

// Exportamos el componente para usar en otros archivos
export default CategoriesSection;