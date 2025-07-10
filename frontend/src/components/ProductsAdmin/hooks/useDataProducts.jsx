import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

const useDataProducts = () => {
  const [activeTab, setActiveTab] = useState("list");
  const API = "http://localhost:4000/api/products";

  // Estados de campos
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState(0);
  const [categoryId, setCategoryId] = useState("");
  const [isPersonalizable, setIsPersonalizable] = useState(false);
  const [details, setDetails] = useState("");
  const [image, setImage] = useState(null);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  // Función auxiliar para manejar respuestas
  const handleResponse = async (response) => {
    const contentType = response.headers.get('content-type');

    // Verificar si la respuesta es JSON
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await response.text();
      console.error('Respuesta no es JSON:', textResponse);
      throw new Error(`El servidor devolvió HTML en lugar de JSON. Status: ${response.status}`);
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || `Error ${response.status}`);
    }

    return data;
  };

  // Cargar categorías
  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/categories");
      const data = await handleResponse(response);
      setCategories(data);
    } catch (error) {
      toast.error("Error al cargar las categorías");
      console.error(error);
    }
  };

  // Cargar productos
  const fetchProducts = async () => {
    try {
      const response = await fetch(API);
      const data = await handleResponse(response);
      setProducts(data);
    } catch (error) {
      toast.error("Error al cargar los productos");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Limpiar formulario
  const resetForm = () => {
    setId("");
    setName("");
    setDescription("");
    setPrice("");
    setStock(0);
    setCategoryId("");
    setIsPersonalizable(false);
    setDetails("");
    setImage(null);
  };

  const createProduct = async (productData) => {
    // Validación más estricta
    if (!productData.name?.trim()) {
      toast.error("El nombre es requerido");
      return;
    }

    if (!productData.description?.trim()) {
      toast.error("La descripción es requerida");
      return;
    }

    if (!productData.price || isNaN(parseFloat(productData.price))) {
      toast.error("El precio debe ser un número válido");
      return;
    }

    if (!productData.categoryId) {
      toast.error("La categoría es requerida");
      return;
    }

    const formData = new FormData();
    formData.append("name", productData.name.trim());
    formData.append("description", productData.description.trim());
    formData.append("price", parseFloat(productData.price));
    formData.append("stock", parseInt(productData.stock) || 0);
    formData.append("categoryId", productData.categoryId);
    formData.append("isPersonalizable", productData.isPersonalizable ? "true" : "false");
    formData.append("details", productData.details || "");

    if (productData.image) {
      formData.append("images", productData.image);
    }

    try {
      const res = await fetch("http://localhost:4000/api/products", {
        method: "POST",
        body: formData
      });

      const data = await handleResponse(res);

      const categoryInfo = categories.find(cat => cat._id === productData.categoryId);
      const enrichedProduct = {
        ...data,
        categoryId: categoryInfo ? categoryInfo : data.categoryId
      };

      setProducts((prev) => [...prev, enrichedProduct]);
      toast.success("Producto creado exitosamente");
      resetForm();
      setActiveTab("list");
    } catch (error) {
      console.error("Error completo:", error);
      toast.error(error.message || "Error inesperado");
    }
  };

  // Eliminar producto
  const deleteProduct = async (id) => {
    try {
      const res = await fetch(`${API}/${id}`, {
        method: "DELETE"
      });

      await handleResponse(res);

      toast.success("Producto eliminado");
      fetchProducts();
    } catch (error) {
      toast.error(error.message || "Error al eliminar producto");
      console.error(error);
    }
  };

  // Prellenar formulario para editar
  const updateProduct = (product) => {
    console.log("Producto a editar:", product);
    console.log("ID del producto:", product._id);

    setId(product._id);
    setName(product.name);
    setDescription(product.description);
    setPrice(product.price);
    setStock(product.stock || 0);
    setCategoryId(product.categoryId._id || product.categoryId || "");
    setIsPersonalizable(product.isPersonalizable);
    setDetails(product.details || "");
    setImage(null);
    setActiveTab("form");
  };

  // Guardar edición
  const handleEdit = async (productData) => {
    // Validación más estricta
    if (!productData.name?.trim()) {
      toast.error("El nombre es requerido");
      return;
    }

    if (!productData.description?.trim()) {
      toast.error("La descripción es requerida");
      return;
    }

    if (!productData.price || isNaN(parseFloat(productData.price))) {
      toast.error("El precio debe ser un número válido");
      return;
    }

    if (!productData.categoryId) {
      toast.error("La categoría es requerida");
      return;
    }

    // Verificar que el ID existe
    if (!id) {
      console.error("ID del producto no encontrado. ID actual:", id);
      toast.error("ID del producto no encontrado");
      return;
    }

    console.log("ID del producto a actualizar:", id);

    try {
      let res;

      if (productData.image instanceof File) {
        const formData = new FormData();
        formData.append("name", productData.name.trim());
        formData.append("description", productData.description.trim());
        formData.append("price", parseFloat(productData.price));
        formData.append("stock", parseInt(productData.stock) || 0);
        formData.append("categoryId", productData.categoryId);
        formData.append("isPersonalizable", productData.isPersonalizable ? "true" : "false");
        formData.append("details", productData.details || "");
        formData.append("images", productData.image);

        console.log("Enviando FormData a:", `${API}/${id}`);

        res = await fetch(`${API}/${id}`, {
          method: "PUT",
          body: formData,
        });
      } else {
        const body = {
          name: productData.name.trim(),
          description: productData.description.trim(),
          price: parseFloat(productData.price),
          stock: parseInt(productData.stock) || 0,
          categoryId: productData.categoryId,
          isPersonalizable: productData.isPersonalizable,
          details: productData.details || "",
        };

        console.log("Enviando JSON a:", `${API}/${id}`, body);

        res = await fetch(`${API}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }

      // Agregar logging de la respuesta
      console.log("Response status:", res.status);
      console.log("Response headers:", res.headers);
      console.log("Response URL:", res.url);

      const data = await handleResponse(res);

      toast.success("Producto actualizado");
      resetForm();
      setActiveTab("list");
      fetchProducts();
    } catch (error) {
      console.error("Error completo:", error);
      toast.error(error.message || "Error al editar producto");
    }
  };

  return {
    activeTab,
    setActiveTab,
    id,
    name,
    setName,
    description,
    setDescription,
    price,
    setPrice,
    stock,
    setStock,
    categoryId,
    setCategoryId,
    isPersonalizable,
    setIsPersonalizable,
    details,
    setDetails,
    image,
    setImage,
    products,
    loading,
    createProduct,
    deleteProduct,
    updateProduct,
    handleEdit,
    categories,
    resetForm,
  };
};

export default useDataProducts;