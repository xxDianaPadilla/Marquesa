import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

// Custom hook para manejar toda la lógica relacionada a las categorías
const useDataCategories = () => {
    // Controla qué pestaña está activa: "list" o "form"
    const [activeTab, setActiveTab] = useState("list");

    // URL base de la API
    const API = "http://localhost:4000/api/categories";

    // Estados para manejar el formulario de edición/creación
    const [id, setId] = useState("");
    const [name, setName] = useState("");
    const [image, setImage] = useState(null);

    // Lista de categorías y el estado de carga
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Función para obtener las categorías desde el backend
    const fetchCategories = async () => {
        try {
            const response = await fetch(API);
            if (!response.ok) {
                throw new Error("Hubo un error al obtener las categorías");
            }
            const data = await response.json();
            
            // FIX: Acceder a data.data ya que el controller devuelve { success, message, data }
            setCategories(data.data || []); // Guardo las categorías en el estado
            setLoading(false);   // Finalizo el estado de carga
        } catch (error) {
            console.error("Error al obtener categorías:", error);
            toast.error("Error al cargar las categorías"); // Muestro error en pantalla
            setLoading(false);
        }
    };

    // Llamo a la función fetch solo una vez al cargar el componente
    useEffect(() => {
        fetchCategories();
    }, []);

    // Función para crear una nueva categoría
    const createCategorie = async (e) => {
        e.preventDefault();

        // Validación: el nombre es obligatorio
        if (!name.trim()) {
            toast.error("El nombre es requerido");
            return;
        }

        // Validación: la imagen es obligatoria
        if (!image) {
            toast.error("La imagen es requerida");
            return;
        }

        try {
            // Uso FormData para poder enviar imagen
            const formData = new FormData();
            formData.append("name", name);
            formData.append("image", image);

            const response = await fetch(API, {
                method: "POST",
                body: formData
            });

            const result = await response.json();

            if (!response.ok) {
                // Mostrar el mensaje de error específico del backend
                throw new Error(result.message || "Hubo un error al registrar la categoría");
            }

            toast.success(result.message || 'Categoría registrada');
            fetchCategories();  // Refresco la lista
            setName("");        // Limpio campos
            setImage(null);
        } catch (error) {
            console.error("Error al crear categoría:", error);
            toast.error(error.message || "Error al crear la categoría");
        }
    };

    // Función para eliminar una categoría
    const deleteCategorie = async (id) => {
        try {
            const response = await fetch(`${API}/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Hubo un error al eliminar la categoría");
            }

            toast.success(result.message || 'Categoría eliminada');
            fetchCategories(); // Actualizo la lista luego de borrar
        } catch (error) {
            console.error("Error al eliminar categoría:", error);
            toast.error(error.message || "Error al eliminar la categoría");
        }
    };

    // Prepara el formulario para editar una categoría existente
    const updateCategorie = (dataCategorie) => {
        setId(dataCategorie._id);      // Guardo el ID
        setName(dataCategorie.name);   // Seteo el nombre
        setImage(dataCategorie.image); // Seteo la imagen actual
        setActiveTab("form");          // Cambio la pestaña para mostrar el formulario
    };

    // Función que maneja la lógica final para editar una categoría
    const handleEdit = async (e) => {
        e.preventDefault();

        // Validación: el nombre es obligatorio
        if (!name.trim()) {
            toast.error("El nombre es requerido");
            return;
        }

        // Validación: la imagen es obligatoria (debe ser File o URL existente)
        if (!image) {
            toast.error("La imagen es requerida");
            return;
        }

        try {
            let response;

            // Si se seleccionó una imagen nueva, uso FormData
            if (image instanceof File) {
                const formData = new FormData();
                formData.append("name", name);
                formData.append("image", image);

                response = await fetch(`${API}/${id}`, {
                    method: "PUT",
                    body: formData
                });
            } else {
                // Si no se cambió la imagen, uso JSON
                response = await fetch(`${API}/${id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ name, image }),
                });
            }

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Error al actualizar la categoría");
            }

            toast.success(result.message || 'Categoría actualizada');
            // Limpio los campos y vuelvo a la pestaña de lista
            setId("");
            setName("");
            setImage(null);
            setActiveTab("list");
            fetchCategories(); // Refresco los datos
        } catch (error) {
            console.error("Error al editar la categoría:", error);
            toast.error(error.message || "Error al actualizar la categoría");
        }
    };

    // Retorno todos los estados y funciones necesarias para usarlas en el componente
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