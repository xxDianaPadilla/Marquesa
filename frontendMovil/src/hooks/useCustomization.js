import { useState } from 'react';

// Hook para el proceso de personalización de productos (MÓVIL)
const useCustomization = () => {
    const [isLoading, setIsLoading] = useState(false);

    // Función para crear el producto personalizado (ADAPTADA PARA MÓVIL)
    const createCustomProduct = async (customProductData, referenceImage = null) => {
        try {
            console.log('=== ENVIANDO DATOS AL SERVIDOR (MÓVIL) ===');
            console.log('customProductData:', customProductData);
            console.log('referenceImage:', referenceImage);

            // Preparar datos para móvil
            let requestData = { ...customProductData };

            // Si hay imagen, convertirla a base64 para móvil
            if (referenceImage) {
                console.log('=== PROCESANDO IMAGEN PARA MÓVIL ===');
                console.log('Tipo de referenceImage:', typeof referenceImage);
                console.log('Propiedades de referenceImage:', Object.keys(referenceImage));

                // Si la imagen ya es base64 string
                if (typeof referenceImage === 'string' && referenceImage.startsWith('data:image')) {
                    requestData.referenceImageBase64 = referenceImage;
                    console.log('Imagen base64 agregada directamente');
                }
                // Si es un objeto con datos base64 (formato de React Native/Expo)
                else if (referenceImage.base64) {
                    // Asegurarse de que el base64 tenga el formato correcto
                    const base64String = `data:image/jpeg;base64,${referenceImage.base64}`;
                    requestData.referenceImageBase64 = base64String;
                    console.log('Imagen convertida a base64 completa');
                    console.log('Base64 length:', base64String.length);
                }
                // Si solo tenemos la URI (fallback, aunque no debería pasar)
                else if (referenceImage.uri) {
                    console.warn('ADVERTENCIA: Solo se encontró URI, se necesita base64');
                    console.log('URI encontrada:', referenceImage.uri);
                    // No agregar nada, porque la URI no servirá en el backend
                }
                else {
                    console.error('ERROR: Formato de imagen no reconocido');
                    console.log('referenceImage object:', referenceImage);
                }
            }

            console.log('=== DATOS FINALES PARA MÓVIL ===');
            console.log('requestData:', JSON.stringify(requestData, null, 2));

            // ENVÍO COMO JSON (siempre para móvil)
            const response = await fetch('https://marquesa.onrender.com/api/customProducts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
                // Para móvil, quitar credentials: 'include' si causa problemas
                // credentials: 'include'
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);

            const data = await response.json();
            console.log('=== RESPUESTA DEL SERVIDOR ===');
            console.log('Full response data:', data);

            if (response.ok && data.success) {
                return data.data;
            } else {
                console.error('=== ERROR DEL SERVIDOR ===');
                console.error('Status:', response.status);
                console.error('Response data:', data);

                // Mostrar errores de validación específicos si existen
                if (data.errors) {
                    console.error('Validation errors:', data.errors);
                    const errorMessages = Array.isArray(data.errors)
                        ? data.errors.map(err => err.message || err).join(', ')
                        : JSON.stringify(data.errors);
                    throw new Error(`Errores de validación: ${errorMessages}`);
                }

                throw new Error(data.message || 'Error al crear el producto personalizado');
            }

        } catch (error) {
            console.error('=== ERROR EN CATCH (MÓVIL) ===');
            console.error('Error creating custom product:', error);

            // Mejorar el manejo de errores de red para móvil
            if (error.message === 'Network request failed') {
                throw new Error('Error de conexión. Verifica tu conexión a internet.');
            }

            throw error;
        }
    };

    // Función para agregar item al carrito (CORREGIDA)
    const addItemToCart = async (userId, itemData) => {
        try {
            console.log('=== AGREGANDO AL CARRITO (MÓVIL) ===');
            console.log('userId:', userId);
            console.log('itemData recibido:', itemData);
            console.log('itemData.itemId type:', typeof itemData.itemId);
            console.log('itemData.itemId value:', itemData.itemId);

            if (!itemData.itemId) {
                console.error('itemId es undefined o null');
                throw new Error('itemData.itemId es requerido');
            }

            if (!userId) {
                throw new Error('userId es requerido');
            }

            if (!itemData || !itemData.itemId) {
                throw new Error('itemData.itemId es requerido');
            }

            const itemId = itemData.itemId.toString().trim();
            console.log('itemId después de toString().trim():', itemId);
            console.log('itemId length:', itemId.length);

            const requestPayload = {
                clientId: userId,
                itemId: itemId, // ID validado y limpio
                quantity: itemData.quantity || 1,
                itemType: itemData.itemType || 'custom'
            };

            console.log('=== DATOS ENVIADOS AL BACKEND ===');
            console.log('Payload:', requestPayload);

            const response = await fetch('https://marquesa.onrender.com/api/shoppingCart/addItem', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestPayload),
                // credentials: 'include' // Comentar si causa problemas en móvil
            });

            console.log('addToCart - Status:', response.status);
            console.log('addToCart - URL:', response.url);

            // Leer la respuesta como texto primero para debug
            const responseText = await response.text();
            console.log('addToCart - Response text (first 200 chars):', responseText.substring(0, 200));

            // Intentar parsear como JSON
            let data;
            try {
                data = JSON.parse(responseText);
                console.log('addToCart - JSON parseado exitosamente:', data);
            } catch (jsonError) {
                console.error('addToCart - Error parseando JSON:', jsonError);
                throw new Error('Respuesta del servidor no válida');
            }

            if (response.ok && data.success) {
                console.log('✅ ÉXITO: Producto agregado al carrito');
                return data.shoppingCart || data.cart;
            } else {
                console.error('❌ ERROR DEL SERVIDOR:', data);
                throw new Error(data.message || `Error ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('❌ ERROR EN CATCH:', error);

            if (error.message === 'Network request failed') {
                throw new Error('Error de conexión. No se pudo agregar al carrito.');
            }

            throw error;
        }
    };

    // Función principal que maneja todo el proceso de personalización (CORREGIDA)
    const processCustomization = async (customizationParams) => {
        const {
            user,
            selectedProducts,
            productType,
            referenceImage,
            comments,
            totalPrice
        } = customizationParams;

        console.log('=== INICIANDO PROCESO DE PERSONALIZACIÓN (MÓVIL) ===');
        console.log('customizationParams:', customizationParams);

        setIsLoading(true);

        try {
            // Validar que el usuario esté autenticado
            if (!user || !user.id) {
                throw new Error('Debes iniciar sesión para continuar');
            }

            // Validar productos seleccionados
            if (!selectedProducts || selectedProducts.length === 0) {
                throw new Error('Debes seleccionar al menos un material');
            }

            // VALIDAR IDS DE PRODUCTOS ANTES DE PROCESAR
            console.log('Validando IDs de productos seleccionados...');
            const invalidProducts = selectedProducts.filter(product => {
                const id = product._id;
                const isValid = id &&
                    typeof id === 'string' &&
                    id.trim().length > 0 &&
                    id.match(/^[0-9a-fA-F]{24}$/);

                if (!isValid) {
                    console.error('Producto con ID inválido:', {
                        product: product,
                        id: id,
                        type: typeof id,
                        length: id ? id.length : 0
                    });
                }

                return !isValid;
            });

            if (invalidProducts.length > 0) {
                console.error('Se encontraron productos con IDs inválidos:', invalidProducts);
                throw new Error('Algunos productos tienen identificadores inválidos. Por favor, selecciona los productos nuevamente.');
            }

            console.log('✅ Todos los IDs son válidos, continuando...');

            // Validar precio
            if (!totalPrice || totalPrice < 0) {
                throw new Error('El precio total debe ser mayor a 0');
            }

            // Preparar materiales seleccionados con IDs validados
            const selectedMaterials = selectedProducts.map(product => {
                const cleanId = product._id.trim();
                console.log(`Procesando material: ${product.name} con ID: ${cleanId}`);

                return {
                    materialId: cleanId, // ID limpio y validado
                    quantity: product.quantity || 1
                };
            });

            // Preparar datos del producto personalizado
            const customProductData = {
                clientId: user.id,
                productToPersonalize: productType,
                selectedMaterials: selectedMaterials,
                totalPrice: totalPrice
            };

            // Agregar comentarios si existen
            if (comments && comments.trim().length >= 10) {
                customProductData.extraComments = comments.trim();
            }

            console.log('=== DATOS FINALES PARA ENVIAR (MÓVIL) ===');
            console.log('customProductData:', customProductData);
            console.log('selectedMaterials details:', selectedMaterials);

            // Crear el producto personalizado
            const createdCustomProduct = await createCustomProduct(customProductData, referenceImage);

            console.log('✅ Producto personalizado creado exitosamente:', createdCustomProduct);

            // VALIDAR QUE EL PRODUCTO CREADO TENGA ID VÁLIDO
            if (!createdCustomProduct._id || !createdCustomProduct._id.match(/^[0-9a-fA-F]{24}$/)) {
                console.error('Producto creado con ID inválido:', createdCustomProduct._id);
                throw new Error('El producto personalizado se creó pero tiene un ID inválido');
            }

            // Preparar datos para agregar al carrito
            const cartItemData = {
                itemType: "custom",
                itemId: createdCustomProduct._id,
                quantity: 1
            };

            console.log('Agregando producto personalizado al carrito:', cartItemData);

            // Agregar al carrito
            const updatedCart = await addItemToCart(user.id, cartItemData);

            console.log('✅ Producto agregado al carrito exitosamente');

            // Retornar resultado
            return {
                customProduct: createdCustomProduct,
                cart: updatedCart,
                selectedProducts,
                productType,
                totalPrice,
                referenceImage: createdCustomProduct.referenceImage || null,
                comments: comments?.trim() || '',
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('❌ Error en el proceso de personalización (móvil):', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        createCustomProduct,
        addItemToCart,
        processCustomization
    };
};

export default useCustomization;