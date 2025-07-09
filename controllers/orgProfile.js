const {orgORGmodel,indiOrgModel,allUserModel}=require("../model/organizerDB")

const orgProfileFXN= async(req,res)=>{
  try {
    const {userID}=req.params;
    if(!userID ||userID===undefined){
      console.log("MISSING USER ID DETAIL")
    }
    console.log("USER ID:", userID);
    const findUser= await indiOrgModel.findOne({userID:userID});
    const allUser= await allUserModel.findOne({userID:userID});
    if(!findUser && !allUser){
      return res.status(404).json({msg:"USER NOT FOUND"})
    }
    const fname= findUser.IndName.firstName
    const lname=  findUser.IndName.lastName 

    
    const name= (fname===lname) ? fname.toUpperCase() : `${fname.toUpperCase()} ${lname.toUpperCase()}`;
    

    const profiLe= {
      photo: allUser.profilePic ,
      name:name,
      email: findUser.email,
      phone: `${findUser.phnCntkt.countryCd} ${findUser.phnCntkt.phnNum}`|| "KINDLY UPDATE YOUR PHONE NUMBER",
      bio: findUser.bio || "KINDLY UPDATE YOUR BIO",
      orgName: findUser.officialName || "KINDLY UPDATE YOUR ORGANIZATION NAME",
      address: findUser.address || "KINDLY UPDATE YOUR ADDRESS",
      socialLinks: {
        facebook: findUser.socialLinks.facebook || "KINDLY UPDATE YOUR FACEBOOK LINK",
        twitter: findUser.socialLinks.twitter || "KINDLY UPDATE YOUR TWITTER LINK",
        instagram: findUser.socialLinks.instagram || "KINDLY UPDATE YOUR INSTAGRAM LINK",
        website: findUser.socialLinks.website || "KINDLY UPDATE YOUR WEBSITE LINK"
      }
    };
    
    res.status(200).json({
      msg:"SUCCESSFUL",
      data:profiLe
    })
  } catch (error) {
    console.error("Error fetching individual organizer:", error);
    res.status(500).json({ msg: error.message });
  }};

  const orgProfileUpdateFXN=async(req,res)=>{
      try {
        const {userID}=req.params;
        const {photo,name,email,phone,bio,orgName,address,socialLinks}=req.body;
        const findUser= await indiOrgModel.findOne({userID:userID});
        if(!findUser){
          return res.status(404).json({msg:"USER NOT FOUND"})
        }
        const findAllUser= await allUserModel.findOne({userID:userID});
        if(!findAllUser){
          return res.status(404).json({msg:"USER NOT FOUND"})
        }
        const updateData = {};
        const isMeaningful = (val) => val !== null && val !== undefined && val !== '';
  
        if (isMeaningful(name?.firstName)) updateData["IndName.firstName"] = name.firstName;
        if (isMeaningful(name?.lastName)) updateData["IndName.lastName"] = name.lastName;
        if (isMeaningful(email)) updateData.email = email;
        if (isMeaningful(phone?.countryCd) ||isMeaningful(phone?.phnNum)) {
          updateData.phnCntkt = {
            countryCd: phone?.countryCd ?? findUser.phnCntkt?.countryCd ?? "",
            phnNum: phone?.phnNum ?? findUser.phnCntkt?.phnNum ?? ""
          };
        }
        if (isMeaningful(bio)) updateData.bio = bio;
        if (isMeaningful(orgName)) updateData.officialName = orgName;
        if (isMeaningful(address)) updateData.address = address;
        if (isMeaningful(socialLinks)) updateData.socialLinks = socialLinks;
  
        const updatedProfile = await indiOrgModel.findOneAndUpdate(
          { userID: userID },
          { $set: updateData },
          { new: true }
        );
        
        // Update the profile picture in allUserModel
        if (photo) {
          await allUserModel.findOneAndUpdate(
            { userID: userID },
            { profilePic: photo },
            { new: true }
          );
        }
        
        res.status(200).json({
          msg:"SUCCESSFUL",
          data:updatedProfile
        });
      } catch (error) {
        console.error("Error updating individual organizer:", error);
        res.status(500).json({ msg: error.message });
      }
   };

  module.exports={orgProfileFXN,orgProfileUpdateFXN}