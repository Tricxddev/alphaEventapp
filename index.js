const express = require("express")
const session =require("express-session")
const mongoose =require("mongoose")
const passport =require("passport")
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const dotenv = require("dotenv")
const bcrypt=require("bcrypt")
const jwt=require("jsonwebtoken")
const moment=require("moment")
const cors=require("cors")
const app = express()


//MODULE EXPORTS
const dbconnect= require("./dbconnnect")
const ensureAuth=require("./middleware/protecto2auth")
const o2authUser=require("./model/o2AuthUsersDb")
const eventModel=require("./model/eventsDB")
const verifyMailer=require("./services/verifyUserMail")
const {orgORGmodel,indiOrgModel,allUserModel}=require("./model/organizerDB")
const sessionModel=require("./model/sessiosDB")
const ticktModel=require("./model/ticketDb")

//CONFIGS
app.use('*',cors({
    origin:"http://localhost:5173",
    methods:["GET", "POST", "PUT", "DELETE"],
    credentials:true,
  }))
dotenv.config()
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
dbconnect()
const PORT= process.env.appPort || 7000
app.listen(PORT,()=>{
    console.log(`This app now listen on ${PORT}`)
});
passport.use(new GoogleStrategy({
  clientID:process.env.gClientID,
  clientSecret:process.env.cliscrtky,
  callbackURL: process.env.gcallbackURL

},async(accessToken,refreshToken,profile,done)=>{


         // Log the raw profile data received from Google
         console.log("Google Profile Data:", profile);

         // Extract specific fields for debugging
         console.log("Google ID:", profile.id);
         console.log("Name:", profile.displayName);
         console.log("Email:", profile.emails[0].value);

  const existingOAuthUser= await o2authUser.findOne({googleId:profile.id})
  if(!existingOAuthUser){
     await o2authUser.create({
     googleId:profile.id,
     name:profile.displayName,
     email:profile.emails[0].value
   })};

    const email = profile.emails[0].value;
    const existingManualUser = await allUserModel.findOne({ email });


    if (!existingManualUser) {
      await allUserModel.create({
        googleId: profile.id,
        userID: new mongoose.Types.ObjectId(),
        name: profile.displayName,
        role: "organizer",
        accntStatus: "active",
        lastLogin: new Date(),
        isEmailVerified: true,
        email: profile.emails[0].value,
      });
    }
   const user = await o2authUser.findOne({ googleId: profile.id })

  // console.log(profile);
  return done(null,user)
}));


app.use(session({secret:`${process.env.cliscrtky}`,resave:false,saveUninitialized:true}));//configure session
app.use(passport.initialize());//initialize passport and session
app.use(passport.session())

