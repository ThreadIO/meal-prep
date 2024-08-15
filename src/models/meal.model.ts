import { Schema, model, models, Types } from "mongoose";

const MealSchema = new Schema({
  mealid: String, // This is the id from the service provider
  url: String, // This is the URL of the company's website
  name: String, // Name of the meal
  status: String, // Status of the meal (e.g. instock, outofstock)
  image: String, // Url of image of meal
  tags: [String], // Tags for the meal, this is menu categories
  price: Number, // Price of the meal
  description: String, // Description of the meal
  nutrition_facts: {
    // Nutrition facts of the base meal
    calories: Number,
    protein: Number,
    fat: Number,
    carbs: Number,
    ingredients: [
      {
        ingredient: { type: Types.ObjectId, ref: "Ingredient" },
        quantity: Number,
        unit: String,
        cookStyle: String,
      },
    ],
  },
  options: [
    {
      // Options for the meal, with nutrition facts and price adjustment for each option
      name: String,
      price_adjustment: Number,
      calories: Number,
      protein: Number,
      fat: Number,
      carbs: Number,
      ingredients: [
        {
          ingredient: { type: Types.ObjectId, ref: "Ingredient" },
          quantity: Number,
          unit: String,
          cookStyle: String,
        },
      ],
    },
  ],
  custom_options: [
    {
      name: String,
      options: [
        {
          name: String,
          price: Number,
          calories: Number,
          carbs: Number,
          protein: Number,
          fat: Number,
          ingredients: [
            {
              ingredient: { type: Types.ObjectId, ref: "Ingredient" },
              quantity: Number,
              unit: String,
              cookStyle: String,
            },
          ],
        },
      ],
    },
  ],
});

export default models.Meal || model("Meal", MealSchema);
