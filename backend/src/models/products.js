// Importamos Schema y model de mongoose para crear el modelo de base de datos
import { Schema, model } from 'mongoose';

// Definimos el esquema para los productos
const productsSchema = new Schema({
  // Nombre del producto con validaciones para evitar espacios vacíos
  name: {
    type: String,
    required: true,
    trim: true, // Elimina espacios al inicio y final
    match: [
      /^[^\s].+[^\s]$/, // Evita nombres que sean solo espacios
      "El nombre del producto no puede ser solo espacios",
    ],
  },
  // Descripción del producto (mínimo 10 caracteres)
  description: {
    type: String,
    required: true,
    trim: true, // Elimina espacios al inicio y final
    minlength: [10, "La descripción debe tener al menos 10 caracteres"],
  },
  // Precio del producto (no puede ser negativo)
  price: {
    type: Number,
    required: true,
    min: [0, "El precio no puede ser negativo"],
  },
  // Cantidad en inventario (por defecto 0, no puede ser negativo)
  stock: {
    type: Number,
    default: 0,
    min: [0, "El stock no puede ser negativo"],
  },
  // Referencia a la categoría del producto
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: "categories",
    required: true,
  },
  // Array de imágenes del producto
  images: [
    {
      image: {
        type: String,
        required: true // Cada imagen debe tener una URL válida
      }
    }
  ],
  // Indica si el producto puede ser personalizado por el cliente
  isPersonalizable: {
    type: Boolean,
    default: false,
  },
  // Detalles adicionales del producto (opcional con validación condicional)
  details: {
    type: String,
    required: false,
    trim: true, // Elimina espacios al inicio y final
    validate: {
      validator: function (v) {
        // Si el campo está vacío o es null/undefined, es válido
        // Si tiene contenido, debe tener al menos 4 caracteres
        return !v || v.length >= 4;
      },
      message: "Los detalles deben tener al menos 4 caracteres"
    }
  },
}, {
  // Agrega automáticamente campos createdAt y updatedAt
  timestamps: true,
  // Permite campos adicionales no definidos en el esquema
  strict: false,
});

// Exportamos el modelo de productos
export default model("products", productsSchema);