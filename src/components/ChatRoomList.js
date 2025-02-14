// src/components/ChatRoomList.js
import React from 'react';

const ChatRoomList = ({ rooms, onJoin }) => {
  return (
    <div className="card shadow mb-4">
      <div className="card-header bg-primary text-white">
        <h5 className="mb-0">Available Chat Rooms</h5>
      </div>
      <ul className="list-group list-group-flush">
        {rooms.length === 0 ? (
          <li className="list-group-item">No chat rooms available.</li>
        ) : (
          rooms.map((room) => (
            <li key={room.id} className="list-group-item d-flex justify-content-between align-items-center">
              <span>{room.name}</span>
              <button className="btn btn-sm btn-outline-primary" onClick={() => onJoin(room)}>
                Join
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default ChatRoomList;
