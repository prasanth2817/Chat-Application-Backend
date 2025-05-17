import Message from "../Models/Messages.js";
import User from "../Models/Users.js";
import Conversation from "../Models/Conversation.js";
import { getReceiverSocketId } from "../../index.js";

// // Controller to create a new message

const sendMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    // Check if a conversation exists between sender and receiver
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    // Create new conversation if one doesn't exist
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    // Create a new message
    const newMessage = new Message({
      senderId,
      receiverId,
      content,
    });

    // Add the new message to the conversation
    if (newMessage) {
      conversation.messages.push(newMessage._id);
    }

    // Save conversation and message in parallel
    await Promise.all([conversation.save(), newMessage.save()]);

    // Get the socket ID of the receiver
    const receiverSocketId = getReceiverSocketId(receiverId);

    // If the receiver is online, emit the new message via socket.io
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    // Send the message response
    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessage controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Controller to fetch chat history for a specific user
const getMessages = async (req, res) => {
  try {
    const { userId } = req.params; // Get the user ID from the request parameters
    const senderId = req.user._id; // Get logged-in user's ID

    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, userId] },
    }).populate("messages"); // Fetch messages related to the conversation

    if (!conversation) return res.status(200).json([]);

    const messages = conversation.messages;
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id; // Get logged-in user's ID

    // Find all conversations that involve the logged-in user
    const conversations = await Conversation.find({
      participants: { $in: [loggedInUserId] },
    });

    // Extract unique user IDs of other participants from these conversations
    const otherUsers = new Set();

    conversations.forEach((conversation) => {
      conversation.participants.forEach((participantId) => {
        if (participantId.toString() !== loggedInUserId.toString()) {
          otherUsers.add(participantId.toString());
        }
      });
    });

    // Convert Set to Array for querying
    const userIds = Array.from(otherUsers);

    // Fetch user details excluding the password
    const users = await User.find({
      _id: { $in: userIds },
    }).select("-password");

    // Return the users for the sidebar
    res.status(200).json(users);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const CreateConversation = async (req, res) => {
  try {
    const { userId } = req.params; // Get the user ID from the request parameters
    const senderId = req.user._id; // Get logged-in user's ID

    // Check if a conversation already exists between the two users
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, userId] },
    }).populate("messages"); // Fetch messages related to the conversation

    // If no conversation exists, create a new one with the participants
    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, userId],
        messages: [], // Initialize with no messages
      });
      await conversation.save();
      return res
        .status(201)
        .json({ conversationId: conversation._id, messages: [] });
    }

    // Respond with the conversation and messages, or empty array if no messages yet
    return res
      .status(200)
      .json({
        conversationId: conversation._id,
        messages: conversation.messages,
      });
  } catch (error) {
    console.error("Error in getMessagesOrCreateConversation: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default {
  sendMessage,
  getMessages,
  getUsersForSidebar,
  CreateConversation,
};



//Controller to Get the Chats for Sidebar

// const getUsersForSidebar = async (req, res) => {
//   try {
//     const loggedInUserId = req.user._id; // Get logged-in user's ID

//     // Find distinct users who have chatted with the logged-in user

//     const senderUsers = await Message.distinct("senderId", {
//       receiverId: loggedInUserId,
//     });

//     const receiverUsers = await Message.distinct("receiverId", {
//       senderId: loggedInUserId,
//     });

//     // Combine the results from both distinct calls
//     const chatUsers = [...new Set([...senderUsers, ...receiverUsers])]; // Combine and ensure unique users

//     // Remove logged-in user ID from the result
//     const filteredUserIds = chatUsers.filter(
//       (userId) => userId.toString() !== loggedInUserId.toString()
//     );

//     // Fetch user details excluding the password
//     const filteredUsers = await User.find({
//       _id: { $in: filteredUserIds },
//     }).select("-password");

//     res.status(200).json(filteredUsers);
//   } catch (error) {
//     console.error("Error in getUsersForSidebar: ", error.message);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };