const mongoose = require('mongoose');

const subsciberSchema= new mongoose.Schema({
    email: {type: String, required: true},
    subscribed: {type: Boolean, default: false},
},{timestamps: true});

const subscriberModel = new mongoose.model('subscriberModel', subsciberSchema);

module.exports = subscriberModel;