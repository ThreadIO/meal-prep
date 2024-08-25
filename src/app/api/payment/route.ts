import Stripe from "stripe";
import { NextResponse, NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  let data = await request.json();
  let price = data.price;
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price: price,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: process.env.STRIPE_REDIRECT_URI!,
    cancel_url: process.env.STRIPE_REDIRECT_URI!,
  });
  return NextResponse.json(session.url);
}

export const dynamic = "force-dynamic";
