let faqs = [];

// Load FAQs from JSON
fetch("faqs.json")
  .then(res => res.json())
  .then(data => {
    faqs = data;
    console.log("✅ FAQs Loaded");
  })
  .catch(() => {
    showMessage("bot", "Hello! I'm RecruIT 😊 — I couldn’t load FAQs right now, but I can still chat!");
  });

const chatBox = document.getElementById("chat-box");
const input = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

// Greeting on reload
if (!localStorage.getItem("visited")) {
  showMessage("bot", "Hey! 😊 I’m RecruIT, here to guide you with NextGen Systems’ recruitment process.");
  localStorage.setItem("visited", true);
}

// Handle sending messages
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
  }, 1000);
}

function showMessage(sender, text) {
  const msg = document.createElement("div");
  msg.classList.add(sender === "user" ? "user-message" : "bot-message");
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
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

  // Greeting detection
  if (["hi", "hello", "hey", "good morning", "good afternoon"].some(g => userText.includes(g))) {
    showMessage("bot", "Hello there! 👋 How can I assist you with NextGen Systems’ careers today?");
    return;
  }

  // Find matching FAQ
  const found = faqs.find(f => userText.includes(f.question.toLowerCase().split(" ")[0]));
  if (found) {
    showMessage("bot", found.answer);
  } else {
    showMessage("bot", "Sorry, I’m not sure about that. Please visit our Careers Page for more details.");
  }
}
