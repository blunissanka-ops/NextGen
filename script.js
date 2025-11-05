let faqs = [];
const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

async function loadFAQs() {
  try {
    const response = await fetch("faqs.json");
    faqs = await response.json();
  } catch (error) {
    addBotMessage("Hello! I'm RecruIT 😊 — I couldn’t load FAQs now, but I can still chat!");
  }
}

function addUserMessage(message) {
  const msg = document.createElement("div");
  msg.classList.add("user-message");
  msg.textContent = message;
  chatBox.appendChild(msg);
}

function addBotMessage(message) {
  const msg = document.createElement("div");
  msg.classList.add("bot-message");
  msg.innerHTML = message;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function addTypingIndicator() {
  const typing = document.createElement("div");
  typing.classList.add("typing");
  typing.innerHTML = "<span>RecruIT is typing</span> <span>...</span>";
  chatBox.appendChild(typing);
  chatBox.scrollTop = chatBox.scrollHeight;
  return typing;
}

function saveChatHistory() {
  localStorage.setItem("chatHistory", chatBox.innerHTML);
}

function loadChatHistory() {
  const saved = localStorage.getItem("chatHistory");
  if (saved) chatBox.innerHTML = saved;
}

function findAnswer(question) {
  const q = question.toLowerCase();
  const match = faqs.find(f => q.includes(f.question.toLowerCase().split(" ")[0]));
  return match ? match.answer : "Sorry, I’m not sure about that. Please visit our <a href='#'>Careers Page</a> for more details.";
}

async function handleUserMessage() {
  const message = userInput.value.trim();
  if (!message) return;
  addUserMessage(message);
  userInput.value = "";

  const typing = addTypingIndicator();
  setTimeout(() => {
    typing.remove();
    const answer = findAnswer(message);
    addBotMessage(answer);
    saveChatHistory();
  }, 800);
}

sendBtn.addEventListener("click", handleUserMessage);
userInput.addEventListener("keypress", e => {
  if (e.key === "Enter") handleUserMessage();
});

document.querySelectorAll(".suggestions button").forEach(btn => {
  btn.addEventListener("click", () => {
    userInput.value = btn.textContent;
    handleUserMessage();
  });
});

window.onload = () => {
  loadChatHistory();
  loadFAQs();
};
