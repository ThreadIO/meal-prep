import { Schema, model, models } from "mongoose";

const SubscriptionSchema = new Schema({
  orgId: { type: Schema.Types.ObjectId, ref: "Org" },
  status: {
    type: String,
    enum: ["active", "cancelled", "paused"],
    default: "active",
  },
  paymentMethodId: String,
  nextBillingDate: Date,
  amount: Number,
  currency: String,
  billingFrequency: {
    type: String,
    enum: ["weekly", "monthly", "quarterly", "yearly"],
    default: "monthly",
  },
  billingInterval: {
    type: Number,
    default: 1,
    min: 1,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default models.Subscription || model("Subscription", SubscriptionSchema);
