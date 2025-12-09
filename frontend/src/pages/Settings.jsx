import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function Settings() {
  const [bondType, setBondType] = useState('Girlfriend');
  const [apiKeys, setApiKeys] = useState({ groqApiKey: '', deepgramApiKey: '' });
  const [hasKeys, setHasKeys] = useState({ hasGroqKey: false, hasDeepgramKey: false });
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

  const updateBond = async (newBond) => {
    try {
      await api.put('/chat/bond', { bondType: newBond });
      setBondType(newBond);
    } catch (err) {
      console.error(err);
    }
  };

  const saveApiKeys = async () => {
    try {
      await api.put('/chat/api-keys', apiKeys);
      fetchApiKeys();
      alert('API keys saved successfully');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/chat')}
          className="mb-6 text-sm text-gray-600 hover:text-black"
        >
          ← Back to Chat
        </button>

        <h1 className="text-2xl font-bold mb-8">Settings</h1>

        {/* Bond Type Section */}
        <div className="border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Bond Type: {bondType}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
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

        {/* API Keys Section */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-2">API Keys</h2>
          <p className="text-sm text-gray-600 mb-4">Optional - Uses default if not provided</p>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-2">
                Groq API Key {hasKeys.hasGroqKey && '✓'}
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
                Deepgram API Key {hasKeys.hasDeepgramKey && '✓'}
              </label>
              <input
                type="password"
                placeholder="Enter Deepgram API key"
                value={apiKeys.deepgramApiKey}
                onChange={(e) => setApiKeys({ ...apiKeys, deepgramApiKey: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              />
            </div>

            <button
              onClick={saveApiKeys}
              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800"
            >
              Save API Keys
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
