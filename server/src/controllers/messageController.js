const Message = require("../model/messageModel.js");
const { ObjectId } = require("mongodb");
const fs = require("fs");
const { uploadOnCloudinary } = require("../utils/cloudinary.js");

const mongoose = require("mongoose");

const createMessage = async (req, res) => {
  const { sender, recipient, text, senderName, camera } = req.body;
  // console.log(camera)

  if (!sender || !recipient) {
    return res
      .status(400)
      .json({ message: "Sender and recipient are required." });
  }

  try {
    let content = { text, camera };

    // Check for files and upload if they exist
    const hasImage = req.files && req.files.image;
    const hasDocument = req.files && req.files.document;
    const hasVideo = req.files && req.files.video;

    if (hasImage) {
      const imageLocalPath = req.files.image[0].path;
      if (fs.existsSync(imageLocalPath)) {
        const imageUploadResult = await uploadOnCloudinary(imageLocalPath);
        if (imageUploadResult?.url) {
          content.image = imageUploadResult.url;
        } else {
          return res
            .status(400)
            .json({ error: "Image upload failed. Please try again." });
        }
      } else {
        return res
          .status(400)
          .json({ error: `Image file not found at path: ${imageLocalPath}` });
      }
    }

    if (hasDocument) {
      const documentLocalPath = req.files.document[0].path;
      if (fs.existsSync(documentLocalPath)) {
        const documentUploadResult = await uploadOnCloudinary(
          documentLocalPath
        );
        if (documentUploadResult?.url) {
          content.document = documentUploadResult.url;
        } else {
          return res
            .status(400)
            .json({ error: "Document upload failed. Please try again." });
        }
      } else {
        return res.status(400).json({
          error: `Document file not found at path: ${documentLocalPath}`,
        });
      }
    }

    if (hasVideo) {
      const videoLocalPath = req.files.video[0].path;
      if (fs.existsSync(videoLocalPath)) {
        const videoUploadResult = await uploadOnCloudinary(videoLocalPath);
        if (videoUploadResult?.url) {
          content.video = videoUploadResult.url;
        } else {
          return res
            .status(400)
            .json({ error: "Video upload failed. Please try again." });
        }
      } else {
        return res
          .status(400)
          .json({ error: `Video file not found at path: ${videoLocalPath}` });
      }
    }

    const message = new Message({
      sender,
      senderName,
      recipient,
      content,
    });

    await message.save();

    res.status(201).json({ message: "Message sent", data: message });
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(400).json({ message: error.message });
  }
};

const getMessages = async (req, res) => {
  const { userId1, userId2 } = req.params;

  if (!ObjectId.isValid(userId1) || !ObjectId.isValid(userId2)) {
    return res.status(400).json({ message: "Invalid user IDs" });
  }

  try {
    const messages = await Message.find({
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

const getMessagesByUser = async (req, res) => {
  const { userId1 } = req.params;

  if (!ObjectId.isValid(userId1)) {
    return res.status(400).json({ message: "Invalid user IDs" });
  }

  try {
    const messages = await Message.find({ recipient: userId1 }).sort({
      createdAt: 1,
    });

    res.status(200).json(messages);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteMessage = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedMessage = await Message.findByIdAndDelete(id);
    res.status(200).json({ message: "Message deleted", deletedMessage });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const unreadMessages = async (req, res) => {
  const { userId } = req.params;
  try {
    const unreadMessagesCount = await Message.countDocuments({
      recipient: userId,
      read: false,
    });
    res.status(200).json({ count: unreadMessagesCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const markMessagesRead = async (req, res) => {
  const { userId } = req.params;
  try {
    const recipientObjectId = new ObjectId(userId);

    const result = await Message.aggregate([
      {
        $match: {
          recipient: recipientObjectId,
        },
      },
      {
        $sort: {
          updatedAt: -1,
        },
      },
      {
        $limit: 1,
      },
    ]);

    res.json(result);
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const forwardMessage = async (req, res) => {
  try {
    const { messageId, newRecipients, sender } = req.body;
    console.log(newRecipients);
    const originalMessage = await Message.findById(messageId);

    if (!originalMessage) {
      return res.status(404).json({ error: "Message not found" });
    }

    const forwardedMessages = await Promise.all(
      newRecipients.map(async (recipient) => {
        const forwardedMessage = new Message({
          sender,
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
    const parentMessage = await Message.findById(parentMessageId);

    // Check if the parent message exists
    if (!parentMessage) {
      return res.status(404).json({ error: "Parent message not found" });
    }

    // Create the reply message
    const replyMessage = new Message({
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

const getuserAllMessages = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const messages = await Message.find({ recipient: userId }).sort({
      createdAt: -1,
    });
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getuserAllMessagesNotification = async (req, res) => {
  const userId = req.params.userId;

  // Validate the userId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  try {
    const messages = await Message.find({ recipient: userId }); // Fetch messages where recipient matches userId
    res.status(200).json(messages); // Send the messages as JSON response
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Internal server error" }); // Send 500 status code in case of error
  }
};
const deleteCameraImg = async (req, res) => {
  const { id } = req.params;

  try {
    // Find the message by id
    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Delete the camera image
    message.content.camera = null;

    // Save the updated message
    await message.save();

    res.status(200).json({ message: "Camera image deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = {
  createMessage,
  getMessages,
  deleteMessage,
  unreadMessages,
  markMessagesRead,
  forwardMessage,
  replyToMessage,
  getMessagesByUser,
  getuserAllMessages,
  getuserAllMessagesNotification,
  deleteCameraImg,
};
