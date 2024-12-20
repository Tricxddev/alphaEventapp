const eventModel=require("../model/eventsDB")
const {orgORGmodel,indiOrgModel,allUserModel}=require("../model/organizerDB")
const moment=require("moment")

const eventDetailsFXN=async(req,res)=>{
    try {
      const {eventID}=req.params
      //console.log("eventID:",eventID)
      const evnttd= await eventModel.findOne({eventID})
      if (!evnttd) {
        return res.status(404).json({ msg: "Event not found" });
      }
     // console.log("eventID:",evnttd)
      const formattedEventStart = moment(evnttd.eventDate.eventStart).format("MMMM Do YYYY, h:mm:ss a");
      const formattedEventEnd = moment(evnttd.eventDate.eventEnd).format("MMMM Do YYYY, h:mm:ss a");

      const userId = evnttd.userID;
      let organizerName = "Unknown Organizer";
      //console.log("userID:",userId)

      if (userId) {
        const organizer = await allUserModel.findOne({ userId });
        organizerName = organizer?.name || "Unknown Organizer";
      }
      const evnttyWithOrgNames = {
        ...evnttd._doc, // Spread the event document fields
        organizerName,
        eventStart: formattedEventStart,
        eventEnd: formattedEventEnd,
      };
      
      res.status(200).json({
        msg:"SUCCESSFUL",
        evnttd:evnttyWithOrgNames
      })
    } catch (error) {return res.status(400).json({msg:error.message})}
  };

  module.exports=eventDetailsFXN