import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [bondType, setBondType] = useState('Girlfriend');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const navigate = useNavigate();



  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);



  const sendMessage = async (e, audioData = null) => {
    e?.preventDefault();
    if ((!input.trim() && !audioData) || loading) return;

    const userMessage = { role: 'user', content: audioData ? '🎤 Voice message' : input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const payload = audioData ? { audio: audioData } : { text: input };
      const { data } = await api.post('/chat/message', payload);
      setMessages((prev) => [...prev, { role: 'assistant', content: data.text }]);
      
      if (data.audio) {
        const audio = new Audio(`data:audio/mp3;base64,${data.audio}`);
        audio.playbackRate = 0.85;
        audio.play();
      }
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Error: Failed to get response' }]);
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result.split(',')[1];
          sendMessage(null, base64);
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone access denied:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };



  const clearHistory = async () => {
    try {
      await api.delete('/chat/history');
      setMessages([]);
    } catch (err) {
      console.error(err);
    }
  };

  const logout = async () => {
    try {
      await api.get('/auth/logout');
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
        <h1 className="text-lg sm:text-xl font-semibold">Zappy AI</h1>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={clearHistory}
            className="hidden sm:block px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            Clear History
          </button>
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <button
                  onClick={() => { navigate('/profile'); setShowDropdown(false); }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-t-lg"
                >
                  Profile
                </button>
                <button
                  onClick={() => { navigate('/settings'); setShowDropdown(false); }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Settings
                </button>
                <button
                  onClick={() => { navigate('/history'); setShowDropdown(false); }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  History
                </button>
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-b-lg text-red-600"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>



      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-12 sm:mt-20 px-4">
            <h2 className="text-xl sm:text-2xl font-semibold mb-2">Start a conversation</h2>
            <p className="text-sm sm:text-base">Your AI {bondType} is ready to chat</p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-3 sm:space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[80%] px-3 sm:px-4 py-2 sm:py-3 rounded-2xl text-sm sm:text-base ${
                    msg.role === 'user'
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-black'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-4 py-3 rounded-2xl">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-3 sm:p-4">
        <form onSubmit={sendMessage} className="max-w-3xl mx-auto">
          <div className="flex gap-1.5 sm:gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message Zappy AI..."
              className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              disabled={loading || isRecording}
            />
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={loading}
              className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-200 hover:bg-gray-300'} disabled:opacity-50`}
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
              </svg>
            </button>
            <button
              type="submit"
              disabled={loading || !input.trim() || isRecording}
              className="px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
