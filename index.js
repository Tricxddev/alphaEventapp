const express = require("express")
const session =require("express-session")
const xml2js = require("xml2js");
const multer = require("multer");
//const upload = multer({ dest: "uploads/" });
const upload = multer();
const mongoose =require("mongoose")
const passport =require("passport")
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const dotenv = require("dotenv")
const bcrypt=require("bcrypt")
const jwt=require("jsonwebtoken")
const moment=require("moment")
const cors=require("cors")
const app = express()
const Stripe = require("stripe");
const stripe = Stripe("your-secret-key");
const path = require("path"); // To handle file paths
const axios = require("axios"); // To handle external API
const GEO_NAMES_USERNAME = 'ALVENT'; 
const cloudinary = require("cloudinary").v2;
const {Pool} =require("pg")

const fs = require('fs');
//multer().none()

//MODULE EXPORTS
const dbconnect= require("./dbconnnect")
const rdbmsConnect=require("./rdbms")
const ensureAuth=require("./middleware/protecto2auth")
const o2authUser=require("./model/o2AuthUsersDb")
const eventModel=require("./model/eventsDB")
const verifyMailer=require("./services/verifyUserMail")
const {orgORGmodel,indiOrgModel,allUserModel}=require("./model/organizerDB")
const sessionModel=require("./model/sessiosDB")
const ticktModel=require("./model/ticketDb")
const {landingtrdPagination,landingFtPagination}=require("./services/utilities")
const subscriberModel=require("./model/subscriberDB")
const sendSubConfirmatn=require("./services/subscribeMailer");
const { execFileSync } = require("child_process");
const { type } = require("os");
//const landingFtPagination=require("./services/utilities")
require("./services/autoMailerSheduler")//for monthly event digest

