import express from "express";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import AppRoutes from "./src/Routes/index.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
const PORT = process.env.PORT || 8000;

const userSocketMap = {};

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);

  // Retrieve the userId from the query parameter
  const userId = socket.handshake.query.userId;

  // Check if userId is valid before storing in userSocketMap
  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  // Emit the list of online users only to the connected client
  socket.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Notify all clients about the new user connection
  io.emit("userConnected", userId);

  // Join a private room between sender and receiver
  socket.on("joinRoom", ({ sender, receiver }) => {
    const room = [sender, receiver].sort().join("-");
    socket.join(room, () => {
      console.log(`${sender} has joined the room with ${receiver}`);
    });
  });

  // Handle sending and receiving messages
  socket.on("sendMessage", (message) => {
    const { sender, receiver, text } = message;
    const room = [sender, receiver].sort().join("-");
    io.to(room).emit("receiveMessage", { sender, text });
    console.log(`Message from ${sender} to ${receiver}: ${text}`);
  });

  // Notify other users when a user is typing
  socket.on("typing", ({ sender, receiver }) => {
    const room = [sender, receiver].sort().join("-");
    io.to(room).emit("notifyTyping", `${sender} is typing...`);
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);

    // Check if userId exists in userSocketMap before deleting
    if (userId && userSocketMap[userId]) {
      delete userSocketMap[userId];
    }

    // Notify all clients about the user disconnection
    io.emit("userDisconnected", userId);

    // Update the list of online users for all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

app.use(express.json());
app.use(cors());
app.use("/", AppRoutes);

server.listen(PORT, () => console.log(`server listening to the port ${PORT}`));
