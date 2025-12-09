import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function History() {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data } = await api.get('/history');
      setTopics(data);
    } catch (err) {
      if (err.response?.status === 401) navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {!selectedTopic && (
          <button
            onClick={() => navigate('/chat')}
            className="mb-6 text-sm text-gray-600 hover:text-black"
          >
            ← Back to Chat
          </button>
        )}

        <h1 className="text-2xl font-bold mb-8">Conversation History</h1>

        {selectedTopic ? (
          <div>
            <button
              onClick={() => setSelectedTopic(null)}
              className="mb-4 text-sm text-gray-600 hover:text-black"
            >
              ← Back to Topics
            </button>
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">{selectedTopic.title}</h2>
              <p className="text-sm text-gray-600 mb-6">{selectedTopic.date}</p>
              <div className="space-y-4">
                {selectedTopic.messages.map((msg, idx) => (
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
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {topics.length === 0 ? (
              <p className="text-gray-500 text-center py-12">No conversation history yet</p>
            ) : (
              topics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic)}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 text-left"
                >
                  <h3 className="font-semibold mb-1">{topic.title}</h3>
                  <p className="text-sm text-gray-600">
                    {topic.date} • {topic.messageCount} messages
                  </p>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
