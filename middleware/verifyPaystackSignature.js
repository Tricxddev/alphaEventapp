// middlewares/verifyPaystackSignature.js
const crypto=require("crypto")

 const verifyPaystackSignature=async(req, res, next) =>{
  const secret = process.env.PAYSTACK_WEBHOOK_SECRET;
  const hash = crypto
    .createHmac("sha512", secret)
    .update(JSON.stringify(req.body))
    .digest("hex");

  const signature = req.headers["x-paystack-signature"];
  if (hash !== signature) {
    return res.status(400).send("Invalid signature");
  }

  next();
}
module.export={verifyPaystackSignature}