// Helper function to implement exponential backoff
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data to use when API is rate limited
const MOCK_QUESTIONS = {
  "Math": `Question: What is the value of π (pi) to two decimal places?
Options:
a) 3.14
b) 3.16
c) 3.12
d) 3.18
e) 3.20
Answer: a) 3.14
Explanation: The mathematical constant π (pi) is approximately equal to 3.14159, which rounds to 3.14 when expressed to two decimal places.

Question: What is the formula for the area of a circle?
Options:
a) A = πr
b) A = 2πr
c) A = πr²
d) A = πd
e) A = r²
Answer: c) A = πr²
Explanation: The area of a circle is calculated using the formula A = πr², where r is the radius of the circle.

Question: What is the Pythagorean theorem?
Options:
a) a² + b² = c²
b) a + b = c
c) a² - b² = c²
d) a × b = c
e) a/b = c
Answer: a) a² + b² = c²
Explanation: The Pythagorean theorem states that in a right triangle, the square of the length of the hypotenuse (c) is equal to the sum of squares of the other two sides (a and b).

Question: What is the derivative of x²?
Options:
a) 2x
b) x²
c) 2
d) x
e) x³
Answer: a) 2x
Explanation: The derivative of x² with respect to x is 2x, following the power rule of differentiation: d/dx(x^n) = n*x^(n-1).

Question: What is the value of log₁₀(100)?
Options:
a) 10
b) 1
c) 2
d) 100
e) 1000
Answer: c) 2
Explanation: log₁₀(100) = log₁₀(10²) = 2, because 10² = 100.

Question: What is the sum of the interior angles of a triangle?
Options:
a) 90 degrees
b) 180 degrees
c) 270 degrees
d) 360 degrees
e) It depends on the triangle
Answer: b) 180 degrees
Explanation: The sum of the interior angles of any triangle is always 180 degrees.

Question: What is the formula for the volume of a sphere?
Options:
a) V = 4/3πr³
b) V = 4πr²
c) V = πr³
d) V = 4/3πr²
e) V = 2πr³
Answer: a) V = 4/3πr³
Explanation: The volume of a sphere is calculated using the formula V = 4/3πr³, where r is the radius of the sphere.

Question: What is the value of sin(90°)?
Options:
a) 0
b) 1
c) -1
d) 1/2
e) √2/2
Answer: b) 1
Explanation: The sine of 90 degrees is equal to 1. This is a fundamental value in trigonometry.

Question: What is the definition of a prime number?
Options:
a) A number divisible by 2
b) A number greater than 10
c) A number with exactly two factors: 1 and itself
d) A number that can be written as a fraction
e) A number that ends in 0 or 5
Answer: c) A number with exactly two factors: 1 and itself
Explanation: A prime number is a natural number greater than 1 that is not a product of two smaller natural numbers, meaning it has exactly two factors: 1 and itself.

Question: What is the quadratic formula?
Options:
a) x = (-b ± √(b² - 4ac))/2a
b) x = -b/2a
c) x = -b ± √(b² + 4ac)
d) x = (-b ± √(4ac - b²))/2a
e) x = -b/a
Answer: a) x = (-b ± √(b² - 4ac))/2a
Explanation: The quadratic formula is used to solve quadratic equations of the form ax² + bx + c = 0, and it is x = (-b ± √(b² - 4ac))/2a.`,

  "JavaScript": `Question: What is the correct way to declare a variable in JavaScript?
Options:
a) var x = 5
b) let x = 5
c) const x = 5
d) All of the above
e) None of the above
Answer: d) All of the above
Explanation: JavaScript has three ways to declare variables: var (function-scoped), let (block-scoped), and const (block-scoped constant).

Question: Which method adds an element to the end of an array?
Options:
a) push()
b) pop()
c) shift()
d) unshift()
e) append()
Answer: a) push()
Explanation: The push() method adds one or more elements to the end of an array and returns the new length of the array.

Question: What does the === operator do in JavaScript?
Options:
a) Assigns a value
b) Compares values only
c) Compares values and types
d) Logical OR
e) Logical AND
Answer: c) Compares values and types
Explanation: The strict equality operator (===) checks whether its two operands are equal, returning a Boolean result. Unlike the equality operator (==), it doesn't perform type conversion.

Question: What is the result of the expression "5" + 2 in JavaScript?
Options:
a) 7
b) "52"
c) "5+2"
d) 52
e) Error
Answer: b) "52"
Explanation: In JavaScript, when you use the + operator with a string and a number, the number is converted to a string and concatenated.

Question: Which of the following is not a primitive data type in JavaScript?
Options:
a) String
b) Object
c) Number
d) Boolean
e) Undefined
Answer: b) Object
Explanation: Object is a reference data type in JavaScript, not a primitive data type. The primitive data types are String, Number, Boolean, Undefined, Null, Symbol, and BigInt.

Question: How do you create a function in JavaScript?
Options:
a) function myFunction() {}
b) def myFunction() {}
c) void myFunction() {}
d) create myFunction() {}
e) func myFunction() {}
Answer: a) function myFunction() {}
Explanation: The correct syntax to create a function in JavaScript is using the keyword "function" followed by the function name and parentheses.

Question: What is the correct way to write a comment in JavaScript?
Options:
a) <!-- This is a comment -->
b) // This is a comment
c) /* This is a comment */
d) Both b and c
e) # This is a comment
Answer: d) Both b and c
Explanation: JavaScript supports single-line comments using // and multi-line comments using /* */.

Question: What is the purpose of the "this" keyword in JavaScript?
Options:
a) To refer to the current function
b) To refer to the current object
c) To refer to the parent object
d) To refer to the global object
e) To refer to the previous object
Answer: b) To refer to the current object
Explanation: The "this" keyword in JavaScript refers to the object that is executing the current function or method.

Question: What is a closure in JavaScript?
Options:
a) A way to close a browser window
b) A function that has access to variables from its outer scope
c) A method to end a loop
d) A way to close a connection to a database
e) A technique to hide HTML elements
Answer: b) A function that has access to variables from its outer scope
Explanation: A closure in JavaScript is a function that has access to variables from its outer (enclosing) scope, even after the outer function has returned.

Question: What is the purpose of the "use strict" directive in JavaScript?
Options:
a) To enforce stricter parsing and error handling
b) To make the code run faster
c) To enable new JavaScript features
d) To make the code more readable
e) To disable certain JavaScript features
Answer: a) To enforce stricter parsing and error handling
Explanation: The "use strict" directive enables strict mode in JavaScript, which enforces stricter parsing and error handling, prevents the use of certain error-prone features, and makes debugging easier.`,

  "React": `Question: What hook is used for side effects in React?
Options:
a) useState
b) useEffect
c) useContext
d) useReducer
e) useCallback
Answer: b) useEffect
Explanation: useEffect is a React Hook that lets you synchronize a component with an external system and perform side effects like data fetching, subscriptions, or DOM manipulations.

Question: What is JSX in React?
Options:
a) JavaScript XML
b) Java Syntax Extension
c) JavaScript Extension
d) JSON XML
e) JavaScript XHTML
Answer: a) JavaScript XML
Explanation: JSX is a syntax extension for JavaScript that looks similar to XML/HTML and allows you to write HTML-like code in your JavaScript files for React elements.

Question: How do you pass data from parent to child component?
Options:
a) Context API
b) Redux
c) Props
d) Hooks
e) Event Emitters
Answer: c) Props
Explanation: Props (short for properties) are used to pass data from a parent component to a child component in React's one-way data flow architecture.

Question: What is the purpose of React's virtual DOM?
Options:
a) To create 3D user interfaces
b) To improve performance by minimizing direct DOM manipulation
c) To enable server-side rendering
d) To add virtual reality features
e) To create mobile applications
Answer: b) To improve performance by minimizing direct DOM manipulation
Explanation: React's virtual DOM is a lightweight copy of the actual DOM that React uses to improve performance by calculating the most efficient way to update the real DOM.

Question: What is a controlled component in React?
Options:
a) A component that controls other components
b) A component where form data is handled by React state
c) A component with administrative privileges
d) A component that cannot be modified
e) A component that controls the application's routing
Answer: b) A component where form data is handled by React state
Explanation: A controlled component in React is a form element whose value is controlled by React state, making React the "single source of truth" for that input.

Question: What is the purpose of the key prop in React lists?
Options:
a) To encrypt the list data
b) To help React identify which items have changed, added, or removed
c) To set the CSS key-value pairs
d) To define the primary key for database operations
e) To specify the order of elements in the list
Answer: b) To help React identify which items have changed, added, or removed
Explanation: The key prop in React lists helps React identify which items have changed, been added, or been removed, which improves performance when updating the DOM.

Question: What is the React Fragment?
Options:
a) A piece of a component that can be reused
b) A way to group multiple elements without adding extra nodes to the DOM
c) A memory fragment used by React
d) A special type of React component
e) A part of React's error boundary system
Answer: b) A way to group multiple elements without adding extra nodes to the DOM
Explanation: React Fragment (<React.Fragment> or the shorthand <>) is a feature that allows you to return multiple elements from a component without adding extra nodes to the DOM.

Question: What is the purpose of React's useCallback hook?
Options:
a) To memoize functions to prevent unnecessary re-renders
b) To handle callback functions in forms
c) To create callback URLs for routing
d) To manage asynchronous callbacks
e) To implement callback patterns in React
Answer: a) To memoize functions to prevent unnecessary re-renders
Explanation: The useCallback hook in React is used to memoize callback functions so they are not recreated on every render, which can help prevent unnecessary re-renders of child components that depend on these functions.

Question: What is the purpose of React's Context API?
Options:
a) To provide global variables
b) To manage API connections
c) To pass data through the component tree without prop drilling
d) To create context-sensitive help
e) To handle contextual menus in the UI
Answer: c) To pass data through the component tree without prop drilling
Explanation: React's Context API provides a way to share values like themes, user data, or other global state between components without having to explicitly pass props through every level of the component tree (prop drilling).

Question: What is the difference between state and props in React?
Options:
a) State is for functional components, props are for class components
b) State is internal and controlled by the component, props are external and controlled by the parent
c) State is for storing data, props are for storing functions
d) State is immutable, props are mutable
e) There is no difference, they are interchangeable
Answer: b) State is internal and controlled by the component, props are external and controlled by the parent
Explanation: In React, state is internal data that is managed by the component itself and can change over time, while props (short for properties) are external data passed to a component from its parent and are read-only within the component.`,

  "General": `Question: What is the capital of France?
Options:
a) London
b) Berlin
c) Paris
d) Madrid
e) Rome
Answer: c) Paris
Explanation: Paris is the capital and most populous city of France, located on the Seine River in the north-central part of the country.

Question: Which planet is known as the Red Planet?
Options:
a) Venus
b) Mars
c) Jupiter
d) Saturn
e) Mercury
Answer: b) Mars
Explanation: Mars appears reddish because its surface contains iron oxide (rust), giving it a distinctive color visible from Earth.

Question: Who wrote "Romeo and Juliet"?
Options:
a) Charles Dickens
b) William Shakespeare
c) Jane Austen
d) Mark Twain
e) Leo Tolstoy
Answer: b) William Shakespeare
Explanation: "Romeo and Juliet" is a tragedy written by William Shakespeare early in his career, between 1591-1595, about two young star-crossed lovers.

Question: What is the largest ocean on Earth?
Options:
a) Atlantic Ocean
b) Indian Ocean
c) Arctic Ocean
d) Pacific Ocean
e) Southern Ocean
Answer: d) Pacific Ocean
Explanation: The Pacific Ocean is the largest and deepest ocean on Earth, covering more than 30% of the Earth's surface.

Question: Which element has the chemical symbol "O"?
Options:
a) Gold
b) Oxygen
c) Osmium
d) Oganesson
e) Olivine
Answer: b) Oxygen
Explanation: Oxygen is represented by the chemical symbol "O" on the periodic table of elements.

Question: Who painted the Mona Lisa?
Options:
a) Vincent van Gogh
b) Pablo Picasso
c) Leonardo da Vinci
d) Michelangelo
e) Claude Monet
Answer: c) Leonardo da Vinci
Explanation: The Mona Lisa was painted by Italian Renaissance artist Leonardo da Vinci between 1503 and 1519.

Question: What is the smallest prime number?
Options:
a) 0
b) 1
c) 2
d) 3
e) 4
Answer: c) 2
Explanation: The number 2 is the smallest prime number because it is only divisible by 1 and itself, and it is the only even prime number.

Question: Which country is home to the Great Barrier Reef?
Options:
a) Brazil
b) Australia
c) Indonesia
d) Mexico
e) Thailand
Answer: b) Australia
Explanation: The Great Barrier Reef, the world's largest coral reef system, is located off the coast of Queensland, Australia.

Question: What is the main ingredient in guacamole?
Options:
a) Tomato
b) Avocado
c) Onion
d) Lime
e) Cilantro
Answer: b) Avocado
Explanation: Avocado is the main ingredient in guacamole, a traditional Mexican dip or spread.

Question: Who was the first person to step on the Moon?
Options:
a) Buzz Aldrin
b) Yuri Gagarin
c) Neil Armstrong
d) John Glenn
e) Alan Shepard
Answer: c) Neil Armstrong
Explanation: Neil Armstrong was the first person to step on the Moon on July 20, 1969, during the Apollo 11 mission.`
};

