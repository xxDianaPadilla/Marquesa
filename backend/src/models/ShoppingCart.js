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
        required: false
      },
      subtotal: {
        type: Number,
        required: true
      }
    }
  ],
  promotionalCode: {
    type: String,
    required: false
  },
  total: {
    type: Number,
    required: true
  }
}, {
  timestamps: true,
  strict: false
});

export default model("ShoppingCart", ShoppingCartSchema);