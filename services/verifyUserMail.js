const nodemailer =require("nodemailer")
const SendmailTransport = require("nodemailer/lib/sendmail-transport")
const dotenv = require("dotenv")
const { express } = require("express")

const verifyMailer = async (OtpGen,veriName,verifyMail)=>{
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
    subject:`ALVENT: HEY!,${veriName} VERIFY YOUR ACCOUNT`,
    text:`<br><br>HERE IS THE TOKEN:<h2>${OtpGen}</h2>     `,
    html:`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP Verifcation</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            background: #e3e6eb;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #f5f7fa;
            border-radius: 8px;
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #1e3c72, #2a5298);
            padding: 20px;
            text-align: left;
        }
        .header img {
            width: 120px;
        }
        .content {
            padding: 30px;
            background: #fff;
            text-align: center;
        }
        .content h2 {
            font-size: 22px;
            color: #333;
            margin-bottom: 10px;
        }
        .content p {
            font-size: 16px;
            color: #666;
        }
        .code {
            font-size: 24px;
            font-weight: bold;
            color: #2a5298;
            margin: 20px 0;
        }
        .footer {
            padding: 20px;
            text-align: center;
            font-size: 14px;
            background: #f5f7fa;
            color: #555;
        }
        .footer a {
            color: #2a5298;
            text-decoration: none;
            font-weight: bold;
        }
        .social-icons {
            margin-top: 10px;
        }
        .social-icons img {
            width: 24px;
            margin: 0 5px;
        }
    </style>
</head>
<body>

    <div class="email-container">
        <!-- Header Section -->
        <div class="header">
            <img src="logo.png" alt="Alpha Event">
        </div>

        <!-- Main Content -->
        <div class="content">
            <h2>Hello ${veriName},</h2>
            <p>Please enter the code below to complete your login.</p>
            <p class="code">${OtpGen}</p>
            <p>If you did not authorize this login attempt,please ignore this notification and promptly contact our support team via email for immediate assistance at 
            <a href="mailto:support@alphaevents.com" style="color: #2a5298; font-weight: bold;">support@alphaevents.com</a></p>
        </div>

        <!-- Footer Section -->
        <div class="footer">
            <p>Need help? Ask at <a href="mailto:support@alphaevents.com">support@alphaevents.com</a> or visit our <a href="#">Help Center</a></p>
            <hr>
            <p><strong>Alpha Event</strong><br>Address 360, City, State.</p>

            <!-- Social Icons -->
            <div class="social-icons">
                <a href="#"><img src="facebook-icon.png" alt="Facebook"></a>
                <a href="#"><img src="twitter-icon.png" alt="Twitter"></a>
                <a href="#"><img src="linkedin-icon.png" alt="LinkedIn"></a>
            </div>

            <p>&copy; 2025 Company.</p>
        </div>
    </div>

</body>
</html>
`

}

const sendMailAtion= await botask.sendMail(sendingDetails)


 //console.log(sendMailAtion)
}

module.exports=verifyMailer