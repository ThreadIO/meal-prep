import mongoose from "mongoose";

export default async function connect(companyName: string = "test") {
  const url = process.env.ATLAS_URL;
  console.log("Company Name: ", companyName);
  if (!url) {
    throw new Error("ATLAS_URL is not defined");
  }
  const db = await mongoose.connect(url, { dbName: companyName });
  if (mongoose.connection.readyState === 1) {
    console.log("Database is connected to: ", db.connection.name);
    return;
  }
  console.log("Database is connected to: ", db.connection.name);
}