export async function generateQuestions(topic, difficulty = 'medium', numQuestions = 5, retries = 3) {
  // First, try to use the API with retries and backoff
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // If this isn't the first attempt, wait with exponential backoff
      if (attempt > 0) {
        const backoffTime = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        console.log(`Rate limited. Retrying in ${backoffTime/1000}s (attempt ${attempt}/${retries})...`);
        await sleep(backoffTime);
      }

      const prompt = `Generate ${numQuestions} ${difficulty} difficulty multiple choice quiz questions specifically about "${topic}".

The questions must be directly related to ${topic} and not general knowledge or other topics.

Format each question exactly like this:
Question: [clear, specific question about ${topic}]
Options:
a) [option text]
b) [option text]
c) [option text]
d) [option text]
e) [option text]
Answer: [correct option with letter]
Explanation: [brief explanation of why the answer is correct]

Make sure all questions are factually accurate, have exactly one correct answer, and are specifically about ${topic}.`;

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7
        })
      });

      // Handle rate limiting (status 429)
      if (res.status === 429) {
        if (attempt === retries) {
          console.log("Rate limit exceeded after all retries. Falling back to mock data.");
          break; // Exit the loop to use fallback data
        }
        continue; // Try again with backoff
      }

      // Handle other HTTP errors
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(`API error (${res.status}): ${errorData.error?.message || res.statusText}`);
      }

      const data = await res.json();

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error("Invalid API response format");
      }

      return data.choices[0].message.content;
    } catch (error) {
      console.error("Error in API request:", error);
      if (attempt === retries) {
        console.log("All API attempts failed. Falling back to mock data.");
      } else {
        continue;
      }
    }
  }

  // Fallback to mock data if API calls fail
  console.log(`Using mock data for topic: ${topic}`);

  // Find the closest matching topic or use General as default
  let mockTopic = "General";

  // First, try exact match (case-insensitive)
  const exactMatch = Object.keys(MOCK_QUESTIONS).find(key =>
    key.toLowerCase() === topic.toLowerCase()
  );

  if (exactMatch) {
    mockTopic = exactMatch;
  } else {
    // Try partial match if no exact match
    const partialMatch = Object.keys(MOCK_QUESTIONS).find(key =>
      topic.toLowerCase().includes(key.toLowerCase()) ||
      key.toLowerCase().includes(topic.toLowerCase())
    );

    if (partialMatch) {
      mockTopic = partialMatch;
    } else {
      // If still no match, use topic-specific keywords to determine the best match
      const topicKeywords = {
        "JavaScript": ["js", "javascript", "ecmascript", "node", "frontend", "web development", "programming", "coding", "js programming"],
        "React": ["react", "reactjs", "frontend", "ui", "component", "jsx", "hooks", "state", "props", "react framework"],
        "Math": ["math", "mathematics", "algebra", "calculus", "geometry", "trigonometry", "arithmetic", "statistics", "maths"],
        "General": ["general", "knowledge", "trivia", "quiz", "facts", "miscellaneous"]
      };

      // Check if any keywords match the topic
      for (const [key, keywords] of Object.entries(topicKeywords)) {
        if (keywords.some(keyword =>
          topic.toLowerCase().includes(keyword.toLowerCase()) ||
          keyword.toLowerCase().includes(topic.toLowerCase())
        )) {
          mockTopic = key;
          break;
        }
      }
    }
  }

  console.log(`Topic "${topic}" matched to mock topic "${mockTopic}"`);


  // Get the mock questions for the selected topic
  const mockQuestionText = MOCK_QUESTIONS[mockTopic];

  // Parse the mock questions to get an array of question objects
  const allQuestions = mockQuestionText.split(/Question: /).filter(q => q.trim()).map(q => `Question: ${q}`);

  // Get timestamp to use as part of the randomization seed
  const timestamp = new Date().getTime();

  // Shuffle the questions using a more thorough Fisher-Yates algorithm with timestamp influence
  const shuffledQuestions = [...allQuestions];
  for (let i = shuffledQuestions.length - 1; i > 0; i--) {
    // Use timestamp in the randomization to make it different each time
    const j = Math.floor((Math.random() * (timestamp % 100) / 100 + Math.random()) % (i + 1));
    [shuffledQuestions[i], shuffledQuestions[j]] = [shuffledQuestions[j], shuffledQuestions[i]];
  }

  // Take only the requested number of questions
  const selectedQuestions = shuffledQuestions.slice(0, numQuestions);

  console.log(`Selected ${selectedQuestions.length} randomized questions for topic "${mockTopic}"`);

  // Add a timestamp comment to force the content to be different each time
  const timestampComment = `\n\n// Generated at: ${new Date().toISOString()}`;

  // Join the selected questions back into a single string and add the timestamp comment
  return selectedQuestions.join('\n\n') + timestampComment;
}
