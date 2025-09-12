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
                
                // Si la imagen ya es base64
                if (typeof referenceImage === 'string' && referenceImage.startsWith('data:image')) {
                    requestData.referenceImageBase64 = referenceImage;
                    console.log('Imagen base64 agregada directamente');
                }
                // Si la imagen es un objeto File o similar
                else if (referenceImage.uri || referenceImage.path) {
                    // Para React Native, usar la URI directamente
                    requestData.referenceImageBase64 = referenceImage.uri || referenceImage.path;
                    console.log('Imagen URI agregada:', requestData.referenceImageBase64);
                }
                // Si es un objeto con datos base64
                else if (referenceImage.base64) {
                    requestData.referenceImageBase64 = `data:image/jpeg;base64,${referenceImage.base64}`;
                    console.log('Imagen convertida a base64');
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

    // Función para agregar item al carrito (sin cambios)
    const addItemToCart = async (userId, itemData) => {
        try {
            console.log('=== AGREGANDO AL CARRITO (MÓVIL) ===');
            console.log('userId:', userId);
            console.log('itemData recibido:', itemData);

            if (!userId) {
                throw new Error('userId es requerido');
            }

            if (!itemData || !itemData.itemId) {
                throw new Error('itemData.itemId es requerido');
            }

            const requestPayload = {
                clientId: userId,
                itemId: itemData.itemId,
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

            console.log('Response status:', response.status);

            const data = await response.json();
            console.log('Response data completa:', data);

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

    // Función principal que maneja todo el proceso de personalización
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

            // Validar precio
            if (!totalPrice || totalPrice < 0) {
                throw new Error('El precio total debe ser mayor a 0');
            }

            // Preparar materiales seleccionados
            const selectedMaterials = selectedProducts.map(product => ({
                materialId: product._id,
                quantity: product.quantity || 1
            }));

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

            // Crear el producto personalizado
            const createdCustomProduct = await createCustomProduct(customProductData, referenceImage);

            console.log('Producto personalizado creado:', createdCustomProduct);

            // Preparar datos para agregar al carrito
            const cartItemData = {
                itemType: "custom",
                itemId: createdCustomProduct._id,
                quantity: 1
            };

            // Agregar al carrito
            const updatedCart = await addItemToCart(user.id, cartItemData);

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
            console.error('Error en el proceso de personalización (móvil):', error);
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