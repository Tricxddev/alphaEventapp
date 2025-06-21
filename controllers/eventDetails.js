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
      const formattedEventStart = moment(evnttd.eventDate.eventStart).format("MMMM Do YYYY");
      const formattedEventEnd = moment(evnttd.eventDate.eventEnd).format("MMMM Do YYYY");
      const eventcountry = evnttd.venueInformation.eventCountry || "Unknown Country";
      
      const eventState = evnttd.venueInformation.eventState || "Unknown State";
      const eventCity = evnttd.venueInformation.eventCity || "Unknown City";
      const eventVenue = evnttd.venueInformation.address || "Unknown Venue";


      const userId = evnttd.userID.toString();
      
      let organizerName = "Unknown Organizer";
      //console.log("userID:",userId)

      if (userId) {
        const organizer = await allUserModel.findOne({ userID: userId });
       
        organizerName = organizer.name || "Unknown Organizer";
      }
      const evnttyWithOrgNames = {
        ...evnttd._doc, // Spread the event document fields
        organizerName,
        eventStart: formattedEventStart,
        eventEnd: formattedEventEnd,
      };
      // console.log("evnttyWithOrgNames:",evnttyWithOrgNames);
      const fordate=evnttyWithOrgNames.eventDate.eventStart;
      const date = moment(fordate).format("dddd, MMMM D");
      const fortime=`${evnttyWithOrgNames.eventTime.start} ${evnttyWithOrgNames.eventTime.startClock}`;
      const time = moment(fortime, "h:mm A").format("h:mm A");
      const address = evnttyWithOrgNames.venueInformation;
      const eventDetails = {
        eventID: evnttyWithOrgNames.eventID,
        eventTitle: evnttyWithOrgNames.eventTitle,
        eventImgURL: evnttyWithOrgNames.eventImgURL,
        eventSchedule: {
          date:date,
          time:time,
          address:address} ,
        eventDesc: evnttyWithOrgNames.eventDesc,
        eventPerks:evnttyWithOrgNames.eventCategory,
        tickets: evnttyWithOrgNames.tickets,
        eventTags: evnttyWithOrgNames.eventTags,
        organizerID: evnttyWithOrgNames.userID,
        organizerName: evnttyWithOrgNames.organizerName,
      };

      res.status(200).json({
        msg:"SUCCESSFUL",
        evnttd:eventDetails
      })
    } catch (error) {return res.status(400).json({msg:error.message})}
  };

  module.exports=eventDetailsFXN