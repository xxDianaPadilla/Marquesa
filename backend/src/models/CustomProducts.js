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
                required: false
            }
        }
    ],
    referenceImage: {
        type: String,
        required: false
    },
    extraComments: {
        type: String,
        required: false
    },
    totalPrice: {
        type: Number,
        required: true
    }
}, {
    timestamps: true,
    strict: false
});

export default model("CustomProducts", customProductsSchema); 