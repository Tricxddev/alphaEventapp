cron=require("node-cron")
const monthlyEvents= require("../middleware/subscriberDigests")
const mongoose = require("mongoose");

cron.schedule('0 8 1 * *', async () => {
// cron.schedule('*/50 * * * * *', async () => {
  console.log('Running monthly event digest job...');
    try {
    await monthlyEvents({
      // Minimal mock req and res
      
        status: (code) => ({
          json: (data) => console.log(`Status ${code}:`, data)
        })
      
    });
    } catch (error) {
        console.error('Error running monthly event digest job:', error);
    }
})