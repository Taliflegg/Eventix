// useSocketListener.ts
import { useEffect, useContext } from 'react';
import { SocketContext } from '../../App';
import { AssignedMenuItem } from '@eventix/shared/src';
export type WebSocketAction =
  | 'assign'
  | 'unassign'
  | 'add'
  | 'update'
  | 'delete'
  | 'undo'
  | 'moveItem'
  | 'move'; 

export type WebSocketType = 'dish' | 'category';
export type WebSocketPayload = {
  itemId?: string;
  assignedUser?: {
    id: string;
    name?: string;
  };
  name?: string;
  notes?: string;
  tags?: string[];
  categoryId?: string;
  position?: number;
  newPosition?: number;
  previousState?: any;
};
export type WebSocketMessage = {
  type: WebSocketType;
  action: WebSocketAction;
  payload: WebSocketPayload;
};
export function useSocketListener(
  setAssignedMenuItems: React.Dispatch<React.SetStateAction<AssignedMenuItem[] | null>>
) {
  const socket = useContext(SocketContext);
  useEffect(() => {
    if (!socket) return;
    socket.onmessage = (event: MessageEvent) => {
      if (!event.data) return;
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        const { type, action, payload } = message;

        //  תנאי מורחב: לא יוצאים אם itemId חסר אבל יש name/category
        // if (!payload?.itemId && !payload?.name) return;

        const updateItem = (updater: (item: AssignedMenuItem) => AssignedMenuItem) => {
          setAssignedMenuItems(prev =>
            prev?.map(i =>
              i.item.id === payload.itemId ? updater(i) : i
            ) ?? []
          );
        };
        const removeItem = () => {
          setAssignedMenuItems(prev =>
            prev?.filter(i => i.item.id !== payload.itemId) ?? []
          );
        };
        const addItem = () => {
          setAssignedMenuItems(prev => [
            ...(prev ?? []),
            {
              item: {
                id: payload.itemId ?? '',
                name: payload.name || '',
                notes: payload.notes || '',
                tags: payload.tags || [],
                categoryId: payload.categoryId,
                position: payload.position ?? 0,
                isCategory: type === 'category',
                createdAt: new Date(),
                updatedAt: new Date()
              },
              assignedUser: undefined
            }
          ]);
        };
        const restorePrevious = () => {
          updateItem(i => ({
            ...i,
            item: {
              ...(i.item),
              ...(payload.previousState ?? {})
            }
          }));
        };
        const moveItem = () => {
          updateItem(i => ({
            ...i,
            item: {
              ...i.item,
              categoryId: payload.categoryId,
              position: payload.newPosition ?? payload.position ?? i.item.position
            }
          }));
        };
        switch (type) {
          case 'dish':
          case 'category':
            switch (action) {
              case 'add':
                addItem();
                break;
              case 'update':
                updateItem(i => ({
                  ...i,
                  item: { ...i.item, ...payload }
                }));
                break;

              case 'delete':
                removeItem();
                break;

              case 'undo':
                restorePrevious();
                break;

              case 'moveItem':
              case 'move': 
                moveItem();
                break;

              case 'assign':
                updateItem(i => ({
                  ...i,
                  assignedUser: {
                    ...(i.assignedUser ?? {
                      id: payload.assignedUser?.id ?? '',
                      email: '',
                      role: 'user',
                      language: 'he',
                      createdAt: new Date(),
                      updatedAt: new Date(),
                      imageUrl: '',
                      profile_image: '',
                      passwordHash: '',
                      googleId: '',
                      dietaryRestrictions: []
                    }),
                    name: payload.assignedUser?.name ?? ''
                  }
                }));
                break;
              case 'unassign':
                updateItem(i => ({
                  ...i,
                  assignedUser: undefined
                }));
                break;
              default:
                break;
            }
            break;
          default:
            break;
        }
      } catch (err) {
        console.error(':exclamation: שגיאה בפענוח הודעת WebSocket:', err);
      }
    };
  }, [socket, setAssignedMenuItems]);
}