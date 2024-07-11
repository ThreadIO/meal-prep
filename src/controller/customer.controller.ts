import Customer from "@/models/customer.model";
import { NextResponse } from "next/server";

// Get Customer is Done by Payment Method Id
export async function getCustomer(payment_method_id: string) {
  try {
    const user = await Customer.findOne({
      payment_method_id: payment_method_id,
    });
    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.log("Error in Get Customer: ", error);
    return NextResponse.json({ success: false, error: error }, { status: 400 });
  }
}

/** POST: http://localhost:3000/api/user */
export async function createCustomer(body: any) {
  try {
    const { payment_method_id } = body;
    if (!payment_method_id)
      return NextResponse.json({
        success: false,
        error: "No payment method id present...!",
      });
    const newCustomer = {
      payment_method_id: payment_method_id,
      userid: body.userid,
      billing_info: body.billing_info,
      order_history: body.order_history,
      dietary_preferences: body.dietary_preferences,
      allergies: body.allergies,
      created_at: new Date(),
      updated_at: new Date(),
    };

    console.log("New Customer: ", newCustomer);
    const customer = await Customer.create(newCustomer);
    console.log("Customer Created: ", customer);
    return NextResponse.json({ success: true, data: customer });
  } catch (error) {
    return NextResponse.json({ success: false, error: error });
  }
}

/** DELETE: http://localhost:3000/api/recipe/id */
export async function deleteCustomer(payment_method_id: string) {
  try {
    if (!payment_method_id)
      return NextResponse.json({
        success: false,
        error: "No payment method id present...!",
      });

    await Customer.deleteMany({ payment_method_id: payment_method_id });

    return NextResponse.json({ success: true, deleted: payment_method_id });
  } catch (error) {
    return NextResponse.json({ success: false, error: error });
  }
}

export async function patchCustomer(payment_method_id: string, body: any = {}) {
  try {
    if (!payment_method_id)
      return NextResponse.json({
        success: false,
        error: "No payment method id present...!",
      });

    if (Object.keys(body).length > 0) {
      console.log("Body: ", body);
      await Customer.updateOne(
        { payment_method_id: payment_method_id },
        { $set: body }
      );
      return NextResponse.json({ success: true, updated: payment_method_id });
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