//serialize & deserialize user infomation
passport.serializeUser((user,done)=>{
    done(null,user.id)
});
passport.deserializeUser(async(id,done)=>{
    const user = await o2authUser.findById(id)
    done(null,user)
})
// Route to initiate Google OAuth
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback route
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    const user=req.user;
    const token = jwt.sign(
      { email: user.email },
      process.env.refresTk,
      { expiresIn: '1h' },
    );
    // Successful authentication, redirect to your desired route
   res.redirect(`http://localhost:5000/OnboardingMain`);
   // res.redirect('/updt%Passwd/:googleId');
  }
);
app.get('/userInfo', async (req, res) => {
  try {
    const { googleId } = req.query; // Pass googleId as a query parameter
    const user = await allUserModel.findOne({ googleId });
    if (user) {
      res.status(200).json({ name: user.name, email: user.email });
    } else {
      res.status(404).json({ msg: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

app.get('/dashboard',ensureAuth,(req,res)=>{
  res.send(`hello,${req.user.displayName}`)
})


//CREATING  AN EVENT //EVENT ID,ORG ID YET TO BE GENERATED DUE TO CONCLUSION
app.post("/updt%Passwd/:googleId",async(req,res)=>{
  const{googleId}=req.params;
  const{passWd}=req.body;
  const findGUser= await o2authUser.findOne({googleId});
  const email= await findGUser.email
  const chckAllUser= await allUserModel.findOne({email})
  if(!chckAllUser){
    const hashPass= await bcrypt.hash(passWd,12)
    const newUser= await allUserModel.create({
      userID:new mongoose.Types.ObjectId(),
      name:findUser.name,
      email:email,
      passWd:hashPass,
      isEmailVerified:true,
      lastLogin: new Date()      
    })};
  
  res.redirect('/dashboard')
})


app.post("/new&User",async(req,res)=>{
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
  if(!newUser)throw new Error("ERROR IN DATA SAVE");
  //res.redirect('/dashboard');
  console.log("SUCCESSFUL");
  res.status(200).json({
  msg:"SUCCESSFUL"
  });
} catch (error){ return res.status(401).json({msg:error.message})
}})

app.get("/verifyUser/:userID",async(req,res)=>{
  try {
    const {userID}=req.params;
    const verifyID= await allUserModel.findOne({userID});
    if(!verifyID){
      res.redirect('/new&User')
    };
    const veriName= await verifyID.name;
    const veriToken= await verifyID.verifyOTpw;
    const verifyMail= await verifyID.email
    await verifyMailer(veriToken,veriName,verifyMail);

    res.status(400).json({msg:"SUCCESSFUL"})
  
  } catch (error) {
    return res.status(400).json({msg:error.message})
  }

})


app.post("/confirmedToken/:userID",async(req,res)=>{
  try{
    const{userToken}=req.body;
    const {userID}=req.params;
    const verifyID= await allUserModel.findOne({userID});
    if(!userToken){
      res.status(403).json({msg:"OTP REQUIRED"})
    };
    const veriToken= await verifyID.verifyOTpw;
    if(userToken===veriToken){
      await allUserModel.findOneAndUpdate({userID},{isEmailVerified:true});
      const sessionTokz=await jwt.sign({userID},`${process.env.accessTk}`,{expiresIn:"60m"})
      //GENERATE SESSION ID
      let sessionID
      let isUnique= false
      while(!isUnique){
      sessionID= Math.floor(Math.random()*88888)
      const findSess= await sessionModel.findOne({sessionID})
      if(!findSess)isUnique=true
      }
      //SESSION DB UPDATE
      const findUserid= await allUserModel.findOne({userID})
      const refrshTokz=await jwt.sign({userID},`${process.env.refresTk}`,{expiresIn:"1m"})
      await sessionModel.create({
          sessionID:sessionID,
          userID:findUserid,
          sessToken:sessionTokz,
          refrshTkn:refrshTokz
      })
      res.status(200).json({
      msg:"SUCCESSFUL",
      token:sessionTokz
    })
    }else{res.status(400).json({msg:"INVALID ACTION"})};
    
  }catch(error){return res.status(400).json({msg:error.message})}
})

//ALL USER COUNT
app.get("/getalluserCont",async(req,res)=>{
  const userCount=await allUserModel.countDocuments()
  res.json(userCount)
})

app.post("/loginUser",async(req,res)=>{
  try{
    const{email,passWd}=req.body
    const existinUser = await allUserModel.findOne({email:email})
    console.log(req.body)

    if(!existinUser){
      return res.status(403).json({msg:"ACCESSRR DENIED"})
    };
    const unHaspwd= await bcrypt.compare(passWd,existinUser.passWd)
    if(!unHaspwd){
      return res.status(403).json({msg:"ACCESS DENIED"})
    }
    const updlastLogin= await allUserModel.findOneAndUpdate(
      {userID:existinUser.userID},
      {lastLogin:new Date()},
      {new:true})
    const datexepl= await moment(updlastLogin.lastLogin).format('MMMM Do YYYY, h:mm:ss a')
    res.status(200).json({
      msg:"SUCCESSFUL",
      userID:existinUser.userID,
      name:existinUser.name,
      lastLogin:datexepl
    })
  }catch(error){return res.status(400).json({msg:error.message})}

})

app.post("/creat%IndioRg/:userID",async(req,res)=>{
  try {
    const {userID}=req.params;
    const {firstName,lastName,countryCd,phnNum,address}=req.body
    const existingUser=await indiOrgModel.findOne({userID});
    if(existingUser){return res.status(409).json({msg:"USER ALREADY AN ORGANIZER:I"})}
    const findUser=await allUserModel.findOne({userID});
    const regdate=new  Date()
    const reaDate= await moment(regdate).format('MMMM Do YYYY, h:mm:ss a');
    //console.log(findUser)
    // await indiOrgModel.collection.dropIndex("orgID_1"); // Drop the index by name to handle ID error encountered while in dev.
    indiUserCreate= await indiOrgModel.create({
      IndName:{
        firstName:firstName.toUpperCase(),
        lastName:lastName.toUpperCase()},
      phnCntkt:{
        countryCd,
        phnNum},
      address,
      email:findUser.email,
      userID:findUser.userID,
      regDate:regdate,
      userFollow:[],
      userFollowCnt:0,
      crtdTketz:[],
      crtdTketCnt:0,
      totalEarning:0})    
  const updtRole= await allUserModel.findOneAndUpdate(
    {userID:findUser.userID},
    {role:"organizer"},
    {new:true})

  res.status(200).json({
    msg:"SUCCESSFULL",
    reaDate,
    updtRole
  })
  } catch (error) {return res.status(400).json({msg:error.message})}  
})



app.post("/creat%ORGoRg/:userID",async(req,res)=>{
  try {
    const {userID}=req.params;
    const {orgName,countryCd,phnNum,address}=req.body;
    const existingUser=await orgORGmodel.findOne({userID});
    if(existingUser){return res.status(409).json({msg:"USER ALREADY AN ORGANIZER:O"})};
    const findUser=await allUserModel.findOne({userID});
    const orgIdGen= async()=>{
      let orgID
      let isUnique= false
      while(!isUnique){
        const randMNo= await Math.floor( Math.random()*9999)
        orgID=`ALVENT-${randMNo}-${new Date().getFullYear()}`
        const idExist= await orgORGmodel.findOne({orgID});
        if(!idExist) isUnique=true
      };
      return orgID
    };
    const newOrgID=await orgIdGen()
    
    const regdate=new  Date()
    const reaDate= await moment(regdate).format('MMMM Do YYYY, h:mm:ss a');
    orgORGUserCreate= await orgORGmodel.create({
      orgName:orgName.toUpperCase(),
      phnCntkt:{
        countryCd,
        phnNum},
      address,
      email:findUser.email,
      userID:findUser.userID,
      orgID:newOrgID,
      regDate:regdate,
      userFollow:[],
      userFollowCnt:0,
      crtdTketz:[],
      crtdTketCnt:0,
      totalEarning:0})

  const updtRole= await allUserModel.findOneAndUpdate({
    userID:findUser.userID},
    {role:"organizer"},
    {new:true});
  console.log(req)
  res.status(200).json({
    msg:"SUCCESSFULL",
    reaDate,
    orgORGUserCreate
  })} catch (error) {return res.status(400).json({msg:error.message})}

});

//CREATE EVENT FOR BOTH IND AND ORG
app.post("/creat%eVnt/:userID",async(req,res)=>{
  try {
  const {eventTitle,eventDesc,eventStart,eventEnd,eventType,eventVenue,eventCity,eventCountry,tickeType,eventImgURL,ticketPrice}=req.body;
  //console.log(req.body)
  const {userID}=req.params
  if(!eventTitle||!eventDesc||!eventStart||!eventEnd||!eventType||!eventVenue||!eventCity||!eventCountry||!tickeType||ticketPrice < 0){
    return res.status(400).json({msg:"FILL EMPTY FORMS!!!"})
  };
  
  if(new Date(eventStart) < new Date()||new Date(eventEnd) <= new Date()){
    return res.status(400).json({msg:"DATE CANNOT BE YESTERDAY OR LESS"})
  };
  
  const findID= await allUserModel.findOne({userID})
  if(!findID){
    res.status(400).json({msg:"UNKNOWN USER"})  
  };
  const {nanoid}= await  import('nanoid');
  const conVTitle= await eventTitle.toUpperCase()
  const createDT= new Date().toISOString().replace(/[-:.TZ]/g, '')
  const findORGID=await orgORGmodel.findOne({userID})

  const genEvntID= async()=>{
    if(findORGID){
       spltORGNm= findORGID.orgName.slice(0,3).toUpperCase()
       return await `${spltORGNm}-${createDT}-${nanoid(5)}`;
    }else{
      //if(!findORGID){
       return await `ALV-${createDT}-${nanoid(5)}`;
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
    eventType,
    eventLocation:{
      eventVenue,
      eventCity,
      eventCountry},
    orgID: useORGID,
    userID:findID.userID,
    tickeType,
    ticketPrice
  })
  res.status(200).json({
    msg:"SUCCESSFUL",
    newEvent
  })} catch (error) {return res.status(400).json({msg:error.message})}})

  //GET EVENT
  app.get("/eventAllGet",async(req,res)=>{
    try {
      const evntty= await eventModel.find()
      
      res.status(200).json({
        msg:"SUCCESSFUL",
        evntty
      })
    } catch (error) {return res.status(400).json({msg:error.message})}
  })

  //GET USER NAME FOR GOOGLE AUTH PURPOSE
  app.get("/userNameFetch/",async(req,res)=>{
    const{email}=req.query
    const finduser= await allUserModel.findOne({email});
    console.log(req.params)
    return res.status(200).json({
      msg:"SUCCESSFUL",
      userName:finduser.name
    })
  })
  //FETCH USER NAME AFTER MANUAL LOGIN
  app.get("/userNameMFetch/:userEmail",async(req,res)=>{
    const{userEmail}=req.params
    const finduser= await allUserModel.findOne({email:userEmail});
    console.log(req.params)
    return res.status(200).json({
      msg:"SUCCESSFUL",
      name:finduser.name
    })
  })
  //GET TICKET REVENUE
  app.get('/orGTicketRev/:userEmail',async(req,res)=>{
    const{userEmail}=req.params
    try {
      // Search in indiOrgModel
      const findIndiUser = await indiOrgModel.findOne({ email: userEmail });
      console.log(findIndiUser.totalEarning)
      if (findIndiUser) {
        console.log("found in indUser")
        return res.status(200).json({
          msg: "SUCCESSFUL",
          totalRevenue: findIndiUser.totalEarning
        })}else{console.log("found in Orguser")}

      // Search in orgORGmodel
      const findOrgUser = await orgORGmodel.findOne({ email: userEmail });
  
      if (findOrgUser) {
        console.log("found in Orguser")
        return res.status(200).json({
          msg: "SUCCESSFUL",
          totalRevenue: findOrgUser.totalEarning
        })}else{console.log("found in indUser")}
      
  
      // If no user found in either model
      return res.status(404).json({
        msg: "User not found"
      });
  
    } catch (error) {
      console.error("Error fetching ticket revenue:", error);
      return res.status(500).json({
        msg: "Server Error",
        error: error.message,
      });}
  });

  //GET TOTAL TICKET COUNT ORGANIZER WISE
  app.get('/totTikContDisp/:userEmail',async(req,res)=>{
    try{
    const{userEmail}=req.params
    //const findUserMail= await allUserModel.findOne({email:userEmail})
    const findUserId= "6737745be3d1857286917723"//await findUserMail.userID
    const ticketsSold= await ticktModel.countDocuments({orgID:findUserId})
    
    res.status(200).json({
      msg:"SUCCESSFULL",
      ticketsSold
    })}catch(error){res.status(400).json({msg:error.message})}

  })



//TICKETING
  app.post("/tickzCrt/:userID/:eventID",async(req,res)=>{
    try {
      const{eventID,userID}=req.params;

    if(!userID){
      return res.status(400).json({msg:"USER NEED TO BE LOGGED IN"})
    }
    const {nanoid}= await  import('nanoid');
    const findevntID= await eventModel.findOne({eventID})
    if(!findevntID){
      res.status(400).json({msg:"UNKNOWN ACTION"})  
    };
    const findORGID=await orgORGmodel.findOne({userID})
    console.log(findevntID)
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

      console.log(ticketID)

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
  })


  
