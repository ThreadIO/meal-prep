import { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
  userid: String,
  settings: {
    client_key: String,
    client_secret: String,
    url: String,
    username: String,
    application_password: String,
  },
});

export default models.User || model("User", UserSchema);
