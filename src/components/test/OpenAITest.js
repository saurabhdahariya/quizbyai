import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, CheckCircle, XCircle, Loader, Zap, Brain, Clock } from 'lucide-react';
import Button from '../ui/Button';
import Card, { CardContent, CardHeader, CardTitle } from '../ui/Card';
import { runAllTests, testOpenAIAPI } from '../../utils/testOpenAI';

const OpenAITest = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [currentTest, setCurrentTest] = useState('');

  const runTests = async () => {
    setIsRunning(true);
    setResults(null);
    setCurrentTest('Initializing...');

    try {
      setCurrentTest('Testing API connection...');
      await new Promise(resolve => setTimeout(resolve, 500));

      setCurrentTest('Running comprehensive tests...');
      const testResults = await runAllTests();
      
      setResults(testResults);
      setCurrentTest('Tests completed!');
    } catch (error) {
      setResults({
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsRunning(false);
    }
  };

  const runQuickTest = async () => {
    setIsRunning(true);
    setResults(null);
    setCurrentTest('Running quick API test...');

    try {
      const quickResult = await testOpenAIAPI();
      setResults({
        tests: { basic: quickResult },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      setResults({
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsRunning(false);
      setCurrentTest('');
    }
  };

  const getStatusIcon = (success) => {
    if (success === true) return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (success === false) return <XCircle className="h-5 w-5 text-red-500" />;
    return <Loader className="h-5 w-5 text-yellow-500 animate-spin" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-4">
            OpenAI API Integration Test
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Test the OpenAI GPT-3.5 Turbo integration for quiz question generation
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-500" />
                Quick Test
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Test basic API connectivity and generate 5 sample questions
              </p>
              <Button
                onClick={runQuickTest}
                disabled={isRunning}
                variant="outline"
                className="w-full"
                icon={<Play className="h-4 w-4" />}
              >
                Run Quick Test
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-500" />
                Comprehensive Test
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Test all features including batch requests, caching, and performance
              </p>
              <Button
                onClick={runTests}
                disabled={isRunning}
                variant="gradient"
                className="w-full"
                icon={<Play className="h-4 w-4" />}
              >
                Run All Tests
              </Button>
            </CardContent>
          </Card>
        </div>

        {isRunning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8"
          >
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <Loader className="h-6 w-6 animate-spin text-blue-500 mr-3" />
                <span className="text-lg">{currentTest}</span>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Test Results
                  <span className="text-sm font-normal text-slate-500">
                    {new Date(results.timestamp).toLocaleTimeString()}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {results.error ? (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-center text-red-600 dark:text-red-400">
                      <XCircle className="h-5 w-5 mr-2" />
                      <span className="font-medium">Test Failed</span>
                    </div>
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                      {results.error}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Basic API Test */}
                    {results.tests?.basic && (
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">API Connection Test</h3>
                          {getStatusIcon(results.tests.basic.success)}
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {results.tests.basic.message}
                        </p>
                        {results.tests.basic.results && (
                          <div className="mt-2 text-xs text-slate-500 space-y-1">
                            <div>Small batch: {results.tests.basic.results.smallBatch} questions</div>
                            <div>Medium batch: {results.tests.basic.results.mediumBatch} questions</div>
                            <div>Large batch: {results.tests.basic.results.largeBatch} questions</div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Topic Tests */}
                    {results.tests?.topics && (
                      <div className="p-4 border rounded-lg">
                        <h3 className="font-medium mb-3">Topic-Specific Tests</h3>
                        <div className="space-y-2">
                          {results.tests.topics.map((topic, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                              <span>{topic.topic}</span>
                              <div className="flex items-center gap-2">
                                {topic.success ? (
                                  <>
                                    <span className="text-green-600">{topic.count} questions</span>
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  </>
                                ) : (
                                  <>
                                    <span className="text-red-600">{topic.error}</span>
                                    <XCircle className="h-4 w-4 text-red-500" />
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Performance Test */}
                    {results.tests?.performance && (
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">Performance Test</h3>
                          {getStatusIcon(results.tests.performance.success)}
                        </div>
                        {results.tests.performance.success && (
                          <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                            <div>Batch request: {results.tests.performance.batchTime}ms</div>
                            <div>Multiple requests: {results.tests.performance.multiTime}ms</div>
                            <div className="font-medium text-green-600">
                              Efficiency gain: {results.tests.performance.efficiencyGain}% faster with batching
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default OpenAITest;
