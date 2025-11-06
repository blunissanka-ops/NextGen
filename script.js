const chatBox = document.querySelector('.chat-box');
const userInput = document.querySelector('#user-input');
const sendBtn = document.querySelector('#send-btn');
const clearBtn = document.querySelector('#clear-btn');
const typingIndicator = document.querySelector('.typing-indicator');

// NEW: Autocomplete elements
const autocompleteContainer = document.querySelector('.autocomplete-container');
const suggestionsList = document.querySelector('#suggestions-list');

let faqsData = [];
let isFaqsLoaded = false;
const SCORE_THRESHOLD = 3; 

// --- Utility Functions ---

function cleanText(text) {
  // Clean text: lowercase + remove punctuation
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
  chatBox.scrollTop = chatBox.scrollHeight;
}

// --- Chatbot Core Logic ---

// Load FAQs asynchronously and handle UI state
appendMessage('bot', '🤖 Initializing HR Chatbot. Please wait, loading knowledge base...');
sendBtn.disabled = true;

fetch('faqs.json')
  .then(res => res.json())
  .then(data => {
    // Flatten the nested structure into a single array of questions
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

  // Step 2: Keyword-based matching
  let bestMatch = null;
  let highestScore = 0;

  faqsData.forEach(faq => {
    let score = 0;
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
      // Tie-breaker: prefer the match with the shorter original question
      if (bestMatch && faq.question.length < bestMatch.question.length) {
        bestMatch = faq;
      } else if (!bestMatch) {
        bestMatch = faq;
      }
    }
  });

  const isSingleWordQuery = userWords.length === 1;

  if (bestMatch) {
    // If it's a single word query (e.g., 'jobs'), accept a score of 1 or more.
    if (isSingleWordQuery && highestScore >= 1) {
        return bestMatch.answer;
    }
    // Standard threshold for multi-word phrases/sentences
    if (highestScore >= SCORE_THRESHOLD) {
        return bestMatch.answer;
    }
  }

  // Default fallback
  return "I'm sorry, I couldn't find a direct answer to your question. Please try rephrasing or ask about common topics like 'jobs', 'application', 'benefits', or 'training'.";
}

// --- Conversational Logic ---

function handleGreetings(userMessage) {
  const cleanedMessage = cleanText(userMessage);

  const greetings = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'greetings'];
  const goodbye = ['bye', 'goodbye', 'see ya', 'cya', 'later'];
  const acknowledgement = ['thank you', 'thanks', 'cheers'];

  if (greetings.some(g => cleanedMessage === g || cleanedMessage.includes(g))) {
    return 'Hello there! How can I assist you with HR matters today?';
  }

  if (goodbye.some(g => cleanedMessage === g || cleanedMessage.includes(g))) {
    return 'Goodbye! Feel free to return if you have any other HR questions.';
  }

  if (acknowledgement.some(a => cleanedMessage.includes(a))) {
    return 'You are very welcome! Is there anything else I can help you with?';
  }

  if (cleanedMessage.includes('how are you')) {
      return "I'm a bot, but I'm operating perfectly! How can I help you with your HR query?";
  }
  
  return null;
}

// --- Autocomplete Functions ---

function filterSuggestions(query) {
  if (!query || !isFaqsLoaded) return [];

  const cleanedQuery = cleanText(query);

  const matchedQuestions = faqsData.filter(faq => {
    // Check if the cleaned query is included in the cleaned question text
    return cleanText(faq.question).includes(cleanedQuery);
  });

  // Sort by how early the query appears in the question (simple relevance)
  matchedQuestions.sort((a, b) => {
    const aIndex = cleanText(a.question).indexOf(cleanedQuery);
    const bIndex = cleanText(b.question).indexOf(cleanedQuery);
    return aIndex - bIndex;
  });

  // Limit to 5 suggestions
  return matchedQuestions.slice(0, 5).map(faq => faq.question);
}

function renderSuggestions(suggestions) {
  suggestionsList.innerHTML = '';

  if (suggestions.length === 0) {
    suggestionsList.style.display = 'none';
    return;
  }

  suggestions.forEach(question => {
    const item = document.createElement('div');
    item.classList.add('suggestion-item');
    item.textContent = question;
    
    // Handle click to select the suggestion and trigger search
    item.addEventListener('click', () => {
      userInput.value = question;
      suggestionsList.style.display = 'none';
      userInput.focus();
      handleUserInput(); // Automatically send the selected question
    });

    suggestionsList.appendChild(item);
  });

  suggestionsList.style.display = 'block';
}

function handleInputForSuggestions() {
  const query = userInput.value.trim();
  // NEW: Check if query is empty instead of length < 2
  if (query.length === 0) { 
    suggestionsList.style.display = 'none';
    return;
  }

  const suggestions = filterSuggestions(query);
  renderSuggestions(suggestions);
}

// --- Event Handlers (Updated) ---

sendBtn.addEventListener('click', handleUserInput);
userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') handleUserInput();
});

// Add the input listener for suggestions
userInput.addEventListener('input', handleInputForSuggestions);

// Add listener to hide suggestions when clicking outside
document.addEventListener('click', (e) => {
    if (suggestionsList && autocompleteContainer && !autocompleteContainer.contains(e.target) && suggestionsList.style.display === 'block') {
        suggestionsList.style.display = 'none';
    }
});


clearBtn.addEventListener('click', () => {
  // Clear the chat box
  chatBox.innerHTML = '';
  // Re-add the hidden typing indicator element
  chatBox.innerHTML = `
    <div class="message bot typing-indicator" style="display: none;">
      <div class="typing-animation">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>`;
  // Re-append the initial message
  appendMessage('bot', 'Hello! I am your NextGen HR Assistant. How can I help you today?');
  suggestionsList.style.display = 'none'; // Ensure suggestions are hidden on clear
});

function handleUserInput() {
  const userMessage = userInput.value.trim();
  if (!userMessage || !isFaqsLoaded) return; 

  // 1. Display user message
  appendMessage('user', userMessage);
  userInput.value = '';
  suggestionsList.style.display = 'none'; // Hide suggestions on send

  // 2. Determine reply (Check for greetings first)
  let reply = handleGreetings(userMessage);

  if (reply === null) {
    reply = findAnswer(userMessage);
  }

  // 3. Show typing indicator and disable button
  showTypingIndicator(true);
  sendBtn.disabled = true;

  // 4. Delay response for UX
  setTimeout(() => {
    // 5. Hide typing indicator and enable send button
    showTypingIndicator(false);
    sendBtn.disabled = false;

    // 6. Display bot reply
    appendMessage('bot', reply);
  }, 800); 
}
