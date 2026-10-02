import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const voices = {
  'cgSgspJ2msm6clMCkdW9': 'Jessica',
  'EXAVITQu4vr4xnSDxMaL': 'Sarah',
  'FGY2WhTYpPnrIDTdsKH5': 'Laura',
  'XB0fDUnXU5powFXDhCwa': 'Charlotte',
  'Xb7hH8MSUJpSbSDYk0k2': 'Alice',
  'pFZP5JQG7iQjIQuC4Bku': 'Lily',
  '9BWtsMINqrJLrRacOk9x': 'Aria',
  'SAz9YHcvj6GT2YYXdXww': 'River',
  'XrExE9yKIg1WjnnlVkGX': 'Matilda',
  'pMsXgVXv3BLzUgSXRplE': 'Serena',
  'piTKgcLEGmPE4e6mEKli': 'Nicole',
  'oWAxZDx7w5VEj9dCyTzz': 'Grace',
};

export default function Profile() {
  const [user, setUser] = useState(null);
  const [aiVoice, setAiVoice] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
    fetchVoice();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/profile');
      setUser(data);
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

  if (!user) return <div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/chat')}
          className="mb-6 text-sm text-gray-600 hover:text-black"
        >
          ← Back to Chat
        </button>

        <div className="border border-gray-200 rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6">Profile</h1>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600">Name</label>
              <p className="text-lg font-medium">{user.name}</p>
            </div>

            <div>
              <label className="text-sm text-gray-600">Email</label>
              <p className="text-lg font-medium">{user.email}</p>
            </div>

            <div>
              <label className="text-sm text-gray-600">AI Voice</label>
              <p className="text-lg font-medium">{voices[aiVoice] || aiVoice || 'Jessica'}</p>
            </div>

            <div>
              <label className="text-sm text-gray-600">Member Since</label>
              <p className="text-lg font-medium">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
