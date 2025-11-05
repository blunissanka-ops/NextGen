let faqs = {};

async function loadFaqs() {
  try {
    const response = await fetch("faqs.json?nocache=" + Date.now());
    if (!response.ok) throw new Error("Failed to fetch FAQs");
    const data = await response.json();
    faqs = data.faqs || {};
    console.log("✅ FAQs loaded:", faqs);
  } catch (error) {
    console.error("❌ FAQ load error:", error);
    appendMessage("bot", "Hello! I'm RecruIT 😊 — I couldn’t load FAQs right now, but I can still chat!");
  }
  showGreeting();
  loadChatHistory();
}

function appendMessage(sender, text) {
  const chatBox = document.getElementById("chatBox");
  const message = document.createElement("div");
  message.classList.add("message", sender);
  message.textContent = text;
  chatBox.appendChild(message);
  chatBox.scrollTop = chatBox.scrollHeight;
  saveChatHistory();
}

function showGreeting() {
  appendMessage("bot", "👋 Hello! I’m RecruIT, your virtual assistant. How can I help you today?");
}

function findAnswer(userMessage) {
  userMessage = userMessage.toLowerCase();
  for (const [question, answer] of Object.entries(faqs)) {
    if (userMessage.includes(question)) return answer;
  }
  return "Sorry, I’m not sure about that. Please visit our Careers Page for more details.";
}

document.getElementById("sendBtn").addEventListener("click", handleUserInput);
document.getElementById("userInput").addEventListener("keypress", e => {
  if (e.key === "Enter") handleUserInput();
});

function handleUserInput() {
  const inputField = document.getElementById("userInput");
  const userMessage = inputField.value.trim();
  if (!userMessage) return;

  appendMessage("user", userMessage);
  inputField.value = "";

  showTypingIndicator(true);

  setTimeout(() => {
    showTypingIndicator(false);
    const botResponse = findAnswer(userMessage);
    appendMessage("bot", botResponse);
  }, 1000);
}

function showTypingIndicator(show) {
  const typing = document.getElementById("typingIndicator");
  typing.style.display = show ? "flex" : "none";
}

function saveChatHistory() {
  const chatBox = document.getElementById("chatBox");
  localStorage.setItem("chatHistory", chatBox.innerHTML);
}

function loadChatHistory() {
  const history = localStorage.getItem("chatHistory");
  if (history) document.getElementById("chatBox").innerHTML = history;
}

window.onload = loadFaqs;
