import Stripe from "stripe";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"]; 
  let event;  
   console.log("starts---")
  try {
    // ✅ Use raw body for webhook verification
    event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    console.error("❌ Stripe Webhook signature error:", error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }
   console.log("event--",event)
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const { transactionId, appId } = session.metadata || {};

        if (appId !== "QuickGPT") {
          console.log("⚠️ Ignored webhook event: Invalid appId", appId);
          break;
        }

        const transaction = await Transaction.findOne({ _id: transactionId, isPaid: false });
        if (!transaction) {
          console.log("⚠️ No unpaid transaction found for:", transactionId);
          break;
        }

        // ✅ Update user's credits
        await User.updateOne(
          { _id: transaction.userId },
          { $inc: { credits: transaction.credits } }
        );

        // ✅ Mark transaction as paid
        transaction.isPaid = true;
        await transaction.save();

        console.log(`✅ Credits added: ${transaction.credits} to user ${transaction.userId}`);
        break;
      }

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("❌ Webhook processing error:", error);
    res.status(500).send("Internal Server Error");
  }
};
