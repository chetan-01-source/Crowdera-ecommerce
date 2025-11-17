import dotenv from "dotenv";
dotenv.config(); // This must come before using process.env

import express from "express";
import Stripe from "stripe";

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: "2025-10-29.clover" });

const YOUR_DOMAIN = process.env.CLIENT_DOMAIN || "http://localhost:5174";

router.post("/create-checkout-session", async (req, res) => {
  try {
    const { 
      amount, 
      currency = 'usd', 
      productName = 'Product', 
      quantity = 1 
    } = req.body;
    
    console.log("Creating checkout session with:", { amount, currency, productName, quantity });
    
    if (!amount) {
      return res.status(400).json({ error: "Missing amount" });
    }

    // Create a product
    const product = await stripe.products.create({
      name: productName,
    });

    // Create a price for the product
    const price = await stripe.prices.create({
      unit_amount: Math.round(amount * 100), // Convert to cents and ensure integer
      currency: currency,
      product: product.id,
    });

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: price.id,
          quantity,
        },
      ],
      mode: "payment",
      success_url: `${YOUR_DOMAIN}/success`,
      cancel_url: `${YOUR_DOMAIN}/cart`,
    });

    res.json({ url: session.url });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;