const express = require("express");
const bodyParser = require("body-parser");
const { Server } = require("socket.io");

const io = new Server({
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});
const app = express();

app.use(bodyParser.json());

const emailtosocketmapping = new Map();
const socketToEmailmapping = new Map();

io.on("connection", (socket) => {
  console.log("New user connected with socket id: ", socket.id);
  socket.on("join-room", ({ roomId, email }) => {
    console.log("User connected with email: ", email);
    emailtosocketmapping.set(email, socket.id);
    socketToEmailmapping.set(socket.id, email);

    socket.join(roomId);
    socket.emit("joined-room", { roomId });
    socket.broadcast.to(roomId).emit("user-connected", email);
  });

  socket.on("call-user", ({ email, offer }) => {
    const socketId = emailtosocketmapping.get(email);
    const fromEmail = socketToEmailmapping.get(socket.id);
    socket.to(socketId).emit("incomming-call", { from: fromEmail, offer });
  });

  socket.on("call-accept", ({ email, answer }) => {
    const socketId = emailtosocketmapping.get(email);
    socket.to(socketId).emit("call-accept", { answer });
  });
});

app.listen(8000, () => console.log("Http server running at PORT 8000"));
io.listen(8001);
