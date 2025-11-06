let faqsData = [];
let darkMode = false;
let theme = 'Purple Gradient';

const chatMessages = document.querySelector('.chat-messages');
const sendBtn = document.querySelector('#send-btn');
const clearBtn = document.querySelector('#clear-btn');
const userInput = document.querySelector('#user-input');
const themeSelect = document.querySelector('#theme-select');
const colorPicker = document.querySelector('#custom-color');
const darkToggle = document.querySelector('#dark-toggle');
const minimizeBtn = document.querySelector('#minimize-btn');
const closeBtn = document.querySelector('#close-btn');
const chatWrapper = document.querySelector('.chat-wrapper');
const chatLauncher = document.querySelector('#chat-launcher');
const suggestionsBox = document.querySelector('.suggestion-list');

fetch('faqs.json')
  .then(res => res.json())
  .then(data => faqsData = data)
  .catch(() => appendMessage('bot', '⚠️ Could not load FAQs.'));

function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  msg.innerHTML = `<p>${text}</p><span class="meta">${time}</span>`;
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function cleanText(str) {
  return str.toLowerCase().replace(/[^a-z0-9\s]/g, '');
}

function similarity(a, b) {
  const aWords = cleanText(a).split(/\s+/);
  const bWords = cleanText(b).split(/\s+/);
  const common = aWords.filter(x => bWords.includes(x));
  return common.length / Math.max(aWords.length, bWords.length);
}

function findAnswer(userMsg) {
  let best = null, bestScore = 0;
  for (const faq of faqsData) {
    const score = similarity(userMsg, faq.question + ' ' + faq.keywords.join(' '));
    if (score > bestScore) {
      best = faq;
      bestScore = score;
    }
  }
  if (best && bestScore > 0.15) return best.answer;
  return "🤔 I’m not sure about that. Try asking about jobs, qualifications, or training.";
}

function handleUserInput() {
  const msg = userInput.value.trim();
  if (!msg) return;
  appendMessage('user', msg);
  userInput.value = '';
  const typing = showTyping();
  setTimeout(() => {
    typing.remove();
    appendMessage('bot', findAnswer(msg));
  }, 500);
}

function showTyping() {
  const el = document.createElement('div');
  el.classList.add('message', 'bot');
  el.innerHTML = `<p>● ● ●</p>`;
  chatMessages.appendChild(el);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return el;
}

sendBtn.addEventListener('click', handleUserInput);
userInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') handleUserInput();
});
clearBtn.addEventListener('click', () => {
  chatMessages.innerHTML = '';
  appendMessage('bot', '🧹 Chat cleared. Ask me something new!');
});

themeSelect.addEventListener('change', e => {
  theme = e.target.value;
  applyTheme();
});
colorPicker.addEventListener('input', e => {
  const color = e.target.value;
  document.documentElement.style.setProperty('--primary-1', color);
  document.documentElement.style.setProperty('--primary-2', color);
});
darkToggle.addEventListener('change', e => {
  darkMode = e.target.checked;
  document.documentElement.classList.toggle('dark', darkMode);
});

function applyTheme() {
  const themes = {
    'Blue Gradient': ['#007BFF', '#00C6FF'],
    'Purple Gradient': ['#7b61ff', '#c56fff'],
    'Mint Gradient': ['#00C9A7', '#92FE9D'],
    'Sunset Gradient': ['#ff9966', '#ff5e62']
  };
  const [c1, c2] = themes[theme] || themes['Blue Gradient'];
  document.documentElement.style.setProperty('--primary-1', c1);
  document.documentElement.style.setProperty('--primary-2', c2);
}

minimizeBtn.addEventListener('click', () => chatWrapper.classList.add('minimized'));
closeBtn.addEventListener('click', () => chatWrapper.classList.add('minimized'));
chatLauncher.addEventListener('click', () => chatWrapper.classList.remove('minimized'));

userInput.addEventListener('input', e => {
  const query = e.target.value.toLowerCase();
  if (!query) return suggestionsBox.innerHTML = '';
  const matches = faqsData
    .filter(f => f.question.toLowerCase().includes(query))
    .slice(0, 5);
  suggestionsBox.innerHTML = '';
  matches.forEach(faq => {
    const btn = document.createElement('button');
    btn.className = 'suggestion';
    btn.textContent = faq.question;
    btn.onclick = () => {
      userInput.value = faq.question;
      suggestionsBox.innerHTML = '';
      handleUserInput();
    };
    suggestionsBox.appendChild(btn);
  });
});

window.addEventListener('load', () => {
  applyTheme();
  appendMessage('bot', "👋 Hello! I am your NextGen HR Assistant. How can I help you today?");
});
