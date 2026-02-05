import React, { useState, useRef, useEffect } from 'react';
import { Box, IconButton, Paper, TextField, Typography, Avatar, Fab, Fade } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import { flaskApi } from '../services/api';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message to chat
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setLoading(true);

    try {
      // Limit conversation history to last 6 messages (3 exchanges) to avoid rate limiting
      // This keeps context while reducing token usage
      const conversationHistory = messages.slice(-6).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      console.log('Sending conversation history length:', conversationHistory.length);

      const response = await flaskApi.post('/api/chatbot', {
        message: userMessage,
        conversation_history: conversationHistory
      });

      // Add assistant response to chat
      setMessages([...newMessages, {
        role: 'assistant',
        content: response.data.response
      }]);
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage = error.response?.status === 429 
        ? 'Rate limit exceeded. Please wait a moment and try again.'
        : 'Sorry, I encountered an error. Please try again.';
      
      setMessages([...newMessages, {
        role: 'assistant',
        content: errorMessage
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <Fab
        color="primary"
        aria-label="chat"
        onClick={() => setIsOpen(!isOpen)}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          backgroundColor: '#232a36',
          '&:hover': {
            backgroundColor: '#1a1f2a'
          },
          zIndex: 1000
        }}
      >
        {isOpen ? <CloseIcon /> : <ChatIcon />}
      </Fab>

      {/* Chat Window */}
      <Fade in={isOpen}>
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: 96,
            right: 24,
            width: { xs: 'calc(100vw - 48px)', sm: 400 },
            height: 600,
            maxHeight: 'calc(100vh - 120px)',
            display: isOpen ? 'flex' : 'none',
            flexDirection: 'column',
            borderRadius: 3,
            overflow: 'hidden',
            zIndex: 999,
            backgroundColor: '#fff'
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 2,
              backgroundColor: '#232a36',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <SmartToyIcon />
            <Typography variant="h6" sx={{ fontFamily: 'Inter, Arial, sans-serif', flex: 1 }}>
              BigBull AI Assistant
            </Typography>
            <IconButton size="small" onClick={() => setIsOpen(false)} sx={{ color: '#fff' }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Messages Area */}
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              p: 2,
              backgroundColor: '#f5f7fa',
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}
          >
            {messages.length === 0 && (
              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <SmartToyIcon sx={{ fontSize: 64, color: '#232a36', opacity: 0.3, mb: 2 }} />
                <Typography sx={{ color: '#64748b', fontFamily: 'Inter, Arial, sans-serif' }}>
                  Hi! I'm your AI investment assistant.
                </Typography>
                <Typography sx={{ color: '#64748b', fontFamily: 'Inter, Arial, sans-serif', fontSize: '0.9rem', mt: 1 }}>
                  Ask me about stocks, market analysis, or investment advice!
                </Typography>
              </Box>
            )}

            {messages.map((message, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  gap: 1,
                  alignItems: 'flex-start',
                  flexDirection: message.role === 'user' ? 'row-reverse' : 'row'
                }}
              >
                <Avatar
                  sx={{
                    backgroundColor: message.role === 'user' ? '#1976d2' : '#232a36',
                    width: 32,
                    height: 32
                  }}
                >
                  {message.role === 'user' ? <PersonIcon sx={{ fontSize: 20 }} /> : <SmartToyIcon sx={{ fontSize: 20 }} />}
                </Avatar>
                <Paper
                  sx={{
                    p: 2,
                    maxWidth: '75%',
                    backgroundColor: message.role === 'user' ? '#1976d2' : '#fff',
                    color: message.role === 'user' ? '#fff' : '#232a36',
                    borderRadius: 2,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: 'Inter, Arial, sans-serif',
                      fontSize: '0.95rem',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}
                  >
                    {message.content}
                  </Typography>
                </Paper>
              </Box>
            ))}

            {loading && (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <Avatar sx={{ backgroundColor: '#232a36', width: 32, height: 32 }}>
                  <SmartToyIcon sx={{ fontSize: 20 }} />
                </Avatar>
                <Paper
                  sx={{
                    p: 2,
                    backgroundColor: '#fff',
                    borderRadius: 2,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                >
                  <Typography sx={{ fontFamily: 'Inter, Arial, sans-serif', fontSize: '0.95rem' }}>
                    Thinking...
                  </Typography>
                </Paper>
              </Box>
            )}

            <div ref={messagesEndRef} />
          </Box>

          {/* Input Area */}
          <Box
            sx={{
              p: 2,
              backgroundColor: '#fff',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              gap: 1
            }}
          >
            <TextField
              fullWidth
              multiline
              maxRows={3}
              placeholder="Ask me anything about stocks..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontFamily: 'Inter, Arial, sans-serif'
                }
              }}
            />
            <IconButton
              color="primary"
              onClick={handleSend}
              disabled={!input.trim() || loading}
              sx={{
                backgroundColor: '#232a36',
                color: '#fff',
                '&:hover': {
                  backgroundColor: '#1a1f2a'
                },
                '&:disabled': {
                  backgroundColor: '#e2e8f0',
                  color: '#94a3b8'
                }
              }}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Paper>
      </Fade>
    </>
  );
};

export default Chatbot;
