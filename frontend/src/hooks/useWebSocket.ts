import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuthStore } from '../store/authStore';

const WS_BASE = import.meta.env.VITE_WS_URL || 'ws://localhost:8080';

interface UseWebSocketOptions {
  onMessage?: (data: string) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (e: Event) => void;
  autoConnect?: boolean;
}

export function useWebSocket(path: string, options: UseWebSocketOptions = {}) {
  const { onMessage, onOpen, onClose, onError, autoConnect = true } = options;
  const wsRef = useRef<WebSocket | null>(null);
  const [readyState, setReadyState] = useState<number>(WebSocket.CLOSED);

  const connect = useCallback(() => {
    const token = useAuthStore.getState().accessToken;
    const url = `${WS_BASE}${path}${token ? `?token=${token}` : ''}`;
    const ws = new WebSocket(url);

    ws.onopen = () => {
      setReadyState(WebSocket.OPEN);
      onOpen?.();
    };
    ws.onmessage = (e) => onMessage?.(e.data);
    ws.onclose = () => {
      setReadyState(WebSocket.CLOSED);
      onClose?.();
    };
    ws.onerror = (e) => onError?.(e);

    wsRef.current = ws;
    setReadyState(WebSocket.CONNECTING);
  }, [path, onMessage, onOpen, onClose, onError]);

  const disconnect = useCallback(() => {
    wsRef.current?.close();
    wsRef.current = null;
  }, []);

  const send = useCallback((data: string | ArrayBuffer) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(data);
    }
  }, []);

  useEffect(() => {
    if (autoConnect) connect();
    return () => disconnect();
  }, [autoConnect, connect, disconnect]);

  return { readyState, send, connect, disconnect, isOpen: readyState === WebSocket.OPEN };
}
