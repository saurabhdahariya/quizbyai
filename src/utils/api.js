// Helper function to implement exponential backoff
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data to use when API is rate limited
const MOCK_QUESTIONS = {
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

      const prompt = `Generate ${numQuestions} ${difficulty} difficulty multiple choice quiz questions on "${topic}". Format like:
Question: ...
Options: a) ... b) ... c) ... d) ... e) ...
Answer: [correct option with letter]
Explanation: [brief explanation of why the answer is correct]`;

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
  const mockTopic = Object.keys(MOCK_QUESTIONS).find(key =>
    topic.toLowerCase().includes(key.toLowerCase())
  ) || "General";

  return MOCK_QUESTIONS[mockTopic];
}
