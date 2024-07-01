// controllers/messageController.js
const MessageRes = require("../model/EmpAdminSenderModel.js");
const { use } = require("../routes/messageRoutes.js");
const { uploadOnCloudinary } = require("../utils/cloudinary.js");
const { ObjectId } = require("mongodb");
const fs = require("fs");
const Notification = require("../model/notificationModel.js");
const cron = require("node-cron");

const createMessage = async (req, res) => {
  const { sender, recipient, text } = req.body;

  try {
    let content = { text };

    // Upload image if it exists
    const hasImage = req.files && req.files.image;
    const hasDocument = req.files && req.files.document;
    const hasVideo = req.files && req.files.video;

    if (hasImage) {
      const imageLocalPath = req.files.image[0].path;
      if (!fs.existsSync(imageLocalPath)) {
        console.error(`Image file does not exist at path: ${imageLocalPath}`);
        return res
          .status(400)
          .json({ error: `Image file not found at path: ${imageLocalPath}` });
      }
      const imageUploadResult = await uploadOnCloudinary(imageLocalPath);
      if (!imageUploadResult || !imageUploadResult.url) {
        console.error(
          "Image upload failed:",
          imageUploadResult?.error || "Unknown error"
        );
        return res
          .status(400)
          .json({ error: "Image upload failed. Please try again." });
      }
      content.image = imageUploadResult.url;
    }

    if (hasDocument) {
      const documentLocalPath = req.files.document[0].path;
      if (!fs.existsSync(documentLocalPath)) {
        console.error(
          `Document file does not exist at path: ${documentLocalPath}`
        );
        return res.status(400).json({
          error: `Document file not found at path: ${documentLocalPath}`,
        });
      }
      const documentUploadResult = await uploadOnCloudinary(documentLocalPath);
      if (!documentUploadResult || !documentUploadResult.url) {
        console.error(
          "Document upload failed:",
          documentUploadResult?.error || "Unknown error"
        );
        return res
          .status(400)
          .json({ error: "Document upload failed. Please try again." });
      }
      content.document = documentUploadResult.url;
    }

    if (hasVideo) {
      const videoLocalPath = req.files.video[0].path;
      if (!fs.existsSync(videoLocalPath)) {
        console.error(`Video file does not exist at path: ${videoLocalPath}`);
        return res
          .status(400)
          .json({ error: `Video file not found at path: ${videoLocalPath}` });
      }
      const videoUploadResult = await uploadOnCloudinary(videoLocalPath);
      if (!videoUploadResult || !videoUploadResult.url) {
        console.error(
          "Video upload failed:",
          videoUploadResult?.error || "Unknown error"
        );
        return res
          .status(400)
          .json({ error: "Video upload failed. Please try again." });
      }
      content.video = videoUploadResult.url;
    }

    const message = new MessageRes({
      sender,
      recipient,
      content,
    });

    await message.save();

    const notification = new Notification({
      sender,
      recipient,
      content,
    });

    const result = await notification.save();
    res.status(201).json({ message: "Message sent", data: message });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// const getMessagesEmp = async (req, res) => {
//   const { userId1, userId2 } = req.params;

//   if (!ObjectId.isValid(userId1) || !ObjectId.isValid(userId2)) {
//     return res.status(400).json({ message: "Invalid user IDs" });
//   }

//   try {
//     const twoHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000); // 2 hours in milliseconds

//     const messages = await MessageRes.find({
//       $or: [
//         {
//           sender: userId1,
//           recipient: userId2,
//           createdAt: { $gte: twoHoursAgo },
//         },
//         {
//           sender: userId2,
//           recipient: userId1,
//           createdAt: { $gte: twoHoursAgo },
//         },
//       ],
//     }).sort({ createdAt: 1 });

//     res.status(200).json(messages);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// Define the deletion logic

const getMessagesEmp = async () => {
  const now = new Date();
  const fifteenMinutesAgo = new Date(now - 15 * 60 * 1000);
  const twelveHoursAgo = new Date(now - 2 * 60 * 1000);

  try {
    // Update records with media content older than 15 minutes
    await MessageRes.updateMany(
      {
        $or: [
          {
            "content.image": { $exists: true, $ne: null },
            updatedAt: { $lte: fifteenMinutesAgo },
          },
          {
            "content.document": { $exists: true, $ne: null },
            updatedAt: { $lte: fifteenMinutesAgo },
          },
          {
            "content.video": { $exists: true, $ne: null },
            updatedAt: { $lte: fifteenMinutesAgo },
          },
        ],
      },
      {
        $unset: {
          "content.image": "",
          "content.document": "",
          "content.video": "",
        },
      }
    );

    // Update records with text content older than 12 hours by setting a flag or clearing content
    await MessageRes.updateMany(
      {
        $or: [
          {
            "content.text": { $exists: true, $ne: null },
            updatedAt: { $lte: twelveHoursAgo },
          },
          {
            "content.originalMessage": { $exists: true, $ne: null },
            updatedAt: { $lte: twelveHoursAgo },
          },
          {
            "content.replyMsg": { $exists: true, $ne: null },
            updatedAt: { $lte: twelveHoursAgo },
          },
        ],
      },
      {
        $set: {
          // You can set a flag or clear the content fields as needed
          // Example: Set a flag indicating the message is outdated
          isOutdated: true,
        },
        // Or you could use $unset to clear specific fields
        // $unset: { "content.text": "", "content.originalMessage": "", "content.replyMsg": "" },
      }
    );
  } catch (error) {
    console.error("Error updating old messages:", error);
  }
};

// Schedule the task
cron.schedule("* * * * *", getMessagesEmp, {
  scheduled: true,
  timezone: "Asia/Kolkata",
});

const getAdminMessages = async (req, res) => {
  const { userId1, userId2 } = req.params;

  if (!ObjectId.isValid(userId1) || !ObjectId.isValid(userId2)) {
    return res.status(400).json({ message: "Invalid user ids" });
  }

  try {
    const messages = await MessageRes.find({
      $or: [
        { sender: userId1, recipient: userId2 },
        { sender: userId2, recipient: userId1 },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getAllEmployee = async (req, res) => {
  try {
    const user = await MessageRes.find();
    if (!user) {
      res.status(400).json({ message: error.message || "user is not exists" });
    }

    res
      .status(200)
      .json(user, { message: "use fetch sucessfully", suceess: true });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
const getAllEmployeeById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await MessageRes.findById({ _id: id });
    if (!user) {
      res.status(400).json({ message: error.message || "user is not exists" });
    }

    res
      .status(200)
      .json(user, { message: "use fetch sucessfully", suceess: true });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const markMessagesRead = async (req, res) => {
  const userId = req.params.userId;
  try {
    // console.log(`Received userId: ${userId}`);
    const recipientObjectId = new ObjectId(userId);
    // console.log(`Converted to ObjectId: ${recipientObjectId}`);

    const result = await MessageRes.aggregate([
      {
        $match: {
          recipient: recipientObjectId,
        },
      },
      {
        $sort: {
          updatedAt: -1, // Sort by updatedAt in descending order
        },
      },
      {
        $limit: 1, // Limit the result to one document
      },
    ]);

    // if (result.length === 0) {
    //   console.log('No matching messages found.');
    // }

    res.json(result);
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const markMessagesReadEmp = async (req, res) => {
  const userId = req.params.userId;
  try {
    // console.log(`Received userId: ${userId}`);
    const recipientObjectId = new ObjectId(userId);
    // console.log(`Converted to ObjectId: ${recipientObjectId}`);

    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours in milliseconds

    const result = await MessageRes.aggregate([
      {
        $match: {
          recipient: recipientObjectId,
          createdAt: { $gte: twoHoursAgo },
        },
      },
      {
        $sort: {
          updatedAt: -1, // Sort by updatedAt in descending order
        },
      },
      {
        $limit: 1, // Limit the result to one document
      },
    ]);

    // if (result.length === 0) {
    //   console.log('No matching messages found.');
    // }

    res.json(result);
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const forwardMessage = async (req, res) => {
  try {
    const { messageId, newRecipients } = req.body;
    console.log(newRecipients);
    const originalMessage = await MessageRes.findById(messageId);

    if (!originalMessage) {
      return res.status(404).json({ error: "Message not found" });
    }

    const forwardedMessages = await Promise.all(
      newRecipients.map(async (recipient) => {
        const forwardedMessage = new MessageRes({
          sender: originalMessage.sender,
          recipient: [recipient], // Store recipients as an array
          content: originalMessage.content,
        });
        await forwardedMessage.save();
        return forwardedMessage;
      })
    );

    res.status(201).json(forwardedMessages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const replyToMessage = async (req, res) => {
  try {
    const { parentMessageId, sender, recipient, text, image, document, video } =
      req.body;

    // Find the parent message by ID
    const parentMessage = await MessageRes.findById(parentMessageId);

    // Check if the parent message exists
    if (!parentMessage) {
      return res.status(404).json({ error: "Parent message not found" });
    }

    // Create the reply message
    const replyMessage = new MessageRes({
      sender,
      recipient,
      content: {
        text,
        image,
        document,
        video,
        originalMessage:
          parentMessage.content.text ||
          parentMessage.content.originalMessage ||
          "",
      },
      parentMessage: parentMessageId, // Reference to the parent message
    });

    // Save the reply message
    await replyMessage.save();

    res.status(201).json(replyMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createMessage,
  getMessagesEmp,
  getAdminMessages,
  getAllEmployee,
  getAllEmployeeById,
  markMessagesRead,
  markMessagesReadEmp,
  forwardMessage,
  replyToMessage,
};
