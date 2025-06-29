// const {orgORGmodel,indiOrgModel,allUserModel}=require("../model/organizerDB")
// const eventModel=require("../model/eventsDB")


// const trendEvntFXN=async(req,res)=>{
//     try {
//       const {limit}=landingtrdPagination(req)
//       const evntty= await eventModel.find().limit(limit)
//       const userIds = evntty.map((event) => event.userID);
//       const orgZ = await allUserModel.find({ userID: { $in: userIds } });
//           // Create a mapping of userID to organizer name for quick lookup
//       const organizerMap = orgZ.reduce((map, organizer) => {
//       map[organizer.userID] = organizer.name;
//       return map;
//     }, {});

//     const evnttyWithOrgNames = (evntty.map((event) => ({
//       // ...event._doc, // Spread event document fields
//       // organizerName: organizerMap[event.userID] || "Unknown Organizer",
      
//       eventID: event.eventID,
//       eventTitle: event.eventTitle,
//       eventImgURL: event.eventImgURL,
//       eventDate: new Date(event.eventDate.eventStart).toLocaleDateString('en-US', {
//         year: 'numeric',
//         month: 'numeric',
//         day: 'numeric'
//       }),
//       venueInformation: event.venueInformation.address,
//       ticketprice:(() => {
//         const prices = Array.isArray(event.tickets)
//           ? event.tickets.map(ticket => ticket.ticketPrice)
//           : [];
        
//         if (prices.length === 0) return "Free";

//         const min = Math.min(...prices);
//         const max = Math.max(...prices);

//         return min === max ? `${min}` : `${min} - ${max}`;
//       })(),
//      organizerName:organizerMap[event.userID] || "Unknown Organizer"
//     })));

//       console.log(evnttyWithOrgNames)
      
//       res.status(200).json({
//         msg:"SUCCESSFUL",
//         evntty:evnttyWithOrgNames
//       })
//     } catch (error) {return res.status(400).json({msg:error.message})}
//   }
//   module.exports=trendEvntFXN

const { allUserModel } = require("../model/organizerDB");
const eventModel = require("../model/eventsDB");
const {landingtrdPagination,landingFtPagination}=require("../services/utilities")

const trendEvntFXN = async (req, res) => {
  try {
    const { limit } = landingtrdPagination(req);
    const events = await eventModel.find().limit(limit);

    // Collect all unique userIDs
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
  } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
};

module.exports = trendEvntFXN;
