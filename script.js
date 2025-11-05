const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const typing = document.getElementById("typing");
const suggestions = document.getElementById("suggestions");

let faqs = [];

// Load FAQs
fetch("faqs.json")
  .then(res => res.json())
  .then(data => {
    faqs = data;
    botMessage("👋 Hi there! I’m <b>RecruIT</b>, your virtual hiring assistant at <b>NextGen Systems</b>. How can I help you today?");
    loadHistory();
  })
  .catch(() => {
    botMessage("Hello! I'm RecruIT 😊 — I couldn’t load FAQs right now, but I can still chat!");
  });

// Load chat history
function loadHistory() {
  const saved = JSON.parse(localStorage.getItem("chatHistory")) || [];
  saved.forEach(msg => addMessage(msg.text, msg.sender, false));
}

// Save chat history
function saveHistory() {
  const messages = [...document.querySelectorAll(".message")].map(m => ({
    text: m.innerHTML,
    sender: m.classList.contains("user-message") ? "user" : "bot"
  }));
  localStorage.setItem("chatHistory", JSON.stringify(messages));
}

sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", e => {
  if (e.key === "Enter") sendMessage();
});

// Suggestion chip click
suggestions.addEventListener("click", e => {
  if (e.target.tagName === "BUTTON") {
    userInput.value = e.target.textContent;
    sendMessage();
  }
});

function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;
  addMessage(text, "user");
  userInput.value = "";
  typing.classList.remove("hidden");

  setTimeout(() => {
    respond(text);
  }, 1000);
}

function respond(input) {
  input = input.toLowerCase();
  let answer = faqs.find(f => input.includes(f.question.toLowerCase()))?.answer;
  if (!answer) {
    answer = "That's a great question! 🤔 Please check our <a href='#' class='link-btn'>Careers Page</a> for more details.";
  }
  typing.classList.add("hidden");
  botMessage(answer);
}

function addMessage(text, sender, save = true) {
  const div = document.createElement("div");
  div.className = `message ${sender}-message`;
  div.innerHTML = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
  if (save) saveHistory();
}

function botMessage(text) {
  addMessage(text, "bot");
}
