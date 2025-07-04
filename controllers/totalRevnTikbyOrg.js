// const {orgORGmodel,indiOrgModel,allUserModel}=require("../model/organizerDB")
const eventModel=require("../model/eventsDB")
const mongoose =require("mongoose")

const { indiOrgModel, allUserModel } = require("../model/organizerDB");
const ticktModel = require("../model/ticketDb");

const totRevnTikFXN = async (req, res) => {
  try {
    const { userID } = req.params;

    const findUser = await allUserModel.findOne({ userID });
    if (!findUser) {
      return res.status(404).json({ msg: "UNKNOWN USER" });
    }

    // Find all ticket documents issued by this user (organizer)
    const ticketDocs = await ticktModel.find({ userId: userID });

    let totalTicketsSold = 0;

    // Sum quantity from all tickets inside each document
    for (const doc of ticketDocs) {
      for (const ticket of doc.tickets) {
        totalTicketsSold += Number(ticket.quantity) || 0;
      }
    }

    // Fetch total earnings for this user
    const organizer = await indiOrgModel.findOne({ userID });
    const totalRevenue = organizer?.totalEarning || 0;
    const fixed_impression = 100;
    const convertedUserID = new mongoose.Types.ObjectId(userID);
    const convertedEventID = new mongoose.Types.ObjectId(userID);
    const userEvents = await eventModel.find({userID:convertedUserID});
    if (!userEvents || userEvents.length === 0) {
      return res.status(404).json({ engagement:0});
    }
    if (!Array.isArray(userEvents) || userEvents.length === 0) {
      return res.status(404).json({ msg: "No events found for this user" });
    }
    let totalClicks = 0;
    const totalEvents = userEvents.length;

    userEvents.forEach(event => {
      totalClicks += event.clicks || 0;
    });

    const totalImpressions = totalEvents * fixed_impression;

    const engagementRate = ((totalClicks / totalImpressions) * 100).toFixed(0);


    return res.status(200).json({
      msg: "SUCCESSFUL",
      totalTicketsSold,
      totalRevenue,
      engagement:engagementRate,
      satisfaction:"0/0"// No logic for this yet
    });

  } catch (error) {
    console.error("Error fetching revenue:", error);
    res.status(500).json({ msg: "SERVER ERROR", error: error.message });
  }
};

module.exports = { totRevnTikFXN };
