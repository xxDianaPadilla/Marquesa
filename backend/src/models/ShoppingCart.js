// Importar Schema y model de Mongoose para definir el esquema de la base de datos
import { Schema, model } from "mongoose";

// Definir el esquema del carrito de compras
const ShoppingCartSchema = new Schema({
  // Referencia al cliente propietario del carrito
  clientId: {
    type: Schema.Types.ObjectId, // Tipo ObjectId para referenciar otro documento
    ref: "Clients", // Referencia al modelo de Clients
    required: true // Campo obligatorio
  },
  // Array de productos/items en el carrito
  items: [
    {
      // Tipo de item para distinguir entre productos normales y personalizados
      itemType: {
        type: String,
        enum: ["product", "custom"], // Solo permite estos dos valores
        required: true
      },
      // ID del producto referenciado
      itemId: {
        type: Schema.Types.ObjectId,
        required: true,
        refPath: "items.itemTypeRef" // Referencia dinámica basada en itemTypeRef
      },
      // Campo que define qué colección referenciar dinámicamente
      itemTypeRef: {
        type: String,
        required: true,
        enum: ["products", "CustomProducts"] // Nombres de las colecciones a referenciar
      },
      // Cantidad del producto en el carrito
      quantity: {
        type: Number,
        required: false, // Opcional para productos personalizados que pueden no tener cantidad
        min: 1 // Mínimo 1 si se especifica
      },
      // Subtotal del item (precio × cantidad)
      subtotal: {
        type: Number,
        required: true,
        min: [0, "El subtotal no puede ser negativo"] // Validación con mensaje personalizado
      }
    }
  ],
  // Código promocional aplicado al carrito (opcional)
  promotionalCode: {
    type: String,
    required: false
  },
  // Total general del carrito
  total: {
    type: Number,
    required: true,
    min: [0, "El total no puede ser negativo"] // Validación con mensaje personalizado
  }
}, {
  // Opciones del esquema
  timestamps: true, // Agrega automáticamente createdAt y updatedAt
  strict: false // Permite campos adicionales no definidos en el esquema
});

// Exportar el modelo del carrito de compras
export default model("ShoppingCart", ShoppingCartSchema);