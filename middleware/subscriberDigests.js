const subscriberModel=require("../model/subscriberDB")
const eventModel=require("../model/eventsDB")
const mongoose =require("mongoose")
const eventMailsender=require("../services/eventMailServ")

const monthlyEvents=async(res)=>{
    try {
        const presentDate = new Date();
        const onemonthAgo = presentDate.setMonth(presentDate.getMonth() - 1);
        const eventsAmonthAgo = await eventModel.find({ createdAt: { $gte: onemonthAgo } });
        if(eventsAmonthAgo.length === 0) {
            console.log("No events found in the last month");
        }
        const subcriberList= await subscriberModel.find({subscribed:true})
        if(subcriberList.length === 0) {
            console.log("No Active subscribers found");
        }
        const mailsub = await eventMailsender(subcriberList,eventsAmonthAgo)
        if(mailsub) {
            console.log("Monthly event digest sent successfully to all subscribers");
        } else {
            console.log("Failed to send event notifications");
        }
    } catch (err) {return res.status(500).json({ msg:err.message }) }
}
module.exports=monthlyEvents