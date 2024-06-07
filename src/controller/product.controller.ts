import Product from "@/models/product.model";
import { NextResponse } from "next/server";

export async function getProduct(productid: string, url: string) {
  try {
    const product = await Product.findOne({ productid: productid, url: url });
    console.log("Product: ", product);
    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.log("Error in Get Product: ", error);
    return NextResponse.json({ success: false, error: error }, { status: 400 });
  }
}

/** POST: http://localhost:3000/api/product */
export async function createProduct(productid: string, body: any) {
  try {
    if (!productid)
      return NextResponse.json({
        success: false,
        error: "No product id present...!",
      });
    console.log("Settings: ", body);
    const newProduct = {
      productid: productid,
      product_name: body.product_name,
      url: body.url,
      calories: body.calories,
      protein: body.protein,
      fat: body.fat,
      carbs: body.carbs,
      add_ons: body.add_ons,
    };
    console.log("New Product: ", newProduct);
    const product = await Product.create(newProduct);
    console.log("Product Created: ", product);
    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    return NextResponse.json({ success: false, error: error });
  }
}

/** DELETE: http://localhost:3000/api/recipe/id */
export async function deleteProduct(productid: string, url: string) {
  try {
    if (!productid)
      return NextResponse.json({
        success: false,
        error: "No product id present...!",
      });

    await Product.deleteMany({ productid: productid, url: url });

    return NextResponse.json({ success: true, deleted: productid });
  } catch (error) {
    return NextResponse.json({ success: false, error: error });
  }
}

export async function patchProduct(
  productid: string,
  url: string,
  body: any = {}
) {
  try {
    console.log("ProductId ID: ", productid);
    if (!productid)
      return NextResponse.json({
        success: false,
        error: "No product id present...!",
      });

    if (Object.keys(body).length > 0) {
      await Product.updateOne(
        { productid: productid, url: url },
        { $set: body }
      );
      return NextResponse.json({ success: true, updated: productid });
    } else {
      return NextResponse.json({
        success: false,
        error: "No valid fields to update",
      });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: error });
  }
}
