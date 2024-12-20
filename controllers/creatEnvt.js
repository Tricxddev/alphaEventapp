const {orgORGmodel,indiOrgModel,allUserModel}=require("../model/organizerDB")



const creatEventFXN=async(req,res)=>{
    try {
    const {
      eventTitle,
      eventDesc,
      eventDate,
      eventType,
      maximumattedees,
      eventVenue,
      eventState,
      eventCity,
      StartTime,
      EndTime,
      eventCountry,
      tickeType,
      eventImgURL,
      ticketPrice }=req.body;
    console.log(req.body)
    const {userID}=req.params
    if(
      !eventTitle||
      !eventDesc||
      !eventType||
      !tickeType){
      return res.status(400).json({msg:"FILL EMPTY FORMS!!!"})
    };
    
      // Date validation
      const eventStart = new Date(eventDate?.eventStart);
      const eventEnd = new Date(eventDate?.eventEnd);
      if (eventStart < new Date() || eventEnd <= new Date()) {
        return res.status(400).json({ msg: "DATE CANNOT BE YESTERDAY OR LESS" });
      }
  
    
   const findUser = await allUserModel.findOne({ userID });
      if (!findUser) {
        return res.status(400).json({ msg: "UNKNOWN USER" });
      }
    const {nanoid}= await  import('nanoid');
    const conVTitle= await eventTitle.toUpperCase()
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
  
     const newEvent = await eventModel.create({
      eventID:await genEvntID(),
      eventTitle:conVTitle,
      eventImgURL,
      eventDesc,
      eventDate:{
        eventStart,
        eventEnd},
        StartTime,
        EndTime,
      eventType,
      eventUrl,
      eventLocation:{
        eventVenue,
        eventCity,
        eventState,
        eventCountry},
      //isPrivate,
      maximumattedees,
      //eventCapacity,
      //customTags: customTags?.split(","),
      orgID: useORGID,
      userID:findUser.userID,
      tickeType,
      ticketPrice
    })
    res.status(200).json({
      msg:"SUCCESSFUL",
      newEvent
    })} catch (error) {return res.status(400).json({msg:error.message})}};
    module.exports=creatEventFXN