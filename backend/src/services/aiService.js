import OpenAI from 'openai';
import { getLinkedInOptimizationPrompt } from './linkedInAlgorithm.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// High-quality example posts from new.md and template.md
const EXAMPLE_POSTS = {
  'system-design-lessons': {
    title: '30 System Design Lessons',
    content: `Here are the 30 System Design lessons I want to give you:

- Design clear & secure APIs
- Use auto scaling for traffic spikes
- Index databases to optimize reads
- Assume failures. Make it fault-tolerant
- Partition and shard data for large datasets
- Shard SQL databases for horizontal scaling
- Use CDNs to reduce latency for global users
- Use websockets for real-time communication
- Use write-through cache for write-heavy apps
- Use an API gateway for multiple microservices
- Use microservices over monoliths for scalability
- Denormalize databases for read-heavy workloads
- Use SQL for structured data and ACID transactions
- Use load balancers for traffic distribution and availability
- Implement data replication and redundancy for fault tolerance
- Clarify functional and non-functional requirements before designing
- Add functionality only when needed. Avoid over-engineering
- Use rate limiting to prevent overload and DOS attacks
- Use heartbeats/health checks for failure detection
- Use the circuit breaker pattern to prevent failures
- Use message queues for async communication
- Make operations idempotent to simplify retries
- Use read-through cache for read-heavy apps
- Use event-driven architecture for decoupling
- Use async processing for non-urgent tasks
- Use data lakes or warehouses for analytics
- Prefer horizontal scaling for scalability
- No perfect solution—only trade-offs
- Use NoSQL for unstructured data
- Use blob storage for media files`
  },
  'leetcode-resources': {
    title: 'LeetCode Resources',
    content: `If I had to restart Leetcode I won't solve 500+ Leetcode problems, I will read these Leetcode Articles to save my time:

1. Dynamic Programming
https://leetcode.com/discuss/general-discussion/458695/dynamic-programming-patterns
https://leetcode.com/discuss/general-discussion/662866/dynamic-programming-patterns-part-2
https://leetcode.com/discuss/general-discussion/786126/dynamic-programming-patterns-part-3
https://leetcode.com/discuss/general-discussion/1050391/dynamic-programming-patterns-part-4

2. Linked List
https://leetcode.com/discuss/general-discussion/638847/linked-list-problems
https://leetcode.com/discuss/general-discussion/692825/linked-list-patterns

3. Prefix Sum
https://leetcode.com/discuss/general-discussion/786126/prefix-sum-technique

4. Bits Manipulation
https://leetcode.com/discuss/general-discussion/872099/bits-manipulation-tricks

5. Strings
https://leetcode.com/discuss/general-discussion/651719/string-problems-patterns

6. Sliding Window
https://leetcode.com/discuss/general-discussion/657507/sliding-window-algorithm-template

7. Back Tracking
https://leetcode.com/discuss/general-discussion/594945/backtracking-algorithm-template
https://leetcode.com/discuss/general-discussion/680662/backtracking-patterns

8. Two Pointers
https://leetcode.com/discuss/general-discussion/540092/two-pointers-technique
https://leetcode.com/discuss/general-discussion/692825/two-pointers-patterns

9. Stack & Queue
https://leetcode.com/discuss/general-discussion/651719/stack-queue-problems
https://leetcode.com/discuss/general-discussion/692825/stack-queue-patterns

10. Heap
https://leetcode.com/discuss/general-discussion/692825/heap-priority-queue
https://leetcode.com/discuss/general-discussion/786126/heap-patterns

11. Binary Search
https://leetcode.com/discuss/general-discussion/786126/binary-search-template
https://leetcode.com/discuss/general-discussion/692825/binary-search-patterns

12. Graphs
https://leetcode.com/discuss/general-discussion/786126/graph-algorithms
https://leetcode.com/discuss/general-discussion/692825/graph-patterns
https://leetcode.com/discuss/general-discussion/651719/graph-traversal

13. Tree
https://leetcode.com/discuss/general-discussion/692825/tree-traversal
https://leetcode.com/discuss/general-discussion/786126/tree-patterns
https://leetcode.com/discuss/general-discussion/651719/tree-problems

14. Recursion
https://leetcode.com/discuss/general-discussion/692825/recursion-patterns

15. Greedy
https://leetcode.com/discuss/general-discussion/786126/greedy-algorithms`
  },
  'interview-patterns': {
    title: '27 Coding Interview Patterns',
    content: `27 Coding Interview Patterns to crack Interviews at your Dream Companies:

1. Two Pointers
2. Prefix Sums
3. Sliding Window
4. Kadane's Algorithm
5. Find Number of Subarrays
6. Fast and Slow Pointers
7. Depth-First Search (DFS)
8. Breadth-First Search (BFS)
9. Matrix Traversal
10. Adjacency List BFS / DFS
11. Two Heaps
12. Modified Binary Search
13. Topological Sort
14. Top K Elements
15. Linked List Reversal
16. Permutations
17. Combinations
18. Tree Maze (Backtracking)
19. Longest Common Subsequence
20. Monotonic Stack
21. Memoization
22. Tabulation
23. Multi-Source BFS
24. Merge Intervals
25. Trie-Based Word Search
26. Greedy Algorithms
27. Union-Find (Disjoint Set Union - DSU)`
  },
  'github-resources': {
    title: '13 GitHub Famous Repositories',
    content: `13 GitHub famous repositories that will help you save money on courses and will make you a good software engineer:

1. System Design 101 by Alex Xu(56k stars):
https://github.com/donnemartin/system-design-primer

2. 30 seconds of Code (119k stars):
https://github.com/30-seconds/30-seconds-of-code

3. Top System Design Resources by Gaurav Sen(14k stars): https://github.com/gauravsen/system-design-resources

4. What Happens when you type google[dot]com in browser(Most In Depth Answer):
https://github.com/alex/what-happens-when

5. Best Company and Personal Engineering Blogs by kilimchoi (29k stars): https://github.com/kilimchoi/engineering-blogs

6. Computer Science Papers for System Design by Arpit Adlakha: https://github.com/arpitjindal97/system-design-resources

7. The best developer Roadmaps by Kamran Ahmed (274k stars):
https://github.com/kamranahmedse/developer-roadmap

8. System Design Chapter Wise Explained (28k stars): https://github.com/shashank88/system_design

9. All Resources for Coding, LLD and HLD interviews by Arpit Adlakha(1.2 k stars):
https://github.com/arpitjindal97/tech-interview-resources

10. Tech Interview Handbook Yangshun Tay (109k stars):
https://github.com/yangshun/tech-interview-handbook

11. Coding Interview University (252k stars) :
https://github.com/jwasham/coding-interview-university

12. System Design Questions/Solutions Collection by Ashish Pratap Singh (10k stars):
https://github.com/ashishps1/awesome-system-design-resources

13. System Design Primer by Donne Martin (252k stars): https://github.com/donnemartin/system-design-primer`
  },
  'youtube-channels': {
    title: 'YouTube Channels for JavaScript & React',
    content: `I would personally recommend these YouTube channels if you want to take your JavaScript, React, and project development abilities to the next level.

These channels offer a goldmine of valuable content, ranging from in-depth tutorials to hands-on project walkthroughs. 

For Concepts and Problem Solving:
Yomesh Gupta - https://www.youtube.com/@yomeshgupta
Akshay Saini 🚀🚀 - https://www.youtube.com/@akshaymarch7
Prashant Yadav - https://www.youtube.com/@prashantdev
Chirag Goel - https://www.youtube.com/@chirag_goel
Codesmith - https://www.youtube.com/@codesmith
Jack 🤔 Herrington - https://www.youtube.com/@jherr
Lydia Hallie - https://www.youtube.com/@lydiahallie
Vedant Jain - https://www.youtube.com/@vedantjain
Nadia Makarevich 🇺🇦 - https://www.youtube.com/@nadiakmakarevich
Piyush Agarwal - https://www.youtube.com/@piyushgarg

For Creating Awesome Projects:
Web Prodigies - https://www.youtube.com/@webprodigies
Adrian Hajdin - https://www.youtube.com/@adrianhajdin
Josh Tried Coding - https://www.youtube.com/@joshtriedcoding
Code With Antonio - https://www.youtube.com/@codewithantonio`
  },
  'frontend-interview': {
    title: 'Frontend Interview Questions',
    content: `Important Frontend Interview Questions & Problem-Solving Challenges 🚀

Core JavaScript
Closures: Implement a createCounter function using closures.
Memoization: Write a memoize function to cache expensive function results.
Polyfills: Implement a polyfill for Array.prototype.map, Array.prototype.reduce, and Function.prototype.bind.
Asynchronous Programming: Write a fetchWithRetry function with retries on failure.
PromiseAll: Implement a promiseAll function similar to Promise.all.
Debounce: Implement a debounce function for optimizing input-heavy UI elements.
Event Loop: Explain and simulate the output of a given event loop scenario.

Arrays
Array Rotation: Rotate an array by k positions.
Max Subarray Sum: Find the maximum sum of a subarray using Kadane's Algorithm.
Two-Pointer: Find all pairs in an array that sum up to a specific target.
Sort 0s, 1s, 2s: Sort an array of 0s, 1s, and 2s without extra space.
Sliding Window: Find the longest substring without repeating characters.
Max Subarray Sum (k): Find the maximum sum of a subarray of size k.

Strings
Anagram Check: Check if a string is a valid anagram of another string.
First Non-Repeating Character: Find the first non-repeating character in a string.
Longest Palindromic Substring: Find the longest palindromic substring.
Rearranged Palindrome: Check if a string can be rearranged into a palindrome.

Objects
Deep Cloning: Implement a deep clone function for a nested object.
Flattening Objects: Flatten a deeply nested object into a single-level object.
Frequency Count: Count the frequency of characters or elements in an array or string.

Practical Applications
Pagination: Write a function to paginate an array based on page number and size.
Debouncing: Implement a debounce function to optimize search inputs.
Throttling: Implement a throttle function to limit API calls.

Miscellaneous
DOM Serialization: Serialize and deserialize a DOM tree structure.
Event Delegation: Handle clicks on dynamically added list items using event delegation.
LRU Cache: Implement an LRU (Least Recently Used) Cache using JavaScript Map.
Custom Promise: Create a custom Promise class with then, catch, and resolve.
Module Bundler: Write a dependency graph resolver for JavaScript modules.

Bonus Tips for Interview Success:
Break down the problem before coding.
Optimize solutions for time and space complexity.
Focus on writing clean, maintainable code.`
  },
  'framework-philosophy': {
    title: 'Framework Philosophy',
    content: `Lately, I've noticed an interesting pattern while talking to frontend developers:

React developers often feel they have to learn Next.js to stay relevant.
On the other hand, developers working with Angular or Vue are constantly thinking about learning React because it's "more in demand."

And honestly, I get it.
There's always this pressure to keep up — to jump to the next tool or framework.

But what I've come to realize (and remind myself too) is this:
It's not about the framework. It's about the fundamentals.

If you have a solid understanding of JavaScript, how the DOM works, how rendering and performance impact user experience — then learning any framework becomes much easier. It's just a different syntax and structure over the same core principles.

So before jumping into the next shiny thing, it's worth asking:
Do I really understand the basics well enough?

That's what gives long-term confidence — not just chasing trends.`
  },
  'dsa-practical': {
    title: 'DSA in React Development',
    content: `Many frontend developers often wonder how Data Structures and Algorithms (DSA) relate to everyday React development. While DSA may seem abstract, they power many core features of modern applications. 

Let's explore some DSA concepts you can leverage in your React app to boost efficiency and user experience:

1. Arrays: Essential for State Management
Arrays are fundamental in React. They're widely used for rendering lists, managing state, and transforming data. Array methods like .map() and .filter() are indispensable for creating dynamic UIs.

2. Objects & Hash Maps: Efficient Data Storage
When dealing with large data sets (e.g., users or posts), normalizing data into objects (hash maps) makes it faster to read and update. Instead of deeply nesting data, map it by IDs for quick access.

3. Doubly Linked Lists: Context-based Navigation
Doubly linked lists are great for navigation components like photo galleries. Each element links to both the next and previous items, providing context on neighboring items—perfect for galleries or carousels.

4. Stacks: Implementing Undo/Redo Functionality
Stacks (LIFO) are perfect for undo/redo operations in forms or text editors. With immutable operations, you can ensure that state remains unmutated while handling user actions efficiently.

5. Queues: Managing Sequential API Calls
Queues (FIFO) ensure that API calls or tasks are processed in the correct order, preventing race conditions and maintaining smooth operation.

6. Trees: Rendering Recursive Components
When dealing with nested data, like comments threads or folder structures, trees help render these components recursively, making the UI easier to manage.

7. Graphs: Building Complex Relationships
Graphs are perfect for representing relationships between entities—whether it's routing in SPAs or modeling social connections. They help in flexible navigation and complex data management.

💬 How have you used Data Structures in your React projects? Share your experiences or drop your thoughts in the comments! 👇`
  },
  'fundamentals-guide': {
    title: 'Frontend Fundamentals Guide',
    content: `🚀 Want to Become a TOP Front-End Developer? Start with the FUNDAMENTALS! 🔑

1️⃣ Master CSS Basics:
Understand the Box Model (padding, border, margin), Specificity (ID > Class > Element), and Pseudo-selectors (:hover, :first-child). 

2️⃣ JavaScript Fundamentals:
Master vanilla JS first—learn DOM manipulation, event handling, and async programming (Promise, async/await).

3️⃣ Understand the Event Loop:
Learn how JavaScript handles asynchronous operations and code execution. This knowledge is key to writing efficient, non-blocking code. 

4️⃣ Version Control with Git:
Use Git to track changes, collaborate, and manage your code effectively. Learn branching, merging, and rebasing. 

5️⃣ Responsive Design:
Use media queries, Flexbox, and CSS Grid to create mobile-first, responsive layouts. 

6️⃣ CSS Preprocessing (SASS/LESS):
Write cleaner, more maintainable CSS using SASS or LESS. Learn about variables, nesting, and mixins to make your styles modular.

7️⃣ Performance Optimization:
Optimize images, lazy-load assets, and minimize CSS/JS to improve your site's speed. 

8️⃣ Build Tools (Webpack/Babel):
Automate tasks like bundling, minifying, and transpiling. Learn Webpack for module bundling and Babel for JavaScript transpiling to support older browsers. 

9️⃣ Cross-Browser Compatibility:
Ensure your site works across all browsers. Use Autoprefixer and tackle common browser quirks. 

🔟 Web APIs:
Learn to use the Fetch API, Local Storage, Session Storage, and Service Workers to interact with external data, store information, and enable offline functionality. 

1️⃣1️⃣ DevTools:
Learn to inspect, debug, and optimize your code with browser DevTools. Use network monitoring, performance audits, and JavaScript debuggers for efficient troubleshooting. 🔧

1️⃣2️⃣ Testing:
Understand unit testing and integration testing using tools like Jest and Mocha. Write tests to ensure your code is bug-free and maintainable.

1️⃣3️⃣ Accessibility (A11Y):
Ensure your websites are accessible to everyone by using semantic HTML, ARIA roles, and proper keyboard navigation.

1️⃣4️⃣ Security Best Practices:
Prevent XSS, CSRF, and other vulnerabilities by sanitizing user input, using HTTPS, and securely handling data.

1️⃣5️⃣ Continuous Integration / Continuous Deployment (CI/CD):
Automate testing, building, and deployment processes using CI/CD pipelines (e.g., GitHub Actions, CircleCI). This ensures smooth workflows and reduces human error.

💡 Pro Tip: Master these fundamentals, and frameworks will be tools that make your job easier. The foundation you build today will set you up for success tomorrow! 🔥`
  },
  'fullstack-blueprint': {
    title: 'Full Stack Product Blueprint',
    content: `How to Build a Full Stack Product from Scratch

1. Start with Node.js and Express.
Lay a solid foundation.

2. Implement secure user access.
Use JWT for authentication and authorization.

3. Create a robust abstract base model.
Promote consistency and reduce code duplication.

4. Elevate user engagement.
Use Firebase Cloud Messaging for push notifications.

5. Utilize Sentry or Rollbar.
Efficient error tracking and debugging.

6. Set up the ELK stack.
Centralize logging and monitor application health.

7. Incorporate throttling and rate limiting.
Safeguard your application's availability.

8. Implement RabbitMQ.
Enhance data flow with asynchronous communication.

9. Automate tasks with Cronitor or Celery Beat.
Streamline maintenance and free up resources.

10. Prioritize security.
Use HashiCorp Vault for secrets management.

11. Opt for React.
Create dynamic user interfaces.

12. Ensure responsive design.
Adapt to various screen sizes seamlessly.

13. Utilize Redux.
Efficient state management.`
  }
};

