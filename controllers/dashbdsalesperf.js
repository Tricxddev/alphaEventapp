const mongoose = require("mongoose");
const ticktModel = require("../model/ticketDb");
const moment = require("moment");

const dashboardsalesFXN=async(req,res)=>{
  try {
  const { userID } = req.params;
  const today= new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  //console.log("startOfMonth:",startOfMonth)
  const tickets = await ticktModel.aggregate([
    {
      $match: {
        userId: userID,
        purchaseDate: {
          $gte: startOfMonth,
          $lt: startOfNextMonth
        }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: {format: "%Y-%m-%d", date: "$purchaseDate" }
        },
        totalsales:{ $sum:"$ticketQty"},
        // totalTicketsSold: { $sum: 1 },
        // totalRevenue: { $sum: "$ticketPrice" }
      }
    },
    {
      $sort: { _id: 1 } // Sort by date
    }
  ]);
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const dailyPerformance =[];
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(today.getFullYear(), today.getMonth(), day);
    const formattedDate = date.toISOString().split("T")[0];
    const dailyData = tickets.find(ticket => ticket._id === formattedDate);

    dailyPerformance.push({
      date: formattedDate,
      date:moment(date).format('MMMM D'),
      totalsales: dailyData ? dailyData.totalsales : 0
      // totalTicketsSold: dailyData ? dailyData.totalTicketsSold : 0,
      // totalRevenue: dailyData ? dailyData.totalRevenue : 0
    });
  }
  res.status(200).json({
    msg: "SUCCESSFUL",
    Performance: dailyPerformance
  });
  } catch (error) {
    console.error("Error fetching monthly performance:", error);
    res.status(500).json({ msg: "Server Error", error: error.message });
    
  }
}
module.exports = { dashboardsalesFXN };
