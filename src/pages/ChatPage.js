// src/pages/ChatPage.js
import React, { useState, useEffect, useRef } from 'react';
import API from '../api/api';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import ChatRoomList from '../components/ChatRoomList';
import MessageList from '../components/MessageList';

const ChatPage = () => {
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [joinUser, setJoinUser] = useState('');
  const [messageText, setMessageText] = useState('');
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState('');
  const [hubConnected, setHubConnected] = useState(false);
  const hubConnectionRef = useRef(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const { data } = await API.get('/chatRooms/getall');
        setRooms(data.data);
      } catch (error) {
        console.error('Error fetching rooms:', error);
      }
    };
    fetchRooms();
  }, []);

  const fetchMessages = async (roomId) => {
    try {
      const { data } = await API.get(`/chat/messages/${roomId}`);
      setMessages(data.data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const joinRoom = async (room) => {
    try {
      setCurrentRoom(room);
      const token = localStorage.getItem('token');
      const connection = new HubConnectionBuilder()
        .withUrl('https://localhost:44307/chathub', { accessTokenFactory: () => token })
        .configureLogging(LogLevel.Information)
        .withAutomaticReconnect()
        .build();

      connection.on('ReceiveMessage', (message) => {
        setMessages((prev) => [...prev, message]);
      });
      connection.on('MessageEdited', (editedMessage) => {
        setMessages((prev) =>
          prev.map((msg) => (msg.MessageId === editedMessage.MessageId ? editedMessage : msg))
        );
      });
      connection.on('MessageDeleted', (deletedMessageId) => {
        setMessages((prev) => prev.filter((msg) => msg.MessageId !== deletedMessageId));
      });
      connection.on('UserJoined', (user) => {
        console.log(`${user} joined the room.`);
      });
      connection.on('UserLeft', (user) => {
        console.log(`${user} left the room.`);
      });

      await connection.start();
      await connection.invoke('JoinRoom', room.id);
      hubConnectionRef.current = connection;
      setHubConnected(true);
      console.log('Joined room and connected to group:', room.id);
      fetchMessages(room.id);
    } catch (error) {
      console.error('Error joining room:', error);
    }
  };

  const leaveRoom = async () => {
    if (!currentRoom) return;
    try {
      await API.delete('/chatRooms/leave', {
        data: { chatRoomId: currentRoom.id, userName: joinUser || 'Anonymous' },
      });
      if (hubConnectionRef.current) {
        await hubConnectionRef.current.invoke('LeaveRoom', currentRoom.id);
        await hubConnectionRef.current.stop();
      }
      setCurrentRoom(null);
      setMessages([]);
      setHubConnected(false);
      console.log('Left room.');
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!currentRoom || !hubConnected) return;
    try {
      await hubConnectionRef.current.invoke('SendMessage', {
        userName: joinUser || 'Anonymous',
        chatRoomId: currentRoom.id,
        message: messageText,
      });
      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleEditMessage = async (id) => {
    if (!currentRoom || !hubConnected) return;
    try {
      await hubConnectionRef.current.invoke('EditMessage', {
        messageId: id,
        chatRoomId: currentRoom.id,
        newContent: editText,
      });
      setEditingMessageId(null);
      setEditText('');
    } catch (error) {
      console.error('Error editing message:', error);
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!currentRoom || !hubConnected) return;
    try {
      // Include the chatRoomId along with the messageId
      await hubConnectionRef.current.invoke('DeleteMessage', {
        messageId: id,
        chatRoomId: currentRoom.id
      });
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  return (
    <div className="container my-4">
      <h2 className="text-center mb-4">Chat App</h2>
      <div className="mb-3">
        <label className="form-label">Your Name:</label>
        <input
          type="text"
          value={joinUser}
          onChange={(e) => setJoinUser(e.target.value)}
          placeholder="Enter your name"
          className="form-control"
        />
      </div>
      {!currentRoom ? (
        <ChatRoomList rooms={rooms} onJoin={joinRoom} />
      ) : (
        <div>
          <div className="d-flex justify-content-between align-items-center bg-light p-3 rounded">
            <h4 className="mb-0">Room: {currentRoom.name}</h4>
            <button className="btn btn-danger" onClick={leaveRoom}>
              Leave Room
            </button>
          </div>
          <MessageList
            messages={messages}
            onEditInit={setEditingMessageId}
            editingMessageId={editingMessageId}
            editText={editText}
            setEditText={setEditText}
            onEditSave={handleEditMessage}
            onDelete={handleDeleteMessage}
          />
          <div className="input-group mt-3">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type your message"
              className="form-control"
            />
            <button className="btn btn-primary" onClick={handleSendMessage}>
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
