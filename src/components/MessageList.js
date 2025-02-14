// src/components/MessageList.js
import React from 'react';

const MessageList = ({
  messages,
  onEditInit,
  editingMessageId,
  editText,
  setEditText,
  onEditSave,
  onDelete,
}) => {
  return (
    <div className="card shadow mt-4">
      <div className="card-header bg-secondary text-white">
        <h6 className="mb-0">Messages</h6>
      </div>
      <ul className="list-group list-group-flush">
        {messages.length === 0 ? (
          <li className="list-group-item">No messages in this room.</li>
        ) : (
          messages.map((msg) => (
            <li key={msg.id} className="list-group-item">
              <div className="d-flex justify-content-between">
                <strong>{msg.userName}:</strong>
                <div>
                  <button className="btn btn-link p-0" onClick={() => onEditInit(msg.id)}>
                    Edit
                  </button>
                  <button className="btn btn-link text-danger p-0" onClick={() => onDelete(msg.id)}>
                    Delete
                  </button>
                </div>
              </div>
              <p className="mt-1 mb-1">{msg.message}</p>
              {editingMessageId === msg.id && (
                <div className="mt-2 d-flex">
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="form-control me-2"
                    placeholder="Edit your message"
                  />
                  <button className="btn btn-success me-2" onClick={() => onEditSave(msg.id)}>
                    Save
                  </button>
                  <button className="btn btn-secondary" onClick={() => onEditInit(null)}>
                    Cancel
                  </button>
                </div>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default MessageList;
