import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, AlertCircle, Home, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import { generateQuestions } from '../utils/api';
import { parseQuestions } from '../utils/parser';
import Header from './Header';
import Button from './ui/Button';
import Card, { CardContent, CardHeader } from './ui/Card';
import PageTransition from './PageTransition';

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

        // Request more questions than needed to account for potential duplicates or parsing failures
        const requestedQuestions = Math.min(Math.max(numQuestions * 1.5, numQuestions + 5), 20);
        console.log(`Requesting ${requestedQuestions} questions for topic: ${topic}`);

        // Normalize topic name to improve matching
        const normalizedTopic = topic.trim();

        // Add topic-specific prefixes for better results
        let topicPrompt = normalizedTopic;

        // Special handling for common topics
        if (normalizedTopic.toLowerCase() === 'math' || normalizedTopic.toLowerCase() === 'mathematics') {
          topicPrompt = 'Mathematics and mathematical concepts';
        } else if (normalizedTopic.toLowerCase() === 'javascript') {
          topicPrompt = 'JavaScript programming language';
        } else if (normalizedTopic.toLowerCase() === 'react') {
          topicPrompt = 'React.js framework';
        }

        console.log(`Using topic prompt: "${topicPrompt}"`);
        const raw = await generateQuestions(topicPrompt, difficulty, requestedQuestions);
        console.log("Raw API response:", raw);

        let parsed = parseQuestions(raw);
        console.log("Parsed questions:", parsed);

        // If we don't have enough questions, try to get more with different prompts
        if (parsed.length < numQuestions) {
          console.log(`Not enough questions (${parsed.length}/${numQuestions}). Trying again with alternative prompts...`);

          // Try different phrasings to get better topic-specific questions
          let alternativePrompts = [];

          // Topic-specific alternative prompts
          if (normalizedTopic.toLowerCase() === 'math' || normalizedTopic.toLowerCase() === 'mathematics') {
            alternativePrompts = [
              'Mathematics quiz questions',
              'Math problems and solutions',
              'Mathematical concepts quiz',
              'Algebra, geometry, and calculus questions',
              'Math formulas and principles test'
            ];
          } else if (normalizedTopic.toLowerCase() === 'javascript') {
            alternativePrompts = [
              'JavaScript programming quiz',
              'JS coding questions',
              'JavaScript syntax and concepts',
              'Web development with JavaScript',
              'JavaScript functions and objects quiz'
            ];
          } else if (normalizedTopic.toLowerCase() === 'react') {
            alternativePrompts = [
              'React.js framework quiz',
              'React components and hooks',
              'React state management questions',
              'Frontend development with React',
              'JSX and React principles'
            ];
          } else {
            // Generic alternative prompts for other topics
            alternativePrompts = [
              `${topic} knowledge test`,
              `${topic} quiz questions`,
              `${topic} specific questions`,
              `questions about ${topic}`,
              `${topic} facts and information`
            ];
          }

          // Try each alternative prompt until we have enough questions
          for (const altPrompt of alternativePrompts) {
            if (parsed.length >= numQuestions) break;

            console.log(`Trying alternative prompt: "${altPrompt}"`);
            const additionalRaw = await generateQuestions(
              altPrompt,
              difficulty,
              numQuestions - parsed.length + 2
            );

            // Parse the additional questions (for logging purposes)
            const additionalParsed = parseQuestions(additionalRaw);
            console.log(`Got ${additionalParsed.length} additional questions from "${altPrompt}"`);

            // Combine the questions, avoiding duplicates (the parser handles deduplication)
            const combinedRaw = raw + '\n\n' + additionalRaw;
            parsed = parseQuestions(combinedRaw);

            if (parsed.length >= numQuestions) {
              console.log(`Reached target question count with prompt "${altPrompt}"`);
              break;
            }
          }
        }

        // Limit to the requested number of questions
        const finalQuestions = parsed.slice(0, numQuestions);
        console.log(`Final questions count: ${finalQuestions.length}`);

        if (finalQuestions.length === 0) {
          setError(`No valid questions could be generated for "${topic}". Please try a different topic.`);
          setLoading(false);
          return;
        }

        if (finalQuestions.length < numQuestions) {
          console.warn(`Could only generate ${finalQuestions.length} questions instead of the requested ${numQuestions}`);
        }

        setQuestions(finalQuestions);
        setLoading(false);

        // Start timer if timePerQuestion is set
        if (timePerQuestion > 0) {
          setTimeLeft(timePerQuestion);
          setTimerActive(true);
        }
      } catch (err) {
        console.error("Failed to load questions:", err);
        setError(`Failed to load questions: ${err.message || 'Unknown error'}. Please try again.`);
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
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <Header />
        <PageTransition>
          <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[80vh]">
            <Card className="w-full max-w-md p-8 text-center" glass>
              <motion.div
                className="mx-auto mb-6 relative"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="w-16 h-16 border-4 border-primary-200 dark:border-primary-900 border-t-primary-600 dark:border-t-primary-400 rounded-full animate-spin mx-auto"></div>
                <motion.div
                  className="absolute inset-0 flex items-center justify-center text-primary-600 dark:text-primary-400"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Clock className="w-6 h-6" />
                </motion.div>
              </motion.div>
              <motion.h2
                className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Preparing Your Quiz
              </motion.h2>
              <motion.p
                className="text-slate-600 dark:text-slate-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Loading questions about {topic}...
              </motion.p>
            </Card>
          </div>
        </PageTransition>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <Header />
        <PageTransition>
          <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[80vh]">
            <Card className="w-full max-w-md p-8 text-center" glass>
              <motion.div
                className="mx-auto mb-6 text-red-500 dark:text-red-400"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <AlertCircle className="w-16 h-16 mx-auto" />
              </motion.div>
              <motion.h2
                className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Something Went Wrong
              </motion.h2>
              <motion.p
                className="text-slate-600 dark:text-slate-400 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {error}
              </motion.p>
              <Button
                onClick={() => navigate('/')}
                variant="primary"
                size="lg"
                icon={<Home className="w-4 h-4" />}
              >
                Back to Home
              </Button>
            </Card>
          </div>
        </PageTransition>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <Header />
        <PageTransition>
          <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[80vh]">
            <Card className="w-full max-w-md p-8 text-center" glass>
              <motion.div
                className="mx-auto mb-6 text-amber-500 dark:text-amber-400"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <AlertCircle className="w-16 h-16 mx-auto" />
              </motion.div>
              <motion.h2
                className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                No Questions Available
              </motion.h2>
              <motion.p
                className="text-slate-600 dark:text-slate-400 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                We couldn't find any questions for this topic. Please try a different topic.
              </motion.p>
              <Button
                onClick={() => navigate('/')}
                variant="primary"
                size="lg"
                icon={<Home className="w-4 h-4" />}
              >
                Back to Home
              </Button>
            </Card>
          </div>
        </PageTransition>
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Header />
      <PageTransition>
        <div className="container mx-auto px-4 py-8 md:py-12">
          <Card className="w-full max-w-3xl mx-auto overflow-hidden" glass>
            {/* Quiz header */}
            <CardHeader className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold">Topic: {topic}</h2>
                  <p className="text-sm opacity-90 mt-1">Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</p>
                </div>
                <div className="flex items-center gap-3">
                  {timePerQuestion > 0 && (
                    <motion.div
                      className={`text-lg font-bold rounded-full w-12 h-12 flex items-center justify-center
                        ${timeLeft <= 10 ? 'bg-red-500/20 text-white' : 'bg-white/20 text-white'}`}
                      animate={{
                        scale: timeLeft <= 10 ? [1, 1.1, 1] : 1,
                        transition: { repeat: timeLeft <= 10 ? Infinity : 0, duration: 1 }
                      }}
                    >
                      {timeLeft}
                    </motion.div>
                  )}
                  <div className="text-right">
                    <p className="text-sm font-medium">Question</p>
                    <p className="text-xl font-bold">{current + 1} / {questions.length}</p>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-white/20 rounded-full h-2 mt-4 overflow-hidden">
                <motion.div
                  className="bg-white h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${((current + 1) / questions.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                ></motion.div>
              </div>
            </CardHeader>

            {/* Quiz content */}
            <CardContent className="p-6 md:p-8">
              {/* Question */}
              <motion.div
                key={current}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h3 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-200 mb-8">
                  {questions[current].question}
                </h3>

                {/* Options */}
                <div className="space-y-4 mb-8">
                  {questions[current].options && questions[current].options.length > 0 ? (
                    questions[current].options.map((opt, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.1 }}
                      >
                        <motion.button
                          onClick={() => handleOptionSelect(opt, i)}
                          disabled={selectedOption !== null}
                          className={`w-full text-left p-4 rounded-xl transition-all flex items-start
                            ${selectedOption === opt
                              ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md'
                              : selectedOption !== null
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed opacity-70'
                                : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow'
                            }`}
                          whileHover={selectedOption === null ? { scale: 1.01 } : {}}
                          whileTap={selectedOption === null ? { scale: 0.99 } : {}}
                        >
                          <span className={`font-bold mr-3 text-lg rounded-full w-8 h-8 flex items-center justify-center
                            ${selectedOption === opt
                              ? 'bg-white/20 text-white'
                              : 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'}`}>
                            {optionLetters[i]}
                          </span>
                          <span className="pt-1">{opt}</span>

                          {selectedOption === opt && (
                            <motion.span
                              className="ml-auto text-white"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring" }}
                            >
                              {opt === questions[current].answer ?
                                <CheckCircle className="w-6 h-6" /> :
                                <XCircle className="w-6 h-6" />
                              }
                            </motion.span>
                          )}
                        </motion.button>
                      </motion.div>
                    ))
                  ) : (
                    <Card className="p-6 text-center bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                      <AlertCircle className="w-8 h-8 text-amber-500 dark:text-amber-400 mx-auto mb-2" />
                      <p className="text-amber-800 dark:text-amber-200">No options available for this question.</p>
                      <Button
                        onClick={() => navigate('/')}
                        variant="outline"
                        size="md"
                        className="mt-4"
                        icon={<Home className="w-4 h-4" />}
                      >
                        Back to Home
                      </Button>
                    </Card>
                  )}
                </div>

                {/* Next button */}
                {selectedOption && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Button
                      onClick={handleNext}
                      variant="gradient"
                      size="lg"
                      className="w-full"
                      icon={<ChevronRight className="w-5 h-5" />}
                    >
                      {current + 1 < questions.length ? 'Next Question' : 'See Results'}
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            </CardContent>
          </Card>
        </div>
      </PageTransition>
    </div>
  );
}

export default Quiz;
