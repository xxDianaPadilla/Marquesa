import { Schema, model } from "mongoose";

const customProductsMaterial = new Schema({
  productToPersonalize: {
    type: String,
    required: true,
    enum: ["Ramo de flores naturales", "Ramo de flores secas", "Giftbox"]
  },
  categoryToParticipate: {
    type: String,
    required: true,
    validate: {
      validator: function (value) {
        const validCategories = {
          "Giftbox": [
            "Base para giftbox",
            "Comestibles para giftbox",
            "Extras"
          ],
          "Ramo de flores naturales": [
            "Flores naturales",
            "Envoltura",
            "Liston"
          ],
          "Ramo de flores secas": [
            "Flores secas",
            "Envoltura",
            "Liston"
          ]
        };

        const selectedProduct = this.productToPersonalize;
        return validCategories[selectedProduct]?.includes(value);
      },
      message: props =>
        `La categoría "${props.value}" no es válida para el producto "${props.instance.productToPersonalize}".`
    }
  },
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  stock: {
    type: Number,
    required: true
  }
});

export default model("CustomProductsMaterial", customProductsMaterial);