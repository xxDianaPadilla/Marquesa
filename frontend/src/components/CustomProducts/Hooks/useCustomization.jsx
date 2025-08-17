import { useState } from 'react';
 
const useCustomization = () => {
    const [isLoading, setIsLoading] = useState(false);
 
    // Función para crear el producto personalizado (con imagen incluida)
    const createCustomProduct = async (customProductData, referenceImage = null) => {
        try {
            console.log('=== ENVIANDO DATOS AL SERVIDOR ===');
            console.log('customProductData:', customProductData);
            console.log('referenceImage:', referenceImage);
 
            // Si hay imagen, usar FormData, sino usar JSON
            if (referenceImage) {
                const formData = new FormData();
 
                console.log('=== USANDO FORMDATA ===');
 
                // Agregar los datos del producto personalizado
                Object.keys(customProductData).forEach(key => {
                    if (key === 'selectedMaterials') {
                        const materialsJson = JSON.stringify(customProductData[key]);
                        console.log(`FormData - ${key}:`, materialsJson);
                        formData.append(key, materialsJson);
                    } else if (customProductData[key] !== undefined && customProductData[key] !== null) {
                        console.log(`FormData - ${key}:`, customProductData[key]);
                        formData.append(key, customProductData[key]);
                    }
                });
 
                // Agregar la imagen de referencia
                console.log('FormData - referenceImage:', referenceImage.name, referenceImage.size, referenceImage.type);
                formData.append('referenceImage', referenceImage);
 
                // Log del FormData completo
                console.log('=== CONTENIDO DEL FORMDATA ===');
                for (let [key, value] of formData.entries()) {
                    console.log(`${key}:`, value);
                }
 
                const response = await fetch('https://marquesa.onrender.com/api/customProducts', {
                    method: 'POST',
                    body: formData,
                    credentials: 'include'
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
            } else {
                console.log('=== USANDO JSON (SIN IMAGEN) ===');
                console.log('JSON data:', JSON.stringify(customProductData, null, 2));
 
                // Sin imagen, enviar como JSON
                const response = await fetch('https://marquesa.onrender.com/api/customProducts', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(customProductData),
                    credentials: 'include'
                });
 
                console.log('Response status:', response.status);
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
            }
        } catch (error) {
            console.error('=== ERROR EN CATCH ===');
            console.error('Error creating custom product:', error);
            throw error;
        }
    };
 
    // Función para agregar item al carrito
    const addItemToCart = async (userId, itemData) => {
        try {
            console.log('=== AGREGANDO AL CARRITO ===');
            console.log('userId:', userId);
            console.log('itemData recibido:', itemData);
 
            // ✅ VALIDACIÓN: Verificar que tenemos los datos necesarios
            if (!userId) {
                throw new Error('userId es requerido');
            }
 
            if (!itemData || !itemData.itemId) {
                throw new Error('itemData.itemId es requerido');
            }
 
            // ✅ CORRECCIÓN CRÍTICA: Estructura correcta para el backend
            const requestPayload = {
                clientId: userId,
                itemId: itemData.itemId,
                quantity: itemData.quantity || 1,
                itemType: itemData.itemType || 'custom'
            };
 
            console.log('=== DATOS ENVIADOS AL BACKEND ===');
            console.log('Payload:', requestPayload);
            console.log('URL:', 'https://marquesa.onrender.com/api/shoppingCart/addItem');
 
            // ✅ USAR EL ENDPOINT CORRECTO (sin userId en la URL)
            const response = await fetch('https://marquesa.onrender.com/api/shoppingCart/addItem', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestPayload),
                credentials: 'include'
            });
 
            console.log('=== RESPUESTA DEL SERVIDOR ===');
            console.log('Status:', response.status);
            console.log('Status Text:', response.statusText);
 
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
            throw error;
        }
    };
 
    // Nueva función específica para productos regulares
    const addRegularProductToCart = async (userId, product, quantity) => {
        try {
            console.log('=== AGREGANDO PRODUCTO REGULAR AL CARRITO ===');
            console.log('userId:', userId);
            console.log('product:', product.name, product._id);
            console.log('quantity:', quantity);
 
            // Validaciones
            if (!userId) {
                throw new Error('ID de usuario requerido');
            }
 
            if (!product || !product._id) {
                throw new Error('Producto inválido');
            }
 
            if (!quantity || quantity < 1) {
                throw new Error('Cantidad debe ser mayor a 0');
            }
 
            // Extraer precio numérico del string
            const priceMatch = product.price?.toString().match(/[\d,.]+/);
            const numericPrice = priceMatch ? parseFloat(priceMatch[0].replace(',', '')) : 0;
 
            if (numericPrice <= 0) {
                throw new Error('Precio del producto inválido');
            }
 
            const subtotal = numericPrice * quantity;
 
            // Preparar datos del item
            const itemData = {
                itemType: "product",
                itemId: product._id,
                itemTypeRef: "products",
                quantity: quantity,
                subtotal: subtotal
            };
 
            console.log('Datos preparados para el carrito:', itemData);
 
            // Agregar al carrito usando la función existente
            return await addItemToCart(userId, itemData);
 
        } catch (error) {
            console.error('Error en addRegularProductToCart:', error);
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
 
        console.log('=== INICIANDO PROCESO DE PERSONALIZACIÓN ===');
        console.log('customizationParams:', customizationParams);
 
        setIsLoading(true);
 
        try {
            // Validar que el usuario esté autenticado
            if (!user || !user.id) {
                throw new Error('Debes iniciar sesión para continuar');
            }
 
            console.log('User validated:', user.id);
 
            // Validar productos seleccionados
            if (!selectedProducts || selectedProducts.length === 0) {
                throw new Error('Debes seleccionar al menos un material');
            }
 
            console.log('Selected products validated:', selectedProducts.length);
 
            // Validar precio
            if (!totalPrice || totalPrice < 0) {
                throw new Error('El precio total debe ser mayor a 0');
            }
 
            console.log('Price validated:', totalPrice);
 
            // Paso 1: Preparar datos para el producto personalizado
            const selectedMaterials = selectedProducts.map(product => ({
                materialId: product._id,
                quantity: product.quantity || 1
            }));
 
            console.log('selectedMaterials prepared:', selectedMaterials);
 
            // Preparar datos del producto personalizado
            const customProductData = {
                clientId: user.id,
                productToPersonalize: productType,
                selectedMaterials: selectedMaterials,
                totalPrice: totalPrice
            };
 
            // Solo agregar extraComments si hay comentarios y tienen al menos 10 caracteres
            if (comments && comments.trim().length >= 10) {
                customProductData.extraComments = comments.trim();
                console.log('Comments added:', comments.trim());
            } else {
                console.log('Comments skipped (too short or empty):', comments);
            }
 
            console.log('=== DATOS FINALES PARA ENVIAR ===');
            console.log('customProductData:', customProductData);
 
            // Validaciones adicionales antes de enviar
            console.log('=== VALIDACIONES FINALES ===');
            console.log('clientId type:', typeof customProductData.clientId);
            console.log('clientId value:', customProductData.clientId);
            console.log('productToPersonalize:', customProductData.productToPersonalize);
            console.log('selectedMaterials length:', customProductData.selectedMaterials.length);
            console.log('totalPrice type:', typeof customProductData.totalPrice);
            console.log('totalPrice value:', customProductData.totalPrice);
 
            // Paso 2: Crear el producto personalizado (incluyendo imagen si existe)
            const createdCustomProduct = await createCustomProduct(customProductData, referenceImage);
 
            console.log('Producto personalizado creado:', createdCustomProduct);
 
            // Paso 3: Preparar datos para agregar al carrito
            const cartItemData = {
                itemType: "custom",
                itemId: createdCustomProduct._id,
                quantity: 1
                // ✅ REMOVIDO: itemTypeRef y subtotal (el backend los calcula)
            };
 
            console.log('=== PREPARANDO PARA CARRITO ===');
            console.log('cartItemData:', cartItemData);
            console.log('createdCustomProduct._id:', createdCustomProduct._id);
 
            // Paso 4: Agregar al carrito
            const updatedCart = await addItemToCart(user.id, cartItemData);
            console.log('Carrito actualizado:', updatedCart);
 
            // Retornar datos del resultado
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
            console.error('Error en el proceso de personalización:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };
 
    return {
        isLoading,
        createCustomProduct,
        addItemToCart,
        addRegularProductToCart, // Nueva función exportada
        processCustomization
    };
};
 
export default useCustomization;