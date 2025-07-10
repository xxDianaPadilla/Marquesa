import { Schema, model } from 'mongoose';

const productsSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    match: [
      /^[^\s].+[^\s]$/, // Evita nombres que sean solo espacios
      "El nombre del producto no puede ser solo espacios",
    ],
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: [10, "La descripción debe tener al menos 10 caracteres"],
  },
  price: {
    type: Number,
    required: true,
    min: [0, "El precio no puede ser negativo"],
  },
  stock: {
    type: Number,
    default: 0,
    min: [0, "El stock no puede ser negativo"],
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: "categories",
    required: true,
  },
  images: [
    {
      image: {
        type: String,
        required: true
      }
    }
  ],
  isPersonalizable: {
    type: Boolean,
    default: false,
  },
  details: {
    type: String,
    required: false,
    trim: true,
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
  timestamps: true,
  strict: false,
});

export default model("products", productsSchema);