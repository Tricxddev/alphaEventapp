const paymentModel = require('../model/paymeNtDb');

const ticketzform = async (req, res) => {
  const { reference } = req.params;
//   console.log('Reference:', reference);
  const payment = await paymentModel.findOne({ paymentID: reference });

  if (!payment) {
    return res.status(404).json({ msg: 'Payment not found' });
  }

  const userName = payment.userName;
  const extractedticketIDs = payment.tickets.map(ticket => ({
    ticketID: ticket.ticketID,
    // quantity: ticket.quantity
  }));
  res.status(200).json({
    userName: payment.user_Name,
    ticketIDs: extractedticketIDs });
};

module.exports = { ticketzform };