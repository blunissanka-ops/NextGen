/* Enhanced script.js for RecruIT
   - Waits for DOMContentLoaded
   - Robust fetch('./faq.json') with error handling
   - Better keyword matching (phrase, substring, token)
   - Save/load chat history safely to localStorage
   - Typing indicator and send button handling
   - Console logs for debugging
*/

document.addEventListener("DOMContentLoaded", () => {
  const chatbox = document.getElementById("chatbox");
  const userInput = document.getElementById("userInput");
  const sendBtn = document.getElementById("sendBtn");
  const typingIndicator = document.getElementById("typing-indicator");

  let faqData = {};
  let isBotTyping = false;

  // Helper: safe JSON parse
  const safeParse = (str) => {
    try { return JSON.parse(str); } catch(e) { return null; }
  };

  // Load FAQ JSON
  async function loadFaq() {
    try {
      const res = await fetch('./faq.json', {cache: "no-store"});
      if (!res.ok) throw new Error(`FAQ fetch failed: ${res.status} ${res.statusText}`);
      faqData = await res.json();
      console.log("faq.json loaded. keys:", Object.keys(faqData).length);
    } catch (err) {
      console.error("Failed to load faq.json — chatbot fallback to limited responses. Error:", err);
      // fallback minimal FAQs so the bot still responds
      faqData = {
        "apply": "You can apply through our Careers Page by selecting the role and clicking Apply Now.",
        "documents": "Upload an updated CV; cover letter and links recommended."
      };
      addMessage("⚠️ Could not load FAQ file. Using limited offline responses — check console for details.", "bot");
    }
  }

  // Load saved chat history from localStorage
  function loadHistory() {
    try {
      const saved = safeParse(localStorage.getItem('chatHistory')) || [];
      saved.forEach(item => addMessage(item.text, item.sender, false));
      console.log(`Loaded ${saved.length} messages from localStorage.`);
    } catch (err) {
      console.warn("Could not load chatHistory from localStorage:", err);
    }
  }

  // Save one message to localStorage
  function saveToHistory(text, sender) {
    try {
      const list = safeParse(localStorage.getItem('chatHistory')) || [];
      list.push({ text, sender, ts: Date.now() });
      localStorage.setItem('chatHistory', JSON.stringify(list));
    } catch (err) {
      console.warn("Failed to save chatHistory:", err);
    }
  }

  // Add message to chatbox
  function addMessage(text, sender = "bot", shouldSave = true) {
    if (!chatbox) return;
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}`;

    const avatar = document.createElement('img');
    avatar.className = 'avatar';
    avatar.src = sender === 'bot'
      ? 'https://cdn-icons-png.flaticon.com/512/4712/4712109.png'
      : 'https://cdn-icons-png.flaticon.com/512/1946/1946429.png';
    avatar.alt = sender === 'bot' ? 'RecruIT' : 'You';

    const textDiv = document.createElement('div');
    textDiv.className = 'text';
    textDiv.textContent = text;

    // user messages align right
    if (sender === 'user') {
      msgDiv.appendChild(textDiv);
      msgDiv.appendChild(avatar);
    } else {
      msgDiv.appendChild(avatar);
      msgDiv.appendChild(textDiv);
    }

    chatbox.appendChild(msgDiv);
    chatbox.scrollTop = chatbox.scrollHeight;

    if (shouldSave) saveToHistory(text, sender);
  }

  // Show/hide typing indicator and disable send while typing
  function showTyping() {
    isBotTyping = true;
    typingIndicator.classList.remove('hidden');
    sendBtn.disabled = true;
    userInput.disabled = true;
  }
  function hideTyping() {
    isBotTyping = false;
    typingIndicator.classList.add('hidden');
    sendBtn.disabled = false;
    userInput.disabled = false;
    userInput.focus();
  }

  // Better matching: phrase -> substring -> token
  function findResponse(userText) {
    const lower = userText.toLowerCase().trim();
    if (!lower) return null;

    // 1) exact phrase key match
    for (const key of Object.keys(faqData)) {
      if (lower === key.toLowerCase()) return faqData[key];
    }

    // 2) substring matches (longer keys first)
    const keysSorted = Object.keys(faqData).sort((a,b) => b.length - a.length);
    for (const key of keysSorted) {
      if (lower.includes(key.toLowerCase())) return faqData[key];
    }

    // 3) token match: split input and check key words
    const tokens = lower.split(/\W+/).filter(Boolean);
    for (const key of keysSorted) {
      const keyTokens = key.toLowerCase().split(/\W+/).filter(Boolean);
      const matchCount = keyTokens.reduce((c, kt) => c + (tokens.includes(kt) ? 1 : 0), 0);
      if (keyTokens.length > 0 && matchCount >= Math.max(1, Math.floor(keyTokens.length/2))) {
        return faqData[key];
      }
    }

    return null;
  }

  // Entry: user sends a message
  async function handleSend() {
    if (isBotTyping) return;
    const text = userInput.value.trim();
    if (!text) return;
    addMessage(text, 'user');
    userInput.value = '';

    // show typing
    showTyping();

    // simulate processing time, then reply
    setTimeout(() => {
      const resp = findResponse(text);
      if (resp) {
        addMessage(resp, 'bot');
      } else {
        addMessage("I'm not sure I understand. Could you rephrase or ask something like: 'How can I apply?' or 'What documents are needed?'", 'bot');
      }
      hideTyping();
    }, 700); // short simulated delay
  }

  // Setup event listeners
  sendBtn.addEventListener('click', handleSend);
  userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSend();
  });

  // Public small debugging helper: clear history (useful while testing)
  // Uncomment to add a clear-history button in the UI if you want.
  // window.clearChatHistory = () => { localStorage.removeItem('chatHistory'); location.reload(); };

  // Init sequence
  (async () => {
    await loadFaq();
    loadHistory();
    // initial greeting if no prior messages
    try {
      const saved = safeParse(localStorage.getItem('chatHistory')) || [];
      if (saved.length === 0) {
        addMessage("Hello! I'm RecruIT 👋 Ask me anything about applying, documents, qualifications or your application status.", "bot");
      }
    } catch (err) {
      console.warn('Could not determine saved history length:', err);
      addMessage("Hello! I'm RecruIT 👋 Ask me anything about applying, documents, qualifications or your application status.", "bot");
    }
  })();

});
