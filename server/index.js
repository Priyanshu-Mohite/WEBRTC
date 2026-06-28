const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    // Deploy hone ke baad isko frontend Render URL se replace karna
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use(bodyParser.json());

const emailToSocketMapping = new Map();
const socketToEmailMapping = new Map();

io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);

  socket.on("join-room", ({ roomId, email }) => {
    console.log(`${email} joined ${roomId}`);

    emailToSocketMapping.set(email, socket.id);
    socketToEmailMapping.set(socket.id, email);

    socket.join(roomId);

    socket.emit("joined-room", { roomId });
    socket.broadcast.to(roomId).emit("user-connected", email);
  });

  socket.on("call-user", ({ email, offer }) => {
    const socketId = emailToSocketMapping.get(email);
    const from = socketToEmailMapping.get(socket.id);

    if (socketId) {
      io.to(socketId).emit("incomming-call", {
        from,
        offer,
      });
    }
  });

  socket.on("call-accept", ({ email, answer }) => {
    const socketId = emailToSocketMapping.get(email);

    if (socketId) {
      io.to(socketId).emit("call-accept", {
        answer,
      });
    }
  });

  socket.on("disconnect", () => {
    const email = socketToEmailMapping.get(socket.id);

    if (email) {
      emailToSocketMapping.delete(email);
      socketToEmailMapping.delete(socket.id);
    }

    console.log("Disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});