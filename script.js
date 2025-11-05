let faqs = [];

// Load chat history
const chatBox = document.getElementById("chat-box");
const input = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

loadChatHistory();

// Load FAQs
fetch("faqs.json")
  .then(res => res.json())
  .then(data => {
    faqs = data;
    console.log("✅ FAQs loaded successfully.");
    if (chatBox.children.length === 0)
      showMessage("bot", "👋 Hello! I’m RecruIT, your virtual assistant. How can I help you today?");
  })
  .catch(() => {
    showMessage("bot", "Hello! I'm RecruIT 😊 — I couldn’t load FAQs right now, but I can still chat!");
  });

// Event listeners
sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keypress", e => {
  if (e.key === "Enter") sendMessage();
});

function sendMessage() {
  const userText = input.value.trim();
  if (!userText) return;
  showMessage("user", userText);
  input.value = "";

  showTypingIndicator();

  setTimeout(() => {
    hideTypingIndicator();
    handleBotResponse(userText);
  }, 800);
}

function showMessage(sender, text) {
  const msg = document.createElement("div");
  msg.classList.add(sender === "user" ? "user-message" : "bot-message");
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  saveChatHistory();
}

function showTypingIndicator() {
  const typing = document.createElement("div");
  typing.classList.add("bot-message", "typing");
  typing.textContent = "RecruIT is typing...";
  typing.id = "typing";
  chatBox.appendChild(typing);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function hideTypingIndicator() {
  const typing = document.getElementById("typing");
  if (typing) typing.remove();
}

function handleBotResponse(userText) {
  userText = userText.toLowerCase();

  // Greetings
  const greetings = ["hi", "hello", "hey", "good morning", "good afternoon", "good evening"];
  if (greetings.some(g => userText.includes(g))) {
    showMessage("bot", "Hello there! 👋 How can I assist you with NextGen Systems’ careers today?");
    return;
  }

  // Keyword-based matching
  const found = faqs.find(f => {
    const q = f.question.toLowerCase();
    return q.split(" ").some(word => userText.includes(word));
  });

  if (found) {
    showMessage("bot", found.answer);
  } else {
    showMessage("bot", "Sorry, I’m not sure about that. Please visit our Careers Page for more details.");
  }
}

// Save chat history to localStorage
function saveChatHistory() {
  localStorage.setItem("chatHistory", chatBox.innerHTML);
}

// Load chat history
function loadChatHistory() {
  const saved = localStorage.getItem("chatHistory");
  if (saved) {
    chatBox.innerHTML = saved;
    chatBox.scrollTop = chatBox.scrollHeight;
  }
}
