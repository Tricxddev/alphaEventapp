const {orgORGmodel,indiOrgModel,allUserModel}=require("../model/organizerDB")
const eventModel=require("../model/eventsDB")
const ticktModel=require("../model/ticketDb");
const { default: mongoose } = require("mongoose");
const totRevnTikFXN=async (req, res) => {
  try {
    const { userID } = req.params;
    // console.log("userID:", userID);

    const findUser = await allUserModel.findOne({ userID: userID });
   

    if (!findUser) {
      return res.status(404).json({ msg: "UNKNOWN USER" });
    }
    const eventIDs = await eventModel.find({ userID: userID }).distinct('eventID');

    if (eventIDs.length === 0) {
      return res.status(200).json({
        msg: "NO EVENT CREATED YET",
        totalRevenue: 0
      });
    }
    // const findUserMail= await allUserModel.findOne({userID:userID})
    // // console.log(findUserMail)
    // const findUserId= await findUserMail.userID
    const ticketsSold= await ticktModel.countDocuments({userId:userID})
     console.log("findUser:", ticketsSold);
    const indORG= await indiOrgModel.findOne({userID:userID})
    const totalRev =indORG.totalEarning
   

    const soldEventData = await eventModel.find({ eventID: { $in: eventIDs } });

    res.status(200).json({
      msg: "SUCCESSFUL",
      totalTicktSold:ticketsSold,
      totalRev:totalRev
    });

  } catch (error) {
    console.error("Error fetching revenue:", error);
    res.status(500).json({ msg: "SERVER ERROR", error: error.message });
  }
};

module.exports = {totRevnTikFXN};