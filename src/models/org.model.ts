import { Schema, model, models } from "mongoose";

const ZipcodeMapSchema = new Schema(
  {
    area: String,
    zipcodes: [String],
  },
  { _id: false }
);

const OrgSchema = new Schema({
  orgid: String, // This is the id from propelAuth
  name: String, // Name of the organization
  merchantid: String, // This is the id from rainforest
  url: String, // This is the URL of the company's website
  service: String, // Name of the service (Woocommerce, Shopify, ect.)
  subscriptions: [{ type: Schema.Types.ObjectId, ref: "Subscription" }], // This is the link to the Subscription Model
  zipcodeMap: [ZipcodeMapSchema], // New field for the area-zipcode mapping
});

export default models.Org || model("Org", OrgSchema);
