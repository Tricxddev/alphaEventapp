const ticktModel=require("../model/ticketDb")



const totTikContDispFXN=async(req,res)=>{
    try{
    const{userEmail}=req.params
    const findUserMail= await allUserModel.findOne({email:userEmail})
    const findUserId= await findUserMail.userID
    const ticketsSold= await ticktModel.countDocuments({orgID:findUserId})
    
    res.status(200).json({
      msg:"SUCCESSFULL",
      ticketsSold
    })}catch(error){res.status(400).json({msg:error.message})}

  };
  module.exports=totTikContDispFXN
