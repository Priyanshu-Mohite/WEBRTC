import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import { SocketProvider } from "./providers/Socket";
import { PeerProvider } from "./providers/Peer";
import Room from "./pages/Room";

function App() {
  return (
    <>
      <PeerProvider>
        <SocketProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/room/:roomId" element={<Room />} />
          </Routes>
        </SocketProvider>
      </PeerProvider>
    </>
  );
}

export default App;
