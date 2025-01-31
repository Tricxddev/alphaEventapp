const nodemailer =require("nodemailer")
const SendmailTransport = require("nodemailer/lib/sendmail-transport")
const dotenv = require("dotenv")
const { express } = require("express")

const verifyMailer = async (veriToken,veriName,verifyMail)=>{
   const botask= nodemailer.createTransport({
        service:'gmail',
        auth:{
            user:`${process.env.botMailer}`,
            pass:`${process.env.botMailpwd}`
        }
    })


const sendingDetails= {
    from:process.env.botMailer,
    to:verifyMail,
    subject:"ALVENT EVENTS: VERIFY YOUR ACCOUNT",
    html:`<h1>WELCOME,${veriName},${veriToken}</h1>`,
    text:`    
    <br>
    <br>HERE IS THE TOKEN:
    <h2>${veriToken}</h2>
     `
}

const sendMailAtion= await botask.sendMail(sendingDetails)
 console.log(sendMailAtion)
}

module.exports=verifyMailer