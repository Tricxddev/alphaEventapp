const {orgORGmodel,indiOrgModel,allUserModel}=require("../model/organizerDB")
const eventModel=require("../model/eventsDB")

const fetureventFXN=async(req,res)=>{
    try {
      const {limit}=landingFtPagination(req)
      const evntty= await eventModel.find().limit(limit)

      const userIds = evntty.map((event) => event.userID);
      //console.log(userIds)

      const orgZ = await allUserModel.find({ userID: { $in: userIds } });
      //console.log(orgZ)
          // Create a mapping of userID to organizer name for quick lookup
      const organizerMap = orgZ.reduce((map, organizer) => {
      map[organizer.userID] = organizer.name;
      return map;
    }, {});

    const evnttyWithOrgNames = evntty.map((event) => ({
      ...event._doc, // Spread event document fields
      organizerName: organizerMap[event.userID] || "Unknown Organizer",
    }));

      
      res.status(200).json({
        msg:"SUCCESSFUL",
        evntty:evnttyWithOrgNames
      })
    } catch (error) {return res.status(400).json({msg:error.message})}
  };
  module.exports=fetureventFXN
