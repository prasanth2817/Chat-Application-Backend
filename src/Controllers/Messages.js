import Message from '../Models/Messages.js';

// Controller to create a new message
const createMessages = async (req, res) => {
  const { person, text } = req.body;

  // Check if person and text are provided
  if (!person || !text) {
    return res.status(400).json({ message: "Person and message text are required." });
  }

  try {
    // Create and save the new message
    const message = { person, text };
    await saveMessage(message);  // Call the function to save the message to the database
    res.status(201).json({ message: "Message sent successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controller to fetch messages for a specific person
const getMessages = async (req, res) => {
  try {
    const personId = req.params.personId;

    // Call the function to fetch message history
    const messages = await getMessageHistory(personId);
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Utility function to fetch message history
const getMessageHistory = async (person) => {
  try {
    const messages = await Message.find({ person }).sort({ timestamp: 1 });
    return messages;
  } catch (error) {
    throw new Error("Error fetching message history");
  }
};

// Utility function to save a new message to the database
const saveMessage = async (message) => {
  try {
    const newMessage = new Message({
      person: message.person,
      text: message.text,
    });
    await newMessage.save();
  } catch (error) {
    throw new Error("Error saving message");
  }
};

export default {
  createMessages,
  getMessages,
  getMessageHistory,
  saveMessage
};

