const chatBox = document.querySelector('.chat-box');
const userInput = document.querySelector('#user-input');
const sendBtn = document.querySelector('#send-btn');
const clearBtn = document.querySelector('#clear-btn');
const typingIndicator = document.querySelector('.typing-indicator');

let faqsData = [];
let isFaqsLoaded = false;
const SCORE_THRESHOLD = 3; // Minimum score required for a confident multi-word answer

// --- Utility Functions ---

// Clean text: lowercase + remove punctuation
function cleanText(text) {
  // Removes special characters, keeps spaces, and converts to lowercase
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

function appendMessage(sender, text, isTyping = false) {
  if (isTyping) return;

  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  msg.innerHTML = `<p>${text}</p>`;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function showTypingIndicator(show) {
  if (show) {
    typingIndicator.style.display = 'flex';
  } else {
    typingIndicator.style.display = 'none';
  }
  // This ensures the typing indicator is visible at the bottom
  chatBox.scrollTop = chatBox.scrollHeight;
}

// --- Chatbot Core Logic ---

// Load FAQs asynchronously and handle UI state
appendMessage('bot', '🤖 Initializing HR Chatbot. Please wait, loading knowledge base...');
sendBtn.disabled = true;

fetch('faqs.json')
  .then(res => res.json())
  .then(data => {
    faqsData = data.faqs.flatMap(cat => cat.questions);
    isFaqsLoaded = true;
    sendBtn.disabled = false;

    // Remove initial loading message
    const loadingMessage = chatBox.querySelector('.bot p');
    if (loadingMessage && loadingMessage.textContent.includes('Initializing HR Chatbot')) {
      loadingMessage.closest('.message').remove();
    }

    appendMessage('bot', 'Hello! I am your NextGen HR Assistant. How can I help you today?');
  })
  .catch(err => {
    console.error('Error loading FAQs:', err);
    appendMessage('bot', 'Error: Could not load FAQ data. Please check the faqs.json file.');
  });

function findAnswer(userMessage) {
  if (!isFaqsLoaded) {
    return 'I am still loading the knowledge base. Please wait a moment before sending a message.';
  }

  const cleanedMessage = cleanText(userMessage);
  // Filter out common, short words (like 'i', 'a', 'the')
  const userWords = cleanedMessage.split(/\s+/).filter(word => word.length > 2);

  // Step 1: Exact Match
  const exactMatch = faqsData.find(faq => cleanText(faq.question) === cleanedMessage);
  if (exactMatch) return exactMatch.answer;

  // Step 2: Keyword-based matching using the dedicated 'keywords' array from faqs.json
  let bestMatch = null;
  let highestScore = 0;

  faqsData.forEach(faq => {
    let score = 0;

    // Convert the FAQ keywords to a Set for O(1) lookups
    const faqKeywords = new Set(faq.keywords);

    // Score based on overlap between user words and FAQ keywords
    userWords.forEach(word => {
      if (faqKeywords.has(word)) {
        score++;
      }
    });

    if (score > highestScore) {
      highestScore = score;
      bestMatch = faq;
    } else if (score === highestScore && score > 0) {
      // Tie-breaker: prefer the match with the shorter original question (implies higher specificity)
      if (bestMatch && faq.question.length < bestMatch.question.length) {
        bestMatch = faq;
      } else if (!bestMatch) {
        bestMatch = faq;
      }
    }
  });

  const isSingleWordQuery = userWords.length === 1;

  if (bestMatch) {
    // If it's a single word query (like 'jobs'), accept a score of 1 or more.
    if (isSingleWordQuery && highestScore >= 1) {
        return bestMatch.answer;
    }
    // Otherwise, use the standard threshold for full sentences/phrases
    if (highestScore >= SCORE_THRESHOLD) {
        return bestMatch.answer;
    }
  }


  // Default fallback if score is too low or no match found
  return "I'm sorry, I couldn't find a direct answer to your question. Please try rephrasing or ask about common topics like 'jobs', 'application', 'benefits', or 'training'.";
}

// --- Conversational Logic for Greetings and Common Phrases ---

function handleGreetings(userMessage) {
  const cleanedMessage = cleanText(userMessage);

  // List of accepted greetings (including single words)
  const greetings = [
    'hi', 'hello', 'hey', 'good morning', 'good afternoon', 'greetings'
  ];
  // List of goodbyes
  const goodbye = [
    'bye', 'goodbye', 'see ya', 'cya', 'later'
  ];
  // List of acknowledgements
  const acknowledgement = [
    'thank you', 'thanks', 'cheers'
  ];

  // Check for greetings
  if (greetings.some(g => cleanedMessage === g || cleanedMessage.includes(g))) {
    return 'Hello there! How can I assist you with HR matters today?';
  }

  // Check for goodbyes
  if (goodbye.some(g => cleanedMessage === g || cleanedMessage.includes(g))) {
    return 'Goodbye! Feel free to return if you have any other HR questions.';
  }

  // Check for acknowledgements
  if (acknowledgement.some(a => cleanedMessage.includes(a))) {
    return 'You are very welcome! Is there anything else I can help you with?';
  }

  // Check for common non-HR questions
  if (cleanedMessage.includes('how are you')) {
      return "I'm a bot, but I'm operating perfectly! How can I help you with your HR query?";
  }
  
  return null;
}

// --- Event Handlers ---

// Handle sending message
sendBtn.addEventListener('click', handleUserInput);
userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') handleUserInput();
});

// Handle clear chat
clearBtn.addEventListener('click', () => {
  chatBox.innerHTML = '';
  // Re-add the welcome message after clearing
  appendMessage('bot', 'Hello! I am your NextGen HR Assistant. How can I help you today?');
});

// Send user message
function handleUserInput() {
  const userMessage = userInput.value.trim();
  if (!userMessage || !isFaqsLoaded) return; 

  // 1. Display user message
  appendMessage('user', userMessage);
  userInput.value = '';

  // 2. Determine reply (Check for greetings first)
  let reply = handleGreetings(userMessage);

  // If not a greeting, proceed to the main FAQ search
  if (reply === null) {
    reply = findAnswer(userMessage);
  }

  // 3. Show typing indicator and disable button
  showTypingIndicator(true);
  sendBtn.disabled = true;

  // 4. Find answer and delay response
  setTimeout(() => {
    // 5. Hide typing indicator and enable send button
    showTypingIndicator(false);
    sendBtn.disabled = false;

    // 6. Display bot reply
    appendMessage('bot', reply);
  }, 800); 
}
