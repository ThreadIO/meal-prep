import { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
  userid: String,
  settings: {
    client_key: String,
    client_secret: String,
    url: String,
  },
});

export default models.User || model("User", UserSchema);
