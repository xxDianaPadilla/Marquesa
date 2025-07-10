import { useState, useMemo } from "react";
import flower1 from "../../../assets/savesFlower1.png";
import flower2 from "../../../assets/savesFlower2.png";
import flower3 from "../../../assets/savesFlower3.png";

const useMedia = () => {
    const [activeFilter, setActiveFilter] = useState("all");
    const [visibleItems, setVisibleItems] = useState(6);

    const allMediaItems = [
        {
            id: 1,
            title: "Técnicas de relajación y mindfulness a base de flores",
            date: "07/09/2025",
            type: "blog",
            category: "Blog",
            image: flower1,
            isVideo: false,
            content: "Contenido completo del artículo sobre técnicas de relajación...",
            videoUrl: null
        },
        {
            id: 2,
            title: "Guía completa: Como preparar un jardín de flores",
            date: "05/09/2025",
            type: "tips",
            category: "Tips",
            image: flower2,
            isVideo: true,
            content: "Guía paso a paso para preparar tu jardín...",
            videoUrl: "https://example.com/video2.mp4"
        },
        {
            id: 3,
            title: "Ejercicios para cuidar de tus ramos de flores",
            date: "03/09/2025",
            type: "datos-curiosos",
            category: "Datos curiosos",
            image: flower3,
            isVideo: false,
            content: "Ejercicios y técnicas para mantener tus flores...",
            videoUrl: null
        },
        {
            id: 4,
            title: "¿Qué comen las plantas?",
            date: "01/09/2025",
            type: "datos-curiosos",
            category: "Datos curiosos",
            image: flower1,
            isVideo: false,
            content: "Información fascinante sobre la alimentación de las plantas...",
            videoUrl: null
        },
        {
            id: 5,
            title: "Meditando con flores",
            date: "30/08/2025",
            type: "blog",
            category: "Blog",
            image: flower2,
            isVideo: true,
            content: "Técnicas de meditación utilizando flores...",
            videoUrl: "https://example.com/video5.mp4"
        },
        {
            id: 6,
            title: "Preparación con flores para bodas",
            date: "28/08/2025",
            type: "blog",
            category: "Blog",
            image: flower3,
            isVideo: false,
            content: "Todo lo que necesitas saber sobre decoración floral para bodas...",
            videoUrl: null
        },
        {
            id: 7,
            title: "Cuidados básicos de flores en casa",
            date: "25/08/2025",
            type: "tips",
            category: "Tips",
            image: flower1,
            isVideo: true,
            content: "Consejos prácticos para el cuidado de flores en el hogar...",
            videoUrl: "https://example.com/video7.mp4"
        },
        {
            id: 8,
            title: "Historia de las flores en diferentes culturas",
            date: "22/08/2025",
            type: "datos-curiosos",
            category: "Datos curiosos",
            image: flower2,
            isVideo: false,
            content: "Descubre el significado de las flores a través de las culturas...",
            videoUrl: null
        }
    ];

    const filteredItems = useMemo(() => {
        if (activeFilter === "all") {
            return allMediaItems;
        }
        return allMediaItems.filter(item => item.type === activeFilter);
    }, [activeFilter]);

    const displayedItems = useMemo(() => {
        return filteredItems.slice(0, visibleItems);
    }, [filteredItems, visibleItems]);

    const hasMoreItems = filteredItems.length > visibleItems;

    const loadMoreItems = () => {
        setVisibleItems(prev => prev + 6);
    };

    const resetItems = () => {
        setVisibleItems(6);
    };

    const handleFilterChange = (newFilter) => {
        setActiveFilter(newFilter);
        setVisibleItems(6); // Reset visible items when filter changes
    };

    const getItemById = (id) => {
        return allMediaItems.find(item => item.id === parseInt(id));
    };

    const getRelatedItems = (currentId, currentType) => {
        return allMediaItems
            .filter(item => item.id !== parseInt(currentId) && item.type === currentType)
            .slice(0, 2);
    };

    return {
        displayedItems,
        activeFilter,
        hasMoreItems,
        loadMoreItems,
        resetItems,
        handleFilterChange,
        getItemById,
        getRelatedItems,
        totalItems: filteredItems.length
    };
};

export default useMedia;