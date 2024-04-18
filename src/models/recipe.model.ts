import { Schema, model, models } from "mongoose";

const RecipeSchema = new Schema({
  name: String,
  orgid: String,
  userid: String,
  ingredients: [
    {
      name: String,
      quantity: Number,
      unit: String,
    },
  ],
});

export default models.Recipe || model("Recipe", RecipeSchema);
