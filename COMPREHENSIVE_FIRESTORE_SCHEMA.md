# Comprehensive Firestore Schema for Quiz Application

## Collections Overview

### 1. `quizzes` Collection (Custom Teacher-Created Quizzes)

```javascript
{
  // Basic Information
  "title": "String - Quiz title",
  "subject": "String - Subject/topic (e.g., Math, Science)",
  "topic": "String - Specific topic within subject",
  "difficulty": "String - easy|medium|hard",
  
  // Configuration
  "numQuestions": "Number - Total number of questions",
  "timeLimit": "Number - Time limit in minutes",
  
  // Scheduling & Access
  "startTime": "Timestamp - When quiz becomes live",
  "endTime": "Timestamp - Calculated: startTime + timeLimit",
  "applicationDeadline": "Timestamp - When applications close (before startTime)",
  
  // Creator Information
  "creatorId": "String - User UID of creator (teacher)",
  "creatorName": "String - Display name of creator",
  "creatorEmail": "String - Email of creator",
  
  // Access Control
  "requiresApplication": "Boolean - Whether users need to apply",
  "maxParticipants": "Number - Maximum allowed participants (optional)",
  "isPublic": "Boolean - Whether quiz is visible to all users",
  
  // Status
  "status": "String - draft|open_for_applications|live|completed|cancelled",
  
  // Statistics
  "totalApplicants": "Number - Count of users who applied",
  "totalParticipants": "Number - Count of users who actually took quiz",
  "averageScore": "Number - Average score percentage",
  "questionsCount": "Number - Total questions in quiz",
  
  // Timestamps
  "createdAt": "Timestamp - When quiz was created",
  "updatedAt": "Timestamp - Last update time",
  
  // Metadata
  "tags": "Array<String> - Topic tags",
  "category": "String - Quiz category",
  "language": "String - Quiz language (default: 'en')"
}
```

### 2. `ai_quizzes` Collection (AI-Generated Quizzes)

```javascript
{
  // Basic Information
  "title": "String - Auto-generated or custom title",
  "subject": "String - Subject/topic",
  "difficulty": "String - easy|medium|hard",
  
  // Configuration
  "numQuestions": "Number - Number of questions generated",
  "timeLimit": "Number - Time limit in minutes",
  
  // AI Generation Details
  "generatedBy": "String - AI model used (e.g., 'openai-gpt-4')",
  "generationPrompt": "String - Prompt used for generation",
  "generatedAt": "Timestamp - When quiz was generated",
  
  // Access (AI quizzes are always accessible)
  "isPublic": "Boolean - Always true for AI quizzes",
  "requiresApplication": "Boolean - Always false for AI quizzes",
  
  // Creator (user who requested the AI quiz)
  "requestedBy": "String - User UID who requested generation",
  "requestedByName": "String - Display name",
  
  // Status
  "status": "String - active|archived",
  
  // Usage Statistics
  "totalAttempts": "Number - How many times quiz was taken",
  "averageScore": "Number - Average score across all attempts",
  "popularityScore": "Number - Calculated popularity metric",
  "questionsCount": "Number - Total questions in quiz",
  
  // Timestamps
  "createdAt": "Timestamp - When quiz was created",
  "lastAttemptAt": "Timestamp - Last time someone took this quiz",
  
  // Metadata
  "tags": "Array<String> - Topic tags",
  "category": "String - Quiz category"
}
```

### 3. `quiz_applications` Collection

```javascript
{
  // References
  "quizId": "String - Reference to quiz document ID",
  "userId": "String - UID of user who applied",
  "quizTitle": "String - Quiz title for easy reference",
  "quizStartTime": "Timestamp - Quiz start time",
  
  // Application Details
  "appliedAt": "Timestamp - When user applied",
  "status": "String - pending|approved|rejected|withdrawn",
  "approvedAt": "Timestamp - When application was approved (if applicable)",
  "approvedBy": "String - UID of who approved (quiz creator)",
  
  // User Information (denormalized for performance)
  "userName": "String - Display name of applicant",
  "userEmail": "String - Email of applicant",
  
  // Quiz Access
  "hasAccess": "Boolean - Whether user can take the quiz",
  "accessGrantedAt": "Timestamp - When access was granted"
}
```

### 4. `quiz_results` Collection

```javascript
{
  // References
  "quizId": "String - Reference to quiz document ID",
  "userId": "String - UID of user who took quiz",
  "quizType": "String - custom|ai (to distinguish quiz types)",
  
  // Quiz Information (denormalized)
  "quizTitle": "String - Quiz title",
  "quizSubject": "String - Quiz subject",
  "quizDifficulty": "String - Quiz difficulty",
  
  // Timing
  "startedAt": "Timestamp - When user started quiz",
  "completedAt": "Timestamp - When user completed quiz",
  "timeSpent": "Number - Time spent in seconds",
  "timeLimitSeconds": "Number - Original time limit",
  
  // Results
  "answers": "Array<Object> - User's answers",
  // Each answer object:
  // {
  //   "questionId": "String",
  //   "questionText": "String",
  //   "selectedOption": "String",
  //   "correctOption": "String",
  //   "isCorrect": "Boolean",
  //   "timeSpent": "Number - seconds spent on this question"
  // }
  
  "score": "Number - Number of correct answers",
  "totalQuestions": "Number - Total questions in quiz",
  "percentage": "Number - Score as percentage",
  "grade": "String - A|B|C|D|F based on percentage",
  
  // Status
  "status": "String - completed|abandoned|in_progress",
  "isVisible": "Boolean - Whether results should be shown to user",
  
  // User Information (denormalized)
  "userName": "String - Display name",
  "userEmail": "String - User email"
}
```

