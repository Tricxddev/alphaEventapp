const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const sendAdminEmail = async ({ name, email, amount, reason, withdrawalID }) => {
  try {
    const botask = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.botMailer,
        pass: process.env.botMailpwd,
      },
    });

    const mailOptions = {
      from: `"Withdrawal Alert" <${process.env.botMailer}>`,
      to: "gpittaz67@gmail.com",
      subject: "Withdrawal Request Submitted",
      html: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Subscription Confirmation</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            background: #e3e6eb;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #f5f7fa;
            border-radius: 8px;
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #1e3c72, #2a5298);
            padding: 20px;
            text-align: left;
        }
        .header img {
            width: 120px;
        }
        .content {
            padding: 30px;
            background: #fff;
            text-align: center;
        }
        .content h2 {
            font-size: 22px;
            color: #333;
            margin-bottom: 10px;
        }
        .content p {
            font-size: 16px;
            color: #666;
        }
        .footer {
            padding: 20px;
            text-align: center;
            font-size: 14px;
            background: #f5f7fa;
            color: #555;
        }
        .footer a {
            color: #2a5298;
            text-decoration: none;
            font-weight: bold;
        }
    </style>
</head>
<body>

    <div class="email-container">
        <!-- Header Section -->
        <div class="header">
            <img src="logo.png" alt="Alpha Event">
        </div>

        <!-- Main Content -->
        <div class="content">
                <h3>New Withdrawal Request</h3>
        <p><strong>User:</strong> ${name || 'N/A'}</p>
        <p><strong>Email:</strong> ${email || 'N/A'}</p>
        <p><strong>Amount:</strong> ₦${amount}</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p><strong>Withdrawal ID:</strong> ${withdrawalID}</p>
        <p>Status is currently <strong>PENDING</strong>. Please review from the admin dashboard.</p>
        </div>

        <!-- Footer Section -->
        <div class="footer">
            <p>If you have any questions, feel free to contact us at <a href="mailto:support@alphaevents.com">support@alphaevents.com</a>.</p>
            <hr>
            <p><strong>Alpha Event</strong><br>Address 360, City, State.</p>

              <!-- Social Icons -->
            <div class="social-icons">
                <a href="#"><img src="facebook-icon.png" alt="Facebook"></a>
                <a href="#"><img src="twitter-icon.png" alt="Twitter"></a>
                <a href="#"><img src="linkedin-icon.png" alt="LinkedIn"></a>
            </div>
            <p>&copy; 2025 Alpha Event.</p>
        </div>
    </div>

</body>
</html>`
    };

    const sendMailAction = await botask.sendMail(mailOptions);
    console.log("Subscription confirmation email sent successfully:", sendMailAction.response);
  } catch (error) {
    console.error("Error sending subscription confirmation email:", error);
    throw new Error("Subscription confirmation email could not be sent.");
  }
};

module.exports = sendAdminEmail;