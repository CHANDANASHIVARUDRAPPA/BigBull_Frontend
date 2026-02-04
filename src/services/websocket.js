export const createWebSocket = (symbols, onMessage) => {
  const ws = new WebSocket('ws://localhost:5000/ws/stream');
  
  ws.onopen = () => {
    const message = { 
      action: 'subscribe', 
      symbols: Array.isArray(symbols) ? symbols : [symbols]
    };
    console.log('WebSocket connected, sending:', message);
    ws.send(JSON.stringify(message));
  };
  
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (error) {
      console.error('WebSocket JSON parse error:', error, 'Raw data:', event.data);
      // Try to handle partial or multiple JSON objects
      try {
        const messages = event.data.split('\n').filter(line => line.trim());
        messages.forEach(msg => {
          try {
            const data = JSON.parse(msg);
            onMessage(data);
          } catch (e) {
            console.error('Failed to parse message chunk:', msg);
          }
        });
      } catch (e) {
        console.error('Could not recover from parse error');
      }
    }
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
  
  ws.onclose = (event) => {
    console.log('WebSocket closed:', event.code, event.reason);
  };
  
  return ws;
};