### 5. `users` Collection

```javascript
{
  // Basic Information
  "uid": "String - Firebase Auth UID",
  "email": "String - User email",
  "name": "String - Display name",
  "role": "String - student|teacher|admin (default: 'student')",
  
  // Profile
  "profilePicture": "String - URL to profile picture (optional)",
  "bio": "String - User bio (optional)",
  "institution": "String - School/University (optional)",
  
  // Preferences
  "preferredSubjects": "Array<String> - Subjects user is interested in",
  "notificationsEnabled": "Boolean - Whether to send notifications",
  
  // Statistics
  "quizzesCreated": "Number - Number of quizzes created (for teachers)",
  "quizzesTaken": "Number - Number of quizzes taken",
  "totalScore": "Number - Sum of all quiz scores",
  "averageScore": "Number - Average quiz score percentage",
  "bestScore": "Number - Highest score achieved",
  "totalTimeSpent": "Number - Total time spent on quizzes (seconds)",
  
  // Activity
  "lastLoginAt": "Timestamp - Last login time",
  "lastQuizAt": "Timestamp - Last time user took a quiz",
  "streakDays": "Number - Consecutive days of quiz activity",
  
  // Timestamps
  "createdAt": "Timestamp - Account creation time",
  "updatedAt": "Timestamp - Last profile update",
  
  // Status
  "isActive": "Boolean - Whether account is active",
  "emailVerified": "Boolean - Whether email is verified"
}
```

### 6. Subcollections

#### `quizzes/{quizId}/questions` and `ai_quizzes/{quizId}/questions`

```javascript
{
  // Question Content
  "questionText": "String - The question",
  "options": "Array<String> - Answer options (A-E)",
  "correctOption": "String - Correct answer (must match one option)",
  "explanation": "String - Explanation of correct answer",
  
  // Metadata
  "order": "Number - Question order in quiz",
  "difficulty": "String - Question-specific difficulty (optional)",
  "timeLimit": "Number - Time limit for this question (optional)",
  "points": "Number - Points for correct answer (default: 1)",
  
  // AI Generation (for AI quizzes)
  "generatedBy": "String - AI model used",
  "confidence": "Number - AI confidence score (0-1)",
  
  // Statistics
  "totalAttempts": "Number - How many times this question was answered",
  "correctAttempts": "Number - How many times answered correctly",
  "averageTimeSpent": "Number - Average time spent on this question",
  
  // Timestamps
  "createdAt": "Timestamp - When question was created"
}
```

## Security Rules Structure

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null; // Others can read basic profile info
    }
    
    // Quiz access rules
    match /quizzes/{quizId} {
      allow read: if request.auth != null;
      allow create, update: if request.auth != null && 
        (resource == null || resource.data.creatorId == request.auth.uid);
      allow delete: if request.auth != null && resource.data.creatorId == request.auth.uid;
    }
    
    // AI Quiz access rules
    match /ai_quizzes/{quizId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        resource.data.requestedBy == request.auth.uid;
    }
    
    // Quiz applications
    match /quiz_applications/{applicationId} {
      allow read: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         isQuizCreator(resource.data.quizId));
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
      allow update: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         isQuizCreator(resource.data.quizId));
    }
    
    // Quiz results
    match /quiz_results/{resultId} {
      allow read: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         isQuizCreator(resource.data.quizId));
      allow create, update: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
    }
    
    // Questions subcollections
    match /quizzes/{quizId}/questions/{questionId} {
      allow read: if request.auth != null && canAccessQuiz(quizId);
      allow write: if request.auth != null && isQuizCreator(quizId);
    }
    
    match /ai_quizzes/{quizId}/questions/{questionId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/ai_quizzes/$(quizId)).data.requestedBy == request.auth.uid;
    }
  }
  
  // Helper functions
  function isQuizCreator(quizId) {
    return request.auth != null && 
      get(/databases/$(database)/documents/quizzes/$(quizId)).data.creatorId == request.auth.uid;
  }
  
  function canAccessQuiz(quizId) {
    let quiz = get(/databases/$(database)/documents/quizzes/$(quizId)).data;
    return quiz.isPublic || 
           quiz.creatorId == request.auth.uid ||
           hasApprovedApplication(quizId);
  }
  
  function hasApprovedApplication(quizId) {
    return exists(/databases/$(database)/documents/quiz_applications/$(quizId + '_' + request.auth.uid)) &&
           get(/databases/$(database)/documents/quiz_applications/$(quizId + '_' + request.auth.uid)).data.status == 'approved';
  }
}
```
