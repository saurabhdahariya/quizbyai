import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [numQuestions, setNumQuestions] = useState(5);
  const [timePerQuestion, setTimePerQuestion] = useState(30);
  const [useTimer, setUseTimer] = useState(true);
  const navigate = useNavigate();

  const popularTopics = [
    'JavaScript', 'React', 'Python', 'History',
    'Science', 'Geography', 'Literature', 'Math'
  ];

  const startQuiz = () => {
    if (topic.trim() === '') {
      alert('Please enter a topic to start the quiz!');
      return;
    }

    navigate('/quiz', {
      state: {
        topic,
        difficulty,
        numQuestions: parseInt(numQuestions),
        timePerQuestion: useTimer ? parseInt(timePerQuestion) : 0
      }
    });
  };

  const selectTopic = (selectedTopic) => {
    setTopic(selectedTopic);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold text-center">QUIZMYSELF</h1>
        </div>
      </nav>

      <div className="container mx-auto p-4 md:p-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-1/4 bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Popular Topics</h3>
            <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
              {popularTopics.map((t, index) => (
                <button
                  key={index}
                  onClick={() => selectTopic(t)}
                  className={`p-2 rounded text-left transition-colors ${
                    topic === t
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 hover:bg-blue-100 text-gray-800'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="w-full md:w-3/4">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Create Your Quiz</h2>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="topic">
                  Topic
                </label>
                <input
                  id="topic"
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter a quiz topic (e.g., JavaScript, World History)"
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="difficulty">
                  Difficulty
                </label>
                <select
                  id="difficulty"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="numQuestions">
                  Number of Questions
                </label>
                <select
                  id="numQuestions"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="15">15</option>
                </select>
              </div>

              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <input
                    id="useTimer"
                    type="checkbox"
                    checked={useTimer}
                    onChange={(e) => setUseTimer(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-gray-700 text-sm font-bold" htmlFor="useTimer">
                    Use Timer
                  </label>
                </div>

                {useTimer && (
                  <div className="pl-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="timePerQuestion">
                      Seconds per Question
                    </label>
                    <select
                      id="timePerQuestion"
                      value={timePerQuestion}
                      onChange={(e) => setTimePerQuestion(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="15">15 seconds</option>
                      <option value="30">30 seconds</option>
                      <option value="45">45 seconds</option>
                      <option value="60">60 seconds</option>
                    </select>
                  </div>
                )}
              </div>

              <button
                onClick={startQuiz}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                Start Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;