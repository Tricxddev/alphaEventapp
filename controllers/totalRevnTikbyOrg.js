const {orgORGmodel,indiOrgModel,allUserModel}=require("../model/organizerDB")
const eventModel=require("../model/eventsDB")
const ticktModel=require("../model/ticketDb")
const totRevnTikFXN=async (req, res) => {
  try {
    const { userID } = req.params;
    // console.log("userID:", userID);

    const findUser = await allUserModel.findOne({ userID: userID });
    // console.log("findUser:", findUser);

    if (!findUser) {
      return res.status(404).json({ msg: "UNKNOWN USER" });
    }
    const eventIDs = await eventModel.find({ userID: findUser.userID.toString() }).distinct('eventID');
    // console.log("eventID:", eventIDs);

    if (eventIDs.length === 0) {
      return res.status(200).json({
        msg: "NO EVENT CREATED YET",
        totalRevenue: 0
      });
    }
    // Get all ticket types for the events
    const tickets = await ticktModel.find({ eventID: { $in: eventIDs } });

    // Map ticketID to price
    const priceMap = {};
   tickets.forEach(ticket => {
      priceMap[ticket.ticketID] = {
        type: ticket.ticketType,
        price: ticket.ticketPrice
      };
    });
   
    // Get event data including ticketsSold and ticketID
    const soldEventData = await eventModel.find({ eventID: { $in: eventIDs } });

    let totalRevenue = 0;
    let totalTicketsSold = 0;

    soldEventData.forEach(event => {
      const { ticketID, ticketsSold } = event;

      const price = priceMap[ticketID]?.price || 0;
      const soldCount = ticketsSold || 0;

      totalRevenue += price * soldCount;
      totalTicketsSold += soldCount;
    });

    // console.log(`Total Revenue for ${findUser.name}: ₦${totalRevenue}`);
    res.status(200).json({
      msg: "SUCCESSFUL",
      totalTicketsSold,
      totalRevenue
    });

  } catch (error) {
    console.error("Error fetching revenue:", error);
    res.status(500).json({ msg: "SERVER ERROR", error: error.message });
  }
};

module.exports = {totRevnTikFXN};