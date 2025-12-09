import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function Profile() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/profile');
      setUser(data);
    } catch (err) {
      if (err.response?.status === 401) navigate('/');
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
              <label className="text-sm text-gray-600">Bond Type</label>
              <p className="text-lg font-medium">{user.bondType}</p>
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
