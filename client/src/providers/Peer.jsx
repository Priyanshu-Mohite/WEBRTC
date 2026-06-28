import React, { useMemo, useContext, useEffect, useState, useCallback } from "react";

// 1. Context banaya
const PeerContext = React.createContext(null);

// 2. Custom Hook (Yeh miss kar diya tha tune!)
export const usePeer = () => {
  return useContext(PeerContext);
};

// 3. Tera Provider Component
export const PeerProvider = ({ children }) => {
  const [remoteStream, setRemoteStream] = useState(null);
  const peer = useMemo(
    () =>
      new RTCPeerConnection({
        iceServers: [
          {
            urls: [
              "stun:stun.l.google.com:19302",
              "stun:global.stun.twilio.com:3478",
            ],
          },
        ],
      }),
    [],
  );

  const createOffer = async () => {
    const offer = await peer.createOffer();
    // Wrap it in RTCSessionDescription for safety
    await peer.setLocalDescription(new RTCSessionDescription(offer));
    return offer;
  };

  const createAnswer = async (offer) => {
    await peer.setRemoteDescription(offer);
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    return answer;
  };

  const setRemoteAns = async (ans) => {
    await peer.setRemoteDescription(ans);
  }

  const sendStream = async (stream) => {
    const tracks = stream.getTracks();
    for(const track of tracks) {
      // Check kar rahe hain ki kya yeh track pehle se WebRTC me add ho chuka hai
      const isAlreadyAdded = peer.getSenders().some(sender => sender.track === track);
      
      // Agar added nahi hai, tabhi push karo
      if(!isAlreadyAdded) {
        peer.addTrack(track, stream);
      }
    }
  }

  const handleTrackEvent = useCallback((ev) => {
    const streams = ev.streams;
      setRemoteStream(streams[0]);
  }, [])

  useEffect(() => {
    peer.addEventListener("track", handleTrackEvent)

    return () => {
      peer.removeEventListener("track", handleTrackEvent)
    }
  }, [peer, handleTrackEvent])

  return (
    <PeerContext.Provider value={{ peer, createOffer, createAnswer, setRemoteAns, sendStream,remoteStream }}>
      {children}
    </PeerContext.Provider>
  );
};
