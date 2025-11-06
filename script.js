/* NextGen HR Assistant - Final Version JS */
/* Supports: Sending messages, Clear chat, Theme gradient changes, Dark/Light mode, Suggestions, Minimize/Maximize */

let faqsData = [];
let darkMode = false;
let theme = 'Blue Gradient';
let chatMinimized = false;

const chatWrapper = document.querySelector('.chat-wrapper');
const chatWidget = document.querySelector('.chat-widget');
const chatLauncher = document.querySelector('#chat-launcher');
const chatMessages = document.querySelector('.chat-messages');
const sendBtn = document.querySelector('#send-btn');
const clearBtn = document.querySelector('#clear-btn');
const userInput = document.querySelector('#user-input');
const themeSelect = document.querySelector('#theme-select');
const colorPicker = document.querySelector('#custom-color');
const minimizeBtn = document.querySelector('#minimize-btn');
const closeBtn = document.querySelector('#close-btn');
const darkToggle = document.querySelector('#dark-toggle');
const suggestionsBox = document.querySelector('.suggestion-list');

/* ---------- Load FAQs ---------- */
fetch('faqs.json')
  .then(res => res.json())
  .then(data => { faqsData = data; })
  .catch(() => appendMessage('bot', "⚠️ Unable to load FAQ data."));

/* ---------- Utility Functions ---------- */
function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  const time = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
  msg.innerHTML = `<p>${text}</p><span class="meta">${time}</span>`;
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function cleanText(str) {
  return str.toLowerCase().replace(/[^a-z0-9\s]/g, '');
}

/* Simple semantic similarity scoring */
function similarity(a, b) {
  const setA = new Set(cleanText(a).split(/\s+/));
  const setB = new Set(cleanText(b).split(/\s+/));
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  return intersection.size / Math.sqrt(setA.size * setB.size);
}

/* Find best matching answer */
function findAnswer(userMsg) {
  const cleaned = cleanText(userMsg);
  let best = null, bestScore = 0;

  for (const faq of faqsData) {
    const combined = faq.question + ' ' + faq.keywords.join(' ');
    const score = similarity(cleaned, combined);
    if (score > bestScore) {
      bestScore = score;
      best = faq;
    }
  }

  if (best && bestScore > 0.2) return best.answer;
  return "🤔 I’m not sure about that. Try asking about jobs, qualifications, or training.";
}

/* Show typing animation */
function showTyping() {
  const bubble = document.createElement('div');
  bubble.classList.add('message', 'bot', 'typing-bubble');
  bubble.innerHTML = `<p>● ● ●</p>`;
  chatMessages.appendChild(bubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return bubble;
}

/* ---------- Event Handlers ---------- */
sendBtn.addEventListener('click', () => handleUserInput());
userInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') handleUserInput();
});
clearBtn.addEventListener('click', clearChat);

function handleUserInput() {
  const msg = userInput.value.trim();
  if (!msg) return;

  appendMessage('user', msg);
  userInput.value = '';
  const typing = showTyping();

  setTimeout(() => {
    typing.remove();
    const reply = findAnswer(msg);
    appendMessage('bot', reply);
  }, 600);
}

/* Clear chat but keep theme and mode */
function clearChat() {
  chatMessages.innerHTML = '';
  appendMessage('bot', "🧹 Chat cleared. How can I help you again?");
}

/* ---------- Theme Management ---------- */
themeSelect.addEventListener('change', e => {
  theme = e.target.value;
  applyTheme();
});
colorPicker.addEventListener('input', e => {
  const c = e.target.value;
  document.documentElement.style.setProperty('--primary-1', c);
  document.documentElement.style.setProperty('--primary-2', c);
});

function applyTheme() {
  const themes = {
    "Blue Gradient": ['#007BFF', '#00C6FF'],
    "Purple Gradient": ['#7b61ff', '#c56fff'],
    "Mint Gradient": ['#00C9A7', '#92FE9D'],
    "Sunset Gradient": ['#ff9966', '#ff5e62']
  };
  const [c1, c2] = themes[theme] || themes["Blue Gradient"];
  document.documentElement.style.setProperty('--primary-1', c1);
  document.documentElement.style.setProperty('--primary-2', c2);
}

/* ---------- Dark Mode Toggle ---------- */
darkToggle.addEventListener('change', e => {
  darkMode = e.target.checked;
  document.documentElement.classList.toggle('dark', darkMode);
});

/* ---------- Minimize / Maximize ---------- */
minimizeBtn.addEventListener('click', () => {
  chatWrapper.classList.toggle('minimized');
});
closeBtn.addEventListener('click', () => {
  chatWrapper.classList.add('minimized');
});
chatLauncher.addEventListener('click', () => {
  chatWrapper.classList.remove('minimized');
});

/* ---------- Suggestions While Typing ---------- */
userInput.addEventListener('input', e => {
  const query = e.target.value.trim().toLowerCase();
  if (!query) return (suggestionsBox.innerHTML = '');
  const suggestions = faqsData
    .filter(f => f.question.toLowerCase().includes(query))
    .slice(0, 5);
  suggestionsBox.innerHTML = '';
  suggestions.forEach(faq => {
    const btn = document.createElement('button');
    btn.classList.add('suggestion');
    btn.textContent = faq.question;
    btn.onclick = () => {
      userInput.value = faq.question;
      suggestionsBox.innerHTML = '';
      handleUserInput();
    };
    suggestionsBox.appendChild(btn);
  });
});

/* ---------- Initialization ---------- */
window.addEventListener('load', () => {
  applyTheme();
  appendMessage('bot', "👋 Hello! I am your NextGen HR Assistant. How can I help you today?");
});
