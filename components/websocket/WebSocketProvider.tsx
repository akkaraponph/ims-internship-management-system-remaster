"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useSession } from "next-auth/react";
import { getWebSocketClient } from "@/lib/websocket/client";

interface WebSocketContextType {
  isConnected: boolean;
  client: ReturnType<typeof getWebSocketClient>;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const client = getWebSocketClient();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!session?.user) {
      return;
    }

    const handleConnected = () => setIsConnected(true);
    const handleDisconnected = () => setIsConnected(false);

    client.on("connected", handleConnected);
    client.on("disconnected", handleDisconnected);

    // Note: In production, you'd need to get a WebSocket token from your API
    // For now, WebSocket connection is optional and polling is used as fallback

    return () => {
      client.off("connected", handleConnected);
      client.off("disconnected", handleDisconnected);
    };
  }, [session]);

  return (
    <WebSocketContext.Provider value={{ isConnected, client }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketContext() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocketContext must be used within WebSocketProvider");
  }
  return context;
}
