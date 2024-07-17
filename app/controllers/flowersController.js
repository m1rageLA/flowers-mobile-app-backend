const Flowers = require("../models/flowers");
const Stripe = require("stripe");
const dotenv = require("dotenv");
const Orders = require("../models/order");

dotenv.config();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

exports.getAllFlowers = async (req, res) => {
  try {
    const flowers = await Flowers.find();
    res.status(200).json(flowers);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving flowers");
  }
};

exports.getInfoBySpecificFlowers = async (req, res) => {
  const { id } = req.params;
  try {
    const flower = await Flowers.findById(id);
    if (!flower) {
      return res.status(404).json({ message: "Flower is not found" });
    }
    res.status(200).json(flower);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving flower information");
  }
};

exports.buyFlowers = async (req, res) => {
  const { id } = req.params;
  const flower = await Flowers.findById(id);
  if (!flower) {
    return res.status(404).send("Flowers not found");
  }
  try {
    const amountInGrosze = Math.round(flower.price * 100);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "PLN",
            product_data: {
              name: flower.title,
            },
            unit_amount: amountInGrosze,
          },
          quantity: 1,
        },
      ],
      metadata: {
        flowerId: flower._id.toString(),
        quantity: 1,
      },
      mode: "payment",
      success_url: `${process.env.SERVER_URL}/flowers/buy/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.SERVER_URL}/flowers/buy/cancel`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error(error);
    console.error("------>", process.env.STRIPE_SECRET_KEY);
    res.status(500).send("Error creating payment session");
  }
};

exports.success = async (req, res) => {
  const { session_id } = req.query;
  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === "paid") {
      const flowerId = session.metadata.flowerId; 
      const quantity = session.metadata.quantity; 

      const order = new Orders({
        flower: flowerId,
        quantity: quantity,
        sessionId: session_id,
        amount: session.amount_total, 
        currency: session.currency, 
      });

      await order.save();
    }

    res.send("Payment successfully completed. session ID: " + session_id);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send("An error occurred while processing a successful payment");
  }
};

exports.cancel = async (req, res) => {};

exports.sendFlowerTo = async (req, res) => {
  res.send("Buy flowers");
};
