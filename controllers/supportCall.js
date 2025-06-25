const SupportModel = require("../model/supportDB");
const sendSupportMail = require("../services/supportMailtouser");

const supportFXN = async (req, res) => {
  try {
    const {
      userName,
      userEmail,
      phone,
      ticketID,
      issueCategory,
      message,
      imgUrl
    } = req.body;


    if (!userName|| !issueCategory || !message || !userEmail) {
      return res.status(400).json({ message: "FILL IMPORTANT FIELDS!!!" });
    }

    const convtName = userName.toUpperCase();

    const generateSupportID = async () => {
      const existingIDs = await SupportModel.distinct("supportID");
      const numbers = "0123456789";
      let newID;
      do {
        newID = `SPT-${Array.from({ length: 5 }, () =>
          numbers.charAt(Math.floor(Math.random() * numbers.length))
        ).join("")}`;
      } while (existingIDs.includes(newID));
      return newID;
    };

    // Make sure to call the function to get the generated ID
    const supportID = await generateSupportID();

    const newSupport = new SupportModel({
      supportID,
      userName: convtName,
      userEmail,
      phone,
      ticketID,
      issueCategory,
      message,      
      img: imgUrl
    });

    await newSupport.save();

    await SupportModel.updateOne(
      { supportID:supportID },
        { $set: { supportStatus: "Open" } }
    );
    // Send email to user
    await sendSupportMail(userEmail, supportID);
    return res.status(201).json({
      message: "Support ticket created successfully, and would be attended to asap.",
      support: newSupport,
    });

  } catch (error) {
    console.error("Signup error:", error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation failed',
        details: Object.values(error.errors).map(err => err.message)
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        error: 'Duplicate entry',
        details: error.keyValue
      });
    }

    res.status(500).json({ error: 'Failed to save data', details: error.message });
  }
};

// const updateSupportStatus = async (req, res) => {
//   try {
//     const { supportStatus } = req.body;
//     const { supportID } = req.params;

//     // Validate support ID and existence
//     const support = await SupportModel.findOne({ supportID });
//     if (!support) {
//       return res.status(404).json({ message: "Support not found" });
//     }

//     // Update supportStatus if provided
//     if (supportStatus !== undefined) {
//       support.supportStatus = supportStatus;
//     }

//     // Save the updated support document
//     await support.save();

//     res.status(200).json({
//       message: "Support Status updated successfully",
//       support // Return the updated support object
//     });
//   } catch (error) {
//     console.error("Error updating support status:", error);
//     res.status(500).json({ message: "Error updating support status", error });
//   }
// };

module.exports = {
  supportFXN
};