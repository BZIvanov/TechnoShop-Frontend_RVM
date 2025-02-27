import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';

import { useDispatch, useSelector } from '@/providers/store/store';
import { selectUser } from '@/providers/store/features/user/userSlice';
import { useGetChatMessagesQuery } from '@/providers/store/services/chat';
import { showNotification } from '@/providers/store/features/notification/notificationSlice';

import { Box, Avatar, Typography, Paper } from '@mui/material';

const ChatMessages = ({ socket, chatId }) => {
  const dispatch = useDispatch();

  const [messages, setMessages] = useState([]);

  const messagesEndRef = useRef(null);

  const user = useSelector(selectUser);

  const { data: messagesData, refetch } = useGetChatMessagesQuery(
    { chatId },
    { skip: !chatId }
  );

  useEffect(() => {
    if (chatId) {
      refetch();
    }
  }, [chatId, refetch]);

  useEffect(() => {
    if (messagesData?.messages) {
      setMessages(messagesData.messages);
    }
  }, [messagesData]);

  useEffect(() => {
    const handleNewMessage = (newMessage) => {
      if (chatId === newMessage.chat) {
        setMessages((prevState) => [...prevState, newMessage]);
      } else {
        dispatch(
          showNotification({
            type: 'success',
            message: 'You have a new message',
          })
        );
      }
    };

    if (socket && chatId) {
      socket.on('newMessage', handleNewMessage);
    }

    return () => {
      if (socket) {
        socket.off('newMessage', handleNewMessage);
      }
    };
  }, [dispatch, socket, chatId]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <Box py={2}>
      <Paper sx={{ padding: 2, height: 'calc(100vh - 260px)' }}>
        {messages.map((message) => {
          const isCurrentUser = user._id === message.sender._id;

          return (
            <Box
              key={message._id}
              sx={{
                display: 'flex',
                justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
                mb: 1,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: isCurrentUser ? 'row-reverse' : 'row',
                  gap: 1,
                  alignItems: 'center',
                  maxWidth: { lg: '85%' },
                }}
              >
                <Avatar
                  src={message.sender?.avatar?.imageUrl}
                  alt='User avatar'
                />
                <Box
                  sx={{
                    backgroundColor: isCurrentUser ? '#ff000022' : '#0000ff22',
                    padding: 1,
                    borderRadius: 1,
                    boxShadow: isCurrentUser
                      ? '0px 2px 2px rgba(255, 0, 0, 0.5)'
                      : '0px 2px 2px rgba(0, 0, 255, 0.5)',
                  }}
                >
                  <Typography variant='body2'>{message.content}</Typography>
                </Box>
              </Box>
            </Box>
          );
        })}

        <div ref={messagesEndRef} />

        {!chatId && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Typography>Select a user to start chatting</Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

ChatMessages.propTypes = {
  socket: PropTypes.object,
  chatId: PropTypes.string,
};

export default ChatMessages;
