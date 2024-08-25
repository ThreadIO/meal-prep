import { Schema, model, models } from "mongoose";

// Ingredient Model
const IngredientSchema = new Schema({
  name: String,
  defaultUnit: String,
  nutritionPer100g: {
    calories: Number,
    protein: Number,
    fat: Number,
    carbs: Number,
  },
});

export default models.Ingredient || model("Ingredient", IngredientSchema);
