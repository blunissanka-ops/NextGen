/* RecruIT - futuristic UI update
   - sticky header
   - scroll up/down previous chats + scroll-to-bottom button
   - suggestion chips
   - typing indicator + avatar wave/blink
   - dark/light (simple toggle)
   - loads faqs.json (cache-busted)
   - localStorage chat history
*/

const FAQ_PATH = "faqs.json?nocache=" + Date.now();

const DOM = {
  messages: document.getElementById("messages"),
  chatArea: document.getElementById("chatArea"),
  userInput: document.getElementById("userInput"),
  sendBtn: document.getElementById("sendBtn"),
  typing: document.getElementById("typing"),
  suggestions: document.getElementById("suggestions"),
  avatar: document.getElementById("avatar"),
  scrollDownBtn: document.getElementById("scrollDownBtn"),
  themeToggle: document.getElementById("themeToggle"),
  clearBtn: document.getElementById("clearBtn")
};

let FAQS = {}; // object mapping
let isBotTyping = false;
let autoScroll = true; // when at bottom, new messages auto-scroll

/* ---------- Utilities ---------- */
function saveHistory() {
  try {
    const arr = Array.from(DOM.messages.querySelectorAll(".message")).map(m => ({
      sender: m.dataset.sender,
      html: m.innerHTML
    }));
    localStorage.setItem("recruit_history_v2", JSON.stringify(arr));
  } catch(e) { console.warn("saveHistory failed", e); }
}
function loadHistory() {
  try {
    const raw = localStorage.getItem("recruit_history_v2");
    if (!raw) return false;
    const arr = JSON.parse(raw);
    DOM.messages.innerHTML = "";
    arr.forEach(item => {
      const d = document.createElement("div");
      d.className = "message " + (item.sender === "user" ? "user-message" : "bot-message");
      d.dataset.sender = item.sender;
      d.innerHTML = item.html;
      DOM.messages.appendChild(d);
    });
    scrollToBottom();
    return true;
  } catch(e){ console.warn("loadHistory failed", e); return false; }
}
function appendMessageHTML(html, sender="bot", save=true) {
  const d = document.createElement("div");
  d.className = "message " + (sender === "user" ? "user-message" : "bot-message");
  d.dataset.sender = sender === "user" ? "user" : "bot";
  d.innerHTML = html;
  DOM.messages.appendChild(d);
  if (autoScroll) scrollToBottom();
  if (save) saveHistory();
}
function appendUserText(text, save=true) {
  appendMessageHTML(escapeHtml(text), "user", save);
  if (autoScroll) scrollToBottom();
  if (save) saveHistory();
}
function escapeHtml(str){ return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

/* ---------- Scroll handling ---------- */
function scrollToBottom() {
  DOM.messages.scrollTo({ top: DOM.messages.scrollHeight, behavior: "smooth" });
  DOM.scrollDownBtn.classList.add("hidden");
}
DOM.messages.addEventListener("scroll", () => {
  const bottomThreshold = 60;
  const distanceFromBottom = DOM.messages.scrollHeight - DOM.messages.scrollTop - DOM.messages.clientHeight;
  autoScroll = distanceFromBottom < bottomThreshold;
  // show scroll-to-bottom button if not at bottom
  if (distanceFromBottom > bottomThreshold) DOM.scrollDownBtn.classList.remove("hidden");
  else DOM.scrollDownBtn.classList.add("hidden");
});

/* ---------- Avatar animations ---------- */
function avatarWave(on=true) {
  if (!DOM.avatar) return;
  if (on) DOM.avatar.classList.add("wave");
  else DOM.avatar.classList.remove("wave");
}
function avatarBlink() {
  if (!DOM.avatar) return;
  DOM.avatar.classList.add("blink");
  setTimeout(()=> DOM.avatar.classList.remove("blink"), 350);
}

/* ---------- Typing indicator ---------- */
function showTyping(duration = 800) {
  if (isBotTyping) return;
  isBotTyping = true;
  DOM.typing.classList.remove("hidden");
  avatarWave(true);
  avatarBlink();
  // keep typing until hideTyping called, or hide after duration if provided
  if (duration) {
    DOM._typingTimeout && clearTimeout(DOM._typingTimeout);
    DOM._typingTimeout = setTimeout(() => hideTyping(), duration + 200);
  }
}
function hideTyping() {
  isBotTyping = false;
  DOM.typing.classList.add("hidden");
  avatarWave(false);
  DOM._typingTimeout && clearTimeout(DOM._typingTimeout);
}

/* ---------- FAQ loading and matching ---------- */
async function loadFaqs() {
  try {
    const res = await fetch(FAQ_PATH, { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    // support both {faqs:{}} and array-of-objects formats
    if (data.faqs && typeof data.faqs === "object") {
      FAQS = data.faqs;
    } else if (Array.isArray(data)) {
      FAQS = {};
      data.forEach(item => {
        if (item.question && item.answer) FAQS[item.question.toLowerCase()] = item.answer;
      });
    } else {
      throw new Error("Unexpected JSON shape");
    }
    console.log("✅ FAQs loaded", Object.keys(FAQS).length);
  } catch (err) {
    console.error("❌ Failed to load faqs.json:", err);
    appendMessageHTML("Hello! I'm RecruIT 😊 — I couldn’t load FAQs right now, but I can still try to help.", "bot");
  }
}

/* fuzzy match: try exact contains first, then token overlap scoring */
function findBestAnswer(input) {
  const q = input.toLowerCase().trim();
  if (!q) return null;
  // 1) exact contains
  for (const key of Object.keys(FAQS)) {
    if (q.includes(key.toLowerCase())) return FAQS[key];
  }
  // 2) token overlap scoring
  const tokens = q.split(/\W+/).filter(Boolean);
  let best = null, bestScore = 0;
  for (const key of Object.keys(FAQS)) {
    const keyTokens = key.toLowerCase().split(/\W+/).filter(Boolean);
    let score = 0;
    keyTokens.forEach(t => { if (tokens.includes(t)) score++; });
    if (score > bestScore) { bestScore = score; best = key; }
  }
  if (bestScore >= 1) return FAQS[best];
  return null;
}

/* ---------- Send / respond flow ---------- */
async function handleSend(textOverride) {
  const raw = (textOverride !== undefined) ? String(textOverride) : DOM.userInput.value;
  const text = raw.trim();
  if (!text) return;
  appendUserText(text);
  DOM.userInput.value = "";
  // typing
  showTyping(1200);
  await new Promise(r => setTimeout(r, 700)); // small processing pause
  const answer = findBestAnswer(text);
  hideTyping();
  if (answer) {
    appendMessageHTML(answer, "bot");
  } else {
    appendMessageHTML("Sorry, I’m not sure about that. Please check our Careers Page or try: <em>How can I apply for a job?</em>", "bot");
  }
}

/* ---------- Suggestions chips ---------- */
DOM.suggestions.addEventListener("click", (e) => {
  const btn = e.target.closest(".chip");
  if (!btn) return;
  const q = btn.textContent.trim();
  handleSend(q);
});

/* ---------- scroll button ---------- */
DOM.scrollDownBtn.addEventListener("click", scrollToBottom);

/* ---------- input & send events ---------- */
DOM.sendBtn.addEventListener("click", () => handleSend());
DOM.userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") { e.preventDefault(); handleSend(); }
});

/* ---------- theme toggle (simple, swaps CSS vars) ---------- */
DOM.themeToggle && DOM.themeToggle.addEventListener("click", () => {
  document.documentElement.classList.toggle("light-mode");
  // quick persisted preference
  localStorage.setItem("recruit_theme", document.documentElement.classList.contains("light-mode") ? "light" : "dark");
});
(function restoreTheme() {
  const pref = localStorage.getItem("recruit_theme");
  if (pref === "light") document.documentElement.classList.add("light-mode");
})();

/* ---------- clear chat ---------- */
DOM.clearBtn && DOM.clearBtn.addEventListener("click", () => {
  if (!confirm("Clear chat history?")) return;
  DOM.messages.innerHTML = "";
  localStorage.removeItem("recruit_history_v2");
});

/* ---------- initialisation ---------- */
(async function init() {
  // try restore history first (so earlier messages appear even if faqs take time)
  const restored = loadHistory();
  await loadFaqs();
  if (!restored) {
    appendMessageHTML("👋 Hello — I'm <strong>RecruIT</strong>, your virtual hiring assistant. Ask me anything about applying, interviews, or training.", "bot");
  }
  // ensure scroll at bottom
  scrollToBottom();
})();