//CONFIGS
const corsOptions = {
  origin: "*", // Add your frontend URLs here
  methods:["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};
// app.use('*',cors({
//     origin:"http://localhost:5173",
//     methods:["GET", "POST", "PUT", "DELETE"],
//     credentials:true,
//  }))
app.use(cors(corsOptions));
dotenv.config()
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
dbconnect()
//rdbmsConnect()
const PORT= process.env.appPort || 7000
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const uploadImage = async (filePath) => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: "my-folder",
  });
  return result.secure_url;
};
const GEO_API_HOST = 'wft-geo-db.p.rapidapi.com';
const GEO_API_KEY = process.env.geoApiscrtky; 
app.listen(PORT,()=>{
    console.log(`This app now listen on ${PORT}`)
});
passport.use(new GoogleStrategy({
  clientID:process.env.gClientID,
  clientSecret:process.env.cliscrtky,
  callbackURL: process.env.gcallbackURL

},async(accessToken,refreshToken,profile,done)=>{
  // console.log("Access Token:", accessToken);
  //   console.log("Refresh Token:", refreshToken);
  //   console.log("Profile:", profile);

    if (!profile) {
      return done(null, false, { message: "No profile returned from Google." });
  }
         // Log the raw profile data received from Google
         //console.log("Google Profile Data:", profile);

         // Extract specific fields for debugging
        //  console.log("Google ID:", profile.id);
        //  console.log("Name:", profile.displayName);
        //  console.log("Email:", profile.emails[0].value);

  const existingOAuthUser= await o2authUser.findOne({googleId:profile.id})

    const email = profile.emails[0].value;
    const existingManualUser = await allUserModel.findOne({ email });

    if (!existingOAuthUser && !existingManualUser) {
      const newUser=  await allUserModel.create({
        googleId: profile.id,
        userID: new mongoose.Types.ObjectId(),
        name: profile.displayName,
        role: "organizer",
        accntStatus: "active",
        lastLogin: new Date(),
        isEmailVerified: true,
        email: profile.emails[0].value,
      });


    if(!existingOAuthUser){
     await o2authUser.create({
     googleId:profile.id,
     name:profile.displayName,
     email:profile.emails[0].value
   })
   const existingIndiOrg = await indiOrgModel.findOne({ email: profile.emails[0].value });
   if (!existingIndiOrg){
    await indiOrgModel.create({
      IndName:{
              firstName: profile.displayName?.split(' ')[0] || '', 
              lastName: profile.displayName?.split(' ')[1] || ''
      },
      phnCntkt:{
        countryCd:'',
        phnNum:''
      },
      address:'',
      email:profile.emails[0].value,
      userID:newUser.userID,
      regDate:new Date(),
      userFollow:[],
      userFollowCnt:0,
      crtdTketz:[],
      crtdTketCnt:0,
      totalEarning:0
    })}
  };}
   
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
    try {
    const user=req.user;
    if (!user) throw new Error('User authentication failed.');
    const token = jwt.sign(
      { email: user.email },
      process.env.refresTk,
      { expiresIn: '1h' },
    );
    // Successful authentication, redirect to your desired route
   res.redirect(`https://alvent.netlify.app/OnboardingMain/?token=${token}`);
   //res.redirect(`http://localhost:5173/OnboardingMain/?token=${token}`);
  //  res.redirect(`https://alvent.netlify.app/OnboardingMain/?token=${token}`);
   // res.redirect('/updt%Passwd/:googleId');
  } catch (error) {
    console.error('Authentication error:', error);
    res.redirect('/');
  }
  }
);
const newUsers=require("./routes/newUserRout");
const login=require("./routes/loGinRout");
const otpActivate=require("./routes/confirmTokRout");
const forgotPWD=require("./routes/forgetPWDrout")
const forgotPWDOTP=require("./routes/forgetPWDrout")
const resetPassword=require("./routes/forgetPWDrout")
const createEvent=require("./routes/creatEventRout")
const subscribe= require("./routes/sunbscribersRout")
const UNSubscribe= require("./routes/sunbscribersRout")
const eventDetail=require("./routes/eventDetailRout")
const organizerEvents=require("./routes/organizerEventRout")
const trendEvnt=require("./routes/trendEventRout")
const featuredEvnt=require("./routes/featuredEvntRout")
const orgProfile=require("./routes/orgProfileRout")
const orgProfileUpdate=require("./routes/orgProfileRout")
const orgChngPwDash=require("./routes/orgChngPwDashRout")
const orgBankDetails=require("./routes/orgBankDetailRout")
const orgBankDetailsfetch=require("./routes/orgBankDetailRout")
const myEventDash=require("./routes/myEventDashRout")
const myEventFetailsDash=require("./routes/myEventDashRout")
//ROUTERS
app.use("/api",newUsers);//SIGNUP API
app.use("/api",login);//LOGIN API
app.use("/api",otpActivate);//OTP ACTIVATION API
app.use("/api",forgotPWD);//FORGOT PASSWORD API
app.use("/api",forgotPWDOTP);//FORGOT PASSWORD OTP API
app.use("/api",resetPassword);//RESET PASSWORD API
app.use("/api",createEvent);//CREATE EVENT API
app.use("/api",subscribe);//SUBSCRIBE API
app.use("/api",UNSubscribe);//UNSUBSCRIBE API
app.use("/api",eventDetail);//EVENT DETAIL API
app.use("/api",organizerEvents);//ORGANIZER EVENTS API
app.use("/api",trendEvnt);//TRENDING EVENTS API
app.use("/api",featuredEvnt);//FEATURED EVENTS API
app.use("/api",orgProfile);//ORGANIZER PROFILE API
app.use("/api",orgProfileUpdate);//ORGANIZER PROFILE UPDATE API
app.use("/api",orgChngPwDash);//ORGANIZER CHANGE PASSWORD FRROM DASHBOARD API
app.use("/api",orgBankDetails);//ORGANIZER BANK DETAILS API
app.use("/api",orgBankDetailsfetch);//ORGANIZER BANK DETAILS FETCH API
app.use("/api",myEventDash);//ORGANIZER MY EVENT DASHBOARD API
app.use("/api",myEventFetailsDash);//ORGANIZER MY EVENT DETAILS DASHBOARD API

app.get('/userInfo', async (req, res) => {
  try {
    // Retrieve the token from the Authorization header
    const authHeader = req.headers.authorization;
    // console.log(authHeader)

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, msg: 'Unauthorized access' });
    }

    const token = authHeader.split(' ')[1];
    

    // Verify the token
    const decoded = jwt.verify(token, process.env.refresTk);

    //console.log(decoded)

    // Use the decoded token to find the user
    const user = await allUserModel.findOne({ email: decoded.email });

    //console.log(user)

    if (user) {
      res.status(200).json({
        msg: "SUCCESSFUL",
        data:{
        name: user.name,
        email: user.email,}
      });
    } else {
      res.status(404).json({ success: false, msg: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
});;

// app.get('/dashboard',ensureAuth,(req,res)=>{
//   res.send(`hello,${req.user.displayName}`)
// })



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
});

