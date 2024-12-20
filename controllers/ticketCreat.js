const ticktModel=require("../model/ticketDb")
const {orgORGmodel,indiOrgModel,allUserModel}=require("../model/organizerDB")
const eventModel=require("./model/eventsDB")

const tickzCrtFXN=async(req,res)=>{
    try {
      const{eventID}=req.params;
     // console.log("ticketeventid:",eventID)
    if(!eventID){
      return res.status(400).json({msg:"Event ID is required"})
    }

    const {nanoid}= await  import('nanoid');
    const findevntID= await eventModel.findOne({eventID})
    if(!findevntID){
      res.status(400).json({msg:"UNKNOWN ACTION"})  
    };
    const findORGID=await orgORGmodel.findOne({orgID:findevntID.orgID})
    //console.log(findevntID)
    const useID= findORGID? findORGID.userID :null;

    const genTicketID= async()=>{
      if(findORGID){
        const spltORGNm= findORGID.orgName.slice(0,3).toUpperCase()
        return  `${spltORGNm}-${nanoid(7).toUpperCase()}`;
      }else{
         return  `ALV-${nanoid(7).toUpperCase()}`;
      }}

      const idUserEVNT= findevntID.userID;
      const idTicktType=findevntID.tickeType;
      const ticktPRICe=findevntID.ticketPrice;
      const ticketID= await genTicketID()

      //console.log(ticketID)

     const newTicket = new ticktModel({
      ticketID:ticketID,
      eventID:findevntID.eventID,
      orgID:useID,
      userId:idUserEVNT.userID,
      tickeType:idTicktType,
      ticketPrice:ticktPRICe,
      purchaseDate: new Date()
    })

    await newTicket.save()
    res.status(200).json({
      msg:"SUCESSFULL",
      newTicket
    })      
    } catch (error) {return res.status(400).json({msg:error.message})}
  };
  module.exports=tickzCrtFXN