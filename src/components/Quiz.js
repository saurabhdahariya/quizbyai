import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { generateQuestions } from '../utils/api';
import { parseQuestions } from '../utils/parser';

function Quiz() {
  const { state } = useLocation();
  const navigate = useNavigate();

  // Get quiz settings from state or use defaults
  const topic = state?.topic || 'General';
  const difficulty = state?.difficulty || 'medium';
  const numQuestions = state?.numQuestions || 5;
  const timePerQuestion = state?.timePerQuestion || 0;

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(timePerQuestion);
  const [timerActive, setTimerActive] = useState(false);

  const timerRef = useRef(null);

  // Option letter mapping
  const optionLetters = React.useMemo(() => ['A', 'B', 'C', 'D', 'E'], []);

  // End quiz and navigate to results
  const endQuiz = React.useCallback(() => {
    navigate('/result', {
      state: {
        score,
        total: questions.length,
        answers: userAnswers,
        topic,
        difficulty,
        timePerQuestion
      }
    });
  }, [navigate, score, questions.length, userAnswers, topic, difficulty, timePerQuestion]);

  // Handle time up
  const handleTimeUp = React.useCallback(() => {
    // If no option selected, record as incorrect
    if (selectedOption === null && questions[current]) {
      // Find the correct answer's index to get its letter
      const correctAnswerIndex = questions[current]?.options.findIndex(
        opt => opt === questions[current]?.answer
      );
      const correctAnswerLetter = correctAnswerIndex >= 0 ? optionLetters[correctAnswerIndex] : '';

      setUserAnswers(prev => [...prev, {
        question: questions[current]?.question || '',
        userAnswer: "Time expired",
        correctAnswer: correctAnswerLetter ?
          `${correctAnswerLetter}) ${questions[current]?.answer}` :
          questions[current]?.answer || '',
        explanation: questions[current]?.explanation || '',
        isCorrect: false
      }]);
    }

    // Move to next question or end quiz
    if (current + 1 < questions.length) {
      setCurrent(current + 1);
      setSelectedOption(null);
      setTimeLeft(timePerQuestion);
    } else {
      // End quiz
      endQuiz();
    }
  }, [current, endQuiz, questions, selectedOption, timePerQuestion, optionLetters]);

  // Load questions on component mount
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const raw = await generateQuestions(topic, difficulty, numQuestions);
        console.log("Raw API response:", raw);
        const parsed = parseQuestions(raw);
        console.log("Parsed questions:", parsed);
        setQuestions(parsed);
        setLoading(false);

        // Start timer if timePerQuestion is set
        if (timePerQuestion > 0) {
          setTimeLeft(timePerQuestion);
          setTimerActive(true);
        }
      } catch (err) {
        console.error("Failed to load questions:", err);
        setError("Failed to load questions. Please try again.");
        setLoading(false);
      }
    }
    load();
  }, [topic, difficulty, numQuestions, timePerQuestion]);

  // Timer effect
  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timerActive && timeLeft === 0) {
      // Time's up for this question
      handleTimeUp();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft, timerActive, handleTimeUp]);

  // Loading and error states
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <p className="text-lg text-gray-700">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-lg text-gray-700">No questions available. Try another topic.</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Handle option selection
  const handleOptionSelect = (opt, index) => {
    if (selectedOption !== null) return; // Prevent changing answer

    setSelectedOption(opt);
    setTimerActive(false); // Stop timer when option selected

    // Check if answer is correct
    const isCorrect = opt === questions[current].answer;
    if (isCorrect) {
      setScore(score + 1);
    }

    // Find the correct answer's index to get its letter
    const correctAnswerIndex = questions[current].options.findIndex(
      option => option === questions[current].answer
    );
    const correctAnswerLetter = correctAnswerIndex >= 0 ? optionLetters[correctAnswerIndex] : '';

    // Save user's answer with letter prefix
    setUserAnswers([...userAnswers, {
      question: questions[current].question,
      userAnswer: `${optionLetters[index]}) ${opt}`,
      correctAnswer: `${correctAnswerLetter}) ${questions[current].answer}`,
      explanation: questions[current].explanation,
      isCorrect
    }]);
  };

  // Handle next question
  const handleNext = () => {
    if (current + 1 < questions.length) {
      setCurrent(current + 1);
      setSelectedOption(null); // Reset selected option

      // Reset timer for next question
      if (timePerQuestion > 0) {
        setTimeLeft(timePerQuestion);
        setTimerActive(true);
      }
    } else {
      // End quiz
      endQuiz();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
        {/* Quiz header */}
        <div className="bg-blue-600 text-white p-4 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Topic: {topic}</h2>
            <div className="text-sm">
              Question {current + 1} of {questions.length}
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-blue-800 rounded-full h-2.5 mt-2">
            <div
              className="bg-green-500 h-2.5 rounded-full"
              style={{ width: `${((current + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Quiz content */}
        <div className="p-6">
          {/* Timer display */}
          {timePerQuestion > 0 && (
            <div className="mb-4 flex justify-end">
              <div className={`text-lg font-bold rounded-full w-12 h-12 flex items-center justify-center
                ${timeLeft <= 10 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                {timeLeft}
              </div>
            </div>
          )}

          {/* Question */}
          <h3 className="text-xl font-bold text-gray-800 mb-6">
            {questions[current].question}
          </h3>

          {/* Options */}
          <div className="space-y-3 mb-6">
            {questions[current].options && questions[current].options.length > 0 ? (
              questions[current].options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleOptionSelect(opt, i)}
                  disabled={selectedOption !== null}
                  className={`w-full text-left p-4 rounded-lg transition-colors flex items-start
                    ${selectedOption === opt
                      ? 'bg-blue-600 text-white'
                      : selectedOption !== null
                        ? 'bg-gray-100 text-gray-700 cursor-not-allowed'
                        : 'bg-gray-100 hover:bg-blue-100 text-gray-700'
                    }`}
                >
                  <span className="font-bold mr-3 text-lg">{optionLetters[i]}.</span>
                  <span>{opt}</span>
                </button>
              ))
            ) : (
              <div className="text-center p-4 bg-yellow-100 text-yellow-800 rounded-lg">
                <p>No options available for this question.</p>
                <button
                  onClick={() => navigate('/')}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Back to Home
                </button>
              </div>
            )}
          </div>

          {/* Next button */}
          {selectedOption && (
            <button
              onClick={handleNext}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors"
            >
              {current + 1 < questions.length ? 'Next Question' : 'See Results'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Quiz;