export const generateAIPost = async ({ vibe = 'Story', originalPost = null, prompt, useCustomPrompt, includeHashtags, includeCTA, postType }) => {
  try {
    // Check if we have a custom prompt from the frontend
    if (useCustomPrompt && prompt) {
      console.log('🟢 [AIService] Using custom prompt!');
      
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a senior staff engineer sharing authentic, valuable content on LinkedIn. Write like you're talking to a colleague over coffee.

CRITICAL REQUIREMENTS:
- Use SIMPLE, CLEAR language that a 12-year-old could understand
- Write short, punchy sentences
- Be direct and to the point
- Share real insights from actual work experience
- Focus on practical, actionable advice
- Avoid corporate jargon and excessive emojis

STYLE EXAMPLES TO FOLLOW:
- "Here are the 30 System Design lessons I want to give you:"
- "If I had to restart Leetcode I won't solve 500+ problems, I will read these articles:"
- "27 Coding Interview Patterns to crack Interviews at your Dream Companies:"
- "I would personally recommend these YouTube channels if you want to take your abilities to the next level."

Keep it simple, valuable, and authentic.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      const content = completion.choices[0]?.message?.content;
      console.log('🟢 [AIService] Custom prompt response:', content ? content.substring(0, 200) + '...' : '[No content]');
      
      if (!content) {
        throw new Error('Failed to generate content with custom prompt');
      }
      return content.trim();
    }

    // Check if we have OpenAI API key for real generation
    if (!process.env.OPENAI_API_KEY) {
      console.log('🟡 [AIService] No OpenAI API key found, using mock content');
      return `🚀 Here are the key insights I've learned about ${postType || 'software development'}:

The most important thing is to focus on fundamentals. I've seen too many developers jump into advanced topics without mastering the basics.

What's your biggest challenge right now? Let's discuss it in the comments! 👇

#SoftwareDevelopment #TechTips #Learning`;
    }

    console.log('🟡 [AIService] Generating post for type:', postType);
    
    // Get relevant examples based on post type
    const relevantExamples = getRelevantExamples(postType);
    const exampleText = relevantExamples.map(key => {
      const example = EXAMPLE_POSTS[key];
      return `EXAMPLE ${key.toUpperCase()}:
${example.content.substring(0, 300)}...`;
    }).join('\n\n');

    const defaultPrompt = `You are a senior staff engineer sharing authentic, valuable content on LinkedIn. Write like you're talking to a colleague over coffee.

Create a LinkedIn post for "${postType}" that follows these EXACT patterns from successful posts:

RELEVANT EXAMPLES:
${exampleText}

REQUIREMENTS:
- ${includeHashtags ? 'Include 2-3 relevant hashtags naturally' : 'Do not include hashtags'}
- ${includeCTA ? 'End with a genuine question that encourages discussion' : 'Do not include call-to-action'}
- Length: 200-400 words
- Sound like a real person sharing real experience
- Use simple, clear language
- Be direct and actionable
- Focus on practical value

CRITICAL: Follow the exact style and structure of the examples above. Use numbered lists, bullet points, and direct language like the examples. Make it immediately valuable and actionable.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a senior staff engineer sharing authentic, valuable content on LinkedIn. Write like you're talking to a colleague over coffee.

CRITICAL REQUIREMENTS:
- Use SIMPLE, CLEAR language that a 12-year-old could understand
- Write short, punchy sentences
- Be direct and to the point
- Share real insights from actual work experience
- Focus on practical, actionable advice
- Avoid corporate jargon and excessive emojis

STYLE EXAMPLES TO FOLLOW:
- "Here are the 30 System Design lessons I want to give you:"
- "If I had to restart Leetcode I won't solve 500+ problems, I will read these articles:"
- "27 Coding Interview Patterns to crack Interviews at your Dream Companies:"
- "I would personally recommend these YouTube channels if you want to take your abilities to the next level."

Keep it simple, valuable, and authentic.`
        },
        {
          role: "user",
          content: defaultPrompt
        }
      ],
      max_tokens: 800,
      temperature: 0.7,
    });

    const generatedContent = completion.choices[0].message.content.trim();
    console.log('🤖 OpenAI generated content:', generatedContent);
    
    return generatedContent;
  } catch (error) {
    console.error('AI Service error:', error);
    
    // Fallback content
    return `🚀 Here are the key insights I've learned about ${postType || 'software development'}:

The most important thing is to focus on fundamentals. I've seen too many developers jump into advanced topics without mastering the basics.

What's your biggest challenge right now? Let's discuss it in the comments! 👇

#SoftwareDevelopment #TechTips #Learning`;
  }
};

// Function to get relevant examples based on post type
const getRelevantExamples = (postType) => {
  const postTypeExamples = {
    'quick-tips': ['system-design-lessons', 'dsa-practical', 'fundamentals-guide'],
    'resource-curation': ['github-resources', 'youtube-channels', 'leetcode-resources'],
    'interview-prep': ['interview-patterns', 'frontend-interview', 'leetcode-resources'],
    'personal-insights': ['framework-philosophy', 'dsa-practical'],
    'educational-content': ['fundamentals-guide', 'system-design-lessons', 'dsa-practical'],
    'career-advice': ['fundamentals-guide', 'framework-philosophy']
  };
  
  return postTypeExamples[postType] || ['fundamentals-guide', 'system-design-lessons'];
}; 