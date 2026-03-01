import { useEffect, useRef } from 'react';
import io from 'socket.io-client';

const BACKEND_URL = "http://localhost:5000";

export default function useSocket() {
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(BACKEND_URL, {
      reconnectionAttempts: 5,
      timeout: 10000,
    });

    socketRef.current.on("connect", () => {
      console.log("✅ Socket.IO connected");
    });

    socketRef.current.on("connect_error", (err) => {
      console.warn("Socket.IO error:", err.message);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  return socketRef.current;
}