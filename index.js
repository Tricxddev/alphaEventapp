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
const crypto = require('crypto');

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
const paymentModel=require("./model/paymeNtDb")

dotenv.config()
//CONFIGS
const corsOptions = {
  origin: "*", 
  methods:["GET", "POST", "PUT", "DELETE","PATCH"],
  credentials: false,
};
// const corsOptions = {
//   origin: "https://alvent.netlify.app", 
//   methods:["GET", "POST", "PUT", "DELETE","PATCH"],
//   credentials: true,
// };
// const corsOptions = {
//   origin: "http://localhost:5174", 
//   methods:["GET", "POST", "PUT", "DELETE","PATCH"],
//   credentials: true,
// };


app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
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


    if (!profile) {
      return done(null, false, { message: "No profile returned from Google." });
  }


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
  async(req, res) => {
    try {
    const user=req.user;
    if (!user) throw new Error('User authentication failed.');
    const token = jwt.sign(
      { email: user.email },
      process.env.refresTk,
      { expiresIn: '1h' },
    );
    const gensessionID = function generateSessionID() {
      return Math.floor(Math.random() * 10000);
    };
    while (await sessionModel.findOne({ sessionID: gensessionID })) {
      gensessionID(); // Ensure the session ID is unique
    }
    const existinUser = await allUserModel.findOne({email:user.email})
    const sessionID = gensessionID();
    const updateSession=await sessionModel.create({
      sessionID:sessionID,
      userID:existinUser.userID,
      sessToken:token,
      loginRoute: 'google'
    })
  
    // Successful authentication, redirect to your desired route
   res.redirect(`https://alvent.netlify.app/OnboardingMain/?token=${token}`);

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
const supportCall=require("./routes/supportCallRout")
//const supportCallupdate=require("./routes/supportCallRout")
const totalRevnTikbyOrgRout=require("./routes/totalRevnTikbyOrgRout")
const dashboardsales=require("./routes/dashbdsalesperfRout")
const {checkSession,logActivity,eventClickGet}=require("./middleware/sessionChecker")
const upcomingevents=require("./routes/myEventDashRout")
const ticketsoldOverview=require("./routes/myEventDashRout")
const initiatewithDrawFunds=require("./routes/financeRout")
const approveWithdrawal=require("./routes/financeRout")
const withdrawalHistory=require("./routes/financeRout")
// app.use(checkSession)
// app.use(logActivity)
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
app.use("/api",supportCall);//SUPPORT CALL API
//app.use("/api",supportCallupdate);//SUPPORT CALL UPDATE API 
app.use("/api",totalRevnTikbyOrgRout);//TOTAL REVENUE AND TICKET COUNT BY ORGANIZER API
app.use("/api",dashboardsales);// SALES PERFORMANCE DASHBOARD VIEW API
app.use("/api",upcomingevents);// ORGANISER DASHBOARD VIEW UPCOMING EVENT API
app.use("/api",ticketsoldOverview);// ORGANISER DASHBOARD VIEW UPCOMING EVENT API
app.use("/api",initiatewithDrawFunds);// WITHDRAW FUNDS API
app.use("/api",approveWithdrawal);// ADMIN APPROVE WITHDRAWAL API
app.use("/api",withdrawalHistory);// WITHDRAWAL HISTORY API

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



//ALL USER COUNT
//ADMIN TOOL
app.get("/getalluserCont",async(req,res)=>{
  const userCount=await allUserModel.countDocuments()
  res.json(userCount)
});
app.get("/userNameFetch/",async(req,res)=>{
  const{email}=req.query
    
  const finduser= await allUserModel.findOne({email:email});
  console.log("finduser:",finduser)
  return res.status(200).json({
      msg:"SUCCESSFUL",
      userDetails:finduser
  })
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
  // app.get('/orGTicketRev/:userEmail',async(req,res)=>{
  //   const{userEmail}=req.params
    
  //   try {
  //     // Search in indiOrgModel
  //     const findIndiUser = await indiOrgModel.findOne({ email: userEmail });
  //    // console.log("userEmail:",findIndiUser)

  //     if (findIndiUser) {
  //       //console.log("found in indUser")
  //       return res.status(200).json({
  //         msg: "SUCCESSFUL",
  //         totalRevenue: findIndiUser.totalEarning
  //       })}else{console.log("found in Orguser")}

  //     // Search in orgORGmodel
  //     const findOrgUser = await orgORGmodel.findOne({ email: userEmail });
  
  //     if (findOrgUser) {
  //       //console.log("found in Orguser")
  //       return res.status(200).json({
  //         msg: "SUCCESSFUL",
  //         totalRevenue: findOrgUser.totalEarning
  //       })}else{console.log("found in indUser")}
      
  
  //     // If no user found in either model
  //     return res.status(404).json({
  //       msg: "User not found"
  //     });
  
  //   } catch (error) {
  //     console.error("Error fetching ticket revenue:", error);
  //     return res.status(500).json({
  //       msg: "Server Error",
  //       error: error.message,
  //     });}
  // });

  //GET TOTAL TICKET COUNT ORGANIZER WISE
  // app.get('/totTikContDisp/:userEmail',async(req,res)=>{
  //   try{
  //   const{userEmail}=req.params
  //   //const findUserMail= await allUserModel.findOne({email:userEmail})
  //   const findUserId= "6737745be3d1857286917723"//await findUserMail.userID
  //   const ticketsSold= await ticktModel.countDocuments({orgID:findUserId})
    
  //   res.status(200).json({
  //     msg:"SUCCESSFULL",
  //     ticketsSold
  //   })}catch(error){res.status(400).json({msg:error.message})}

  // })
//BUY TICKET-PAYSTACK INITIATE ------PENDING


app.post("/buyTicket-initiate/:eventID", async (req, res) => {
  try {
    const { eventID } = req.params;
    // console.log(req.path)
    const { tickets, email, totalPurchase } = req.body;

    //if (!eventID || !tickets || !email) return res.status(400).json({ msg: "Missing required fields" });

    const findevntID = await eventModel.findOne({ eventID });
    if (!findevntID) return res.status(404).json({ msg: "Event not found" });

    const geteventCapacity= await  findevntID.eventCapacity
    // const event=await eventModel.findOne({eventID})
    const tiketsold=findevntID.ticketsSold

    if(tiketsold>geteventCapacity ||tiketsold === geteventCapacity ){
      return res.status(410).json({msg:"TICKET FOR THIS EVENT IS SOLD OUT"})
    }

    const { nanoid } = await import('nanoid');
    const createDT = new Date().toISOString().replace(/[-:.TZ]/g, '');
    const findORGID = await indiOrgModel.findOne({ userID: findevntID.userID });

    const genTicketID = async () => {
      const prefix = findORGID?.IndName?.firstName?.slice(0, 3).toUpperCase() || "ALV";
      return `${prefix}-${createDT}-${nanoid(7)}`;
    };
    let freeTickets = [];
    let paidTickets = [];
    let calculatedTotal = 0;

    for (const ticket of tickets) {
      const findevntID = await eventModel.findOne({ eventID });
      const ticketDetails = findevntID.tickets.find(t => t._id.toString() === ticket._id);
      const totalQty = tickets.reduce((sum, ticket) => sum + (ticket.quantity), 0);
      
      if (!findevntID) return res.status(404).json({ msg: "Event not found" });

      const geteventCapacity=  findevntID.eventCapacity
      const event=await eventModel.findOne({eventID:findevntID.eventID})
      const tiketsold=event.ticketsSold
      if (!ticketDetails) return res.status(400).json({ msg: `Ticket ID ${ticket._id} not found` });

      const qty = Number(ticket.quantity) || 1;
      const price = ticketDetails.ticketPrice;
      calculatedTotal += price * qty;

      for (let i = 0; i < qty; i++) {
        const ticketID = await genTicketID();
        const ticketPayload = {
          _id: ticket._id,
          ticketID,
          ticketType:ticket.ticketType,
          quantity: 1,
          unitPrice: price
        };

        if (price === 0) freeTickets.push(ticketPayload);
        else paidTickets.push(ticketPayload);
      }
    }

    if (calculatedTotal !== parseInt(totalPurchase)) {
      return res.status(400).json({ msg: "Total cost mismatch" });
    }

    if (calculatedTotal === 0) {
      await ticktModel.insertMany(freeTickets);
      return res.status(200).json({ msg: "Free tickets issued", tickets: freeTickets });
    }
      if (calculatedTotal !== parseInt(totalPurchase, 10)) {
        return res.status(400).json({ msg: "Total cost does not match the purchase amount" });
      }
    const response = await axios.post("https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: calculatedTotal * 100,
        callback_url: "https://alvent.netlify.app"
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json"
        }
      });

    if (!response.data.status) return res.status(400).json({ msg: "Failed to initialize payment" });

    const ticketTxn = new paymentModel({
      paymentID: response.data.data.reference,
      eventID,
      email,
      tickets: paidTickets,
      totalPurchase: calculatedTotal,
      trnsctnDT: new Date()
    });
    await ticketTxn.save();
    if (freeTickets.length > 0){
     const ticketTxnforTKmodel = new ticktModel({
      eventID,
      email,
      userId:findevntID.userID,
      tickets: freeTickets,
      totalPurchase: 0,
      purchaseDate: new Date()
    });
    // Calculate the total quantity of free tickets issued
    let totalFreeQty = 0;
    for (const frrtkt of freeTickets) {
      const qty = frrtkt.quantity;
      totalFreeQty += qty;
  
      await eventModel.updateOne(
      { eventID, "tickets._id": frrtkt._id },
      { $inc: { "tickets.$.sold": qty } }
      );
    }
       await ticketTxnforTKmodel.save();
  }

    return res.status(200).json({
      msg: "Redirect to Paystack",
      authorization_url: response.data.data.authorization_url,
      reference: response.data.data.reference
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Server error", error: error.message });
  }
});

//yet to push ticket ID's to eventmodel.ticketIDs
app.post("/paystack/webhook", express.json(), async (req, res) => {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;

    //  Validate signature
    const hash = crypto
      .createHmac('sha512', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
       console.log(" InValid Paystack webhook received:", req.body.event);
      return res.sendStatus(401); // Unauthorized
      
    }else{ console.log("Valid Paystack webhook received:", req.body.event);}

    //   Check event type and status
    const event = req.body;
    const { reference, status } = event.data;
    if (event.event !== "charge.success" || status !== "success") {
      return res.sendStatus(200); // Nothing to process
        }

    //  Find payment by reference
    const txn = await paymentModel.findOne({ paymentID: reference });
    if (!txn) return res.sendStatus(404);
    // if (txn.paymentStatus === "completed") return res.sendStatus(200);
    if (txn.paymentStatus === "completed") {
      console.log("Transaction already completed:", reference);
      return res.sendStatus(200);
    }
    if (txn.paymentStatus !== "pending") {
      console.log("Unexpected payment status:", txn.paymentStatus);
      return res.sendStatus(200);
    }
    if (txn.paymentStatus === "pending"){
    const findEvent= await eventModel.findOne({eventID:txn.eventID})
   
        //update indidata
        console.log(findEvent.userID) 
        console.log(txn.totalPurchase) 
       const updateINDTOT= await indiOrgModel.updateOne(
            {
              userID: new mongoose.Types.ObjectId(findEvent.userID),
              // "tickets._id": purchased._id
            },
            {
              $inc: {
                totalEarning: txn.totalPurchase
              }
            }
          );
    if(updateINDTOT){console.log("Total Updated")}
      

    //   Get event document
    const findevntID = await eventModel.findOne({ eventID: txn.eventID });
    if (!findevntID) return res.status(404).json({ msg: "Event not found" });

    //   Prepare and save issued tickets
    const ticketData = txn.tickets.map(t => ({
      _id: t._id,
      ticketType: t.ticketType,
      ticketID: t.ticketID,
      quantity: t.quantity
    }));

    const ticketDoc = new ticktModel({
      paymentID: reference,
      tickets: ticketData,
      eventID: txn.eventID,
      email: txn.email,
      userId: findevntID.userID,
      purchaseDate: new Date()
    });

    await ticketDoc.save();

    //  Mark payment as completed
    txn.paymentStatus = "completed";
    txn.trnsctnDT = new Date();
    await txn.save();

    // //  Update overall ticketsSold
    const geteventCapacity = findevntID.eventCapacity;

    // Fetch all ticket documents for this event
    const allTickets = await ticktModel.find({ eventID: txn.eventID });

    // Initialize total counter
    let totalTicketsSold = 0;

    // Loop through each ticket document
    allTickets.forEach(ticketDoc => {
      // Loop through each item in the `tickets` array
      ticketDoc.tickets.forEach(ticket => {
        // Add quantity to total (convert to number just in case)
        totalTicketsSold += Number(ticket.quantity) || 0;
      });
    });
    
    console.log("getTotalTicketsIssued:",totalTicketsSold)

    // Update the ticketsSold field in your event model
    await eventModel.updateOne(
      { eventID: txn.eventID },
      { $set: { ticketsSold: totalTicketsSold } }
    );

  const soldCountMap = {};

  txn.tickets.forEach(t => {
    const id = t._id.toString();
    const qty = Number(t.quantity) || 1;
    soldCountMap[id] = (soldCountMap[id] || 0) + qty;
  });

  // Update the `sold` field per ticket ID once
  for (const [ticketId, soldQty] of Object.entries(soldCountMap)) {
    await eventModel.updateOne(
      { eventID: txn.eventID, "tickets._id": ticketId },
      { $inc: { "tickets.$.sold": soldQty } }
    );
  }


    console.log(`Transaction processed successfully for:${txn.email}`);
    res.sendStatus(200); // Success
  }
  } catch (err) {
    console.error("Webhook error:", err.message);
    res.sendStatus(500);
  }});


app.get("/ticket-details/:reference/:email", async (req, res) => {
  const { reference, email} = req.params;
  const txn = await paymentModel.findOne({ paymentID: reference });
  if (!txn || txn.paymentStatus !== 'completed') {
    return res.status(404).json({ msg: "Transaction not verified or not found" });
  }

  const tickets = await ticktModel.find({ eventID: txn.eventID, email});
  return res.status(200).json({ 
  tickets
  });
});
//Ticketet count
app.get("/dashbdTicketCount/:userID",async(req,res)=>{
  const{userID}=req.params
  const findevntID = await eventModel.findOne({ userID })
  if(!findevntID){
    return res.status(200).json({
      ticketCount:0
    })
  }
      const getticketIssuedcount = await ticktModel.countDocuments({
      userId: userID,
      // email: txn.email
    });
    res.status(200).json({
      msg:"SUCCESSFUL",
      ticketCount:getticketIssuedcount
    })
})


// //STRIPE API
// app.post("/create-payment-intent", async (req, res) => {
//   try {
//     const { eventID, totalCost } = req.body;

//     if (!eventID || totalCost === undefined) {
//       return res.status(400).json({ msg: "Invalid data" });
//     }

//     // Skip payment intent creation for free events
//     if (totalCost === 0) {
//       return res.json({ clientSecret: null });
//     }

//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: totalCost * 100, // Stripe expects the amount in cents
//       currency: "ngn",
//       metadata: { eventID },
//     });

//     res.json({ clientSecret: paymentIntent.client_secret });
//   } catch (error) {
//     res.status(500).json({ msg: error.message });
//   }
// });

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