// Importa los hooks useState y useEffect desde React
import { useState, useEffect } from 'react';

// Hook personalizado que recibe un productId y obtiene los detalles del producto desde una API
const useDataBaseProductsDetail = (productId) => {
    // Estado para guardar los datos del producto
    const [product, setProduct] = useState(null);
    // Estado para indicar si está cargando
    const [loading, setLoading] = useState(true);
    // Estado para manejar errores
    const [error, setError] = useState(null);

    // useEffect se ejecuta cuando cambia el productId
    useEffect(() => {
        // Función asincrónica para obtener los detalles del producto
        const fetchProductDetail = async () => {
            // Muestra el productId recibido en consola
            console.log('ProductId recibido:', productId);
            // Muestra el tipo de dato de productId
            console.log('Tipo de productId:', typeof productId);
            // Verifica si productId es "truthy"
            console.log('ProductId es válido:', !!productId);

            // Si no se proporciona un productId válido, se marca el error y se detiene la carga
            if (!productId || productId.trim() === '') {
                console.log('ProductId es null/undefined/vacío');
                setError('ID del producto requerido');
                setLoading(false);
                return;
            }

            try {
                // Comienza la carga y limpia errores previos
                setLoading(true);
                setError(null);

                // Construye la URL para la petición al backend
                const url = `https://marquesa.onrender.com/api/products/${productId}`;
                // Realiza la solicitud fetch al servidor
                const response = await fetch(url, {
                    method: 'GET', // Método GET para obtener datos
                    headers: {
                        'Content-Type': 'application/json', // Especifica tipo de contenido JSON
                    }
                });

                // Muestra detalles de la respuesta
                console.log('Respuesta recibida');
                console.log('Status:', response.status);
                console.log('Status Text:', response.statusText);
                console.log('OK:', response.ok);

                // Verifica si la respuesta fue exitosa
                if (!response.ok) {
                    const errorText = await response.text(); // Lee el texto del error
                    console.error('Error del servidor:', response.status, errorText);
                    throw new Error(`Error del servidor: ${response.status}`); // Lanza error personalizado
                }

                // Intenta parsear el JSON de la respuesta
                console.log('Intentando parsear JSON...');
                const responseData = await response.json(); // Parsea JSON
                console.log('JSON parseado exitosamente');
                console.log('Datos completos recibidos:', responseData);

                // Variable para guardar los datos reales del producto
                let actualProductData = null;

                // Verifica si la respuesta sigue la estructura con success y data
                if (responseData.success && responseData.data) {
                    console.log('Estructura estándar encontrada (success + data)');
                    actualProductData = responseData.data;
                } else if (responseData.data) {
                    // Si no hay success pero sí hay data
                    console.log('Estructura con data encontrada');
                    actualProductData = responseData.data;
                } else {
                    // Si no hay ni success ni data, usa directamente la respuesta
                    console.log('Usando datos directos');
                    actualProductData = responseData;
                }

                // Si no se reciben datos válidos, se lanza un error
                if (!actualProductData) {
                    throw new Error('No se recibieron datos del producto');
                }

                // Transforma los datos recibidos para adaptarlos al formato esperado
                const transformedProduct = {
                    _id: actualProductData._id || productId, // Usa ID recibido o el proporcionado
                    name: actualProductData.name || 'Producto sin nombre', // Nombre del producto
                    price: actualProductData.price ? `$${actualProductData.price}` : '$0', // Precio en formato string
                    category: actualProductData.categoryId?.name || 'Sin categoría', // Nombre de la categoría
                    categoryId: actualProductData.categoryId?._id || null, // ID de la categoría
                    description: actualProductData.description || 'Descripción no disponible', // Descripción
                    details: actualProductData.details || 'Detalles no disponibles', // Detalles
                    shipping: actualProductData.shipping || 'Información de envío no disponible', // Información de envío
                    images: Array.isArray(actualProductData.images)
                        ? actualProductData.images.map(img => img.image || img)
                        : [], // Arreglo de URLs de imágenes
                    stock: actualProductData.stock || 0, // Stock disponible
                    isPersonalizable: actualProductData.isPersonalizable || false, // Si el producto es personalizable
                    reviews: {
                        average: actualProductData.reviews?.average || 0, // Promedio de reviews
                        count: actualProductData.reviews?.count || 0, // Cantidad de reviews
                        comments: actualProductData.reviews?.comments || [] // Comentarios de usuarios
                    },
                    createdAt: actualProductData.createdAt, // Fecha de creación
                    updatedAt: actualProductData.updatedAt // Fecha de última actualización
                };

                // Muestra por consola el producto transformado
                console.log('Producto transformado:', transformedProduct);
                console.log('Verificación final:');
                console.log('  - Nombre:', transformedProduct.name);
                console.log('  - Precio:', transformedProduct.price);
                console.log('  - Descripción:', transformedProduct.description);
                console.log('  - Imágenes:', transformedProduct.images.length);

                // Establece el producto transformado en el estado
                console.log('Estableciendo producto en estado');
                setProduct(transformedProduct);

            } catch (err) {
                // Captura errores de red o ejecución
                console.log('ERROR CAPTURADO');
                console.error('Tipo de error:', err.constructor.name);
                console.error('Mensaje de error:', err.message);
                console.error('Stack trace:', err.stack);

                let errorMessage = 'Error desconocido';

                // Diferentes mensajes según el tipo de error
                if (err.name === 'TypeError' && err.message.includes('fetch')) {
                    errorMessage = 'No se pudo conectar con el servidor. Verifica que esté corriendo.';
                } else if (err.message.includes('NetworkError') || err.message.includes('Failed to fetch')) {
                    errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
                } else {
                    errorMessage = err.message;
                }

                // Establece el error en el estado
                setError(errorMessage);
            } finally {
                // Finaliza la carga sin importar si hubo éxito o error
                setLoading(false);
            }
        };

        // Si hay productId válido, se ejecuta la función para obtener el producto
        if (productId) {
            fetchProductDetail();
        } else {
            // Si no hay ID válido, se evita la llamada y se marca el error
            console.log('No se ejecuta fetch - productId no válido:', productId);
            setLoading(false);
            setError('ID del producto requerido');
        }
    }, [productId]); // Se ejecuta cada vez que productId cambia

    // Muestra en consola el estado actual del hook
    console.log('Estado actual del hook:', {
        hasProduct: !!product, // Si hay producto
        loading, // Estado de carga
        hasError: !!error, // Si hay error
        productId, // ID actual
        productName: product?.name // Nombre del producto si existe
    });

    // Devuelve los estados necesarios para usar el hook
    return {
        product, // Datos del producto
        loading, // Indicador de carga
        error // Mensaje de error si existe
    };
};

// Exporta el hook para usarlo en otros componentes
export default useDataBaseProductsDetail;