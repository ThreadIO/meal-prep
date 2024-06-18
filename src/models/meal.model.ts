import { Schema, model, models } from "mongoose";

const MealSchema = new Schema({
  productid: String,
  url: String,
  name: String,
  status: String,
  image: String,
  tags: [String],
  price: Number,
  nutrition_facts: {
    calories: Number,
    protein: Number,
    fat: Number,
    carbs: Number,
    ingredients: Number,
  },
  options: [
    {
      name: String,
      price_adjustment: Number,
      calories: Number,
      protein: Number,
      fat: Number,
      carbs: Number,
    },
  ],
});

export default models.Meal || model("Meal", MealSchema);
