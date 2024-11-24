const mongoose =require("mongoose")
const ticketDB=require("./ticketDb")

const paymentSchema= new mongoose.Schema({
    paymentID:{type:String,required:true},
    ticketID:{type:mongoose.Schema.Types.ObjectId,ref:"ticktsModel"},
    payAmount:{type:Number,required:true,default:0},
    paymentStatus:{type:String,required:true,enum:["completed","pending","failed"],default:"pending"},
    payMethod:{type:String,required:true,default:"stripe"},
    trnsctnID:{type:String,required:true},
    trnsctnDT:{type:Date,required:true}

},{timestamps:true})

const paymentModel = new mongoose.model("paymentModel",paymentSchema)

module.exports=paymentModel