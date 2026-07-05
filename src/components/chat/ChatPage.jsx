import React, { useRef, useState, useEffect } from 'react';
import { callApi } from '../../services/api';

const getAvatarBg = (name) => {
  const colors = ['#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#8b5cf6', '#6366f1', '#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6', '#10b981', '#22c55e', '#eab308', '#f97316'];
  if (!name) return colors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

export default function ChatPage({ conversations, activeConversation, chatMessages, chatInput, setChatInput, chatRecipientId, setChatRecipientId, openConversation, sendMessage, userId, setActiveConversation, token }) {
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searching, setSearching] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState('');

  const formatLastMessageTime = (ts) => {
    if (!ts) return '';
    try {
      const date = new Date(ts);
      const now = new Date();
      if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
      }
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch (e) {
      return '';
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Auto-load user info when chatRecipientId is pre-filled
  useEffect(() => {
    if (chatRecipientId && !activeConversation) {
      callApi(`/users/${chatRecipientId}/profile`, 'GET', token)
        .then(data => {
          if (data && data.name) setSelectedUser({ id: data.id, name: data.name, role: data.role });
        })
        .catch(() => {});
    }
  }, [chatRecipientId]);

  // Search users by name
  useEffect(() => {
    if (searchQuery.trim().length < 1) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await callApi(`/users/search?q=${encodeURIComponent(searchQuery)}`, 'GET', token);
        setSearchResults((results || []).filter(u => String(u.id) !== String(userId)));
      } catch (e) { setSearchResults([]); }
      setSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  function selectUserToChat(user) {
    setSelectedUser(user);
    setChatRecipientId(String(user.id));
    setSearchQuery('');
    setSearchResults([]);
  }

  function clearSelectedUser() {
    setSelectedUser(null);
    setChatRecipientId('');
  }

  // File upload and send
  async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setShowAttachMenu(false);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await callApi('/messages/upload', 'POST', token, formData, true);

      // Determine receiver
      let receiverId;
      if (activeConversation) {
        receiverId = activeConversation.participantIds.find(id => String(id) !== String(userId));
      } else if (chatRecipientId) {
        receiverId = Number(chatRecipientId);
      }

      if (receiverId) {
        await callApi('/messages/send', 'POST', token, {
          receiverId,
          content: file.name,
          messageType: uploadRes.messageType,
          fileUrl: uploadRes.fileUrl,
          fileName: uploadRes.fileName,
          fileSize: uploadRes.fileSize
        });

        if (activeConversation) {
          openConversation(activeConversation);
        } else {
          setChatRecipientId('');
          const convs = await callApi('/messages/conversations', 'GET', token);
          if (convs.length > 0) openConversation(convs[0]);
        }
      }
    } catch (err) {
      console.error('Upload failed', err);
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function openFileSelector(accept) {
    if (fileInputRef.current) {
      fileInputRef.current.accept = accept || '*/*';
      fileInputRef.current.click();
    }
  }

  // Render message bubble content based on type
  function renderMessageContent(msg) {
    const type = msg.messageType || 'text';
    
    if (type === 'image') {
      return (
        <div className="msg-media">
          <img src={msg.fileUrl} alt={msg.fileName} className="msg-image" onClick={() => window.open(msg.fileUrl, '_blank')} />
          {msg.content && msg.content !== msg.fileName && <p className="msg-caption">{msg.content}</p>}
        </div>
      );
    }
    if (type === 'video') {
      return (
        <div className="msg-media">
          <video src={msg.fileUrl} controls className="msg-video" />
          {msg.content && msg.content !== msg.fileName && <p className="msg-caption">{msg.content}</p>}
        </div>
      );
    }
    if (type === 'audio') {
      return (
        <div className="msg-media">
          <audio src={msg.fileUrl} controls className="msg-audio" />
        </div>
      );
    }
    if (type === 'file') {
      const sizeStr = msg.fileSize ? `${(msg.fileSize / 1024).toFixed(1)} KB` : '';
      return (
        <div className="msg-file" onClick={() => window.open(msg.fileUrl, '_blank')}>
          <div className="msg-file-icon"></div>
          <div className="msg-file-info">
            <span className="msg-file-name">{msg.fileName || 'File'}</span>
            {sizeStr && <span className="msg-file-size">{sizeStr}</span>}
          </div>
          <div className="msg-file-download">↓</div>
        </div>
      );
    }
    // Default: text
    return <p>{msg.content}</p>;
  }

  const filteredConversations = conversations.filter(conv => {
    const otherName = conv.participantNames?.find((n, i) => String(conv.participantIds[i]) !== String(userId)) || 'User';
    return otherName.toLowerCase().includes(localSearchQuery.toLowerCase());
  });

  const showMainPanel = activeConversation || chatRecipientId || selectedUser;

  return (
    <div className="chat-page">
      <div className="chat-layout">
        {/* Conversation list */}
        <div className={`chat-sidebar ${!showMainPanel ? 'show-sidebar' : ''}`}>
          <div className="chat-sidebar-header">
            <h3>Messages</h3>
            <button className="btn-new-chat" onClick={() => { setActiveConversation(null); clearSelectedUser(); }}>+ New</button>
          </div>
          <div className="chat-sidebar-search">
            <div className="search-input-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input 
                placeholder="Search chats..." 
                value={localSearchQuery} 
                onChange={e => setLocalSearchQuery(e.target.value)} 
              />
              {localSearchQuery && (
                <button className="clear-search-btn" onClick={() => setLocalSearchQuery('')}>&times;</button>
              )}
            </div>
          </div>
          <div className="chat-conv-list">
            {filteredConversations.length === 0 && <p className="empty-text">No conversations found</p>}
            {filteredConversations.map(conv => {
              const otherName = conv.participantNames?.find((n, i) => String(conv.participantIds[i]) !== String(userId)) || 'User';
              return (
                <div key={conv.id} className={`chat-conv-item ${activeConversation?.id === conv.id ? 'active' : ''}`} onClick={() => openConversation(conv)}>
                  <div className="conv-avatar" style={{ backgroundColor: getAvatarBg(otherName), color: '#fff', fontWeight: 'bold' }}>{otherName[0]?.toUpperCase()}</div>
                  <div className="conv-info">
                    <div className="conv-info-top">
                      <strong>{otherName}</strong>
                      <span className="conv-time">{formatLastMessageTime(conv.lastMessageAt)}</span>
                    </div>
                    <p className="conv-last-msg">{conv.lastMessage || 'No messages'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat area - right side */}
        <div className={`chat-main ${!showMainPanel ? 'hide-main' : ''}`}>
          {!activeConversation && (
            <div className="chat-new-conv">
              <h4>Start a new conversation</h4>
              {selectedUser ? (
                <div className="selected-user-chip">
                  <div className="chip-avatar" style={{ backgroundColor: getAvatarBg(selectedUser.name), color: '#fff', fontWeight: 'bold' }}>{selectedUser.name[0]?.toUpperCase()}</div>
                  <div className="chip-info">
                    <strong>{selectedUser.name}</strong>
                    <span className="chip-role">{selectedUser.role}</span>
                  </div>
                  <button className="chip-remove" onClick={clearSelectedUser}>&times;</button>
                </div>
              ) : (
                <div className="user-search-box">
                  <input className="input" placeholder="Search user by name..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                  {searching && <p className="empty-text">Searching...</p>}
                  {searchResults.length > 0 && (
                    <div className="user-search-results">
                      {searchResults.map(u => (
                        <div key={u.id} className="user-search-item" onClick={() => selectUserToChat(u)}>
                          <div className="conv-avatar" style={{ backgroundColor: getAvatarBg(u.name), color: '#fff', fontWeight: 'bold' }}>{u.name[0]?.toUpperCase()}</div>
                          <div className="conv-info">
                            <strong>{u.name}</strong>
                            <span style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>{u.role}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {searchQuery && !searching && searchResults.length === 0 && <p className="empty-text">No users found</p>}
                </div>
              )}
              {(selectedUser || chatRecipientId) && (
                <div className="chat-input-bar" style={{marginTop: '0.75rem'}}>
                  <input className="input" placeholder="Type a message..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} />
                  <button className="btn-send" onClick={sendMessage}>Send</button>
                </div>
              )}
            </div>
          )}

          {activeConversation && (
            <>
              {(() => {
                const otherName = activeConversation.participantNames?.find((n, i) => String(activeConversation.participantIds[i]) !== String(userId)) || 'Chat';
                return (
                  <div className="chat-header-bar" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button className="back-btn-sm" onClick={() => setActiveConversation(null)}>←</button>
                    <div className="conv-avatar" style={{ backgroundColor: getAvatarBg(otherName), color: '#fff', fontSize: '0.85rem', width: '32px', height: '32px', fontWeight: 'bold' }}>{otherName[0]?.toUpperCase()}</div>
                    <h4 style={{ margin: 0 }}>{otherName}</h4>
                  </div>
                );
              })()}
              <div className="chat-messages">
                {chatMessages.map(msg => (
                  <div key={msg.id} className={`chat-msg ${String(msg.senderId) === String(userId) ? 'sent' : 'received'}`}>
                    <div className="msg-bubble">
                      {renderMessageContent(msg)}
                      <span className="msg-time">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="chat-input-bar">
                {/* Attachment button */}
                <div className="attach-wrapper">
                  <button className="btn-attach" onClick={() => setShowAttachMenu(!showAttachMenu)} title="Attach file">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
                  </button>
                  {showAttachMenu && (
                    <div className="attach-menu">
                      <button onClick={() => openFileSelector('image/*')} title="Photo">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        Photo
                      </button>
                      <button onClick={() => openFileSelector('video/*')} title="Video">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
                        Video
                      </button>
                      <button onClick={() => openFileSelector('audio/*')} title="Audio">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                        Audio
                      </button>
                      <button onClick={() => openFileSelector('*/*')} title="File">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                        File
                      </button>
                    </div>
                  )}
                </div>
                <input className="input" placeholder="Type a message..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} />
                <button className="btn-send" onClick={sendMessage} disabled={uploading}>{uploading ? '...' : 'Send'}</button>
              </div>
              {/* Hidden file input */}
              <input type="file" ref={fileInputRef} style={{display:'none'}} onChange={handleFileUpload} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
