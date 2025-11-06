/* NextGen HR Chatbot - advanced client-side version
   Features:
   - Semantic scoring using token + bigram overlap + weighted fields
   - Live suggestions (top 5) while typing
   - Theme selection with predefined gradients + custom color
   - Minimize / maximize with launcher
   - LocalStorage for chat, theme, collapsed state
*/

/* ---------------- DOM ---------------- */
const launcherBtn = document.getElementById('chat-launcher');
const chatWrapper = document.getElementById('chat-wrapper');
const chatWidget = document.getElementById('chat-widget');
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const clearBtn = document.getElementById('clear-btn');
const suggestionsEl = document.getElementById('suggestions');
const themeSelect = document.getElementById('theme-select');
const customColor = document.getElementById('custom-color');
const minimizeBtn = document.getElementById('minimize-btn');
const closeBtn = document.getElementById('close-btn');
const saveNote = document.getElementById('save-note');

let faqs = [];
let loaded = false;

/* ---------------- Utilities ---------------- */
const nowTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const clean = txt => txt.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
const tokenize = txt => {
  const t = clean(txt);
  if (!t) return [];
  const words = t.split(' ').filter(Boolean);
  // include bigrams as tokens for context
  const bigrams = [];
  for (let i=0;i<words.length-1;i++) bigrams.push(words[i] + ' ' + words[i+1]);
  return words.concat(bigrams);
};
const unique = arr => Array.from(new Set(arr));

/* Build a simple weighted vector from faq item */
function buildFaqVector(faq) {
  // tokens from question, keywords, and answer with weights
  const qTokens = tokenize(faq.question);
  const kTokens = (faq.keywords || []).map(k => clean(k)).flatMap(t => t.split(/\s+/));
  const aTokens = tokenize(faq.answer);
  // weights: question=0.6, keywords=0.9, answer=0.25
  const vec = {};
  qTokens.forEach(t => vec[t] = (vec[t] || 0) + 0.6);
  kTokens.forEach(t => vec[t] = (vec[t] || 0) + 0.9);
  aTokens.forEach(t => vec[t] = (vec[t] || 0) + 0.25);
  return vec;
}

/* cosine similarity between two vectors */
function cosineSim(vecA, vecB) {
  let dot = 0, magA = 0, magB = 0;
  for (const k in vecA) { magA += vecA[k]*vecA[k]; }
  for (const k in vecB) { magB += vecB[k]*vecB[k]; }
  for (const k in vecA) {
    if (vecB[k]) dot += vecA[k]*vecB[k];
  }
  magA = Math.sqrt(magA); magB = Math.sqrt(magB);
  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}

/* Precompute vectors for faqs */
let faqVectors = [];
function prepareFaqVectors() {
  faqVectors = faqs.map(f => ({ faq: f, vec: buildFaqVector(f) }));
}

/* Create user query vector */
function buildQueryVector(text) {
  const tokens = tokenize(text);
  const vec = {};
  tokens.forEach(t => vec[t] = (vec[t] || 0) + 1.0);
  // boost single-word queries by value to prefer exact matches sometimes
  return vec;
}

/* find best match (semantic) */
function findBestMatch(text) {
  const qVec = buildQueryVector(text);
  let best = null, bestScore = 0;
  for (const item of faqVectors) {
    const score = cosineSim(qVec, item.vec);
    if (score > bestScore) {
      bestScore = score;
      best = item.faq;
    }
  }
  return { best, score: bestScore };
}

/* get top-k suggestions for partial typing */
function getTopKSuggests(text, k=5) {
  if (!text || !text.trim()) return [];
  const qVec = buildQueryVector(text);
  const scored = faqVectors.map(item => ({ faq: item.faq, score: cosineSim(qVec, item.vec) }));
  scored.sort((a,b)=>b.score-a.score);
  return scored.slice(0,k).filter(s => s.score>0).map(s => ({ question: s.faq.question, score: s.score, faq: s.faq }));
}

/* ---------------- UI helpers ---------------- */
function appendMessage(sender, text, meta='') {
  const wrapper = document.createElement('div');
  wrapper.className = `message ${sender}`;
  const p = document.createElement('p');
  p.textContent = text;
  const m = document.createElement('div');
  m.className = 'meta';
  m.textContent = meta || nowTime();
  wrapper.appendChild(p);
  wrapper.appendChild(m);
  chatBox.appendChild(wrapper);
  chatBox.scrollTop = chatBox.scrollHeight;
  saveChat();
}

