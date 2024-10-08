import express from 'express';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import Cors from 'cors';
import AppRoutes from './src/Routes/index.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});
const PORT = process.env.PORT || 8000;

// io.on("connection", (socket) => {
//   console.log("A magic bird is ready to deliver the messages");

//   socket.on("joinPerson", (person) => {
//     socket.join(person);
//     console.log(`bird has joined the person ${person}`);
//   });

//   socket.on("sendMessage", (message) => {
//     io.to(message.person).emit("receiveMessage", message);
//     console.log("message :" ,message.text,`From ${message.person} :` ,message.person);
    
//   });

//   socket.on("typing", (person) => {
//     io.to(person).emit("notifyTyping", `${person} is typing...`);
//   });

//   socket.on("disconnect", () => {
//     console.log("connection is disconnected");
//   });
// });

io.on("connection", (socket) => {
  console.log("A user has connected");

  // Join a private room for the conversation between two users
  socket.on("joinRoom", ({ sender, receiver }) => {
    const room = [sender, receiver].sort().join('-');  // Unique room identifier
    socket.join(room);
    console.log(`${sender} has joined the room with ${receiver}`);
  });

  // Handle sending a message in the private room
  socket.on("sendMessage", (message) => {
    const { sender, receiver, text } = message;
    const room = [sender, receiver].sort().join('-');  // Unique room identifier
    io.to(room).emit("receiveMessage", { sender, text });
    console.log(`Message from ${sender} to ${receiver}: ${text}`);
  });

  socket.on("typing", ({ sender, receiver }) => {
    const room = [sender, receiver].sort().join('-');
    io.to(room).emit("notifyTyping", `${sender} is typing...`);
  });

  socket.on("disconnect", () => {
    console.log("A user has disconnected");
  });
});


app.use(express.json());
app.use(Cors());
app.use("/", AppRoutes);

server.listen(PORT, () => console.log(`server listening to the port ${PORT}`));


