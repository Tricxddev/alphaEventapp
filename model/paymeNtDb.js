const mongoose =require("mongoose")
const ticketDB=require("./ticketDb")

const paymentSchema= new mongoose.Schema({
    paymentID:{type:String,required:true},
    eventID:{type:String},
      tickets: [
    {
      _id: { type: mongoose.Schema.Types.ObjectId, required: true },
      ticketType:{type:String,required:true,enum:["Regular","VIP","Early Bird"]},
    //   ticketPrice: { type: Number, required: true },
      ticketID: {type:String},
      quantity: {type:Number}
    }
  ],
    email: {type: String,required: true},
    totalPurchase: {type: Number,required: true,default:0},
    paymentStatus:{type:String,required:true,enum:["completed","pending","failed"],default:"pending"},
    payMethod:{type:String,default:"Paystack"},
    trnsctnDT:{type:Date,required:true}

},{timestamps:true})

const paymentModel = new mongoose.model("paymentModel",paymentSchema)

module.exports=paymentModel