import {Schema, model} from "mongoose";

const customProductsSchema = new Schema({
    clientId: {
        type: Schema.Types.ObjectId,
        ref: "Clients",
        required: true
    },
    categoryId: {
        type: Schema.Types.ObjectId,
        ref: "categories",
        required: true
    },
    selectedItems: [
        {
            productId: {
                type: Schema.Types.ObjectId,
                ref: "products",
                required: true
            },
            quantity: {
                type: Number,
                required: false,
                min: 1
            }
        }
    ],
    referenceImage: {
        type: String,
        required: false
    },
    extraComments: {
        type: String,
        required: false,
        minLength: 10
    },
    totalPrice: {
        type: Number,
        required: true,
        min: [0, "El total no puede ser negativo"]
    }
}, {
    timestamps: true,
    strict: false
});

export default model("CustomProducts", customProductsSchema); 