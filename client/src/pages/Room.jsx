// import React, { useEffect, useCallback, useState } from "react";
// import { useSocket } from "../providers/Socket";
// import { usePeer } from "../providers/Peer";
// import ReactPlayer from "react-player";

// const Room = () => {
//   const socket = useSocket();
//   const { peer, createOffer, createAnswer, setRemoteAns } = usePeer();

//   const [myStream, setMyStream] = useState(null);

//   // useCallback taaki re-render par reference na badle
//   const handleUserJoined = useCallback(
//     async (email) => {
//       console.log("Arey user join ho gaya bhai: ", email);
//       const offer = await createOffer();

//       socket.emit("call-user", { email, offer });
//     },
//     [createOffer, socket],
//   );

//   const handleIncomingCall = useCallback(
//     async ({ from, offer }) => {
//       console.log("incomming call from", from, offer);
//       const answer = await createAnswer(offer);
//       socket.emit("call-accept", { email: from, answer });
//     },
//     [createAnswer, socket],
//   );

//   const handleCallAccept = useCallback(
//     async ({ answer }) => {
//       await setRemoteAns(answer);
//       console.log("call got accepted", answer);
//     },
//     [setRemoteAns],
//   );

//   const getUserMediaStream = useCallback(async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         audio: true,
//         video: true,
//       });
//       setMyStream(stream);
//     } catch (error) {
//       console.error("Camera access denied ya hardware error hai:", error);
//     }
//   }, []);

//   useEffect(() => {
//     // Agar socket nahi hai toh kuch mat kar
//     if (!socket) return;

//     // Sahi event name jo server bhej raha hai
//     socket.on("user-connected", handleUserJoined);

//     socket.on("incomming-call", handleIncomingCall);

//     socket.on("call-accept", handleCallAccept);

//     // Ye raha tera cleanup function (mat bhoolna aage se)
//     return () => {
//       socket.off("user-connected", handleUserJoined);
//       socket.off("incomming-call", handleIncomingCall);
//       socket.off("call-accept", handleCallAccept);
//     };
//   }, [socket, handleUserJoined, handleIncomingCall, handleCallAccept]);

//   useEffect(() => {
//     getUserMediaStream();
//   }, [getUserMediaStream]);

//   return (
//     <div>
//       <h1 className="text-3xl font-bold text-black text-center mb-4">Room Page</h1>
      
//       {/* Jab tak myStream me data nahi aayega, ye render nahi hoga. Aur muted lagana zaroori hai! */}
//       {myStream && (
//         <ReactPlayer 
//           url={myStream} 
//           playing 
//           muted 
//           width="400px" 
//           height="300px" 
//         />
//       )}
//     </div>
//   );
// };

// export default Room;


import React, { useEffect, useCallback, useState, useRef } from "react";
import { useSocket } from "../providers/Socket";
import { usePeer } from "../providers/Peer";

const Room = () => {
  const socket = useSocket();
  const { peer, createOffer, createAnswer, setRemoteAns, sendStream, remoteStream } = usePeer();

  const [myStream, setMyStream] = useState(null);
  const [remoteEmailId, setRemoteEmailId] = useState(null)
  
  // 1. Video tag ko reference karne ke liye useRef banaya
  const videoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const handleUserJoined = useCallback(
    async (email) => {
      console.log("Arey user join ho gaya bhai: ", email);
      const offer = await createOffer();
      socket.emit("call-user", { email, offer });
      setRemoteEmailId(email)
    },
    [createOffer, socket],
  );

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const handleIncomingCall = useCallback(
    async ({ from, offer }) => {
      console.log("incomming call from", from, offer);
      const answer = await createAnswer(offer);
      socket.emit("call-accept", { email: from, answer });
      setRemoteEmailId(from);
    },
    [createAnswer, socket],
  );

  const handleCallAccept = useCallback(
    async ({ answer }) => {
      await setRemoteAns(answer);
      console.log("call got accepted", answer);
    },
    [setRemoteAns],
  );

  const getUserMediaStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
    } catch (error) {
      console.error("Camera access denied ya hardware error hai:", error);
    }
  }, [setMyStream]);

  useEffect(() => {
    if (!socket) return;

    socket.on("user-connected", handleUserJoined);
    socket.on("incomming-call", handleIncomingCall);
    socket.on("call-accept", handleCallAccept);

    return () => {
      socket.off("user-connected", handleUserJoined);
      socket.off("incomming-call", handleIncomingCall);
      socket.off("call-accept", handleCallAccept);
    };
  }, [socket, handleUserJoined, handleIncomingCall, handleCallAccept]);

  useEffect(() => {
    getUserMediaStream();
  }, [getUserMediaStream]);

  // 2. Jab bhi myStream aaye, usko video tag ke srcObject me attach kar do
  useEffect(() => {
    if (myStream && videoRef.current) {
      videoRef.current.srcObject = myStream;
    }
  }, [myStream]);

  // const handleNegotiation = useCallback(() => {
  //   console.log("negogiation needed");
  //   const localOffer = peer.localDescription;
  //   socket.emit("call-user", {email: remoteEmailId, offer: localOffer});
  // }, [peer.localDescription, remoteEmailId, socket])

  // async/await add kiya, aur createOffer() call kiya
  const handleNegotiation = useCallback(async () => {
    console.log("negotiation needed");
    // Purana description mat le, naya offer create kar!
    const offer = await createOffer(); 
    socket.emit("call-user", {email: remoteEmailId, offer});
  }, [createOffer, remoteEmailId, socket]);

  useEffect(() => {
    peer.addEventListener("negotiationneeded", handleNegotiation);

    return () => {
      peer.removeEventListener("negotiationneeded", handleNegotiation)
    }
  }, [peer, handleNegotiation])

  return (
    <div>
      <h1 className="text-3xl font-bold text-white text-center mb-4">Room Page</h1>

      <button onClick={e => sendStream(myStream)}>send my video</button>
      
      {/* Container taaki dono videos side-by-side ya upar-niche dikhe */}
      <div className="flex flex-col md:flex-row justify-center gap-4 p-4">
        
        {/* Tera apna video (My Stream) */}
        {myStream && (
          <div className="flex flex-col items-center">
             <span className="text-white mb-2">My Video</span>
             <video 
               ref={videoRef}
               autoPlay 
               playsInline
               muted // Tera video tujhe muted hi chahiye, warna echo hoga
               className="w-[400px] h-[300px] bg-slate-800 rounded-lg shadow-lg object-cover"
             />
          </div>
        )}

        {/* 4. NAYA: Remote user ka video dikhane ke liye */}
        {remoteStream && (
          <div className="flex flex-col items-center">
             <span className="text-white mb-2">Remote User</span>
             <video 
               ref={remoteVideoRef}
               autoPlay 
               playsInline
               // Isko muted mat karna, warna dusre ki aawaz nahi aayegi!
               className="w-[400px] h-[300px] bg-slate-800 rounded-lg shadow-lg border-2 border-blue-500 object-cover"
             />
          </div>
        )}

      </div>
    </div>
  );
};

export default Room;