// Importación de Schema y model desde mongoose para definir el esquema de la base de datos
import { Schema, model } from "mongoose";

// Esquema para materiales utilizados en productos personalizables
const customProductsMaterial = new Schema({
  // Tipo de producto que se puede personalizar
  productToPersonalize: {
    type: String,
    required: true,
    // Solo permite estos 3 tipos de productos personalizables
    enum: ["Ramo de flores naturales", "Ramo de flores secas", "Giftbox"]
  },
  // Categoría del material que participa en la personalización
  categoryToParticipate: {
    type: String,
    required: true,
    // Validación personalizada que verifica si la categoría es válida para el producto seleccionado
    validate: {
      validator: function (value) {
        // Mapeo de productos y sus categorías válidas de materiales
        const validCategories = {
          "Giftbox": [
            "Base para giftbox",      // Cajas, contenedores base
            "Comestibles para giftbox", // Chocolates, dulces, etc.
            "Extras"                  // Accesorios adicionales
          ],
          "Ramo de flores naturales": [
            "Flores naturales",       // Rosas, tulipanes, etc.
            "Envoltura",             // Papel, tela para envolver
            "Liston"                 // Cintas decorativas
          ],
          "Ramo de flores secas": [
            "Flores secas",          // Flores deshidratadas/preservadas
            "Envoltura",             // Papel, tela para envolver
            "Liston"                 // Cintas decorativas
          ]
        };

        // Obtiene el producto seleccionado para validar contra sus categorías permitidas
        const selectedProduct = this.productToPersonalize;
        // Verifica si la categoría existe en las categorías válidas del producto
        return validCategories[selectedProduct]?.includes(value);
      },
      // Mensaje de error personalizado cuando la validación falla
      message: props =>
        `La categoría "${props.value}" no es válida para el producto "${props.instance.productToPersonalize}".`
    }
  },
  // Nombre del material específico
  name: {
    type: String,
    required: true
  },
  // URL o path de la imagen del material
  image: {
    type: String,
    required: true
  },
  // Precio del material en la moneda base del sistema
  price: {
    type: Number,
    required: true
  },
  // Cantidad disponible en inventario
  stock: {
    type: Number,
    required: true
  }
});

// Exportación del modelo basado en el esquema
export default model("CustomProductsMaterial", customProductsMaterial);