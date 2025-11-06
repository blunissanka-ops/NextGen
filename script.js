// --- DOM Elements ---
const chatBox = document.querySelector('.chat-box');
const userInput = document.querySelector('#user-input');
const sendBtn = document.querySelector('#send-btn');
const clearBtn = document.querySelector('#clear-btn');
const typingIndicator = document.querySelector('.typing-indicator');
const colorPicker = document.querySelector('#color-picker');

let faqsData = [];
let isLoaded = false;

// --- Utility Functions ---
function cleanText(txt) {
  return txt.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
}
function timestamp() {
  return new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}
function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  msg.innerHTML = `<p>${text}</p><span class="timestamp">${timestamp()}</span>`;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  saveChat();
}
function showTyping(show) {
  typingIndicator.style.display = show ? 'flex' : 'none';
  chatBox.scrollTop = chatBox.scrollHeight;
}
function saveChat() {
  localStorage.setItem('chatHistory', chatBox.innerHTML);
}
function loadChat() {
  const saved = localStorage.getItem('chatHistory');
  if (saved) chatBox.innerHTML = saved;
}

// --- Theme Color ---
function setBotColor(color) {
  document.documentElement.style.setProperty('--bot-color', color);
  document.documentElement.style.setProperty('--bot-gradient', `linear-gradient(135deg, ${color}, ${lightenColor(color, 40)})`);
  localStorage.setItem('botColor', color);
  colorPicker.value = color;
}
function lightenColor(color, percent) {
  const num = parseInt(color.replace("#",""),16),
  amt = Math.round(2.55 * percent),
  R = (num >> 16) + amt,
  G = (num >> 8 & 0x00FF) + amt,
  B = (num & 0x0000FF) + amt;
  return "#" + (
    0x1000000 +
    (R<255?R<1?0:R:255)*0x10000 +
    (G<255?G<1?0:G:255)*0x100 +
    (B<255?B<1?0:B:255)
  ).toString(16).slice(1);
}
const savedColor = localStorage.getItem('botColor') || '#0078ff';
setBotColor(savedColor);
colorPicker.addEventListener('input', e => setBotColor(e.target.value));

// --- Fuzzy Similarity Search ---
function similarity(a, b) {
  const A = new Set(cleanText(a).split(/\s+/));
  const B = new Set(cleanText(b).split(/\s+/));
  const intersect = new Set([...A].filter(x => B.has(x)));
  return intersect.size / Math.sqrt(A.size * B.size);
}

// --- Greeting Logic ---
function handleGreeting(msg) {
  const t = cleanText(msg);
  if (['hi','hello','hey','good morning','good afternoon'].some(w=>t.includes(w))) return "Hello! How can I assist you with HR matters today?";
  if (['thank','thanks'].some(w=>t.includes(w))) return "You're very welcome! Anything else I can help you with?";
  if (['bye','goodbye','see you'].some(w=>t.includes(w))) return "Goodbye! Have a great day ahead.";
  if (t.includes('how are you')) return "I'm fully operational! How can I support your HR query?";
  return null;
}
function findAnswer(msg) {
  const t = cleanText(msg);
  const words = t.split(/\s+/);
  const isShortQuery = words.length <= 2;

  // Quick routing by keywords
  const lower = t.toLowerCase();
  if (isShortQuery) {
    if (/(job|jobs|apply|career)/.test(lower)) {
      const jobFaq = faqsData.find(f => f.question.toLowerCase().includes("apply for a job"));
      if (jobFaq) return jobFaq.answer;
    }
    if (/(qualification|degree|requirements|education)/.test(lower)) {
      const reqFaq = faqsData.find(f => f.question.toLowerCase().includes("qualifications"));
      if (reqFaq) return reqFaq.answer;
    }
    if (/(interview|call|feedback|status)/.test(lower)) {
      const intFaq = faqsData.find(f => f.question.toLowerCase().includes("interview"));
      if (intFaq) return intFaq.answer;
    }
  }

  // Fuzzy match for normal queries
  let best = null, bestScore = 0;
  faqsData.forEach(faq => {
    const combined = faq.question + ' ' + faq.keywords.join(' ');
    const score = similarity(t, combined);
    if (score > bestScore) { bestScore = score; best = faq; }
  });

  if (best && bestScore > 0.25) return best.answer;
  return "I'm sorry, I couldn’t find an exact answer. Please try rephrasing or ask about 'applications', 'training', or 'policies'.";
}


// --- Load FAQs ---
appendMessage('bot', '🤖 Initializing HR Chatbot... please wait.');
sendBtn.disabled = true;

fetch('faqs.json')
  .then(res => res.json())
  .then(data => {
    faqsData = data.faqs.flatMap(c => c.questions);
    isLoaded = true;
    sendBtn.disabled = false;
    chatBox.innerHTML = ''; // clear init message
    appendMessage('bot', 'Hello! I am your NextGen HR Assistant. How can I help you today?');
  })
  .catch(() => appendMessage('bot', '⚠️ Error: Could not load FAQs. Please ensure faqs.json is available.'));

// --- Event Listeners ---
sendBtn.addEventListener('click', handleInput);
userInput.addEventListener('keypress', e => { if (e.key === 'Enter') handleInput(); });
clearBtn.addEventListener('click', () => {
  localStorage.removeItem('chatHistory');
  chatBox.innerHTML = '';
  appendMessage('bot', 'Chat cleared. How can I help you today?');
});

function handleInput() {
  const msg = userInput.value.trim();
  if (!msg || !isLoaded) return;
  appendMessage('user', msg);
  userInput.value = '';
  let reply = handleGreeting(msg) || findAnswer(msg);

  showTyping(true);
  sendBtn.disabled = true;

  setTimeout(() => {
    showTyping(false);
    sendBtn.disabled = false;
    appendMessage('bot', reply);
  }, 700);
}

// --- Load saved history on start ---
window.addEventListener('load', loadChat);
