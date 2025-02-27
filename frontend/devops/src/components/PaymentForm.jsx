import React, { useState } from "react";
import axios from "axios";
import "./PaymentForm.css"; // Import the custom CSS file

const PaymentForm = () => {
  const [formData, setFormData] = useState({
    amount: "",
    productinfo: "Buy USDT",
    firstname: "User",
    email: "user@example.com",
    phone: "9999999999",
    vpa: "",
  });
  const [error, setError] = useState(null);
  const [paymentForm, setPaymentForm] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setPaymentForm(null);

    try {
      // Validate UPI handle
      console.log("Validating UPI handle...");
      const validateResponse = await axios.post("http://localhost:5000/validate-upi", {
        upi: formData.vpa,
      });

      if (!validateResponse.data.valid) {
        setError("Invalid UPI handle.");
        return;
      }

      console.log("UPI handle validated. Initiating payment...");

      // Initiate payment
      const response = await axios.post("http://localhost:5000/initiate-payment", formData);
      setPaymentForm(response.data.formHtml);
    } catch (err) {
      console.error("Error during payment process:", err);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="payment-container">
      <div className="payment-card">
        <h1 className="payment-title">Secure UPI Payment</h1>
        <p className="payment-subtitle">Complete your transaction quickly and securely.</p>
        <form onSubmit={handleSubmit} className="payment-form">
          <div className="form-group">
            <label>Amount</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              placeholder="Enter Amount"
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>UPI ID</label>
            <input
              type="text"
              name="vpa"
              value={formData.vpa}
              onChange={handleChange}
              required
              placeholder="example@upi"
              className="form-input"
            />
          </div>
          <button type="submit" className="payment-button">Proceed to Pay</button>
        </form>
        {error && <p className="error-message">{error}</p>}
        {paymentForm && (
          <div
            className="payment-response"
            dangerouslySetInnerHTML={{ __html: paymentForm }}
          ></div>
        )}
      </div>
    </div>
  );
};

export default PaymentForm;