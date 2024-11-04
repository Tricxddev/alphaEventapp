const express = require("express")
const session =require("express-session")
const passport =require("passport")
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const dotenv = require("dotenv")
const app = express()
const PORT= process.env.appPort || 5000

//MODULE EXPORTS
const dbconnect= require("./dbconnnect")

const ensureAuth=require("./middleware/protecto2auth")

//CONFIGS
dotenv.config()
app.use(express.json())
dbconnect()

app.listen(PORT,()=>{
    console.log(`This app now listen on ${PORT}`)
});
passport.use(new GoogleStrategy({
  clientID:process.env.gClientID,
  clientSecret:process.env.cliscrtky,
  callbackURL: process.env.gcallbackURL

},(accessToken,refreshToken,profile,done)=>{
  return done(null,profile)
}));


app.use(session({secret:`${process.env.cliscrtky}`,resave:false,saveUninitialized:true}));//configure session
app.use(passport.initialize());//initialize passport and session
app.use(passport.session())

//serialize & deserialize user infomation
passport.serializeUser((user,done)=>{
    done(null,user)
});
passport.deserializeUser((obj,done)=>{
    done(null,obj)
})
// Route to initiate Google OAuth
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback route
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication, redirect to your desired route
    res.redirect('/dashboard');
  }
);
app.get('/dashboardmsg',ensureAuth,(req,res)=>{
  res.send(`hello,${req.user.displayName}`)
})