function showSuggestions(list) {
  suggestionsEl.innerHTML = '';
  if (!list || list.length===0) {
    suggestionsEl.style.display = 'none';
    suggestionsEl.setAttribute('aria-hidden','true');
    return;
  }
  suggestionsEl.style.display = 'block';
  suggestionsEl.setAttribute('aria-hidden','false');
  const container = document.createElement('div');
  container.className = 'suggestion-list';
  list.forEach(item => {
    const chip = document.createElement('button');
    chip.className = 'suggestion';
    chip.type = 'button';
    // show question text and subtle score (not necessary but helpful)
    chip.innerText = item.question;
    chip.onclick = () => {
      // fill input and trigger answer
      userInput.value = item.question;
      userInput.focus();
      // optionally auto-send (we choose to show answer when clicked)
      handleSend(true, item.faq);
    };
    container.appendChild(chip);
  });
  suggestionsEl.appendChild(container);
}

/* ---------------- Data loading ---------------- */
function loadFaqs() {
  return fetch('faqs.json')
    .then(r => r.json())
    .then(data => {
      faqs = data.faqs.flatMap(c => c.questions);
      prepareFaqVectors();
      loaded = true;
    })
    .catch(e => {
      console.error('Failed to load faqs.json', e);
      appendMessage('bot', '⚠️ Error loading knowledge base. Please ensure faqs.json is available.');
    });
}

/* ---------------- Chat persistence ---------------- */
function saveChat() {
  localStorage.setItem('ng_chat_history', chatBox.innerHTML);
}
function loadChat() {
  const html = localStorage.getItem('ng_chat_history');
  if (html) chatBox.innerHTML = html;
}
function clearChat() {
  localStorage.removeItem('ng_chat_history');
  chatBox.innerHTML = '';
  appendMessage('bot','Hello! I am your NextGen HR Assistant. How can I help you today?');
}

/* ---------------- Theme & state ---------------- */
const themes = {
  blue: { a:'#0078ff', b:'#00b4ff' },
  mint: { a:'#00bfa6', b:'#22c1a1' },
  purple: { a:'#7b61ff', b:'#c56fff' },
  sunset: { a:'#ff7a7a', b:'#ffb56b' }
};

function applyThemeByName(name) {
  if (name === 'custom') {
    const c = localStorage.getItem('ng_custom_color') || '#0078ff';
    setPrimaryFromColor(c);
    themeSelect.value = 'custom';
    customColor.value = c;
    return;
  }
  const t = themes[name] || themes.blue;
  document.documentElement.style.setProperty('--primary-1', t.a);
  document.documentElement.style.setProperty('--primary-2', t.b);
  localStorage.setItem('ng_theme', name);
  // also persist custom color to default if user selects later
}
function setPrimaryFromColor(hex) {
  // compute a lighter/two-tone pair
  const light = lighten(hex, 36);
  document.documentElement.style.setProperty('--primary-1', hex);
  document.documentElement.style.setProperty('--primary-2', light);
  localStorage.setItem('ng_custom_color', hex);
  localStorage.setItem('ng_theme', 'custom');
}

/* color helper: lighten hex by percent */
function lighten(hex, percent) {
  const num = parseInt(hex.replace('#',''),16);
  const amt = Math.round(2.55 * percent);
  let R = (num >> 16) + amt, G = (num >> 8 & 0x00FF) + amt, B = (num & 0x0000FF) + amt;
  R = Math.max(0, Math.min(255,R)); G = Math.max(0, Math.min(255,G)); B = Math.max(0, Math.min(255,B));
  return '#' + ( (1<<24) + (R<<16) + (G<<8) + B ).toString(16).slice(1);
}

/* ---------------- Interaction handlers ---------------- */
let typingTimer = null;
userInput.addEventListener('input', (e) => {
  const text = e.target.value;
  if (!loaded) return;
  // debounce suggestions
  clearTimeout(typingTimer);
  typingTimer = setTimeout(() => {
    const suggestions = getTopKSuggests(text, 5);
    showSuggestions(suggestions);
  }, 200);
});