const generateOTpw= function(){
  return  Math.floor(100000+Math.random()*90000)
};


app.post("/verifyOTp/:userEmail",async(req,res)=>{
  const{userEmail}=req.params;
  const{verificationCode}=req.body;

  console.log('verificationCode:',verificationCode)
  
  const findUser= await allUserModel.findOne({email: userEmail})
  if(!findUser){
    return res.status(403).json({msg:"INVALID USER"})
  };
  const findToken= await findUser.restpasswordOTP;
  const compOtp= await bcrypt.compare(verificationCode,findToken)
  if(compOtp){
    console.log('OTPyesssssssss:')
  }
  if(!compOtp){
    return res.status(403).json({msg:"INVALID OTP"})
  }
  await allUserModel.findOneAndUpdate(
    {email:userEmail},
    {isEmailVerified:true,
      restpasswordOTP:undefined,
      restpasswordOTP_Expires:undefined},{new:true})
  res.status(200).json({msg:"SUCCESSFUL"})})


//ALL USER COUNT
app.get("/getalluserCont",async(req,res)=>{
  const userCount=await allUserModel.countDocuments()
  res.json(userCount)
})


// app.post("/creatIndioRg/:userID",async(req,res)=>{
//   try {
//     const {userID}=req.params;
//     const {firstName,lastName,countryCd,phnNum,address}=req.body
//     const existingUser=await indiOrgModel.findOne({userID});
//     if(existingUser){return res.status(409).json({msg:"USER ALREADY AN ORGANIZER:I"})}
//     const findUser=await allUserModel.findOne({userID});
//     const regdate=new  Date()
//     const reaDate= await moment(regdate).format('MMMM Do YYYY, h:mm:ss a');
//     //console.log(findUser)
//     // await indiOrgModel.collection.dropIndex("orgID_1"); // Drop the index by name to handle ID error encountered while in dev.
//     indiUserCreate= await indiOrgModel.create({
//       IndName:{
//         firstName:firstName.toUpperCase(),
//         lastName:lastName.toUpperCase()},
//       phnCntkt:{
//         countryCd,
//         phnNum},
//       address,
//       email:findUser.email,
//       userID:findUser.userID,
//       regDate:regdate,
//       userFollow:[],
//       userFollowCnt:0,
//       crtdTketz:[],
//       crtdTketCnt:0,
//       totalEarning:0})    
//   const updtRole= await allUserModel.findOneAndUpdate(
//     {userID:findUser.userID},
//     {role:"organizer"},
//     {new:true})

//   res.status(200).json({
//     msg:"SUCCESSFULL",
//     reaDate,
//     updtRole
//   })
//   } catch (error) {return res.status(400).json({msg:error.message})}  
// })



// app.post("/creat%ORGoRg/:userID",async(req,res)=>{
//   try {
//     const {userID}=req.params;
//     const {orgName,countryCd,phnNum,address}=req.body;
//     const existingUser=await orgORGmodel.findOne({userID});
//     if(existingUser){return res.status(409).json({msg:"USER ALREADY AN ORGANIZER:O"})};
//     const findUser=await allUserModel.findOne({userID});
//     const orgIdGen= async()=>{
//       let orgID
//       let isUnique= false
//       while(!isUnique){
//         const randMNo= await Math.floor( Math.random()*9999)
//         orgID=`ALVENT-${randMNo}-${new Date().getFullYear()}`
//         const idExist= await orgORGmodel.findOne({orgID});
//         if(!idExist) isUnique=true
//       };
//       return orgID
//     };
//     const newOrgID=await orgIdGen()
    
