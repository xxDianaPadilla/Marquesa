import { useState, useEffect } from "react";
import { useProducts } from "./useProducts";
import { useCustomProducts } from "../../CustomProducts/Hooks/useCustomProducts";

export const useBestSellingProducts = () => {
    const {products, loading: productsLoading} = useProducts();
    const {customProducts, loadin: customProductsLoading} = useCustomProducts();
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

            customProducts.forEach(customProduct => {
                if(customProduct.selectedItems){
                    customProduct.selectedItems.forEach(item => {
                        const productId = item.productId._id || item.productId;
                        const quantity = item.quantity || 1;

                        if(productSales[productId]){
                            productSales[productId].sold += quantity;
                        }else{
                            productSales[productId] = {
                                product: item.productId,
                                sold: quantity
                            };
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
        }finally{
            setLoading(false);
        }
    };

    return {bestSelling, loading};
};