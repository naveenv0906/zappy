import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const voices = [
  { id: 'cgSgspJ2msm6clMCkdW9', label: 'Jessica', desc: 'Female · Playful & Warm' },
  { id: 'EXAVITQu4vr4xnSDxMaL', label: 'Sarah', desc: 'Female · Mature & Confident' },
  { id: 'FGY2WhTYpPnrIDTdsKH5', label: 'Laura', desc: 'Female · Enthusiastic' },
  { id: 'Xb7hH8MSUJpSbSDYk0k2', label: 'Alice', desc: 'Female · Clear & Engaging' },
  { id: 'pFZP5JQG7iQjIQuC4Bku', label: 'Lily', desc: 'Female · Velvety' },
  { id: 'XrExE9yKIg1WjnnlVkGX', label: 'Matilda', desc: 'Female · Professional' },
  { id: 'hpp4J3VqNfWAUOO0d1Us', label: 'Bella', desc: 'Female · Bright & Warm' },
];

export default function Settings() {
  const [apiKeys, setApiKeys] = useState({ groqApiKey: '', elevenLabsApiKey: '' });
  const [hasKeys, setHasKeys] = useState({ hasGroqKey: false, hasElevenLabsKey: false });
  const [aiVoice, setAiVoice] = useState('cgSgspJ2msm6clMCkdW9');
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchApiKeys();
    fetchVoice();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const { data } = await api.get('/chat/api-keys');
      setHasKeys(data);
    } catch (err) {
      if (err.response?.status === 401) navigate('/');
    }
  };

  const fetchVoice = async () => {
    try {
      const { data } = await api.get('/chat/voice');
      setAiVoice(data.aiVoice);
    } catch (err) {
      console.error(err);
    }
  };

  const saveApiKeys = async () => {
    try {
      await api.put('/chat/api-keys', apiKeys);
      fetchApiKeys();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const updateVoice = async (voice) => {
    try {
      await api.put('/chat/voice', { aiVoice: voice });
      setAiVoice(voice);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button onClick={() => navigate('/chat')} className="mb-6 text-sm text-gray-600 hover:text-black">
          ← Back to Chat
        </button>

        <h1 className="text-2xl font-bold mb-8">Settings</h1>

        {/* Voice Selection */}
        <div className="border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-1">AI Voice</h2>
          <p className="text-sm text-gray-500 mb-4">Choose how your AI girlfriend sounds</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {voices.map((v) => (
              <button
                key={v.id}
                onClick={() => updateVoice(v.id)}
                className={`px-3 py-3 text-sm rounded-lg border text-left ${
                  aiVoice === v.id ? 'bg-black text-white border-black' : 'bg-white border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="font-medium">{v.label}</div>
                <div className={`text-xs mt-0.5 ${aiVoice === v.id ? 'text-gray-300' : 'text-gray-500'}`}>{v.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* API Keys */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-2">API Keys</h2>
          <p className="text-sm text-gray-500 mb-6">Optional — uses default keys if not provided</p>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-2">
                Groq API Key {hasKeys.hasGroqKey && <span className="text-green-600">✓ Saved</span>}
              </label>
              <input
                type="password"
                placeholder="gsk_..."
                value={apiKeys.groqApiKey}
                onChange={(e) => setApiKeys({ ...apiKeys, groqApiKey: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">
                ElevenLabs API Key {hasKeys.hasElevenLabsKey && <span className="text-green-600">✓ Saved</span>}
              </label>
              <input
                type="password"
                placeholder="Enter ElevenLabs API key"
                value={apiKeys.elevenLabsApiKey}
                onChange={(e) => setApiKeys({ ...apiKeys, elevenLabsApiKey: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              />
            </div>
            <button onClick={saveApiKeys} className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800">
              {saved ? '✓ Saved!' : 'Save API Keys'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