//     const regdate=new  Date()
//     const reaDate= await moment(regdate).format('MMMM Do YYYY, h:mm:ss a');
//     orgORGUserCreate= await orgORGmodel.create({
//       orgName:orgName.toUpperCase(),
//       phnCntkt:{
//         countryCd,
//         phnNum},
//       address,
//       email:findUser.email,
//       userID:findUser.userID,
//       orgID:newOrgID,
//       regDate:regdate,
//       userFollow:[],
//       userFollowCnt:0,
//       crtdTketz:[],
//       crtdTketCnt:0,
//       totalEarning:0})

//   const updtRole= await allUserModel.findOneAndUpdate({
//     userID:findUser.userID},
//     {role:"organizer"},
//     {new:true});
//   //console.log(req)
//   res.status(200).json({
//     msg:"SUCCESSFULL",
//     reaDate,
//     orgORGUserCreate
//   })} catch (error) {return res.status(400).json({msg:error.message})}

// });


  //GET USER NAME FOR GOOGLE AUTH PURPOSE
  app.get("/userNameFetch/",async(req,res)=>{
    const{email}=req.query
    
    const finduser= await allUserModel.findOne({email:email});
    console.log("finduser:",finduser)
    return res.status(200).json({
      msg:"SUCCESSFUL",
      userDetails:finduser
    })
  })
  //FETCH USER NAME AFTER MANUAL LOGIN
  app.get("/userNameMFetch/:userEmail",async(req,res)=>{
    const{userEmail}=req.params
    const finduser= await allUserModel.findOne({email:userEmail});
    return res.status(200).json({
      msg:"SUCCESSFUL",
      name:finduser.name
    })
  });
