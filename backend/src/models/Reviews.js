import { Schema, model } from "mongoose";

const reviewsSchema = new Schema({
    clientId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    products: [
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
        }
    ],
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    message: {
        type: String,
        required: true
    }
}, {
    timestamps: true,
    strict: false
});

export default model("Reviews", reviewsSchema);