function handleSend(fromSuggestion = false, directFaq = null) {
  const text = userInput.value.trim();
  if (!text && !directFaq) return;
  // if directFaq provided (when user clicks suggestion), use it
  if (directFaq) {
    appendMessage('user', directFaq.question);
    appendMessage('bot', directFaq.answer);
    userInput.value = '';
    showSuggestions([]);
    return;
  }

  appendMessage('user', text);
  userInput.value = '';
  showSuggestions([]);

  // if short query, try early routing (common intents)
  const t = clean(text);
  let reply = null;
  // greeting detection
  if (/(^|\s)(hi|hello|hey|good morning|good afternoon)(\s|$)/.test(t)) {
    reply = 'Hello! How can I assist you with HR matters today?';
  } else if (/(^|\s)(thanks|thank you|cheers)(\s|$)/.test(t)) {
    reply = "You're welcome! Anything else I can help with?";
  }

  if (reply) {
    appendMessage('bot', reply);
    return;
  }

  // use semantic matching
  const { best, score } = findBestMatch(text);

  // if the best score is low, try fallback routing by common keywords
  if (!best || score < 0.12) {
    // basic routing
    if (/(job|jobs|apply|career)/.test(t)) {
      // find FAQ most related to "apply for a job"
      const candidate = faqs.find(f => /apply for a job/i.test(f.question));
      if (candidate) reply = candidate.answer;
    } else if (/(interview|feedback|schedule|called)/.test(t)) {
      const candidate = faqs.find(f => /interview/i.test(f.question));
      if (candidate) reply = candidate.answer;
    } else if (/(status|application status|my application)/.test(t)) {
      const candidate = faqs.find(f => /current status of my job application/i.test(f.question) || /application status/i.test(f.question));
      if (candidate) reply = candidate.answer;
    }
  }

  if (!reply && best) {
    // use best match
    reply = best.answer;
  }

  // final fallback
  if (!reply) reply = "Sorry — I couldn't find a close match. Try rephrasing or choose a suggestion above.";

  // show typing indicator simulation
  showTypingIndicator(true);
  setTimeout(() => {
    showTypingIndicator(false);
    appendMessage('bot', reply);
  }, 700 + Math.min(800, Math.floor(Math.random()*400)));
}

/* typing indicator (a simple bot bubble) */
function showTypingIndicator(show) {
  // create or remove a fake typing bubble
  const existing = document.querySelector('.typing-bubble');
  if (show) {
    if (existing) return;
    const div = document.createElement('div');
    div.className = 'message bot typing-bubble';
    div.innerHTML = `<p>...</p><div class="meta">${nowTime()}</div>`;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
  } else {
    if (existing) existing.remove();
  }
}

/* send on click / enter */
sendBtn.addEventListener('click', () => handleSend(false,null));
userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    handleSend(false,null);
  }
});

/* clear */
clearBtn.addEventListener('click', clearChat);

/* minimize / launcher behaviors */
function setMinimized(min) {
  if (min) {
    chatWrapper.classList.add('minimized');
    localStorage.setItem('ng_minimized','1');
  } else {
    chatWrapper.classList.remove('minimized');
    localStorage.removeItem('ng_minimized');
  }
}
launcherBtn.addEventListener('click', () => setMinimized(false));
minimizeBtn.addEventListener('click', () => setMinimized(true));
closeBtn.addEventListener('click', () => {
  setMinimized(true);
});

/* theme handlers */
themeSelect.addEventListener('change', () => {
  const val = themeSelect.value;
  if (val === 'custom') {
    const saved = localStorage.getItem('ng_custom_color') || '#0078ff';
    setPrimaryFromHex(saved);
    customColor.value = saved;
  } else {
    const t = themes[val] || themes.blue;
    document.documentElement.style.setProperty('--primary-1', t.a);
    document.documentElement.style.setProperty('--primary-2', t.b);
    localStorage.setItem('ng_theme', val);
  }
});

customColor.addEventListener('input', (e) => {
  const hex = e.target.value;
  setPrimaryFromHex(hex);
  themeSelect.value = 'custom';
  localStorage.setItem('ng_custom_color', hex);
  localStorage.setItem('ng_theme', 'custom');
});

function setPrimaryFromHex(hex) {
  const light = lighten(hex, 36);
  document.documentElement.style.setProperty('--primary-1', hex);
  document.documentElement.style.setProperty('--primary-2', light);
}

/* ---------------- Init ---------------- */
async function init() {
  // load chat history
  loadChat();

  // load faqs
  await loadFaqs();

  // initial greeting if chat empty
  if (!chatBox.innerHTML.trim()) {
    appendMessage('bot','Hello! I am your NextGen HR Assistant. How can I help you today?');
  }

  // load theme
  const savedTheme = localStorage.getItem('ng_theme') || 'blue';
  if (savedTheme === 'custom') {
    const c = localStorage.getItem('ng_custom_color') || '#0078ff';
    setPrimaryFromHex(c);
    customColor.value = c;
    themeSelect.value = 'custom';
  } else {
    const t = themes[savedTheme] || themes.blue;
    document.documentElement.style.setProperty('--primary-1', t.a);
    document.documentElement.style.setProperty('--primary-2', t.b);
    themeSelect.value = savedTheme;
  }

  // minimization state
  const min = !!localStorage.getItem('ng_minimized');
  setMinimized(min);

  // small save note
  saveNote.textContent = 'Theme & chat saved locally';
}

/* run init */
init();
