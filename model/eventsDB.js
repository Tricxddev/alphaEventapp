const mongoose =require("mongoose")
const {orgORGmodel,indiOrgModel,allUserModel}=require("../model/organizerDB")

const eventSchema = new mongoose.Schema({

    eventID: { type: String,  unique: true },
    eventTitle: { type: String,  maxlength: 50 },
    eventDesc: {type: String,  maxlength: 100},
    eventCapacity: { type: Number},
    eventTags: [{type: String}],
    eventType: { type: String, 
        enum: ["Virtual", "Physical"], 
        },
    eventCategory: { 
        type: String, 
        enum: ["Premium", "Education", "Attractions", "Entertainment", "Sports"], 
        },
    eventDate: {
        eventStart: { type: String },
        eventEnd: { type: String },
        startTimezone: { type: String },
        endTimezone: { type: String }
            },

    eventTime: {
        start: { type: String}, // Store as "HH:MM"
        end: { type: String },
        startClock: { type: String, enum: ["AM", "PM"] },
        endClock: { type: String, enum: ["AM", "PM"] }
        },
       
    venueInformation: {
        eventCountry: { type: String},
        eventState: { 
            type: String,
            // enum:  [
            //     "Abia", "Abuja", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", 
            //     "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo", "Jigawa", 
            //     "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", 
            //     "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara" 
            //   ]
        },
        eventCity: { type: String },
        address: { type: String },
        url: { type: String },
    },
    // contactDetail: {
    //     name: { type: String},
    //     email: { type: String},
    //     phoneNumber: { type: String },
    // },
    socialDetail: {
        fb: { type: String},
        inst: { type: String},
    },
  
    promotion : {type: String},
    
    tickets: [
        {
        ticketType:{
            type: String, 
            enum: ["Early Bird", "Regular", "VIP"], 
            },
        PriceType: {
            type: String,
            enum: ["Free","Paid"],
            
        },
        ticketPrice: { type: Number,   },
        quantity: { type: Number   },
        sold:{type: Number,default:0}
        }
    ],
    
    featured: { type: Boolean, default: false },
    eventImgURL: { type: String, }, // Cloudinary Image URL
    subscribers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subscriber" }],
    clicks: { type: Number, default: 0 },
    orgID: {type:mongoose.Schema.Types.ObjectId,ref:"indiOrgModel"},
    userID: {type:mongoose.Schema.Types.ObjectId,ref:"allUserModel"},
    organizerName: {type: String},
    ticketsSold: { type: Number, default: 0 },
    ticketIDs: [{ type:String , unique: true }], 

}, { timestamps: true });



const eventModel= new mongoose.model("eventModel",eventSchema)

module.exports=eventModel