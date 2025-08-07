const API_BASE_URL = 'http://localhost:4000/api';

export const useFeaturedProductsService = {
    getFeaturedProducts: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/products/featured`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if(!response.ok){
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const result = await response.json();

            if(result.success){
                return result.data || [];
            }else{
                console.warn('API returned unsuccessful response: ', result.message);
                return [];
            }
        } catch (error) {
            console.log('Error fetching featured products: ', error);

            return [];
        }
    }
};

export default useFeaturedProductsService;