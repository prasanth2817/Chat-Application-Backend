import express from 'express';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import AppRoutes from './src/Routes/index.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  }
});
const PORT = process.env.PORT || 8000;

export const getReceiverSocketId = (receiverId) => {
	return userSocketMap[receiverId];
};

const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId != "undefined") {
    userSocketMap[userId] = socket.id;
  }

  // Emit the list of online users
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Join a private room
  socket.on("joinRoom", ({ sender, receiver }) => {
    const room = [sender, receiver].sort().join('-');
    socket.join(room);
    console.log(`${sender} has joined the room with ${receiver}`);
  });

  // Send and receive messages
  socket.on("sendMessage", (message) => {
    const { sender, receiver, text } = message;
    const room = [sender, receiver].sort().join('-');
    io.to(room).emit("receiveMessage", { sender, text });
    console.log(`Message from ${sender} to ${receiver}: ${text}`);
  });

  // Notify typing status
  socket.on("typing", ({ sender, receiver }) => {
    const room = [sender, receiver].sort().join('-');
    io.to(room).emit("notifyTyping", `${sender} is typing...`);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});



app.use(express.json());
app.use(cors());
app.use("/", AppRoutes);

server.listen(PORT, () => console.log(`server listening to the port ${PORT}`));


