import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import {
  MessageSquare,
  X,
  Send,
  Bug,
  Lightbulb,
  Heart,
  Star,
  AlertTriangle
} from 'lucide-react';
import Button from '../ui/Button';
import Card, { CardContent, CardHeader, CardTitle } from '../ui/Card';
import Input from '../ui/Input';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';

const FeedbackModal = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const [feedbackType, setFeedbackType] = useState('general');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const feedbackTypes = [
    { id: 'general', label: 'General Feedback', icon: MessageSquare, color: 'blue' },
    { id: 'bug', label: 'Bug Report', icon: Bug, color: 'red' },
    { id: 'feature', label: 'Feature Request', icon: Lightbulb, color: 'yellow' },
    { id: 'improvement', label: 'Improvement', icon: Star, color: 'green' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'feedback'), {
        type: feedbackType,
        message: message.trim(),
        rating,
        userId: currentUser?.uid || null,
        userName: currentUser?.displayName || 'Anonymous',
        userEmail: currentUser?.email || 'anonymous@example.com',
        createdAt: serverTimestamp(),
        status: 'pending'
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        setMessage('');
        setRating(5);
        setFeedbackType('general');
      }, 2000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-2xl border-0 bg-white dark:bg-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary-600" />
                Send Feedback
              </CardTitle>
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent>
              {success ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
                    Thank You!
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Your feedback has been submitted successfully. We appreciate your input!
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Feedback Type */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                      Feedback Type
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {feedbackTypes.map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setFeedbackType(type.id)}
                          className={`p-3 rounded-lg border-2 transition-all text-left ${
                            feedbackType === type.id
                              ? `border-${type.color}-500 bg-${type.color}-50 dark:bg-${type.color}-900/20`
                              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <type.icon className={`h-4 w-4 ${
                              feedbackType === type.id 
                                ? `text-${type.color}-600 dark:text-${type.color}-400`
                                : 'text-slate-500 dark:text-slate-400'
                            }`} />
                            <span className={`text-sm font-medium ${
                              feedbackType === type.id
                                ? `text-${type.color}-800 dark:text-${type.color}-200`
                                : 'text-slate-700 dark:text-slate-300'
                            }`}>
                              {type.label}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Rating */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                      Overall Rating
                    </label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`h-6 w-6 ${
                              star <= rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-slate-300 dark:text-slate-600'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Your Message
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us what you think about QuizByAI..."
                      required
                      rows={4}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="gradient"
                    className="w-full"
                    isLoading={loading}
                    icon={<Send className="h-4 w-4" />}
                  >
                    Send Feedback
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default FeedbackModal;
