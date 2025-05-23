import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Share2, RefreshCw, Award, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import Header from './Header';
import Button from './ui/Button';
import Card, { CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/Card';
import Badge from './ui/Badge';
import Switch from './ui/Switch';
import PageTransition from './PageTransition';

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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Header />
      <PageTransition>
        <div className="container mx-auto px-4 py-8 md:py-12">
          <Card className="max-w-4xl mx-auto overflow-hidden" glass>
            {/* Header */}
            <CardHeader className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <CardTitle className="text-2xl font-bold">Quiz Results</CardTitle>
                  <CardDescription className="text-white/80 mt-1">
                    Topic: {topic} | Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </CardDescription>
                </div>
                <Badge
                  variant={percentage >= 70 ? "success" : percentage >= 50 ? "warning" : "danger"}
                  size="lg"
                  className="md:self-start"
                >
                  {percentage}% Score
                </Badge>
              </div>
            </CardHeader>

            {/* Score section */}
            <CardContent className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <motion.div
                  className="mb-4 md:mb-0"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">{getFeedback()}</h3>
                  <p className="text-slate-600 dark:text-slate-400">You answered {score} out of {total} questions correctly.</p>
                </motion.div>

                <motion.div
                  className="relative w-32 h-32"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div className="w-full h-full rounded-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 shadow-inner">
                    <div className="absolute inset-0 rounded-full overflow-hidden">
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary-500 to-secondary-500 transition-all duration-1000"
                        style={{ height: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="relative z-10 text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                      {percentage}%
                    </div>
                  </div>
                  <motion.div
                    className="absolute -top-2 -right-2"
                    initial={{ rotate: -30, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                  >
                    <Award className="w-8 h-8 text-primary-500 dark:text-primary-400" />
                  </motion.div>
                </motion.div>
              </div>
            </CardContent>

            {/* Controls */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Question Review</h3>
              <Switch
                checked={showExplanations}
                onChange={setShowExplanations}
                label={showExplanations ? "Hide Explanations" : "Show Explanations"}
                description={showExplanations ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              />
            </div>

            {/* Question review */}
            <CardContent className="p-6">
              <motion.div
                className="space-y-6"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1
                    }
                  }
                }}
              >
                {answers.map((answer, index) => (
                  <motion.div
                    key={index}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 }
                    }}
                    className={`p-5 rounded-xl border shadow-sm ${
                      answer.isCorrect
                        ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                        : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-slate-800 dark:text-slate-200">Question {index + 1}</h4>
                      <Badge
                        variant={answer.isCorrect ? "success" : "danger"}
                        size="sm"
                      >
                        {answer.isCorrect ? 'Correct' : 'Incorrect'}
                      </Badge>
                    </div>

                    <p className="my-3 text-slate-800 dark:text-slate-200">{answer.question}</p>

                    <div className="mt-3 space-y-2">
                      <div className="flex items-start">
                        <span className={`inline-flex items-center justify-center rounded-full w-6 h-6 mr-2 ${
                          answer.isCorrect
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                        }`}>
                          {answer.isCorrect ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Your answer:
                          </p>
                          <p className={`text-sm ${answer.isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {answer.userAnswer}
                          </p>
                        </div>
                      </div>

                      {!answer.isCorrect && (
                        <div className="flex items-start">
                          <span className="inline-flex items-center justify-center rounded-full w-6 h-6 mr-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                            <CheckCircle className="w-4 h-4" />
                          </span>
                          <div>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              Correct answer:
                            </p>
                            <p className="text-sm text-green-600 dark:text-green-400">
                              {answer.correctAnswer}
                            </p>
                          </div>
                        </div>
                      )}

                      {showExplanations && answer.explanation && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                        >
                          <p className="text-sm text-slate-700 dark:text-slate-300">
                            <span className="font-semibold">Explanation:</span> {answer.explanation}
                          </p>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </CardContent>

            {/* Action buttons */}
            <CardFooter className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex flex-wrap gap-4">
              <Button
                onClick={() => navigate('/')}
                variant="primary"
                size="lg"
                className="flex-1"
                icon={<Home className="w-5 h-5" />}
              >
                New Quiz
              </Button>

              <Button
                onClick={handleRetry}
                variant="secondary"
                size="lg"
                className="flex-1"
                icon={<RefreshCw className="w-5 h-5" />}
              >
                Retry Topic
              </Button>

              <Button
                onClick={handleShare}
                variant="outline"
                size="lg"
                className="flex-1"
                icon={<Share2 className="w-5 h-5" />}
              >
                Share Results
              </Button>
            </CardFooter>
          </Card>
        </div>
      </PageTransition>
    </div>
  );
}

export default Result;
