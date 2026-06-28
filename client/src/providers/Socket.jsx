import React, { createContext, useMemo, useContext } from "react";
import { io } from "socket.io-client";

// Step 1: Context Create Karna
const SocketContext = createContext(null);

// Step 2: Custom Hook Banana
export const useSocket = () => {
  const socket = useContext(SocketContext);
  return socket;
};

// Step 3: Provider Component Banana
export const SocketProvider = (props) => {
  
  // Sabse important line: useMemo ka logic
  const socket = useMemo(() => io("localhost:8001"), []);

  return (
    <SocketContext.Provider value={socket}>
      {props.children}
    </SocketContext.Provider>
  );
};