let faqs = {};

async function loadFaqs() {
  try {
    const response = await fetch("./faqs.json?nocache=" + new Date().getTime());
    if (!response.ok) throw new Error("Could not load FAQs");
    const data = await response.json();
    faqs = data.faqs || {};
    console.log("✅ FAQs loaded:", faqs);
  } catch (error) {
    console.error("❌ Error loading FAQs:", error);
    appendMessage("bot", "Hello! I'm RecruIT 😊 — I couldn’t load FAQs right now, but I can still chat!");
  }
  showGreeting();
  loadChatHistory();
}

function showGreeting() {
  appendMessage("bot", "Hello! 👋 I’m RecruIT, your virtual assistant. How can I help you today?");
}

function appendMessage(sender, text) {
  const chatbox = document.getElementById("chatbox");
  const msg = document.createElement("div");
  msg.classList.add("message", sender);
  msg.innerText = text;
  chatbox.appendChild(msg);
  chatbox.scrollTop = chatbox.scrollHeight;
  saveChatHistory();
}

function saveChatHistory() {
  localStorage.setItem("chatHistory", document.getElementById("chatbox").innerHTML);
}

function loadChatHistory() {
  const saved = localStorage.getItem("chatHistory");
  if (saved) document.getElementById("chatbox").innerHTML = saved;
}

function findAnswer(userInput) {
  const question = userInput.toLowerCase();
  for (let key in faqs) {
    if (question.includes(key)) return faqs[key];
  }
  return "Sorry, I’m not sure about that. Please visit our Careers Page for more details.";
}

function showTyping(callback) {
  const typing = document.getElementById("typingIndicator");
  typing.classList.remove("hidden");
  setTimeout(() => {
    typing.classList.add("hidden");
    callback();
  }, 1000);
}

document.getElementById("sendBtn").addEventListener("click", () => {
  const input = document.getElementById("userInput");
  const text = input.value.trim();
  if (text === "") return;
  appendMessage("user", text);
  input.value = "";
  showTyping(() => {
    const answer = findAnswer(text);
    appendMessage("bot", answer);
  });
});

document.getElementById("userInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") document.getElementById("sendBtn").click();
});

document.querySelectorAll(".suggestion").forEach(btn => {
  btn.addEventListener("click", () => {
    document.getElementById("userInput").value = btn.textContent;
    document.getElementById("sendBtn").click();
  });
});

loadFaqs();
