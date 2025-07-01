import { useState, useEffect } from "react";

export const useSales = () => {
    const [sales, setSales] = useState([]);
    const [totalSales, setTotalSales] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchSales();
        fetchTotalSales();
    }, []);

    const fetchSales = async () => {
        try {
            const response = await fetch('http://localhost:4000/api/sales');
            const data = await response.json();
            setSales(data);
        } catch (error) {
            setError(error.message);
        }
    };

    const fetchTotalSales = async () => {
        try {
            const response = await fetch('http://localhost:4000/api/sales/total');
            const data = await response.json();
            setTotalSales(data.total);
            setLoading(false);
        } catch (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    return{
        sales,
        totalSales,
        loading,
        error,
        refetch: () => {
            fetchSales();
            fetchTotalSales();
        }
    };
};