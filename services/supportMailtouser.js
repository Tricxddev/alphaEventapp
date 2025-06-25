const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const sendSupportMail = async (userEmail, supportID) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.botMailer,
        pass: process.env.botMailpwd,
      },
    });

    const mailOptions = {
      from: process.env.botMailer,
      to: userEmail,
      subject: "Support Ticket Created Successfully",
      html: `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
              .container { max-width: 600px; margin: auto; background: #fff; padding: 20px; border-radius: 8px; }
              h2 { color: #333; }
              p { color: #555; }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>Support Ticket Created Successfully</h2>
              <p>Dear User,</p>
              <p>Your support ticket has been created successfully. Your support ID is <strong>${supportID}</strong>.</p>
              <p>We will get back to you as soon as possible.</p>
              <p>Thank you for reaching out to us!</p>
            </div>
          </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Support email sent successfully");
  } catch (error) {
    console.error("Error sending support email:", error);
  }
}
module.exports = sendSupportMail;