import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import crypto from "crypto";

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// PayU Credentials
const PAYU_KEY = "4uMgQm";
const PAYU_SALT = "MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDdBV/5jTrrSi2CDMN6KWX2yaMzO6+tjGnHWVsq+LuTUEc9wsNRFVtZuRUWfpwiF8XrQ5YEqIBvCv8ck9tS+yddU9eKc7iPaDbkMItk/eWJBcFmWPgr3lsTRR7ESahHyK5gBXhFoi7ecSn2Xdw0m3Q4Gm3hg9Cv9+jflXYyb4WwnVLi3q4Y6/mmdD/LjiEm7XVV97NnV+exyy7OBEBPeUingxRCz5hIV6I5fd0G7Lu05wBSOKymoNhuuHmjEf6zEfrwVVZPhZsLgt3M6XIaNohBZLIu8ELeG7GS+etoJ/3+f/I2VivrG9noHBVWIBm+Rbz8ktbfEnqtoN4a9j/qya0fAgMBAAECggEAKKsjhMy66a6FfyeQFHtnmqhxkizKX5m1oQvNHbQU979OzIt42wOeAn1u5uu3GQLc1TRjd0n2D/irBnwiYDt8e8zAnWY7sI+Rgh14mMWrJbJcatO2HoRUp9ARIDcZctP3Wg3HmrCEBUQ3X3DX4wozsVsTmuphTO/F9tYOoKsqo1uH6gTaKea0kVDQgW0iZf7g4f7jlxiJzLclx6S3E9QPUW9Nd2K5q+oKOZ2G4gj6Mr3gEwkC+9ecbRA07HcI6ep808VBjXYrtVmfYAK06qeiPkSctRLkPyprZ5UOCltnThML0HsCWN8Ltc/+Qo63VlfVCdxv1scmZ5qSufyJKgJhqQKBgQDuUDHy6GUB3FfuAdcbCE+yNvqvtlrRfCzhEF7YFBZwZTL/PaUcpNyvdAq4X6fzGdY85C0A0p2Axz7bYX8wIzB4VtMT5HNvv3b4pZ8Xqm5pNb/9oA1jD2owAHV0DiwGANg+3qrT4QSE7DsD14kHczq+M2Ls5mdXVmlpqizDH/UyuwKBgQDtbKMsnwFoFxmVsbveKffGiqUtg0I7T/GCu5OPPUBYN3kOXGREWEWukelAIgnpJ9q354l+rWKMb7FzXAEgMDxlkv1hayP6A3qWuGN9ag84HnSO/VPpYWR/IYb1QG+3VqkgEOVNeE21TX1VScBy7RR5++oOSh/O+2bfkj0DI4jC7QKBgQDIk1im4G/7E/Ax0vyvtNwW2+08LJfdjszbFIMvDCEishos9z5bkGpphZpsOZ5KnmlRUJ6L/bgwpgHCdRmucz+dWT5IlNOPry878XGoYnqRNHsFxUrfIB84jXpNlov49YcLyy8uK0o5cfXtst+TFKnRYcCWMQmzWXhZRbBs/h3KdwKBgDmWWB3Ck3zD3ZjJe1/vngGyL05SwAXS5ilnhesAWFMNYXdyQX+ySXSGP6UmnHDJEev5ZQgs1fJqRQhOEJfWG1Anzv2KFzfVEC7umnMY/ogGGw9zsp6w2MddQnbKIk693lfAwV2BCJgpK3U8Zkl557WOvL6qi/yQTet8dQAF5m4hAoGAEFOu2lnRlMqv7F20nnGUgOFEIPQHc7q7yJe+xqGfCPKP4Q+yvIHh09egehmjnu7zSvL5446RGOChDeu2y8KUcR8e8lUVJtZmHg1oB9T1ANuUnemiSBuexDSqfQACcsiqMALQUZQn+N3ZimuHGsL0ZCS8J1fZ2puhiQxkb6Sjuvk=";

const PAYU_URL = "https://test.payu.in/_payment"; // Use production URL for live

// VPA Validation Endpoint
app.post("/validate-upi", async (req, res) => {
  const { upi } = req.body;

  // Validate only allowed test VPAs in sandbox mode
  const validVPAs = ["anything@payu", "9999999999@payu.in","9630087918@pthdfc"];
  if (!validVPAs.includes(upi)) {
    return res.status(400).json({ valid: false, message: "Invalid UPI handle." });
  }

  console.log(`UPI handle validated: ${upi}`);
  res.json({ valid: true });
});

// Payment Initiation Endpoint
app.post("/initiate-payment", async (req, res) => {
  const { amount, productinfo, firstname, email, phone, vpa } = req.body;

  // Generate unique transaction ID
  const txnid = `txn_${Date.now()}`;

  // Hash calculation
  const hashString = `${PAYU_KEY}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${PAYU_SALT}`;
  const hash = crypto.createHash("sha512").update(hashString).digest("hex");

  console.log(`Hash generated: ${hash}`);

  // Payment form data
  const paymentData = {
    key: PAYU_KEY,
    txnid: txnid,
    amount: amount,
    productinfo: productinfo,
    firstname: firstname,
    email: email,
    phone: phone,
    pg: "UPI",
    bankcode: "UPI",
    vpa: vpa,
    surl: "http://localhost:5000/success", // Success URL
    furl: "http://localhost:5000/failure", // Failure URL
    hash: hash,
  };

  console.log("Payment initiation request:", paymentData);

  // Generate HTML form to submit to PayU
  const formHtml = `
    <form action="${PAYU_URL}" method="post">
      ${Object.entries(paymentData)
        .map(([key, value]) => `<input type="hidden" name="${key}" value="${value}" />`)
        .join("\n")}
      <input type="submit" value="Proceed to PayU" />
    </form>
  `;

  res.status(200).json({ formHtml });
});

// Success Callback
app.post("/success", (req, res) => {
  console.log("Payment success response received:", req.body);

  // Validate the hash returned by PayU
  const { txnid, amount, productinfo, firstname, email, status, hash } = req.body;
  const reverseHashString = `${PAYU_SALT}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${PAYU_KEY}`;
  const calculatedHash = crypto.createHash("sha512").update(reverseHashString).digest("hex");

  if (hash === calculatedHash) {
    console.log("Hash validation successful!");
    res.send("Payment successful and hash verified!");
  } else {
    console.error("Hash validation failed!");
    res.status(400).send("Payment success but hash validation failed.");
  }
});

// Failure Callback
app.post("/failure", (req, res) => {
  console.log("Payment failure response received:", req.body);
  res.send("Payment failed. Please try again.");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
