const express = require("express")
const mongoose =require("mongoose")
const subscriberModel=require("../model/subscriberDB")
const sendSubConfirmatn=require("../services/subscribeMailer");

const SUBSCRIBERFXN= async(req,res)=>{
  try {
    console.log("SUBSCRIBER:",req.body)
    const {email}=req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ msg: "Invalid email format" });
    }
    const findSubscriber= await subscriberModel.findOne({email});

    if(!findSubscriber){
    await subscriberModel.create({
      email:email,
      subscribed:true
    })

    await sendSubConfirmatn(email)

    return res.status(200).json({msg:"SUBSCRIBED SUCCESSFULLY"});
  }
      
    if(findSubscriber.subscribed === true ){
      return res.status(409).json({msg:"YOU ARE ALREADY A SUBSCRIBER OF THIS PLATFORM"})}
    else{
      await subscriberModel.findOneAndUpdate(
        {email:email},
        {subscribed:true},
        {new:true}
      )

     return res.status(200).json({msg:"SUBSCRIPTION REACTIVATED"})
    }
}catch(err){res.status(400).json({msg:err.message})}
}

const UNSUBSCRIBERFXN= async(req,res)=>{
  try {
    const {email}=req.body
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ msg: "Invalid email format" });
    }
    const findSubscriber= await subscriberModel.findOne({email:email})

    if(findSubscriber.subscribed === false ){
      return res.status(409).json({msg:"YOU ARE NO MORE A SUBSCRIBER OF THIS PLATFORM"})}
    if(findSubscriber.subscribed === true){
      await subscriberModel.findOneAndUpdate(
        {email:email},
        {subscribed:false},
        {new:true}
      )
      return res.status(200).json({msg:"SUBSCRIPTION DEACTIVATED"})
    }
   //const sendsubMail= await sendSubConfirmatn(email)
    if(!sendsubMail){
      return res.status(400).json({msg:"ERROR IN SENDING MAIL"})
    }

  }catch(err){res.status(400).json({msg:err.message})}
}

module.exports={
  SUBSCRIBERFXN,
  UNSUBSCRIBERFXN
}