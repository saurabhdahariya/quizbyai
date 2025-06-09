import React, { useState } from 'react';
import Card, { CardContent, CardHeader, CardTitle } from './ui/Card';
import Button from './ui/Button';
import { Shield, Copy, ExternalLink, Terminal } from 'lucide-react';

function FirebaseRulesHelper() {
  const [copied, setCopied] = useState(false);

  const rules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all authenticated users for development
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Allow read access to public data even for unauthenticated users
    match /quizzes/{quizId} {
      allow read: if resource.data.isPublic == true || request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Test collection for debugging - allow all operations
    match /test_connection/{document} {
      allow read, write: if true;
    }
  }
}`;

  const copyRules = async () => {
    try {
      await navigator.clipboard.writeText(rules);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const openFirebaseConsole = () => {
    window.open('https://console.firebase.google.com/project/quizbyai-fb550/firestore/rules', '_blank');
  };

  return (
    <Card className="max-w-4xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-6 w-6" />
          Firebase Security Rules Setup
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <h3 className="font-bold text-red-800 dark:text-red-200 mb-2">
            🚨 Permission Denied Error Detected
          </h3>
          <p className="text-red-700 dark:text-red-300 text-sm">
            Your Firestore security rules are blocking read/write operations. 
            You need to update them to allow authenticated users to access the database.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-bold mb-3">Option 1: Using Firebase Console (Recommended)</h3>
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              1. Click the button below to open Firebase Console
            </p>
            <Button
              onClick={openFirebaseConsole}
              variant="primary"
              icon={<ExternalLink className="h-4 w-4" />}
            >
              Open Firebase Console Rules
            </Button>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              2. Replace the existing rules with the rules below and click "Publish"
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold mb-3">Option 2: Using Firebase CLI</h3>
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Run these commands in your terminal:
            </p>
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg font-mono text-sm">
              <div className="flex items-center gap-2 mb-2">
                <Terminal className="h-4 w-4" />
                <span>Terminal Commands:</span>
              </div>
              <div className="space-y-1">
                <div>firebase login</div>
                <div>firebase use quizbyai-fb550</div>
                <div>firebase deploy --only firestore:rules</div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold mb-3">Firestore Security Rules</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Copy these rules and paste them in Firebase Console:
              </p>
              <Button
                onClick={copyRules}
                variant="outline"
                size="sm"
                icon={<Copy className="h-4 w-4" />}
              >
                {copied ? 'Copied!' : 'Copy Rules'}
              </Button>
            </div>
            
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm overflow-x-auto border">
              <code>{rules}</code>
            </pre>
          </div>
        </div>

        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h4 className="font-bold text-blue-800 dark:text-blue-200 mb-2">
            ℹ️ What These Rules Do:
          </h4>
          <ul className="text-blue-700 dark:text-blue-300 text-sm space-y-1">
            <li>• Allow authenticated users to read and write all documents</li>
            <li>• Allow anyone to read public quizzes</li>
            <li>• Allow unrestricted access to test_connection collection for debugging</li>
            <li>• Block all access for unauthenticated users (except public quizzes)</li>
          </ul>
        </div>

        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <h4 className="font-bold text-yellow-800 dark:text-yellow-200 mb-2">
            ⚠️ Important Notes:
          </h4>
          <ul className="text-yellow-700 dark:text-yellow-300 text-sm space-y-1">
            <li>• These rules are permissive for development purposes</li>
            <li>• For production, you should implement more restrictive rules</li>
            <li>• Always test your rules before deploying to production</li>
            <li>• Rules may take a few minutes to propagate after deployment</li>
          </ul>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            After updating the rules, refresh this page and try the Firestore tests again.
          </p>
          <Button
            onClick={() => window.location.reload()}
            variant="secondary"
          >
            Refresh Page
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default FirebaseRulesHelper;
