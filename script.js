const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const typingIndicator = document.getElementById("typing-indicator");

let faqs = {};
const greetings = [
  "👋 Hello there! I'm RecruIT, your AI assistant from NextGen Systems. How can I help you today?",
  "Hi! 😊 I'm RecruIT. Looking for information about careers or job openings?",
  "Hey! 👋 Need help applying to a position at NextGen Systems?"
];

// Load FAQ data
async function loadFaqs() {
  try {
    const response = await fetch("faqs.json?nocache=" + new Date().getTime());
    if (!response.ok) throw new Error("Could not load FAQs");
    const data = await response.json();
    faqs = data.faqs || {};
    console.log("✅ FAQs loaded:", faqs);
  } catch (error) {
    console.error("❌ Error loading FAQs:", error);
  }
  showGreeting();
  loadChatHistory();
}

// Greeting
function showGreeting() {
  const greet = greetings[Math.floor(Math.random() * greetings.length)];
  appendMessage("bot", greet);
}

// Append message
function appendMessage(sender, text) {
  const msg = document.createElement("div");
  msg.classList.add("message", sender === "user" ? "user-message" : "bot-message");
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  saveChatHistory();
}

// Save chat history
function saveChatHistory() {
  localStorage.setItem("recruitChatHistory", chatBox.innerHTML);
}

// Load chat history
function loadChatHistory() {
  const saved = localStorage.getItem("recruitChatHistory");
  if (saved) chatBox.innerHTML = saved;
}

// Typing indicator
function showTyping() {
  typingIndicator.classList.remove("hidden");
  setTimeout(() => typingIndicator.classList.add("hidden"), 1000);
}

// Send message
sendBtn.addEventListener("click", () => {
  const text = userInput.value.trim();
  if (!text) return;
  appendMessage("user", text);
  userInput.value = "";
  showTyping();
  setTimeout(() => botReply(text), 800);
});

// Enter key
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendBtn.click();
});

// Bot reply
function botReply(input) {
  const lower = input.toLowerCase();
  let response = "🤔 Sorry, I’m not sure about that. Please visit our Careers Page for more details.";

  for (const key in faqs) {
    if (lower.includes(key)) {
      response = faqs[key];
      break;
    }
  }

  appendMessage("bot", response);
}

// Load everything
loadFaqs();
