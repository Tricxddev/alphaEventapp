const nodemailer = require('nodemailer');
const dotenv = require("dotenv");
dotenv.config(); // Load environment variables

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.botMailer,
    pass: process.env.botMailpwd,
  },
});

// /**
//  * Sends an HTML email digest to subscribers
//  * @param {Array} subscribers - List of subscriber objects
//  * @param {Array} events - List of event objects
//  */
const eventMailsender = async (subcriberList, eventsAmonthAgo) => {
  const subject = `Monthly Event Newsletter - ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`;

  // Generate HTML for all events
  const eventsHTML = eventsAmonthAgo.map(event => `
    <div style="padding: 10px; border: 1px solid #ddd; margin-bottom: 15px;">
      <h2 style="color: #2196F3;">${event.eventName}</h2>
      <p><strong>Organizer:</strong> ${event.organizerName || 'N/A'}</p>
      <p><strong>Date:</strong> ${event.eventDate?.eventStart || 'TBA'}</p>
      <p><strong>Time:</strong> ${event.eventTime?.start || 'TBA'}</p>
      <p><strong>Location:</strong> ${event.eventType || 'Online'}</p>
      <p>${event.eventDescription || 'No description provided.'}</p>
      <a href="${event.venueInformation?.url || '#'}" style="color: #2196F3;">View Event</a>
    </div>
  `).join('');

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
      <h1 style="text-align: center; color: #333;">This Month's Events</h1>
      ${eventsHTML}
      <p style="text-align: left; color: #555;">Thank you for subscribing to our event updates!</p>
      <div style="padding: 20px; text-align: center; font-size: 14px; background: #f5f7fa; color: #555;">
        <p>Need help? Ask at <a href="mailto:support@alphaevents.com" style="color: #2a5298;">support@alphaevents.com</a> or visit our <a href="#" style="color: #2a5298;">Help Center</a></p>
        <hr>
        <p><strong>Alpha Event</strong><br>Address 360, City, State.</p>
        <div style="margin-top: 10px;">
          <!-- Replace with actual hosted image URLs -->
          <a href="#"><img src="https://example.com/facebook-icon.png" alt="Facebook" width="24"></a>
          <a href="#"><img src="https://example.com/twitter-icon.png" alt="Twitter" width="24"></a>
          <a href="#"><img src="https://example.com/linkedin-icon.png" alt="LinkedIn" width="24"></a>
        </div>
        <p style="margin-top: 10px;">&copy; 2025 Alpha Event.</p>
      </div>
    </div>
  `;

  try {
    // Send email to all subscribers
    const mailPromises = subcriberList.map(subscriber => {
      return transporter.sendMail({
        from: `"Event Hub" <${process.env.botMailer}>`,
        to: subscriber.email,
        subject,
        html: htmlContent,
      });
    });

    await Promise.all(mailPromises);
    console.log("Event notifications sent successfully to all subscribers");
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send event notifications.");
  }
};

module.exports = eventMailsender;