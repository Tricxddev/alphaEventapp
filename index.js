const express = require("express")
const session =require("express-session")
const xml2js = require("xml2js");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
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

const fs = require('fs');


//MODULE EXPORTS
const dbconnect= require("./dbconnnect")
const ensureAuth=require("./middleware/protecto2auth")
const o2authUser=require("./model/o2AuthUsersDb")
const eventModel=require("./model/eventsDB")
const verifyMailer=require("./services/verifyUserMail")
const {orgORGmodel,indiOrgModel,allUserModel}=require("./model/organizerDB")
const sessionModel=require("./model/sessiosDB")
const ticktModel=require("./model/ticketDb")
const {landingtrdPagination,landingFtPagination}=require("./services/utilities")
const featuredEvnt=require("./routes/featuredEvntRout.js")
const userInfo=require("./routes/userInfoRout.js")
const userDetailUDT=require("./routes/updtUserDetailsRout.js")
const newUser=require("./routes/newUserRout.js")
const verifyUser=require("./routes/verifyUserRout.js")
const confirmedToken=require("./routes/confirmTokRout.js")
const alluserCount=require("./routes/allUSerCountRout.js")
const login=require("./routes/loGinRout.js")
const creatUserIndi=require("./routes/creatUSerRout.js")
const creatUserOrg=require("./routes/creatOrgUsrRout.js")
const creatEvent=require("./routes/creatEventRout.js")
const eventDetails=require("./routes/eventDetailRout.js")
const trendEvent=require("./routes/trendEventRout.js")
const googleUnmFetch=require("./routes/googleUnamFetRout.js")
const manualoGinUfetch=require("./routes/manualoGinRout.js")
const utilityNmfetch=require("./routes/utilityNmfetRout.js")
const ticketRevFetch=require("./routes/ticketRevRout.js")
const totTikContDispFetch=require("./routes/totTikContDispRout.js")
const tickzCrtFETCH=require("./routes/tickzCrtRout.js")
//const landingFtPagination=require("./services/utilities")

//CONFIGS
// app.use('*',cors({
//     origin:"http://localhost:5173",
//     methods:["GET", "POST", "PUT", "DELETE"],
//     credentials:true,
//   }))
const allowedOrigins = ['http://localhost:5173', 'https://your-production-site.com'];
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));
app.use((req, res, next) => {
  console.log(`Request Origin: ${req.headers.origin}`);
  next();
});

dotenv.config()
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
dbconnect()
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
        countryCd,
        phnNum
      },
      address:"",
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
    const user=req.user;
    const token = jwt.sign(
      { email: user.email },
      process.env.refresTk,
      { expiresIn: '1h' },
    );
    // Successful authentication, redirect to your desired route
   res.redirect(`http://localhost:5173/OnboardingMain/?token=${token}`);
   // res.redirect('/updt%Passwd/:googleId');
  }
);


//FETCH USER INFO
app.use('/API',userInfo) 

app.get('/dashboard',ensureAuth,(req,res)=>{
  res.send(`hello,${req.user.displayName}`)
})


//UPDATE USER INFO
app.use("/API",userDetailUDT)

//NEW USER REQ
app.use("/API",newUser)

//VERIFY USER
app.use("/API",verifyUser)

//CONFIRM TOKEN
app.use("/API",confirmedToken)

//ALL USER COUNT
app.use("/API",alluserCount)
//LOGIN
app.use("/API",login)

//CREAT USER indORG
app.use("/API",creatUserIndi)

//CREAT USER indORG
app.use("/API",creatUserOrg)

//CREATE EVENT FOR BOTH IND AND ORG
app.use("/API",creatEvent)

  //FETCH FEATURED EVENT
  app.use("/API",featuredEvnt)
//FETCH EVENT DETAILS
  app.use("/API",eventDetails)

//FETCH TRENDING EVENT
  app.use("/API",trendEvent)

  //GET USER NAME FOR GOOGLE AUTH PURPOSE
  app.use("/API",googleUnmFetch)

  //FETCH USER NAME AFTER MANUAL LOGIN
  app.use("/API",manualoGinUfetch)
//UTILITY FOR OTHER USE
  app.use("/API",utilityNmfetch),
  //GET TICKET REVENUE
  app.use('/API',ticketRevFetch)

  //GET TOTAL TICKET COUNT ORGANIZER WISE
  app.use('/API',totTikContDispFetch)


//TICKETING
  app.post("/API",tickzCrtFETCH)


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

    res.json({ clientSecret: paymentIntent.process.env.client_secret });
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