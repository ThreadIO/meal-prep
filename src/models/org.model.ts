import { Schema, model, models } from "mongoose";

const OrgSchema = new Schema({
  orgid: String, // This is the id from the propelAuth
  name: String, // Name of the organization
  merchantid: String, // This is the id from rainforest
  url: String, // This is the URL of the company's website
  service: String, // Name of the service (Woocommerce, Shopify, ect.)
});

export default models.Org || model("Org", OrgSchema);
