import { useState, useEffect } from "react";
import { useProducts } from "./useProducts";
import { useCustomProducts } from "../../CustomProducts/Hooks/useCustomProducts";

// Hook para obtener los productos más vendidos
// Calcula los productos más vendidos a partir de las ventas de productos y productos personalizados
// Devuelve los productos más vendidos y un estado de carga
export const useBestSellingProducts = () => {
    const {products, loading: productsLoading} = useProducts();
    const {customProducts, loading: customProductsLoading} = useCustomProducts(); 
    const [bestSelling, setBestSelling] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if(!productsLoading && !customProductsLoading){
            calculateBestSelling();
        }
    }, [products, customProducts, productsLoading, customProductsLoading]);

    const calculateBestSelling = () => {
        try {
            const productSales = {};

            // Verificar si customProducts existe y tiene la estructura correcta
            let customProductsArray = [];
            
            if (customProducts) {
                // Si customProducts es un objeto con data (nueva estructura del API)
                if (customProducts.data && Array.isArray(customProducts.data)) {
                    customProductsArray = customProducts.data;
                }
                // Si customProducts es directamente un array (estructura antigua)
                else if (Array.isArray(customProducts)) {
                    customProductsArray = customProducts;
                }
                // Si customProducts es un objeto pero no tiene data, podría ser un solo elemento
                else if (customProducts.selectedItems) {
                    customProductsArray = [customProducts];
                }
            }

            // Procesar cada producto personalizado
            customProductsArray.forEach(customProduct => {
                if(customProduct && customProduct.selectedItems && Array.isArray(customProduct.selectedItems)){
                    customProduct.selectedItems.forEach(item => {
                        if (item && item.productId) {
                            const productId = item.productId._id || item.productId;
                            const quantity = item.quantity || 1;

                            if(productSales[productId]){
                                productSales[productId].sold += quantity;
                            } else {
                                productSales[productId] = {
                                    product: item.productId,
                                    sold: quantity
                                };
                            }
                        }
                    });
                }
            });

            const sortedProducts = Object.values(productSales)
                .sort((a, b) => b.sold - a.sold)
                .slice(0, 5);

            const totalSold = sortedProducts.reduce((sum, item) => sum + item.sold, 0);
            const productsWithPercentage = sortedProducts.map(item => ({
                ...item,
                percentage: totalSold > 0 ? Math.round((item.sold / totalSold) * 100) : 0
            }));

            setBestSelling(productsWithPercentage);
        } catch (error) {
            console.error('Error calculando productos más vendidos: ', error);
            setBestSelling([]);
        } finally {
            setLoading(false);
        }
    };

    return {bestSelling, loading};
};