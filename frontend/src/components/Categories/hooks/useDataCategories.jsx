import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

const useDataCategories = () => {
    const [activeTab, setActiveTab] = useState("list");
    const API = "http://localhost:4000/api/categories";
    const [id, setId] = useState("");
    const [name, setName] = useState("");
    const [image, setImage] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Obtener categorías
    const fetchCategories = async () => {
        try {
            const response = await fetch(API);
            if (!response.ok) {
                throw new Error("Hubo un error al obtener las categorías");
            }
            const data = await response.json();
            setCategories(data);
            setLoading(false);
        } catch (error) {
            console.error("Error al obtener categorías:", error);
            toast.error("Error al cargar las categorías");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const createCategorie = async (e) => {
        e.preventDefault();

        // Validación básica
        if (!name.trim()) {
            toast.error("El nombre es requerido");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("name", name);
            if (image) {
                formData.append("image", image);
            }

            const response = await fetch(API, {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                throw new Error("Hubo un error al registrar la categoría");
            }

            toast.success('Categoría registrada');
            fetchCategories();
            setName("");
            setImage(null);
        } catch (error) {
            console.error("Error al crear categoría:", error);
            toast.error("Error al crear la categoría");
        }
    };

    const deleteCategorie = async (id) => {
        try {
            const response = await fetch(`${API}/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Hubo un error al eliminar la categoría");
            }

            toast.success('Categoría eliminada');
            fetchCategories();
        } catch (error) {
            console.error("Error al eliminar categoría:", error);
            toast.error("Error al eliminar la categoría");
        }
    };

    const updateCategorie = async (dataCategorie) => {
        setId(dataCategorie._id);
        setName(dataCategorie.name);
        setImage(dataCategorie.image);
        setActiveTab("form");
    };

    const handleEdit = async (e) => {
        e.preventDefault();

        // Validación básica
        if (!name.trim()) {
            toast.error("El nombre es requerido");
            return;
        }

        try {
            // Si image es un archivo, usar FormData; si no, usar JSON
            let response;

            if (image instanceof File) {
                // Si es un archivo nuevo
                const formData = new FormData();
                formData.append("name", name);
                formData.append("image", image);

                response = await fetch(`${API}/${id}`, {
                    method: "PUT",
                    body: formData
                });
            } else {
                // Si no hay archivo nuevo, solo actualizar el nombre
                response = await fetch(`${API}/${id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ name, image }),
                });
            }

            if (!response.ok) {
                throw new Error("Error al actualizar la categoría");
            }

            toast.success('Categoría actualizada');
            setId("");
            setName("");
            setImage(null);
            setActiveTab("list");
            fetchCategories();
        } catch (error) {
            console.error("Error al editar la categoría:", error);
            toast.error("Error al actualizar la categoría");
        }
    };

    return {
        activeTab,
        setActiveTab,
        id,
        name,
        setName,
        image,
        setImage,
        categories,
        setCategories,
        loading,
        createCategorie,
        deleteCategorie,
        updateCategorie,
        handleEdit,
    };
}

export default useDataCategories;