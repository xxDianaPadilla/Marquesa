import { Schema, model } from "mongoose";

const ShoppingCartSchema = new Schema({
  clientId: {
    type: Schema.Types.ObjectId,
    ref: "Clients",
    required: true
  },
  items: [
    {
      itemType: {
        type: String,
        enum: ["product", "custom"],
        required: true
      },
      itemId: {
        type: Schema.Types.ObjectId,
        required: true,
        refPath: "items.itemTypeRef"
      },
      itemTypeRef: {
        type: String,
        required: true,
        enum: ["products", "CustomProducts"]
      },
      quantity: {
        type: Number,
        required: false,
        min: 1
      },
      subtotal: {
        type: Number,
        required: true,
        min: [0, "El subtotal no puede ser negativo"]
      }
    }
  ],
  
  pendingDiscount: {
    code: String,
    codeId: String,
    name: String,
    discount: String,
    amount: {
      type: Number,
      min: 0
    },
    appliedAt: Date,
    color: String,
    textColor: String
  },
  
  appliedDiscount: {
    code: String,
    codeId: String,
    name: String,
    discount: String,
    amount: {
      type: Number,
      min: 0
    },
    appliedAt: Date,
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Sales"
    }
  },
  
  subtotal: {
    type: Number,
    required: true,
    default: 0,
    min: [0, "El subtotal no puede ser negativo"]
  },
  
  total: {
    type: Number,
    required: true,
    min: [0, "El total no puede ser negativo"]
  },
  
  status: {
    type: String,
    enum: ["Activo", "Completado", "Abandonado"],
    default: "Activo"
  }
}, {
  timestamps: true,
  strict: false
});

ShoppingCartSchema.methods.recalculateTotals = function() {
  // Calcular subtotal de items
  this.subtotal = this.items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  
  // Obtener descuento aplicable (pendiente tiene prioridad)
  const discountAmount = this.pendingDiscount?.amount || this.appliedDiscount?.amount || 0;
  
  // Calcular total final
  this.total = Math.max(0, this.subtotal - discountAmount);
  
  console.log('Totales recalculados:', {
    cartId: this._id,
    subtotal: this.subtotal,
    pendingDiscount: this.pendingDiscount?.amount || 0,
    appliedDiscount: this.appliedDiscount?.amount || 0,
    discountUsed: discountAmount,
    finalTotal: this.total
  });
};

ShoppingCartSchema.pre('save', function(next) {
  this.recalculateTotals();
  next();
});

export default model("ShoppingCart", ShoppingCartSchema);