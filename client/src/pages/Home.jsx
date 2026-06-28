import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom"; // Yeh yahan se aana chahiye
import { useSocket } from "../providers/Socket";

function Home() {
  const [email, setEmail] = useState("");
  const [roomCode, setRoomCode] = useState("");

  const socket = useSocket();
  const navigate = useNavigate();

  const handleRoomJoined = useCallback(
    async ({ roomId }) => {
      console.log("Joined room with ID: ", roomId);
      navigate(`/room/${roomId}`);
    },
    [navigate],
  );

  useEffect(() => {
    // Initialize socket connection if needed
    socket.on("joined-room", handleRoomJoined);

    return () => {
      socket.off("joined-room", handleRoomJoined);
    };
  }, [socket]);

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log({
      email,
      roomCode,
    });

    // Socket ya API call yaha karenge
    socket.emit("join-room", { roomId: roomCode, email });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-8 shadow-2xl">
        <h1 className="text-3xl font-bold text-white text-center">
          Join Video Room
        </h1>

        <p className="text-slate-400 text-center mt-2">
          Enter your email and room code to continue.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="block text-sm text-slate-300 mb-2">Email</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">
              Room Code
            </label>

            <input
              type="text"
              placeholder="Enter room code"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Join Room
          </button>
        </form>
      </div>
    </div>
  );
}

export default Home;
