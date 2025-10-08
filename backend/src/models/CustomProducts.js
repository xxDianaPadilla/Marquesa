import { Schema, model } from "mongoose";

const customProductsSchema = new Schema({
    clientId: {
        type: Schema.Types.ObjectId,
        ref: "Clients",
        required: true
    },
    productToPersonalize: {
        type: String,
        required: true,
        enum: ["Ramo de flores naturales", "Ramo de flores secas", "Giftbox"]
    },
    selectedMaterials: [
        {
            materialId: {
                type: Schema.Types.ObjectId,
                ref: "CustomProductsMaterial",
                required: true
            },
            quantity: {
                type: Number,
                required: false,
                min: 1,
                default: 1
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
    },
}, {
    timestamps: true,
    strict: false
});

export default model("CustomProducts", customProductsSchema);