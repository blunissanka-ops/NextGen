let faqs = [];

// Load FAQs from faqs.json
async function loadFAQs() {
  try {
    const res = await fetch("faqs.json");
    const data = await res.json();
    faqs = data.faqs.flatMap(c => c.questions);
    console.log("✅ FAQs loaded:", faqs.length);
  } catch (error) {
    console.error("❌ Error loading FAQs:", error);
    appendMessage("⚠️ Sorry, I couldn’t load the FAQs. Please refresh or check your connection.", "bot");
  }
}

// Send message when user clicks Send
function sendMessage() {
  const input = document.getElementById("userInput");
  const message = input.value.trim();
  if (!message) return;

  appendMessage(message, "user");
  input.value = "";

  setTimeout(() => {
    const answer = getBestAnswer(message);
    appendMessage(answer, "bot");
  }, 400);
}

// Append chat messages
function appendMessage(text, sender) {
  const chatBox = document.getElementById("chatBox");
  const msg = document.createElement("div");
  msg.classList.add("message", sender);
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// --- IMPROVED FAQ MATCHING FUNCTION ---
function getBestAnswer(userQuestion) {
  userQuestion = userQuestion.toLowerCase();

  let bestMatch = null;
  let highestScore = 0;

  faqs.forEach(faq => {
    const question = faq.question.toLowerCase();

    const score = advancedSimilarity(userQuestion, question);
    if (score > highestScore) {
      highestScore = score;
      bestMatch = faq;
    }
  });

  console.log(`🔍 "${userQuestion}" best match score: ${highestScore}`);

  if (highestScore > 0.35 && bestMatch) {
    return bestMatch.answer;
  } else {
    return "🤔 I’m not sure I understand that. Could you rephrase or ask something else about our careers?";
  }
}

// --- ADVANCED SIMILARITY ALGORITHM ---
function advancedSimilarity(a, b) {
  const wordsA = a.split(/\s+/);
  const wordsB = b.split(/\s+/);

  // Basic overlap score
  const matches = wordsA.filter(word => wordsB.includes(word));
  const overlapScore = matches.length / Math.max(wordsA.length, wordsB.length);

  // Keyword weight (boosts matching for key terms)
  const keywords = ["apply", "job", "qualification", "training", "degree", "experience", "interview", "feedback"];
  const keywordHits = keywords.filter(k => a.includes(k) && b.includes(k)).length;
  const keywordScore = keywordHits / keywords.length;

  // Length similarity (penalizes very different sentence lengths)
  const lenScore = 1 - Math.abs(wordsA.length - wordsB.length) / Math.max(wordsA.length, wordsB.length);

  // Weighted average
  const finalScore = (overlapScore * 0.5) + (keywordScore * 0.3) + (lenScore * 0.2);
  return finalScore;
}

// Load FAQs on startup
loadFAQs();
