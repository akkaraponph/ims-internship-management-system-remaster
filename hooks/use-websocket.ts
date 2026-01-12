"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { getWebSocketClient } from "@/lib/websocket/client";

export function useWebSocket() {
  const { data: session } = useSession();
  const [isConnected, setIsConnected] = useState(false);
  const wsClientRef = useRef(getWebSocketClient());

  useEffect(() => {
    if (!session?.user) {
      return;
    }

    const client = wsClientRef.current;

    const handleConnected = () => setIsConnected(true);
    const handleDisconnected = () => setIsConnected(false);

    client.on("connected", handleConnected);
    client.on("disconnected", handleDisconnected);

    // Connect with session token (you'll need to implement token generation)
    // For now, we'll use a simple approach
    if (!client.isConnected()) {
      // In a real implementation, you'd get a WebSocket token from your API
      // client.connect(sessionToken);
    }

    return () => {
      client.off("connected", handleConnected);
      client.off("disconnected", handleDisconnected);
    };
  }, [session]);

  return {
    isConnected,
    client: wsClientRef.current,
  };
}
