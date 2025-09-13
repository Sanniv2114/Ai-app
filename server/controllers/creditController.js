import Transaction from "../models/Transaction.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const plans = [
  { _id: "basic", name: "Basic", price: 10, credits: 100 },
  { _id: "pro", name: "Pro", price: 20, credits: 500 },
  { _id: "premium", name: "Premium", price: 30, credits: 1000 }
];

export const getPlans = async (req, res) => {
  try {
    res.json({ success: true, plans });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const purchasePlan = async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const plan = plans.find(p => p._id === planId);
    if (!plan) {
      return res.json({ success: false, message: "Invalid plan" });
    }

    // ✅ Create a new transaction
    const transaction = await Transaction.create({
      userId,
      planId: plan._id,
      amount: plan.price,
      credits: plan.credits,
      isPaid: false
    });

    const origin = req.headers.origin || "http://localhost:5173";

    // ✅ Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: plan.price * 100,
            product_data: { name: plan.name }
          },
          quantity: 1
        }
      ],
      mode: "payment",
      success_url: `${origin}/loading`,
      cancel_url: `${origin}`,
      metadata: { transactionId: transaction._id.toString(), appId: "QuickGPT" },
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60) // remove if it causes issues
    });

    res.json({ success: true, url: session.url });
  } catch (error) {
    console.error("❌ purchasePlan error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
