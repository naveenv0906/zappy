import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [bondType, setBondType] = useState('Girlfriend');
  const [showSettings, setShowSettings] = useState(false);
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [apiKeys, setApiKeys] = useState({ groqApiKey: '', deepgramApiKey: '' });
  const [hasKeys, setHasKeys] = useState({ hasGroqKey: false, hasDeepgramKey: false });
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const bondTypes = [
    'Mother', 'Father', 'Sister', 'Brother', 'Grandmother', 'Grandfather', 'Aunt', 'Uncle', 'Cousin',
    'Godparent', 'Mentor', 'Like a sister', 'Like a brother',
    'Girlfriend', 'Boyfriend', 'Partner', 'Significant Other', 'Wife', 'Husband', 'Fiancé', 'Fiancée',
    'Best Friend', 'Close Friend', 'Confidant', 'Companion', 'Neighbor', 'Teammate', 'Colleague', 'Coworker'
  ];

  useEffect(() => {
    fetchBondType();
    fetchApiKeys();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchBondType = async () => {
    try {
      const { data } = await api.get('/chat/bond');
      setBondType(data.bondType);
    } catch (err) {
      if (err.response?.status === 401) navigate('/');
    }
  };

  const fetchApiKeys = async () => {
    try {
      const { data } = await api.get('/chat/api-keys');
      setHasKeys(data);
    } catch (err) {
      console.error(err);
    }
  };

  const saveApiKeys = async () => {
    try {
      await api.put('/chat/api-keys', apiKeys);
      setShowApiKeys(false);
      fetchApiKeys();
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await api.post('/chat/message', { text: input });
      setMessages((prev) => [...prev, { role: 'assistant', content: data.text }]);
      
      if (data.audio) {
        const audio = new Audio(`data:audio/mp3;base64,${data.audio}`);
        audio.play();
      }
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Error: Failed to get response' }]);
    } finally {
      setLoading(false);
    }
  };

  const updateBond = async (newBond) => {
    try {
      await api.put('/chat/bond', { bondType: newBond });
      setBondType(newBond);
      setShowSettings(false);
    } catch (err) {
      console.error(err);
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
      <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Zappy AI</h1>
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
                onClick={() => { setShowSettings(!showSettings); setShowDropdown(false); }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Settings
              </button>
              <button
                onClick={() => { setShowApiKeys(!showApiKeys); setShowDropdown(false); }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                API Keys
              </button>
              <button
                onClick={() => { clearHistory(); setShowDropdown(false); }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Clear History
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

      {/* API Keys Panel */}
      {showApiKeys && (
        <div className="border-b border-gray-200 p-4 bg-gray-50">
          <p className="text-sm font-semibold mb-3">API Keys (Optional - Uses default if not provided)</p>
          <div className="space-y-3 max-w-2xl">
            <div>
              <label className="text-xs text-gray-600 block mb-1">
                Groq API Key {hasKeys.hasGroqKey && '✓'}
              </label>
              <input
                type="password"
                placeholder="gsk_..."
                value={apiKeys.groqApiKey}
                onChange={(e) => setApiKeys({ ...apiKeys, groqApiKey: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 block mb-1">
                Deepgram API Key {hasKeys.hasDeepgramKey && '✓'}
              </label>
              <input
                type="password"
                placeholder="Enter Deepgram API key"
                value={apiKeys.deepgramApiKey}
                onChange={(e) => setApiKeys({ ...apiKeys, deepgramApiKey: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              />
            </div>
            <button
              onClick={saveApiKeys}
              className="px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800"
            >
              Save API Keys
            </button>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="border-b border-gray-200 p-4 bg-gray-50">
          <p className="text-sm font-semibold mb-2">Bond Type: {bondType}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-60 overflow-y-auto">
            {bondTypes.map((bond) => (
              <button
                key={bond}
                onClick={() => updateBond(bond)}
                className={`px-3 py-2 text-sm rounded-lg border ${
                  bondType === bond
                    ? 'bg-black text-white border-black'
                    : 'bg-white border-gray-300 hover:bg-gray-100'
                }`}
              >
                {bond}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-20">
            <h2 className="text-2xl font-semibold mb-2">Start a conversation</h2>
            <p>Your AI {bondType} is ready to chat</p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl ${
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
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={sendMessage} className="max-w-3xl mx-auto">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message Zappy AI..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
