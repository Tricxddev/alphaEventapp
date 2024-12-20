const {orgORGmodel,indiOrgModel,allUserModel}=require("../model/organizerDB")
const bcrypt=require("bcrypt")
const mongoose =require("mongoose")

const newUserFXN=async(req,res)=>{
    try {
      const {name,email,passWd}=req.body
      const existinUser = await allUserModel.findOne({email})
      const hashPass= await bcrypt.hash(passWd,12)
      const generateOTpw= function(){
        return  Math.floor(10000+Math.random()*90000)
      };
      if(existinUser){
        return res.status(409).json({msg:"USER ALREADY EXIST"});
      };
      const nameCap= await name.toUpperCase()
      const newUser= await allUserModel.create({
        userID:new mongoose.Types.ObjectId(),
        name:nameCap,
        email,
        verifyOTpw:generateOTpw(),
        passWd:hashPass,
        lastLogin: new Date()      
      });
      await indiOrgModel.create({
        IndName:{
                firstName: nameCap, 
                lastName:  nameCap|| ''
        },
        phnCntkt:{
          countryCd,
          phnNum
        },
        address:"",
        email,
        userID:newUser.userID,
        regDate:new Date(),
        userFollow:[],
        userFollowCnt:0,
        crtdTketz:[],
        crtdTketCnt:0,
        totalEarning:0
      })
      if(!newUser)throw new Error("ERROR IN DATA SAVE");
      //res.redirect('/dashboard');
      //console.log("SUCCESSFUL");
      res.status(200).json({
      msg:"SUCCESSFUL"
      });
    } catch (error){ return res.status(401).json({msg:error.message})
    }};
    module.exports=newUserFXN