// REEMPLAZAR COMPLETAMENTE: frontend/src/components/Products/Hooks/useFeaturedProductsService.jsx

// CORREGIDO: URL del backend en lugar del frontend
const API_BASE_URL = 'https://marquesa.onrender.com/api';

// Hook para obtener los productos mejor evaluados
export const useFeaturedProductsService = {
    getFeaturedProducts: async () => {
        try {
            console.log('🌟 Obteniendo productos destacados...');
            
            const response = await fetch(`${API_BASE_URL}/products/featured`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            console.log('📡 Respuesta recibida:', response.status, response.statusText);

            if(!response.ok){
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const result = await response.json();
            console.log('📦 Datos recibidos:', result);

            if(result.success){
                console.log(`✅ ${result.data?.length || 0} productos destacados obtenidos`);
                return result.data || [];
            } else {
                console.warn('API returned unsuccessful response: ', result.message);
                return [];
            }
        } catch (error) {
            console.error('❌ Error fetching featured products: ', error);
            return [];
        }
    }
};

export default useFeaturedProductsService;