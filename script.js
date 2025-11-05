let faqData = {};
const chatbox = document.getElementById("chatbox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const typingIndicator = document.getElementById("typing-indicator");

// Load FAQs from JSON
fetch("faq.json")
  .then(res => res.json())
  .then(data => faqData = data);

// Load previous chat from localStorage
window.onload = () => {
  const savedChat = JSON.parse(localStorage.getItem("chatHistory")) || [];
  savedChat.forEach(msg => addMessage(msg.text, msg.sender, false));
};

// Event listeners
sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", e => {
  if (e.key === "Enter") sendMessage();
});

function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;
  addMessage(text, "user");
  userInput.value = "";

  showTypingIndicator();
  setTimeout(() => {
    const reply = getBotResponse(text);
    addMessage(reply, "bot");
    hideTypingIndicator();
  }, 800);
}

function getBotResponse(text) {
  const lower = text.toLowerCase();
  for (let key in faqData) {
    if (lower.includes(key)) {
      return faqData[key];
    }
  }
  return "I'm not sure I understand. Could you rephrase that? 😊";
}

function addMessage(text, sender, save = true) {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("message", sender);

  const avatar = document.createElement("img");
  avatar.classList.add("avatar");
  avatar.src = sender === "bot" 
    ? "https://cdn-icons-png.flaticon.com/512/4712/4712109.png"
    : "https://cdn-icons-png.flaticon.com/512/1946/1946429.png";

  const textDiv = document.createElement("div");
  textDiv.classList.add("text");
  textDiv.textContent = text;

  msgDiv.appendChild(avatar);
  msgDiv.appendChild(textDiv);

  chatbox.appendChild(msgDiv);
  chatbox.scrollTop = chatbox.scrollHeight;

  if (save) {
    saveChatHistory(text, sender);
  }
}

function saveChatHistory(text, sender) {
  let chat = JSON.parse(localStorage.getItem("chatHistory")) || [];
  chat.push({ text, sender });
  localStorage.setItem("chatHistory", JSON.stringify(chat));
}

function showTypingIndicator() {
  typingIndicator.classList.remove("hidden");
}

function hideTypingIndicator() {
  typingIndicator.classList.add("hidden");
}
