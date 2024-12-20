const {orgORGmodel,indiOrgModel,allUserModel}=require("../model/organizerDB")
const eventModel=require("../model/eventsDB")


const trendEvntFXN=async(req,res)=>{
    try {
      const {limit}=landingtrdPagination(req)
      const evntty= await eventModel.find().limit(limit)
      const userIds = evntty.map((event) => event.userID);
      const orgZ = await allUserModel.find({ userID: { $in: userIds } });
          // Create a mapping of userID to organizer name for quick lookup
      const organizerMap = orgZ.reduce((map, organizer) => {
      map[organizer.userID] = organizer.name;
      return map;
    }, {});

    const evnttyWithOrgNames = evntty.map((event) => ({
      ...event._doc, // Spread event document fields
      organizerName: organizerMap[event.userID] || "Unknown Organizer",
    }));

      //console.log(evnttyWithOrgNames)
      
      res.status(200).json({
        msg:"SUCCESSFUL",
        evntty:evnttyWithOrgNames
      })
    } catch (error) {return res.status(400).json({msg:error.message})}
  }
  module.exports=trendEvntFXN