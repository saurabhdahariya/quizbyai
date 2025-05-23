import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function Result() {
  const { state } = useLocation();
  const navigate = useNavigate();

  // Default values in case state is missing
  const score = state?.score || 0;
  const total = state?.total || 0;
  const answers = state?.answers || [];
  const topic = state?.topic || 'General';
  const difficulty = state?.difficulty || 'medium';

  const [showExplanations, setShowExplanations] = useState(true);

  // Calculate percentage score
  const percentage = Math.round((score / total) * 100);

  // Get appropriate feedback based on score
  const getFeedback = () => {
    if (percentage >= 90) return "Excellent! You're a master of this topic!";
    if (percentage >= 70) return "Great job! You have a solid understanding.";
    if (percentage >= 50) return "Good effort! Keep studying to improve.";
    return "Keep practicing! You'll get better with time.";
  };

  // Handle retry with same settings
  const handleRetry = () => {
    navigate('/quiz', {
      state: {
        topic,
        difficulty,
        numQuestions: total,
        timePerQuestion: state?.timePerQuestion || 0
      }
    });
  };

  // Handle share results (mock functionality)
  const handleShare = () => {
    const text = `I scored ${score}/${total} (${percentage}%) on a ${difficulty} ${topic} quiz!`;

    // Check if Web Share API is available
    if (navigator.share) {
      navigator.share({
        title: 'My Quiz Results',
        text: text,
      }).catch(err => {
        alert('Sharing failed: ' + err);
      });
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(text)
        .then(() => alert('Result copied to clipboard!'))
        .catch(() => alert('Could not copy to clipboard.'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 text-white p-6">
            <h2 className="text-2xl font-bold">Quiz Results</h2>
            <p className="text-sm opacity-90">Topic: {topic} | Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</p>
          </div>

          {/* Score section */}
          <div className="p-6 border-b">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-4 md:mb-0">
                <h3 className="text-xl font-bold text-gray-800">{getFeedback()}</h3>
                <p className="text-gray-600">You answered {score} out of {total} questions correctly.</p>
              </div>

              <div className="relative w-32 h-32">
                <div className="w-full h-full rounded-full flex items-center justify-center bg-blue-100">
                  <div className="text-3xl font-bold text-blue-600">{percentage}%</div>
                </div>
                {/* Circular progress indicator would go here with more complex CSS */}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800">Question Review</h3>
            <div className="flex items-center">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showExplanations}
                  onChange={() => setShowExplanations(!showExplanations)}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                <span className="ms-3 text-sm font-medium text-gray-700">Show Explanations</span>
              </label>
            </div>
          </div>

          {/* Question review */}
          <div className="p-6">
            <div className="space-y-6">
              {answers.map((answer, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    answer.isCorrect
                      ? 'border-green-500 bg-green-50'
                      : 'border-red-500 bg-red-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-gray-800">Question {index + 1}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      answer.isCorrect
                        ? 'bg-green-200 text-green-800'
                        : 'bg-red-200 text-red-800'
                    }`}>
                      {answer.isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>

                  <p className="my-2 text-gray-800">{answer.question}</p>

                  <div className="mt-2">
                    <p className="text-sm">
                      <span className="font-semibold">Your answer:</span>
                      <span className={answer.isCorrect ? 'text-green-600' : 'text-red-600'}>
                        {' '}{answer.userAnswer}
                      </span>
                    </p>

                    {!answer.isCorrect && (
                      <p className="text-sm mt-1">
                        <span className="font-semibold">Correct answer:</span>
                        <span className="text-green-600">{' '}{answer.correctAnswer}</span>
                      </p>
                    )}

                    {showExplanations && answer.explanation && (
                      <div className="mt-3 p-3 bg-gray-100 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <span className="font-semibold">Explanation:</span> {answer.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="p-6 bg-gray-50 flex flex-wrap gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition-colors"
            >
              New Quiz
            </button>

            <button
              onClick={handleRetry}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded transition-colors"
            >
              Retry This Topic
            </button>

            <button
              onClick={handleShare}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded transition-colors"
            >
              Share Results
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Result;
