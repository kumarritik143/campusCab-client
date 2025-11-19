// SocketProvider.tsx
"use client";
import React, { createContext, useEffect } from "react";
import { io, Socket } from "socket.io-client";

// Define the type of socket context
type SocketContextType = {
  socket: Socket;
};

// Create a typed context
export const SocketContext = createContext<SocketContextType | undefined>(undefined);

// Initialize socket
const socket = io(process.env.NEXT_PUBLIC_API_URL as string, {
  withCredentials: true,
  transports: ["websocket"], // Ensures stability
});

type Props = {
  children: React.ReactNode;
};

const SocketProvider: React.FC<Props> = ({ children }) => {
  useEffect(() => {
    socket.on("connect", () => {
      console.log("✅ Connected to server");

      // ✅ Join user-specific room
      const userId = localStorage.getItem("userId");
      if (userId) {
        socket.emit("join", { userId, userType: "user" });
        console.log(`✅ Joined room for userId: ${userId}`);
      } else {
        // Only warn in development, not an error in production
        if (process.env.NODE_ENV === 'development') {
          console.warn("⚠️ User ID not found in localStorage - socket room join skipped");
        }
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from server");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
