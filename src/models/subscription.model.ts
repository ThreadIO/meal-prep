import { Schema, model, models } from "mongoose";

const SubscriptionSchema = new Schema({
  orgid: { type: Schema.Types.ObjectId, ref: "Org" },
  status: {
    type: String,
    enum: ["active", "cancelled", "paused"],
    default: "active",
  },
  paymentMethodId: String,
  payinConfigId: String,
  nextBillingDate: {
    type: Date,
    default: () => {
      const date = new Date();
      date.setMonth(date.getMonth() + 1);
      return date;
    },
  },
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
  processedBillingCycles: [String],
});

// Add a compound index for faster lookups
SubscriptionSchema.index({ orgid: 1, nextBillingDate: 1 });

export default models.Subscription || model("Subscription", SubscriptionSchema);
