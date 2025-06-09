# Firestore Schema Documentation

## Overview
This document describes the Firestore database schema for the QuizByAI application.

## Collections

### 1. `quizzes` Collection

Each quiz document contains the following fields:

```javascript
{
  // Basic Information
  "title": "String - Quiz title",
  "description": "String - Quiz description (optional)",
  "topic": "String - Main topic/subject",
  "difficulty": "String - easy|medium|hard",
  
  // Configuration
  "numQuestions": "Number - Total number of questions",
  "duration": "Number - Duration in minutes",
  "timeLimit": "Number - Time limit in seconds",
  
  // Scheduling
  "startTime": "Timestamp - When quiz becomes available",
  "endTime": "Timestamp - When quiz ends",
  
  // Access Control
  "isPublic": "Boolean - Whether quiz is publicly visible",
  
  // Author Information
  "createdBy": "String - User UID of creator",
  "createdByName": "String - Display name of creator",
  "createdByEmail": "String - Email of creator",
  
  // Timestamps
  "createdAt": "Timestamp - When quiz was created",
  "updatedAt": "Timestamp - Last update time",
  
  // Participant Management
  "approvedParticipants": "Array<String> - UIDs of approved users",
  "pendingParticipants": "Array<String> - UIDs of pending users",
  
  // Status
  "status": "String - draft|active|completed",
  
  // Statistics
  "questionsCount": "Number - Current number of questions",
  "totalSubmissions": "Number - Total quiz submissions",
  "averageScore": "Number - Average score percentage",
  
  // Metadata
  "tags": "Array<String> - Topic tags",
  "category": "String - Quiz category",
  "language": "String - Quiz language (default: 'en')",
  "version": "Number - Schema version"
}
```

### 2. `questions` Collection

Each question document contains:

```javascript
{
  // Reference
  "quizId": "String - Reference to parent quiz document ID",
  
  // Question Content
  "question": "String - The question text",
  "options": "Array<String> - Answer options (2-5 options)",
  "answer": "String - Correct answer (must match one option)",
  "explanation": "String - Explanation of correct answer",
  
  // Metadata
  "createdAt": "Timestamp - When question was created",
  "order": "Number - Question order in quiz (optional)",
  "difficulty": "String - Question-specific difficulty (optional)"
}
```

### 3. `submissions` Collection

Each submission document contains:

```javascript
{
  // References
  "quizId": "String - Reference to quiz document ID",
  "userId": "String - UID of user who submitted",
  
  // Answers
  "answers": "Array<Object> - User's answers",
  // Each answer object:
  // {
  //   "questionId": "String",
  //   "question": "String",
  //   "selectedOption": "String",
  //   "correctOption": "String",
  //   "isCorrect": "Boolean"
  // }
  
  // Results
  "score": "Number - Number of correct answers",
  "totalQuestions": "Number - Total questions in quiz",
  "percentage": "Number - Score as percentage",
  
  // Timing
  "startedAt": "Timestamp - When user started quiz",
  "completedAt": "Timestamp - When user completed quiz",
  "timeSpent": "Number - Time spent in seconds"
}
```

### 4. `users` Collection

Each user document contains:

```javascript
{
  // Basic Information
  "uid": "String - Firebase Auth UID",
  "email": "String - User email",
  "name": "String - Display name",
  "role": "String - user|admin (default: 'user')",
  
  // Timestamps
  "createdAt": "Timestamp - Account creation time",
  "updatedAt": "Timestamp - Last profile update",
  "lastLoginAt": "Timestamp - Last login time",
  
  // Statistics
  "quizzesCreated": "Number - Number of quizzes created",
  "quizzesTaken": "Number - Number of quizzes taken",
  "averageScore": "Number - Average quiz score"
}
```

## Security Rules

The Firestore security rules should enforce:

1. **Authentication**: Users must be authenticated for most operations
2. **Ownership**: Users can only modify their own quizzes and submissions
3. **Quiz Access**: Only approved participants can take quizzes
4. **Time Restrictions**: Submissions only allowed during quiz active time
5. **Read Permissions**: Public quizzes readable by all, private by creator only

## Common Queries

### Get User's Quizzes
```javascript
const myQuizzes = query(
  collection(db, 'quizzes'),
  where('createdBy', '==', currentUser.uid),
  orderBy('createdAt', 'desc')
);
```

### Get Public Quizzes
```javascript
const publicQuizzes = query(
  collection(db, 'quizzes'),
  where('isPublic', '==', true),
  where('startTime', '>', new Date()),
  orderBy('startTime', 'asc')
);
```

### Get Quiz Questions
```javascript
const questions = query(
  collection(db, 'questions'),
  where('quizId', '==', quizId),
  orderBy('order', 'asc') // if order field is used
);
```

### Get Quiz Submissions
```javascript
const submissions = query(
  collection(db, 'submissions'),
  where('quizId', '==', quizId),
  orderBy('score', 'desc')
);
```

## Best Practices

1. **Use Transactions**: For operations that update multiple documents
2. **Batch Writes**: For creating multiple questions at once
3. **Indexes**: Create composite indexes for complex queries
4. **Pagination**: Use limit() and startAfter() for large result sets
5. **Error Handling**: Always wrap Firestore operations in try-catch blocks
6. **Validation**: Validate data before writing to Firestore

## Debugging Common Issues

1. **Permission Denied**: Check Firestore security rules
2. **Missing Index**: Create required indexes in Firebase Console
3. **Offline Errors**: Handle offline state gracefully
4. **Timestamp Issues**: Use serverTimestamp() for server-side timestamps
5. **Array Operations**: Use arrayUnion() and arrayRemove() for array updates
