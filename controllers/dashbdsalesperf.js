const mongoose = require("mongoose");
const ticktModel = require("../model/ticketDb");
// const moment = require("moment");
const moment = require("moment-timezone");

const dashboardsalesFXN = async (req, res) => {
  try {
    const { userID } = req.params;
    const userObjId = new mongoose.Types.ObjectId(userID);

    // const today = new Date();
    const today = moment().tz("Africa/Lagos");
    // const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    // const startOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const startOfMonth = today.clone().startOf("month").toDate(); 
    const startOfNextMonth = today.clone().add(1, "month").startOf("month").toDate();
          console.log(startOfMonth)

    const tickets = await ticktModel.aggregate([
      {
        $match: {
          userId: userObjId,
          purchaseDate: {
            $gte: startOfMonth,
            $lt: startOfNextMonth,
          },
        },
      },
      { $unwind: "$tickets" },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$purchaseDate" ,timezone: "Africa/Lagos"},
          },
          totalsales: { $sum: "$tickets.quantity" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const daysInMonth = today.daysInMonth();
    const dailyPerformance = [];

    for (let day = 1; day <= daysInMonth; day++) {
      // const date = new Date(today.getFullYear(), today.getMonth(), day);
      const date = today.clone().startOf("month").add(day - 1, "days");
      // const formattedDate = date.toISOString().split("T")[0];

      // const formattedDate = moment.utc(date).format("YYYY-MM-DD");
      const formattedDate = date.format("YYYY-MM-DD");

      const dailyData = tickets.find(ticket => ticket._id === formattedDate);

      dailyPerformance.push({
        // rawDate: formattedDate,
        // day_date: moment.utc(date).format("MMMM D"),
        day_date: date.format("MMMM D"),
        day_totalsales: dailyData ? dailyData.totalsales : 0,
      });
    }

    res.status(200).json({
      msg: "SUCCESSFUL",
      Performance: dailyPerformance,
    });
  } catch (error) {
    console.error("Error fetching monthly performance:", error);
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

module.exports = { dashboardsalesFXN };
