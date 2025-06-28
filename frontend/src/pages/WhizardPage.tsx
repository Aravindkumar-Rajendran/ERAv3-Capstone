import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const WhizardPage = () => {
  // Upload state
  const [userContent, setUserContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [topics, setTopics] = useState<string[]>([]);
  const [showTopics, setShowTopics] = useState(false);
  // Chat state
  const [messages, setMessages] = useState([
    { sender: 'whizard', text: 'Hi! I am WhiZard. Ask me anything about your uploaded sources.' }
  ]);
  const [input, setInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  // Topic selection modal
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { logout, token } = useAuth();
  const navigate = useNavigate();

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Upload handler
  const handleUpload = async () => {
    if (!userContent.trim() && !selectedFile && !youtubeUrl.trim()) {
      alert('Please enter some content, upload a file, or provide a YouTube URL first!');
      return;
    }
    setIsUploading(true);
    try {
      const formData = new FormData();
      if (selectedFile) formData.append('files', selectedFile);
      if (userContent.trim()) formData.append('text', userContent);
      if (youtubeUrl.trim()) formData.append('youtube_urls', youtubeUrl);
      const uploadResponse = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!uploadResponse.ok) throw new Error(`Upload failed: ${uploadResponse.status}`);
      const uploadResult = await uploadResponse.json();
      setConversationId(uploadResult.conversation_id);
      // Get topics
      const topicsResponse = await fetch('http://localhost:8000/topics/' + uploadResult.conversation_id, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!topicsResponse.ok) throw new Error(`Topics failed: ${topicsResponse.status}`);
      const topicsResult = await topicsResponse.json();
      setTopics(topicsResult.topics);
      setShowTopics(true);
      setMessages([
        { sender: 'whizard', text: 'Hi! I am WhiZard. Ask me anything about your uploaded sources.' }
      ]);
    } catch (error) {
      alert('Failed to process content. Please try again.');
      setConversationId(null);
      setTopics([]);
      setShowTopics(false);
    }
    setIsUploading(false);
  };

  // Reset handler
  const handleReset = () => {
    setUserContent('');
    setSelectedFile(null);
    setYoutubeUrl('');
    setIsUploading(false);
    setConversationId(null);
    setTopics([]);
    setShowTopics(false);
    setMessages([{ sender: 'whizard', text: 'Hi! I am WhiZard. Ask me anything about your uploaded sources.' }]);
    setInput('');
    setShowTopicModal(false);
    setSelectedTopics([]);
  };

  // Chat send handler
  const handleSend = async () => {
    if (!input.trim() || !conversationId) return;
    const userMsg = { sender: 'user', text: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput('');
    setIsChatLoading(true);
    try {
      const formData = new FormData();
      formData.append('user_input', input);
      formData.append('conversation_id', conversationId);
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        body: formData,
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Chat failed');
      const data = await response.json();
      setMessages((msgs) => [...msgs, { sender: 'whizard', text: data.response }]);
    } catch (e) {
      setMessages((msgs) => [...msgs, { sender: 'whizard', text: 'Sorry, something went wrong.' }]);
    }
    setIsChatLoading(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Generate Magic (open topic modal)
  const handleGenerateMagic = () => {
    setShowTopicModal(true);
    setSelectedTopics([]);
  };

  // Topic selection
  const handleTopicSelect = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic)
        ? prev.filter((t) => t !== topic)
        : [...prev, topic]
    );
  };

  // Proceed to interactive page
  const handleTopicModalProceed = () => {
    setShowTopicModal(false);
    if (conversationId && selectedTopics.length > 0) {
      navigate('/interactive', { state: { selectedTopics, conversationId } });
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #2d2d2d 100%)', color: '#fff', fontFamily: 'Arial, sans-serif', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: 0 }}>
      {/* Logout Button */}
      <button onClick={handleLogout} style={{ position: 'absolute', top: 20, right: 20, background: 'linear-gradient(45deg, #f44336, #e57373)', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(244,67,54,0.15)', zIndex: 10 }}>Logout</button>
      {/* Header */}
      <div style={{ background: 'rgba(0,0,0,0.5)', padding: '20px', borderBottom: '2px solid #4caf50', width: '100%' }}>
        <h1 style={{ margin: 0, textAlign: 'center', fontSize: '2.5rem', background: 'linear-gradient(45deg, #4caf50, #66bb6a, #81c784)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 0 20px rgba(76, 175, 80, 0.3)' }}>🧙‍♂️ WhizardLM</h1>
        <p style={{ textAlign: 'center', margin: '10px 0 0 0', opacity: 0.8, fontSize: '1.1rem' }}>AI-Powered Interactive Learning Platform</p>
      </div>
      {/* Upload Section */}
      {!conversationId && (
        <div style={{ width: '100%', maxWidth: 700, margin: '40px auto 0 auto', background: 'rgba(255,255,255,0.05)', borderRadius: '15px', padding: '30px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ margin: '0 0 20px 0', color: '#4caf50' }}>📝 Enter Your Learning Content</h2>
          {/* Text Input */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px', color: '#4caf50' }}>Option 1: Paste Text Content</label>
            <textarea value={userContent} onChange={(e) => { setUserContent(e.target.value); if (e.target.value.trim()) { setSelectedFile(null); setYoutubeUrl(''); } }} placeholder="Paste your text content here... (articles, documents, notes, etc.)" style={{ width: '100%', height: '150px', background: 'rgba(0,0,0,0.3)', border: '2px solid #16213e', borderRadius: '10px', padding: '15px', color: '#e0dede', fontSize: '16px', fontFamily: 'Arial, sans-serif', resize: 'vertical' }} />
          </div>
          {/* OR Separator */}
          <div style={{ textAlign: 'center', margin: '20px 0', color: '#888' }}><span style={{ background: 'rgba(255,255,255,0.05)', padding: '5px 15px', borderRadius: '15px' }}>OR</span></div>
          {/* File Upload */}
          <div>
            <label style={{ display: 'block', marginBottom: '10px', color: '#4caf50' }}>Option 2: Upload File (PDF, TXT)</label>
            <div style={{ border: '2px dashed #16213e', borderRadius: '10px', padding: '20px', textAlign: 'center', background: 'rgba(0,0,0,0.2)', cursor: 'pointer', transition: 'all 0.3s ease' }} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); const files = e.dataTransfer.files; if (files.length > 0) { setSelectedFile(files[0]); setUserContent(''); setYoutubeUrl(''); } }}>
              <input type="file" id="file-upload" accept=".pdf,.txt" onChange={(e) => { if (e.target.files && e.target.files[0]) { setSelectedFile(e.target.files[0]); setUserContent(''); setYoutubeUrl(''); } }} style={{ display: 'none' }} />
              <label htmlFor="file-upload" style={{ cursor: 'pointer', color: '#4caf50' }}>
                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📄</div>
                {selectedFile ? (
                  <div>
                    <div style={{ color: '#4caf50', fontWeight: 'bold' }}>✅ {selectedFile.name}</div>
                    <div style={{ color: '#888', fontSize: '14px' }}>Click to change file</div>
                  </div>
                ) : (
                  <div>
                    <div>Click to upload or drag & drop</div>
                    <div style={{ color: '#888', fontSize: '14px' }}>Supported: PDF, TXT files</div>
                  </div>
                )}
              </label>
            </div>
          </div>
          {/* OR Separator */}
          <div style={{ textAlign: 'center', margin: '20px 0', color: '#888' }}><span style={{ background: 'rgba(255,255,255,0.05)', padding: '5px 15px', borderRadius: '15px' }}>OR</span></div>
          {/* YouTube URL Input */}
          <div>
            <label style={{ display: 'block', marginBottom: '10px', color: '#4caf50' }}>Option 3: YouTube Video URL</label>
            <input type="url" value={youtubeUrl} onChange={(e) => { setYoutubeUrl(e.target.value); if (e.target.value.trim()) { setUserContent(''); setSelectedFile(null); } }} placeholder="Paste YouTube video URL here... (e.g., https://www.youtube.com/watch?v=...)" style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '2px solid #16213e', borderRadius: '10px', padding: '15px', color: '#e0dede', fontSize: '16px', fontFamily: 'Arial, sans-serif' }} />
            {youtubeUrl && (<div style={{ marginTop: '10px', color: '#4caf50', fontSize: '14px' }}>✅ YouTube URL ready for processing</div>)}
          </div>
          {/* Upload/Reset Buttons */}
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '30px' }}>
            <button onClick={handleUpload} disabled={isUploading} style={{ background: isUploading ? 'linear-gradient(45deg, #666, #888)' : 'linear-gradient(45deg, #4caf50, #66bb6a)', color: 'white', border: 'none', borderRadius: '25px', padding: '15px 40px', fontSize: '18px', fontWeight: 'bold', cursor: isUploading ? 'not-allowed' : 'pointer', transition: 'all 0.3s ease', boxShadow: '0 4px 20px rgba(76, 175, 80, 0.3)' }}>{isUploading ? '🔄 Uploading...' : 'Upload'}</button>
            <button onClick={handleReset} style={{ background: 'linear-gradient(45deg, #ff5722, #ff7043)', color: 'white', border: 'none', borderRadius: '25px', padding: '15px 30px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 4px 20px rgba(255, 87, 34, 0.3)' }}>Reset</button>
          </div>
        </div>
      )}
      {/* Chat Section */}
      {conversationId && (
        <div style={{ flex: 1, width: '100%', maxWidth: '700px', margin: '40px auto 0 auto', background: 'rgba(255,255,255,0.05)', borderRadius: '15px', padding: '30px 0 90px 0', border: '1px solid rgba(255,255,255,0.1)', minHeight: '500px', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 4px 24px rgba(0,0,0,0.15)' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 30px' }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-end', marginBottom: '18px' }}>
                {/* Avatar */}
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: msg.sender === 'user' ? '#4caf50' : '#16213e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: '#fff', margin: msg.sender === 'user' ? '0 0 0 16px' : '0 16px 0 0', border: msg.sender === 'user' ? '2px solid #4caf50' : '2px solid #16213e' }}>{msg.sender === 'user' ? '🧑' : '🧙‍♂️'}</div>
                {/* Message bubble */}
                <div style={{ background: msg.sender === 'user' ? 'linear-gradient(45deg, #4caf50, #66bb6a)' : 'linear-gradient(45deg, #16213e, #0f3460)', color: '#fff', borderRadius: '16px', padding: '16px 22px', maxWidth: '70%', fontSize: '1.1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', wordBreak: 'break-word', textAlign: 'left' }}>{msg.text}</div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          {/* Input area */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', background: 'rgba(0,0,0,0.7)', borderBottomLeftRadius: '15px', borderBottomRightRadius: '15px', padding: '18px 30px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleInputKeyDown} placeholder="Type your question..." style={{ flex: 1, minHeight: 40, maxHeight: 120, borderRadius: 10, border: '2px solid #16213e', padding: '12px 16px', fontSize: 16, color: '#fff', background: 'rgba(0,0,0,0.2)', resize: 'vertical', outline: 'none' }} disabled={isChatLoading} />
            <button onClick={handleSend} disabled={isChatLoading || !input.trim()} style={{ background: isChatLoading || !input.trim() ? 'linear-gradient(45deg, #666, #888)' : 'linear-gradient(45deg, #4caf50, #66bb6a)', color: 'white', border: 'none', borderRadius: '10px', padding: '12px 28px', fontSize: '16px', fontWeight: 'bold', cursor: isChatLoading || !input.trim() ? 'not-allowed' : 'pointer', transition: 'all 0.3s ease', boxShadow: '0 2px 8px rgba(76, 175, 80, 0.15)' }}>{isChatLoading ? '...' : 'Send'}</button>
            <button onClick={handleGenerateMagic} style={{ background: 'linear-gradient(45deg, #ff9800, #ffb74d)', color: 'white', border: 'none', borderRadius: '10px', padding: '12px 28px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 2px 8px rgba(255, 152, 0, 0.15)' }}>✨ Generate Magic</button>
          </div>
        </div>
      )}
      {/* Topic Selection Modal */}
      {showTopicModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#222', borderRadius: '18px', padding: '40px 30px', minWidth: 340, maxWidth: 420, boxShadow: '0 8px 32px rgba(0,0,0,0.25)', color: '#fff', textAlign: 'center', position: 'relative' }}>
            <h2 style={{ color: '#ff9800', marginBottom: 18 }}>🎯 Select Topics</h2>
            <p style={{ color: '#bbb', marginBottom: 24 }}>Choose one or more topics to generate interactive elements:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              {topics.map((topic, idx) => (
                <button key={idx} onClick={() => handleTopicSelect(topic)} style={{ background: selectedTopics.includes(topic) ? 'linear-gradient(45deg, #4caf50, #66bb6a)' : 'rgba(255,255,255,0.08)', color: selectedTopics.includes(topic) ? 'white' : '#e0dede', border: selectedTopics.includes(topic) ? '2px solid #4caf50' : '2px solid #16213e', borderRadius: 10, padding: '12px', fontSize: 15, cursor: 'pointer', transition: 'all 0.2s' }}>{selectedTopics.includes(topic) && '✅ '}{topic}</button>
              ))}
            </div>
            <button onClick={handleTopicModalProceed} disabled={selectedTopics.length === 0} style={{ background: selectedTopics.length === 0 ? 'linear-gradient(45deg, #666, #888)' : 'linear-gradient(45deg, #ff9800, #ffb74d)', color: 'white', border: 'none', borderRadius: 12, padding: '14px 32px', fontSize: 16, fontWeight: 'bold', cursor: selectedTopics.length === 0 ? 'not-allowed' : 'pointer', marginTop: 10, transition: 'all 0.2s' }}>Generate Magic</button>
            <button onClick={() => setShowTopicModal(false)} style={{ background: 'none', color: '#bbb', border: 'none', fontSize: 15, marginTop: 18, cursor: 'pointer', textDecoration: 'underline' }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}; 