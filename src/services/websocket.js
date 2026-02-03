export const createWebSocket = (symbols, onMessage) => {
  const ws = new WebSocket('ws://localhost:5000/ws/stream');
  
  ws.onopen = () => {
    ws.send(JSON.stringify({ action: 'subscribe', symbols }));
  };
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage(data);
  };
  
  ws.onclose = () => {
    console.log('WebSocket closed');
  };
  
  return ws;
};