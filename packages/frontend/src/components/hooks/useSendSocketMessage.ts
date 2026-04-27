import { useContext } from 'react';
import { SocketContext } from '../../App';
export type WebSocketAction =
  | 'add'
  | 'update'
  | 'delete'
  | 'assign'
  | 'unassign'
  | 'move' 
  | 'undo'; 

export interface SocketMessage {
  type: string;
  action: WebSocketAction;
  payload: {
    itemId?: string;
    name?: string;
    notes?: string;
    tags?: string[];
    assignedTo?: string;
    categoryId?: string;
    position?: number;
    newPosition?: number;
    previousState?: any;
    assignedUser?: {
      id: string;
      name?: string;
    };
  };
}
export function useSendSocketMessage() {
  const socket = useContext(SocketContext);
  const send = ({ type, action, payload }: SocketMessage) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.warn(':electric_plug: WebSocket לא מחובר');
      return false;
    }
    try {
      socket.send(JSON.stringify({ type, action, payload }));
      return true;
    } catch (err) {
      console.error(':exclamation: שגיאה בשליחת הודעה:', err);
      return false;
    }
  };
  const isConnected = socket?.readyState === WebSocket.OPEN;
  return {
    send,
    isConnected,
  };
}