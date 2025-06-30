/*
    media{
    type: string,
    imageURL: string,
    videoURL: string,
*/ 

import { Schema, model } from 'mongoose';

const mediaSchema = new Schema({
  type: {
    type: String,
    required: true,
    enum: ['Dato Curioso', 'Tip', 'Blog'],
  },
    imageURL: {
        type: String,
        required: true,
    },
    videoURL: {
        type: String,
        required: true,
    }
}, {
  timestamps: true,
  strict: false,
});

export default model("media", mediaSchema);