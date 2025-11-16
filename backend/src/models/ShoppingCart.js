// Importar Schema y model de Mongoose para definir el esquema de la base de datos
import { Schema, model } from "mongoose";

// Definir el esquema del carrito de compras
const ShoppingCartSchema = new Schema({
  // Referencia al cliente propietario del carrito
  clientId: {
    type: Schema.Types.ObjectId,
    ref: "Clients",
    required: true
  },
  // Array de productos/items en el carrito
  items: [
    {
      // Tipo de item para distinguir entre productos normales y personalizados
      itemType: {
        type: String,
        enum: ["product", "custom"],
        required: true
      },
      // ID del producto referenciado
      itemId: {
        type: Schema.Types.ObjectId,
        required: true,
        refPath: "items.itemTypeRef"
      },
      // Campo que define qué colección referenciar dinámicamente
      itemTypeRef: {
        type: String,
        required: true,
        enum: ["products", "CustomProducts"]
      },
      // Cantidad del producto en el carrito
      quantity: {
        type: Number,
        required: false,
        min: 1
      },
      // Subtotal del item (precio × cantidad)
      subtotal: {
        type: Number,
        required: true,
        min: [0, "El subtotal no puede ser negativo"]
      }
    }
  ],

  // Información del descuento pendiente (no aplicado aún)
  pendingDiscount: {
    // Información del código promocional
    code: {
      type: String,
      required: false
    },
    codeId: {
      type: String,
      required: false
    },
    name: {
      type: String,
      required: false
    },
    discount: {
      type: String, // Por ejemplo: "10%", "15%"
      required: false
    },
    // Monto calculado del descuento
    amount: {
      type: Number,
      required: false,
      min: 0
    },
    // Fecha de aplicación temporal
    appliedAt: {
      type: Date,
      required: false
    },
    // Color y estilo (opcional, para UI)
    color: {
      type: String,
      required: false
    },
    textColor: {
      type: String,
      required: false
    }
  },

  // Descuento confirmado (solo después de completar la compra)
  appliedDiscount: {
    code: {
      type: String,
      required: false
    },
    codeId: {
      type: String,
      required: false
    },
    name: {
      type: String,
      required: false
    },
    discount: {
      type: String,
      required: false
    },
    amount: {
      type: Number,
      required: false,
      min: 0
    },
    appliedAt: {
      type: Date,
      required: false
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Sales",
      required: false
    }
  },

  // Subtotal sin descuentos
  subtotal: {
    type: Number,
    required: true,
    default: 0,
    min: [0, "El subtotal no puede ser negativo"]
  },

  // Total general del carrito (subtotal - descuento aplicado)
  total: {
    type: Number,
    required: true,
    min: [0, "El total no puede ser negativo"]
  },

  // Estado del carrito
  status: {
    type: String,
    enum: ["active", "completed", "abandoned"],
    default: "active"
  }
}, {
  timestamps: true,
  strict: false
});

// Middleware pre-save para calcular totales
ShoppingCartSchema.pre('save', function (next) {
  // Calcular subtotal de items
  this.subtotal = this.items.reduce((sum, item) => sum + item.subtotal, 0);

  // Calculamos total considerando descuento aplicado (no pendiente)
  const discountAmount = this.appliedDiscount?.amount || 0;
  this.total = Math.max(0, this.subtotal - discountAmount);

  next();
});

// Exportar el modelo del carrito de compras
export default model("ShoppingCart", ShoppingCartSchema);