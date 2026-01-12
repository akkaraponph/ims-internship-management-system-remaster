"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";

interface RealtimeOptions {
  interval?: number; // Polling interval in milliseconds
  enabled?: boolean;
}

export function useRealtime<T>(
  fetchFn: () => Promise<T>,
  options: RealtimeOptions = {}
) {
  const { interval = 5000, enabled = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    if (!enabled || !session) {
      return;
    }

    const fetchData = async () => {
      try {
        const result = await fetchFn();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchData();

    // Set up polling
    intervalRef.current = setInterval(fetchData, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchFn, interval, enabled, session]);

  return { data, isLoading, error, refetch: () => fetchFn() };
}
