import { Schema, model, models } from "mongoose";

const ProductSchema = new Schema({
  productid: String,
  url: String,
  product_name: String,
  calories: Number,
  protein: Number,
  fat: Number,
  carbs: Number,
  add_ons: [
    {
      add_on_name: String,
      add_on_calories: Number,
      add_on_protein: Number,
      add_on_fat: Number,
      add_on_carbs: Number,
    },
  ],
});

export default models.Product || model("Product", ProductSchema);
