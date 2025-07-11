const {orgORGmodel,indiOrgModel,allUserModel}=require("../model/organizerDB")
const moment=require("moment")
const eventModel=require("../model/eventsDB")
const multer = require("multer");



const creatEventFXN=async(req,res)=>{
    try {
    // console.log("params:",req.params)
    const {
    eventTitle,
    eventDesc,
    //startDate,
    eventStart,
    eventEnd,
    //endDate,
    eventType,
    url,
    endClock,
    startClock,
    startTimezone,
    startTime,
    endTime,
    endTimezone,
    eventCategory,
    maximumAttendees,
    eventCountry,
    eventState,
    eventCity,
    eventVenue,
    eventTags,
    tickets:rawTickets,
    eventImgURL,
    facebook,
    instagram
  }=req.body;
  const {userID}=req.params;
  console.log("reqBody:",req.body)
  const tickets = [];
    if (typeof rawTickets === "string") {
      try {
        tickets = JSON.parse(rawTickets);
      } catch (err) {
        return res.status(400).json({ msg: "Invalid tickets format" });
      }
    } else if (Array.isArray(rawTickets)) {
      tickets = rawTickets;
    }
// const reconstructTickets = (body) => {


//   for (const key in body) {
//     const match = key.match(/^tickets\[(\d+)]\[(\w+)]$/);
//     if (match) {
//       const index = parseInt(match[1], 10);
//       const field = match[2];
//       if (!tickets[index]) tickets[index] = {};
//       tickets[index][field] = body[key];
//     }
//   }

//   return tickets;
// };

// const tickets = reconstructTickets(req.body);
  // validate if maximumAttendees equal to total number of array of tickets(ticket quantity)
  const maxAttdtonumber = parseInt(maximumAttendees, 10);

  const totalTicketQuantity = tickets.reduce((total, ticket) => {
    if (parseInt(ticket.quantity,10) && typeof parseInt(ticket.quantity,10) === 'number') {
      return total + parseInt(ticket.quantity,10);
    }
    return total;
  }, 0);
  console.log("totalTicketQuantity:",totalTicketQuantity)
  if (maxAttdtonumber !== totalTicketQuantity) {
    return res.status(400).json({ msg: "Maximum attendees configure must equal total ticket quantity configured" });
  } 


  const fullStartTime = `${startTime} ${startClock} `;
  const fullEndTime = `${endTime} ${endClock} `;



  const eventStartDate = new Date(eventStart);
  const eventEndDate = new Date(eventEnd);

  const today   = new Date();
  const envtStTime= moment(fullStartTime,"HH:mm A")
  const envtEndTime= moment(fullEndTime,"HH:mm A")


  if(!envtEndTime.isAfter(envtStTime)){
    return res.status(400).json({ msg: "Event start/end time Variation err" });
  }

  if (eventStartDate < today || eventEndDate < today || eventEndDate < eventStartDate) {
    return res.status(400).json({ msg: "DATE CANNOT BE YESTERDAY OR LESS" });
  }

  const findUser = await allUserModel.findOne({ userID });
  if (!findUser) {
    return res.status(400).json({ msg: "UNKNOWN USER" });
  }
  
  const {nanoid}= await  import('nanoid');
  //const conVTitle= await eventTitle.toUpperCase()
  const createDT= new Date().toISOString().replace(/[-:.TZ]/g, '')
  const findORGID=await orgORGmodel.findOne({userID})

  const genEvntID= async()=>{
    if(findORGID){
       spltORGNm= findORGID.orgName.slice(0,3).toUpperCase()
       return  `${spltORGNm}-${createDT}-${nanoid(5)}`;
    }else{
      //if(!findORGID){
       return `ALV-${createDT}-${nanoid(5)}`;
    }}
  
  const useORGID = findORGID ? findORGID.userID :null;

  let processedEventTags = [];

  if (Array.isArray(eventTags)) {
    if (eventTags.length === 1 && typeof eventTags[0] === "string") {
      processedEventTags = eventTags[0]
        .split(/\s+/)                
        .map(tag => tag.trim().toLowerCase())
        .filter(tag => tag);         
    } else {
      processedEventTags = eventTags.map(tag =>
        typeof tag === "string" ? tag.trim().toLowerCase() : tag
      );
    }
  }

   const newEvent = new eventModel({
    eventID:await genEvntID(),
    eventTitle,
    eventImgURL,
    eventDesc,
    eventDate:{
      eventStart,
      eventEnd,
      endTimezone,
      startTimezone
    },
    eventTime:{
      start:startTime,
      end:endTime,
      startClock,
      endClock
    },
    eventType,
    tickets,
    eventCategory,
    venueInformation:{
      eventCountry:eventCountry,
      eventState:eventState,
      eventCity:eventCity,
      address:eventVenue,
      url:url},
    socialDetail:{
      fb: facebook,
      inst: instagram},
    eventCapacity:maximumAttendees,
    eventTags:processedEventTags,
    orgID: useORGID,
    userID:findUser.userID
  })

 const saveDtat= await newEvent.save();

 if(!saveDtat){
   console.log("ERROR IN DATA SAVE");
  }
  res.status(200).json({
    msg:"SUCCESSFUL",
    newEvent
  }) 

    } catch (error) {return res.status(400).json({msg:error.message})}};
    module.exports=creatEventFXN