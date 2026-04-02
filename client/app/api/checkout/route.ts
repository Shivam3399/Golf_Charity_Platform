import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',

      // ✅ Identify user
      customer_email: email,

      // ✅ Attach metadata (important for future use)
      metadata: {
        email: email,
      },

      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Golf Subscription',
            },
            unit_amount: 1000, // $10
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],

      // ✅ Redirect to success page (not dashboard)
      success_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000/',
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Stripe error' },
      { status: 500 }
    );
  }
}