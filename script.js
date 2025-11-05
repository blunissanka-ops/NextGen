const chatBox = document.querySelector('.chat-box');
const userInput = document.querySelector('#user-input');
const sendBtn = document.querySelector('#send-btn');
const clearBtn = document.querySelector('#clear-btn'); // New Clear button

let faqsData = [];

// Load FAQs from JSON
fetch('faqs.json')
  .then(response => response.json())
  .then(data => {
    faqsData = data.faqs.flatMap(cat => cat.questions);
  })
  .catch(error => console.error('Error loading FAQs:', error));

// Append message to chat
function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  msg.innerHTML = `<p>${text}</p>`;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Handle sending message
sendBtn.addEventListener('click', handleUserInput);
userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') handleUserInput();
});

// Handle clear chat
clearBtn.addEventListener('click', () => {
  chatBox.innerHTML = '';
});

// Send user message
function handleUserInput() {
  const userMessage = userInput.value.trim();
  if (!userMessage) return;

  appendMessage('user', userMessage);
  userInput.value = '';

  const reply = findAnswer(userMessage);
  setTimeout(() => appendMessage('bot', reply), 400);
}

// Clean text: lowercase + remove punctuation
function cleanText(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .trim();
}

// Find best matching answer
function findAnswer(userMessage) {
  const cleanedMessage = cleanText(userMessage);

  // Step 1: Exact match
  const exactMatch = faqsData.find(faq => cleanText(faq.question) === cleanedMessage);
  if (exactMatch) return exactMatch.answer;

  // Step 2: Keyword-based priority matching
  let bestMatch = null;
  let highestScore = 0;

  faqsData.forEach(faq => {
    const cleanedQuestion = cleanText(faq.question);

    // Priority keywords for specific categories
    const trainingKeywords = ['training', 'program', 'learning', 'development', 'upskill', 'workshop'];
    const applicationKeywords = ['apply', 'application', 'submit', 'resume', 'cv'];
    const interviewKeywords = ['interview', 'round', 'bring', 'prepare', 'called'];

    let score = 0;

    // Boost score if keywords overlap
    trainingKeywords.forEach(word => {
      if (cleanedMessage.includes(word) && cleanedQuestion.includes(word)) score += 3;
    });

    applicationKeywords.forEach(word => {
      if (cleanedMessage.includes(word) && cleanedQuestion.includes(word)) score += 2;
    });

    interviewKeywords.forEach(word => {
      if (cleanedMessage.includes(word) && cleanedQuestion.includes(word)) score += 2;
    });

    // General word matching fallback
    const words = cleanedMessage.split(' ');
    words.forEach(word => {
      if (cleanedQuestion.includes(word)) score += 1;
    });

    if (score > highestScore) {
      highestScore = score;
      bestMatch = faq;
    }
  });

  if (bestMatch && highestScore > 0) {
    return bestMatch.answer;
  }

  // Default fallback
  return "Hello there! 👋 How can I assist you with NextGen Systems’ careers or HR policies today?";
}
