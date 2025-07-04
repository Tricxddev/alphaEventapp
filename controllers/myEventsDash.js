const {orgORGmodel,indiOrgModel,allUserModel}=require("../model/organizerDB")
const eventModel=require("../model/eventsDB")
const moment=require("moment")
const DashupcomingFXN=async(req,res)=>{
  try {
    const {userID}=req.params;
    const findUser= await indiOrgModel.findOne({userID:userID});
    if(!findUser){
      return res.status(404).json({msg:"USER NOT FOUND"})
    }
    const allEvents= await eventModel.find({userID:userID}).sort({createdAt:-1});
    if(allEvents.length===0){
      return res.status(404).json({msg:"NO EVENTS CREATED YET"})
    }
    const upcomingevents= await Promise.all(allEvents.map(async(event) => {
    const userID = event.userID.toString();
    const findUsername=await allUserModel.findOne({userID:userID})
    const startdte = new Date(event.eventDate.eventStart).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
      });
    const enddte = new Date(event.eventDate.eventEnd).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
      });
    const eventDate = `${moment(startdte).format('MMMM D YYYY')} `//- ${moment(enddte).format('MMMM D YYYY')}`;
    // console.log("eventDate:",eventDate)
    const ttime=`${event.eventTime.start} ${event.eventTime.startClock}`// - ${event.eventTime.end} ${event.eventTime.endClock}`;

    return {
      eventID: event.eventID,
      eventTitle: event.eventTitle,
      eventImgURL: event.eventImgURL,
      eventDate:eventDate ,
      eventTime:ttime,
      venueInformation: event.venueInformation.address ? event.venueInformation.address : event.venueInformation.url,
      // ticketprice:(() => {
      //   const prices = Array.isArray(event.tickets)
      //     ? event.tickets.map(ticket => ticket.ticketPrice)
      //     : [];
        
      //   if (prices.length === 0) return "Free";

      //   //const min = Math.min(...prices);
      //   const max = Math.max(...prices);

      //   return max ;
      // })(),
      // imageURL:event.eventImgURL
    };
  }));
    res.status(200).json({
      msg:"SUCCESSFUL",
      data:upcomingevents
    })
    
  } catch (error) {
    console.error("Error fetching individual organizer:", error);
    res.status(500).json({ msg: error.message });
    
  }
};
const myEventDashFXN=async(req,res)=>{
  try {
    const {userID}=req.params;
    const findUser= await indiOrgModel.findOne({userID:userID});
    if(!findUser){
      return res.status(404).json({msg:"USER NOT FOUND"})
    }
    const allEvents= await eventModel.find({userID:userID}).sort({createdAt:-1});
    if(allEvents.length===0){
      return res.status(404).json({msg:"NO EVENTS CREATED YET"})
    }
    const eventsDD= await Promise.all(allEvents.map(async(event) => {
    const userID = event.userID.toString();
    const findUsername=await allUserModel.findOne({userID:userID})
    const startdte = new Date(event.eventDate.eventStart).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
      });
    const enddte = new Date(event.eventDate.eventEnd).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
      });
    const eventDate = `${moment(startdte).format('MMMM D YYYY')} - ${moment(enddte).format('MMMM D YYYY')}`;
    // console.log("eventDate:",eventDate)
    const ttime=`${event.eventTime.start} ${event.eventTime.startClock} - ${event.eventTime.end} ${event.eventTime.endClock}`;

    return {
      eventID: event.eventID,
      eventTitle: event.eventTitle,
      eventImgURL: event.eventImgURL,
      eventDate:eventDate ,
      eventTime:ttime,
      venueInformation: event.venueInformation.address ? event.venueInformation.address : event.venueInformation.url,
      ticketprice:(() => {
        const prices = Array.isArray(event.tickets)
          ? event.tickets.map(ticket => ticket.ticketPrice)
          : [];
        
        if (prices.length === 0) return "Free";

        //const min = Math.min(...prices);
        const max = Math.max(...prices);

        return max ;
      })(),
      imageURL:event.eventImgURL
    };
  }));
    res.status(200).json({
      msg:"SUCCESSFUL",
      data:eventsDD
    })
    
  } catch (error) {
    console.error("Error fetching individual organizer:", error);
    res.status(500).json({ msg: error.message });
    
  }
};

