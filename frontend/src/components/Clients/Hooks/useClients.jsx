import { useState, useEffect } from "react";

export const useClients = () => {
    const [clients, setClients] = useState([]);
    const [totalClients, setTotalClients] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchClients();
        fetchTotalClients();
    }, []);

    const fetchClients = async () => {
        try {
            const response = await fetch('http://localhost:4000/api/clients');
            const data = await response.json();
            setClients(data);
        } catch (error) {
            setError(error.message);
        }
    };

    const fetchTotalClients = async () => {
        try {
            const response = await fetch('http://localhost:4000/api/clients/total');
            const data = await response.json();
            setTotalClients(data.total);
            setLoading(false);
        } catch (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    return {
        clients,
        totalClients,
        loading,
        error,
        refetch: () => {
            fetchClients();
            fetchTotalClients();
        }
    };
};