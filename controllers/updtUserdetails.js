const o2authUser=require("../model/o2AuthUsersDb")
const {orgORGmodel,indiOrgModel,allUserModel}=require("../model/organizerDB")



const updtUserFXN=async(req,res)=>{
    const{googleId}=req.params;
    const{passWd}=req.body;
    const findGUser= await o2authUser.findOne({googleId});
    const email= await findGUser.email
    const chckAllUser= await allUserModel.findOne({email})
    if(!chckAllUser){
      const hashPass= await bcrypt.hash(passWd,12)
      const newUser= await allUserModel.create({
        userID:new mongoose.Types.ObjectId(),
        name:findGUser.name,
        email:email,
        passWd:hashPass,
        isEmailVerified:true,
        lastLogin: new Date()      
      })};
    
    res.redirect('/dashboard')
  };
  module.exports=updtUserFXN