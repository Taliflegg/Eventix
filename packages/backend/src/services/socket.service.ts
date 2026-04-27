
import { WebSocketServer, WebSocket } from 'ws';

// יצירת WebSocket Server
export const wss = new WebSocketServer({ port: 8080 });
// const PORT = process.env.WEBSOCKET_PORT || 8080;
// export const wss = new WebSocketServer({ port: Number(PORT) });

wss.on('connection', (ws: WebSocket) => {
  console.log('🟢 לקוח התחבר ל־WebSocket');

  ws.on('message', (message: Buffer) => {
    const msgString = message.toString();
    console.log('📨 התקבלה הודעה מהלקוח:', msgString);
    ws.send(JSON.stringify({ message: 'get message' }));
  });

  ws.on('close', () => {
    console.log('🔒 לקוח ניתק את החיבור');
  });
});

// שידור הודעה לכל הלקוחות שמחוברים
export const broadcastMessage = (message: {
  type: string;
  action: string;
  payload: any;
}) => {
  console.log("------------------------webSocket-----------------------------");
  const msg = JSON.stringify(message);
  console.log(`📡 משדר הודעה ל־${wss.clients.size} לקוחות:`, message);

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
};
