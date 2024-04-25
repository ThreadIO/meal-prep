import Stripe from "stripe";
import { NextResponse } from "next/server";

export async function GET() {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const prices = await stripe.products.list({ limit: 4, active: true });
  return NextResponse.json(prices.data.reverse());
}