const orgMYeventsDashDetaisFXN=async (req, res) => {
  try {
    const { userID, eventID } = req.params;

    const findUser = await indiOrgModel.findOne({ userID });
    if (!findUser) {
      return res.status(404).json({ msg: "USER NOT FOUND" });
    }

    const event = await eventModel.findOne({ eventID });
    if (!event) {
      return res.status(404).json({ msg: "EVENT NOT FOUND" });
    }

    const orgID = event.userID.toString();
    const findUsername = await allUserModel.findOne({ userID: orgID });

    const startdte = new Date(event.eventDate.eventStart).toLocaleDateString("en-US", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });

    const enddte = new Date(event.eventDate.eventEnd).toLocaleDateString("en-US", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });

    const eventDate = `${moment(startdte).format("MMMM D YYYY")} - ${moment(enddte).format("MMMM D YYYY")}`;

    const ttime = `${event.eventTime.start} ${event.eventTime.startClock} - ${event.eventTime.end} ${event.eventTime.endClock}`;

    const eventData = {
      eventID: event.eventID,
      eventTitle: event.eventTitle,
      eventImgURL: event.eventImgURL,
      eventDate: eventDate,
      eventTime: ttime,
      venueInformation: event.venueInformation.address
        ? event.venueInformation.address
        : event.venueInformation.url,
      ticketQtyCount: event.eventCapacity,
      ticketsSold: event.ticketsSold,
      imageURL: event.eventImgURL,
      eventDescription: event.eventDesc,
    };

    res.status(200).json({
      msg: "SUCCESSFUL",
      data: eventData,
    });
  } catch (error) {
    console.error("Error fetching individual organizer event details:", error);
    res.status(500).json({ msg: error.message });
  }
};
const ticketSoldOverviewDashDetaisFXN=async (req, res) => {
  try {
    const { userID, eventID } = req.params;

    const findUser = await indiOrgModel.findOne({ userID });
    if (!findUser) {
      return res.status(404).json({ msg: "USER NOT FOUND" });
    }

    const event = await eventModel.findOne({ userID:userID });
    if (!event) {
      return res.status(404).json({ msg: "EVENT NOT FOUND" });
    }

    const orgID = event.userID.toString();
    const findUsername = await allUserModel.findOne({ userID: orgID });

    const startdte = new Date(event.eventDate.eventStart).toLocaleDateString("en-US", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });

    const enddte = new Date(event.eventDate.eventEnd).toLocaleDateString("en-US", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });

    const eventDate = `${moment(startdte).format("MMMM D YYYY")}`// - ${moment(enddte).format("MMMM D YYYY")}`;

    const ttime = `${event.eventTime.start} ${event.eventTime.startClock}`// - ${event.eventTime.end} ${event.eventTime.endClock}`;

    const eventData = {
      eventID: event.eventID,
      eventTitle: event.eventTitle,
      eventImgURL: event.eventImgURL,
      eventDate: eventDate,
      eventTime: ttime,
      // venueInformation: event.venueInformation.address
      //   ? event.venueInformation.address
      //   : event.venueInformation.url,
      ticketQtyCount: event.eventCapacity,
      ticketsSold: event.ticketsSold,
      // imageURL: event.eventImgURL,
      // eventDescription: event.eventDesc,
    };

    res.status(200).json({
      msg: "SUCCESSFUL",
      data: eventData,
    });
  } catch (error) {
    console.error("Error fetching individual organizer event details:", error);
    res.status(500).json({ msg: error.message });
  }
};

module.exports={myEventDashFXN,orgMYeventsDashDetaisFXN,DashupcomingFXN,ticketSoldOverviewDashDetaisFXN}