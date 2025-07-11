// frontend/src/components/Media/Hooks/useMedia.jsx
// Importa los hooks useState y useMemo de React, y las imágenes locales.
import { useState, useMemo } from "react";
import flower1 from "../../../assets/savesFlower1.png";
import flower2 from "../../../assets/savesFlower2.png";
import flower3 from "../../../assets/savesFlower3.png";

// Define y exporta por defecto el custom hook 'useMedia'.
const useMedia = () => {
  // Estado para almacenar el filtro activo (ej. "all", "blog"). Inicia en "all".
  const [activeFilter, setActiveFilter] = useState("all");
  // Estado para controlar el número de elementos visibles en la UI. Inicia en 6.
  const [visibleItems, setVisibleItems] = useState(6);

  // Array estático que contiene todos los objetos de medios. Actúa como una base de datos local.
  const allMediaItems = [
    {
      id: 1,
      title: "Técnicas de relajación y mindfulness a base de flores",
      date: "07/09/2025",
      type: "blog",
      category: "Blog",
      image: flower1,
      isVideo: false,
      content:
        "Descubre cómo las flores pueden ayudarte a encontrar la paz interior y reducir el estrés diario. Las técnicas de mindfulness combinadas con aromaterapia floral han demostrado ser efectivas para mejorar el bienestar mental. En este artículo exploraremos métodos ancestrales y modernos para aprovechar las propiedades terapéuticas de las flores en tu rutina de relajación.",
      videoUrl: null,
    },
    {
      id: 2,
      title: "Guía completa: Como preparar un jardín de flores",
      date: "05/09/2025",
      type: "tips",
      category: "Tips",
      image: flower2,
      isVideo: true,
      content: "Aprende paso a paso cómo crear y mantener un hermoso jardín de flores. Desde la preparación del suelo hasta la selección de las mejores especies para tu clima. Esta guía completa te llevará de la mano para convertir cualquier espacio en un oasis floral vibrante y saludable.",
      videoUrl: "https://example.com/video2.mp4",
    },
    {
      id: 3,
      title: "Ejercicios para cuidar de tus ramos de flores",
      date: "03/09/2025",
      type: "datos-curiosos",
      category: "Datos curiosos",
      image: flower3,
      isVideo: false,
      content: "Conoce las mejores técnicas y ejercicios para mantener tus ramos de flores frescos por más tiempo. Desde el corte adecuado hasta los cuidados diarios que marcan la diferencia. Descubre secretos profesionales que prolongarán la vida y belleza de tus arreglos florales.",
      videoUrl: null,
    },
    {
      id: 4,
      title: "¿Qué comen las plantas?",
      date: "01/09/2025",
      type: "datos-curiosos",
      category: "Datos curiosos",
      image: flower1,
      isVideo: false,
      content: "Descubre información fascinante sobre la alimentación de las plantas y cómo optimizar los nutrientes para un crecimiento saludable. Explora el mundo microscópico de la nutrición vegetal y aprende a crear el ambiente perfecto para el desarrollo de tus flores favoritas.",
      videoUrl: null,
    },
    {
      id: 5,
      title: "Meditando con flores",
      date: "30/08/2025",
      type: "blog",
      category: "Blog",
      image: flower2,
      isVideo: true,
      content: "Explora técnicas de meditación utilizando flores como punto focal. Una práctica ancestral que combina belleza natural con bienestar espiritual. Aprende diferentes métodos de meditación floral que te ayudarán a conectar más profundamente contigo mismo y con la naturaleza.",
      videoUrl: "https://example.com/video5.mp4",
    },
    {
      id: 6,
      title: "Preparación con flores para bodas",
      date: "28/08/2025",
      type: "blog",
      category: "Blog",
      image: flower3,
      isVideo: false,
      content:
        "Todo lo que necesitas saber sobre decoración floral para bodas. Desde la elección de colores hasta los arreglos más elegantes para tu día especial. Una guía completa que cubre desde la planificación inicial hasta los detalles finales que harán de tu boda un evento inolvidable.",
      videoUrl: null,
    },
    {
      id: 7,
      title: "Cuidados básicos de flores en casa",
      date: "25/08/2025",
      type: "tips",
      category: "Tips",
      image: flower1,
      isVideo: true,
      content: "Consejos prácticos para el cuidado de flores en el hogar. Aprende a mantener tus flores frescas y vibrantes durante más tiempo. Desde técnicas de riego hasta la ubicación ideal, descubre todo lo necesario para convertir tu hogar en un jardín interior próspero.",
      videoUrl: "https://example.com/video7.mp4",
    },
    {
      id: 8,
      title: "Historia de las flores en diferentes culturas",
      date: "22/08/2025",
      type: "datos-curiosos",
      category: "Datos curiosos",
      image: flower2,
      isVideo: false,
      content:
        "Descubre el significado de las flores a través de las culturas y cómo han influenciado tradiciones y ceremonias alrededor del mundo. Un viaje fascinante por la historia que revela el papel crucial de las flores en la expresión humana y las tradiciones culturales.",
      videoUrl: null,
    },
  ];

  // useMemo memoriza los elementos filtrados. Solo se recalcula si 'activeFilter' cambia.
  const filteredItems = useMemo(() => {
    // Si el filtro es "all", devuelve todos los elementos.
    if (activeFilter === "all") {
      return allMediaItems;
    }
    // De lo contrario, filtra los elementos cuyo 'type' coincida con el filtro activo.
    return allMediaItems.filter((item) => item.type === activeFilter);
  }, [activeFilter]);

  // useMemo memoriza los elementos que se mostrarán. Se recalcula si 'filteredItems' o 'visibleItems' cambian.
  const displayedItems = useMemo(() => {
    // Corta el array de elementos filtrados para mostrar solo la cantidad de 'visibleItems'.
    return filteredItems.slice(0, visibleItems);
  }, [filteredItems, visibleItems]);

  // Una variable booleana que indica si hay más elementos para cargar.
  const hasMoreItems = filteredItems.length > visibleItems;

  // Función para cargar más elementos, aumentando la cantidad de 'visibleItems'.
  const loadMoreItems = () => {
    setVisibleItems((prev) => prev + 6); // Añade 6 al valor anterior.
  };

  // Función para reiniciar la vista, mostrando solo los 6 elementos iniciales.
  const resetItems = () => {
    setVisibleItems(6);
  };

  // Manejador para cambiar el filtro activo.
  const handleFilterChange = (newFilter) => {
    setActiveFilter(newFilter);
    setVisibleItems(6); // Reinicia los elementos visibles al cambiar de filtro.
  };

  // Función para obtener un elemento específico por su ID - VERSIÓN SIMPLIFICADA
  const getItemById = (id) => {
    // Busca en la lista completa y convierte el id a número para una comparación segura.
    const numericId = parseInt(id, 10);
    return allMediaItems.find((item) => item.id === numericId) || null;
  };

  // Función para obtener elementos relacionados a uno actual.
  const getRelatedItems = (currentId, currentType) => {
    const numericId = parseInt(currentId, 10);
    // Filtra para obtener elementos del mismo tipo, excluyendo el actual.
    return allMediaItems
      .filter(
        (item) => item.id !== numericId && item.type === currentType
      )
      .slice(0, 2); // Devuelve solo los dos primeros resultados.
  };

  // El hook retorna un objeto con los datos y funciones para ser utilizados por el componente.
  return {
    displayedItems, // Los elementos a renderizar en la UI.
    activeFilter, // El filtro que está actualmente seleccionado.
    hasMoreItems, // Booleano para mostrar o no el botón "Cargar más".
    loadMoreItems, // Función para cargar más elementos.
    resetItems, // Función para reiniciar la vista.
    handleFilterChange, // Función para cambiar el filtro.
    getItemById, // Función para buscar un elemento por ID.
    getRelatedItems, // Función para obtener elementos relacionados.
    totalItems: filteredItems.length, // El número total de elementos después de filtrar.
    allMediaItems, // Exportar todos los elementos para acceso directo
  };
};

export default useMedia;