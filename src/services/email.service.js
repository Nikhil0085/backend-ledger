const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify transporter
transporter.verify((error, success) => {
  if (error) {
    console.error("Error connecting to email server:", error);
  } else {
    console.log("Email server is ready to send messages");
  }
});

// Generic send email function
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Backend Ledger" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("Message sent:", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

// Registration Email
async function sendRegistrationEmail(to) {
  const subject = "Welcome to Backend Ledger!";

  const text =
    "Thank you for registering with Backend Ledger. We're excited to have you on board!";

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Welcome to Backend Ledger 🎉</h2>

      <p>
        Thank you for registering with
        <strong>Backend Ledger</strong>.
      </p>

      <p>We're excited to have you on board!</p>
    </div>
  `;

  await sendEmail(to, subject, text, html);
}

// Transaction Success Email
async function sendTransactionEmail(to, transactionData) {
  const { fromAccount, toAccount, amount, transactionId } = transactionData;

  const subject = "Transaction Successful - Backend Ledger";

  const text = `
Hello User,

Your transaction has been completed successfully.

Transaction Details:
- Transaction ID: ${transactionId}
- From Account: ${fromAccount}
- To Account: ${toAccount}
- Amount: ₹${amount}

Thank you for using Backend Ledger.
`;

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="color: green;">Transaction Successful ✅</h2>

      <p>Your transaction has been completed successfully.</p>

      <h3>Transaction Details:</h3>

      <ul>
        <li><strong>Transaction ID:</strong> ${transactionId}</li>
        <li><strong>From Account:</strong> ${fromAccount}</li>
        <li><strong>To Account:</strong> ${toAccount}</li>
        <li><strong>Amount:</strong> ₹${amount}</li>
      </ul>

      <p>
        Thank you for using
        <strong>Backend Ledger</strong>.
      </p>
    </div>
  `;

  await sendEmail(to, subject, text, html);
}

// Transaction Failure Email
async function sendTransactionFailureEmail(to, transactionData) {
  const { fromAccount, toAccount, amount, reason } = transactionData;

  const subject = "Transaction Failed - Backend Ledger";

  const text = `
Hello User,

Unfortunately, your transaction could not be completed.

Transaction Details:
- From Account: ${fromAccount}
- To Account: ${toAccount}
- Amount: ₹${amount}

Reason:
${reason}

Please try again later.

Thank you for using Backend Ledger.
`;

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="color: red;">
        Transaction Failed ❌
      </h2>

      <p>
        Unfortunately, your transaction could not be completed.
      </p>

      <h3>Transaction Details:</h3>

      <ul>
        <li><strong>From Account:</strong> ${fromAccount}</li>
        <li><strong>To Account:</strong> ${toAccount}</li>
        <li><strong>Amount:</strong> ₹${amount}</li>
      </ul>

      <h3>Reason:</h3>

      <p>${reason}</p>

      <p>Please try again later.</p>

      <p>
        Thank you for using
        <strong>Backend Ledger</strong>.
      </p>
    </div>
  `;

  await sendEmail(to, subject, text, html);
}

module.exports = {
  sendRegistrationEmail,
  sendTransactionEmail,
  sendTransactionFailureEmail,
};
