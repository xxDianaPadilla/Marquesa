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

  // Cargar categorías
  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/categories");
      const data = await response.json();
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
      const data = await response.json();
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
  if (
    !productData.name?.trim() ||
    !productData.description?.trim() ||
    !productData.price ||
    !productData.categoryId
  ) {
    toast.error("Faltan campos requeridos");
    return;
  }

  const formData = new FormData();
  formData.append("name", productData.name.trim());
  formData.append("description", productData.description.trim());
  formData.append("price", parseFloat(productData.price));
  formData.append("stock", parseInt(productData.stock));
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

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Error al crear producto");
    }

    setProducts((prev) => [...prev, data]);
    toast.success("Producto creado exitosamente");
  } catch (error) {
    toast.error(error.message || "Error inesperado");
  }
};
  // Eliminar producto
  const deleteProduct = async (id) => {
    try {
      const res = await fetch(`${API}/${id}`, {
        method: "DELETE"
      });

      if (!res.ok) throw new Error("Error al eliminar el producto");

      toast.success("Producto eliminado");
      fetchProducts();
    } catch (error) {
      toast.error("Error al eliminar producto");
      console.error(error);
    }
  };

  // Prellenar formulario para editar
  const updateProduct = (product) => {
    setId(product._id);
    setName(product.name);
    setDescription(product.description);
    setPrice(product.price);
    setStock(product.stock || 0);
    setCategoryId(product.categoryId._id || "");
    setIsPersonalizable(product.isPersonalizable);
    setDetails(product.details || "");
    setImage(null); // No cargamos imagen vieja
    setActiveTab("form");
  };

  // Guardar edición
  const handleEdit = async (productData) => {
    if (
      !productData.name.trim() ||
      !productData.description.trim() ||
      !productData.price ||
      !productData.categoryId
    ) {
      toast.error("Faltan campos requeridos");
      return;
    }

    try {
      let res;

      if (productData.image instanceof File) {
        const formData = new FormData();
        formData.append("name", productData.name);
        formData.append("description", productData.description);
        formData.append("price", productData.price);
        formData.append("stock", productData.stock);
        formData.append("categoryId", productData.categoryId);
        formData.append("isPersonalizable", productData.isPersonalizable);
        formData.append("details", productData.details);
        formData.append("images", productData.image);

        res = await fetch(`${API}/${id}`, {
          method: "PUT",
          body: formData,
        });
      } else {
        const body = {
          name: productData.name,
          description: productData.description,
          price: productData.price,
          stock: productData.stock,
          categoryId: productData.categoryId,
          isPersonalizable: productData.isPersonalizable,
          details: productData.details,
        };

        res = await fetch(`${API}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }

      if (!res.ok) throw new Error("Error al actualizar el producto");

      toast.success("Producto actualizado");
      resetForm();
      setActiveTab("list");
      fetchProducts();
    } catch (error) {
      toast.error("Error al editar producto");
      console.error(error);
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
  };
};

export default useDataProducts;
