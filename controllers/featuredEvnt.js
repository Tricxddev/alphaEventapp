const {orgORGmodel,indiOrgModel,allUserModel}=require("../model/organizerDB")
const eventModel=require("../model/eventsDB")
const {landingtrdPagination,landingFtPagination}=require("../services/utilities")

const fetureventFXN=async(req,res)=>{
    try {
    const {limit}=landingFtPagination(req)
    const events = await eventModel.find().limit(limit);
    const userIds = events.map(event => event.userID);
    const organizers = await allUserModel.find({ userID: { $in: userIds } });

    // Create a map of userID to name
    const organizerMap = organizers.reduce((acc, org) => {
      acc[org.userID] = org.name;
      return acc;
    }, {});

    const simplifiedData = events.map(event => {
      const ticketPrices = Array.isArray(event.tickets)
        ? event.tickets.map(t => t.ticketPrice)
        : [];

      const minPrice = Math.min(...ticketPrices);
      const maxPrice = Math.max(...ticketPrices);
      let ticketpriceMIN = "Free";
      let ticketpriceMAX = "Free";

      if (ticketPrices.length > 0) {
        ticketpriceMIN = minPrice === maxPrice
          ? `${minPrice}`
          : `${minPrice}`// - ${maxPrice}`;
      }
      if (ticketPrices.length > 0) {
        ticketpriceMAX = minPrice === maxPrice
          ? `${maxPrice}`
          : `${maxPrice}`// - ${maxPrice}`;
      }

      return {
        eventID: event.eventID,
        eventTitle: event.eventTitle,
        eventImgURL: event.eventImgURL,
        eventDate: new Date(event.eventDate.eventEnd).toLocaleDateString("en-US"),
        venueInformation: event.venueInformation?.address || "Not Provided",
        ticketpriceMIN,
        ticketpriceMAX,
        organizerName: organizerMap[event.userID] || "Unknown Organizer"
      };
    });

    return res.status(200).json({
      msg: "SUCCESSFUL",
      data: simplifiedData
    });
    } catch (error) {return res.status(400).json({msg:error.message})}
  };
  module.exports=fetureventFXN
