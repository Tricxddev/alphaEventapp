const mongoose = require("mongoose");
const ticktModel = require("../model/ticketDb");
const moment = require("moment");

const dashboardsalesFXN = async (req, res) => {
  try {
    const { userID } = req.params;
    const userObjId = new mongoose.Types.ObjectId(userID);

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

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
            $dateToString: { format: "%Y-%m-%d", date: "$purchaseDate" },
          },
          totalsales: { $sum: "$tickets.quantity" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const dailyPerformance = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(today.getFullYear(), today.getMonth(), day);
      // const formattedDate = date.toISOString().split("T")[0];
      const formattedDate = moment.utc(date).format("YYYY-MM-DD");

      const dailyData = tickets.find(ticket => ticket._id === formattedDate);

      dailyPerformance.push({
        // rawDate: formattedDate,
        day_date: moment.utc(date).format("MMMM D"),
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
