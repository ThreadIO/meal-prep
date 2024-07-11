import { Schema, model, models } from "mongoose";

const CustomerSchema = new Schema({
  userid: String, // This is the id from propelAuth
  payment_method_id: String, // This is the attached payment method id from rainforest
  billing_info: {
    first_name: String,
    last_name: String,
    email: String,
    phone: String,
    address: {
      street: String,
      city: String,
      state: String,
      zip: String,
    },
  },
  order_history: [
    {
      order_date: Date,
      meals: [
        {
          meal: {
            type: Schema.Types.ObjectId,
            ref: "Meal",
          },
          quantity: Number,
          selected_options: [
            {
              option_name: String,
              selection: String,
            },
          ],
          custom_options: [
            {
              option_name: String,
              selection: String,
            },
          ],
        },
      ],
      total_amount: Number,
      status: {
        type: String,
        enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      },
    },
  ],
  dietary_preferences: [String],
  allergies: [String],
  created_at: {
    type: Date,
    default: () => new Date(),
  },
  updated_at: {
    type: Date,
    default: () => new Date(),
  },
});

CustomerSchema.pre("save", function (next) {
  this.updated_at = new Date();
  next();
});

export default models.Customer || model("Customer", CustomerSchema);