//UTILITY FOR OTHER USE
  app.get("/userNamFetch/:userEmail",async(req,res)=>{
    const{userEmail}=req.params

    const finduser= await allUserModel.findOne({email:userEmail});
    //console.log(req.params)
    //console.log("USERFOUND:",finduser)
    
    return res.status(200).json({
      msg:"SUCCESSFUL",
      data:finduser
    })
  })
  //GET TICKET REVENUE
  app.get('/orGTicketRev/:userEmail',async(req,res)=>{
    const{userEmail}=req.params
    
    try {
      // Search in indiOrgModel
      const findIndiUser = await indiOrgModel.findOne({ email: userEmail });
     // console.log("userEmail:",findIndiUser)

      if (findIndiUser) {
        //console.log("found in indUser")
        return res.status(200).json({
          msg: "SUCCESSFUL",
          totalRevenue: findIndiUser.totalEarning
        })}else{console.log("found in Orguser")}

      // Search in orgORGmodel
      const findOrgUser = await orgORGmodel.findOne({ email: userEmail });
  
      if (findOrgUser) {
        //console.log("found in Orguser")
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




//GET TOTAL REVENUE ORGANIZER WISE
app.get('/orGTotRev/:userEmail',async(req,res)=>{
  const {userEmail}=req.params
  const findUser= await allUserModel.findOne({email:userEmail})
  if(!findUser){
    return res.status(404).json({msg:"UNKNOWN USER"})
  };
  const eventID = await eventModel.find({ orgID: findUser.userID }).distinct('eventID');
  if(eventID.length === 0){
    return res.status(200).json({
      msg:"NO EVENT CREATED YET",
      data:0
    });
  }
  const tickets = await ticktModel.find({ eventID: { $in: eventID } });
  const priceMap = {};
  tickets.forEach(ticket => { priceMap[ticket.ticketID]= {type:ticket.tickeType, price:ticket.ticketPrice}});
  const ticketIDS = Object.keys(priceMap)

  const soldTickets = await eventModel.find({ eventID: { $in: eventID } })
  const totalSoldTickets = soldTickets.reduce((acc, soldTickets) => {
    return acc + (soldTickets.ticketsSold || 0);
  })
  soldTickets.forEach(ticket => {
    const {price} = priceMap[ticket.ticketID] || {};
    totalRevenue += price || 0;
  });
  console.log(`Total Revenue for ${findUser.name}:${totalRevenue}`);
  res.status(200).json({
    msg:"SUCCESSFUL",
    totalRevenue
  });
});
//TICKETING
  app.post("/tickzCrt/:eventID",async(req,res)=>{
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
  })


//STRIPE API
app.post("/create-payment-intent", async (req, res) => {
  try {
    const { eventID, totalCost } = req.body;

    if (!eventID || totalCost === undefined) {
      return res.status(400).json({ msg: "Invalid data" });
    }

    // Skip payment intent creation for free events
    if (totalCost === 0) {
      return res.json({ clientSecret: null });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCost * 100, // Stripe expects the amount in cents
      currency: "ngn",
      metadata: { eventID },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

// Fetch all countries
app.get("/countries", async (req, res) => {
  try {
    const response = await axios.get(`http://api.geonames.org/countryInfo?formatted=true&lang=eng&username=${GEO_NAMES_USERNAME}`);
    

    // Convert XML response to JSON
    xml2js.parseString(response.data, (err, result) => {
      if (err) {
        console.error("Error parsing XML:", err);
        return res.status(500).json({ message: "Error parsing XML" });
      }

      // Check if 'country' array exists and map over it
      const countries = result.geonames.country.map(country => ({
        geonameId: country.geonameId[0],
        countryName: country.countryName[0]
      }));

      res.status(200).json(countries);
    });
    
  } catch (error) {
    console.error("Error fetching countries:", error.message);
    res.status(500).json({ message: "Error fetching countries" });
  }
});

// Fetch STATE for a specific state
app.get("/states/:countryId", async (req, res) => {
  const { countryId } = req.params;

  try {
    const response = await axios.get(`http://api.geonames.org/children?geonameId=${countryId}&username=${GEO_NAMES_USERNAME}`);
    

    
    xml2js.parseString(response.data, (err, result) => {
      if (err) {
        console.error("Error parsing XML:", err);
        return res.status(500).json({ message: "Error parsing XML" });
      }

      const geonames = result?.geonames;
      const totalResultsCount = parseInt(geonames?.totalResultsCount[0], 10);

      if (totalResultsCount === 0) {
        // No states found
        console.log("No states found for countryId:", countryId);
        return res.status(200).json([]);
      }


      // Map states
      const states = geonames.geoname?.map((state) => ({
        geonameId: state.geonameId[0],
        stateName: state.name[0],
      })) || [];
      //console.log("Raw Response:", states);
      res.status(200).json(states);
    });
  } catch (error) {
    console.error("Error fetching states:", error.message);
    res.status(500).json({ message: "Error fetching states" });
  }
});
// Fetch STATE for a specific state
app.get("/cities/:stateId", async (req, res) => {
  const { stateId } = req.params;

  try {
    const response = await axios.get(
      `http://api.geonames.org/children?geonameId=${stateId}&username=${GEO_NAMES_USERNAME}`
    );

    xml2js.parseString(response.data, (err, result) => {
      if (err) {
        console.error("Error parsing XML:", err);
        return res.status(500).json({ message: "Error parsing XML" });
      }

      const geonames = result?.geonames;
      const totalResultsCount = parseInt(geonames?.totalResultsCount[0], 10);

      if (totalResultsCount === 0) {
        // No cities found
        console.log("No cities found for stateId:", stateId);
        return res.status(200).json([]); // Return an empty array
      }

      const cities = geonames.geoname?.map((city) => ({
        geonameId: city.geonameId[0],
        cityName: city.name[0],
      })) || [];
      //console.log("Raw Response:", cities);
      res.status(200).json(cities);
    });
  } catch (error) {
    console.error("Error fetching cities:", error.message);
    res.status(500).json({ message: "Error fetching cities" });
  }
});

//multer
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path; // Temporary file path
    const imageURL = await uploadImage(filePath);
    res.json({ success: true, url: imageURL });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});