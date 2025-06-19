import { Schema, model } from 'mongoose';

const categorySchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
}, {
  timestamps: true,
  strict: false,
});

export default model("categories", categorySchema); 
