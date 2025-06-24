const eventModel=require("../model/eventsDB")
const {orgORGmodel,indiOrgModel,allUserModel}=require("../model/organizerDB")
const organizersEventsFXN=async(req,res)=>{
  const {userID}=req.params;
  //console.log("userID:",userID)
  

  const findEvnts= await eventModel.find({userID:userID})
  if(!findEvnts || findEvnts.length === 0){
    return res.status(404).json({msg:"NO MORE EVENTS FOUND FOR THIS ORGANIZER"})
  }
  // console.log("findEvnts:",findEvnts)
  

  const eventsDD= await Promise.all(findEvnts.map(async(event) => {
    const userID = event.userID.toString();
    const findUsername=await allUserModel.findOne({userID:userID})

    return {
      eventID: event.eventID,
      eventTitle: event.eventTitle,
      eventImgURL: event.eventImgURL,
      eventDate: new Date(event.eventDate.eventStart).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
      }),
      venueInformation: event.venueInformation.address ? event.venueInformation.address : event.venueInformation.url,
      ticketprice:(() => {
        const prices = Array.isArray(event.tickets)
          ? event.tickets.map(ticket => ticket.ticketPrice)
          : [];
        
        if (prices.length === 0) return "Free";

        const min = Math.min(...prices);
        const max = Math.max(...prices);

        return min === max ? `${min}` : `${min} - ${max}`;
      })(),
     organizerName:findUsername.name || "Unknown Organizer"
    };
  }));
  res.status(200).json({
    msg:"SUCCESSFUL",
    data: eventsDD
  })
};
module.exports=organizersEventsFXN;