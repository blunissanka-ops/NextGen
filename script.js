let faqsData = [];

// --- Load external faqs.json ---
fetch("./faqs.json")
  .then(r => r.json())
  .then(d => {
    faqsData = d;
    appendMessage("bot","✅ FAQs loaded successfully!");
  })
  .catch(() => appendMessage("bot","⚠️ Unable to load FAQs. Please check faqs.json."));

const chatWrapper=document.querySelector(".chat-wrapper");
const chatWidget=document.querySelector(".chat-widget");
const chatLauncher=document.querySelector("#chat-launcher");
const chatMessages=document.querySelector(".chat-messages");
const sendBtn=document.querySelector("#send-btn");
const clearBtn=document.querySelector("#clear-btn");
const userInput=document.querySelector("#user-input");
const themeSelect=document.querySelector("#theme-select");
const colorPicker=document.querySelector("#custom-color");
const darkToggle=document.querySelector("#dark-toggle");
const menuBtn=document.querySelector("#menu-btn");
const menuDropdown=document.querySelector("#menu-dropdown");
const fullscreenBtn=document.querySelector("#fullscreen-btn");
const exitFullscreenBtn=document.querySelector("#exit-fullscreen-btn");
const suggestionsBox=document.querySelector(".suggestion-list");

function appendMessage(sender,text){
  const msg=document.createElement("div");
  msg.classList.add("message",sender);
  const t=new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
  msg.innerHTML=`<p>${text}</p><span class="meta">${t}</span>`;
  chatMessages.appendChild(msg);
  chatMessages.scrollTop=chatMessages.scrollHeight;
}

function cleanText(s){return s.toLowerCase().replace(/[^a-z0-9\s]/g,"");}
function similarity(a,b){
  const A=cleanText(a).split(/\s+/),B=cleanText(b).split(/\s+/);
  const inter=A.filter(x=>B.includes(x));
  return inter.length/Math.max(A.length,B.length);
}

function findAnswer(msg) {
function findAnswer(msg) {
  const text = cleanText(msg);

  // Greeting detection
  const greetings = ["hi","hello","hey","good morning","good evening","good afternoon"];
  if (greetings.some(g => text.includes(g)))
    return "👋 Hello there! How can I assist you today? You can ask about jobs, application status, or training.";

  // Smart matching
  let best = null, bestScore = 0;
  faqsData.forEach(f => {
    const combined = (f.question + " " + (f.keywords || []).join(" ")).toLowerCase();
    const score = similarity(text, combined);
    if (score > bestScore) { best = f; bestScore = score; }
  });

  // If a good match found
  if (best && bestScore > 0.1) return best.answer;

  // Partial word match (extra layer)
  const partial = faqsData.find(f => {
    const qWords = f.question.toLowerCase().split(" ");
    return qWords.some(w => text.includes(w));
  });
  if (partial) return partial.answer;

  // Default fallback
  return "🤔 I’m not sure about that one. Try asking about jobs, qualifications, or training programs.";
}


}

function showTyping(){
  const el=document.createElement("div");
  el.classList.add("message","bot","typing");
  el.textContent="...";
  chatMessages.appendChild(el);
  chatMessages.scrollTop=chatMessages.scrollHeight;
  return el;
}

function handleUserInput(){
  const msg=userInput.value.trim();
  if(!msg)return;
  appendMessage("user",msg);
  userInput.value="";
  hideSuggestionDropdown();
  const typing=showTyping();
  setTimeout(()=>{
    typing.remove();
    appendMessage("bot",findAnswer(msg));
  },700);
}

function clearChat(){
  chatMessages.innerHTML="";
  appendMessage("bot","🧹 Chat cleared. How can I help you again?");
}

// --- Suggestions ---
let suggestionDropdown;
function createSuggestionDropdown(){
  suggestionDropdown=document.createElement("div");
  suggestionDropdown.className="live-suggestions";
  document.querySelector(".chat-footer").appendChild(suggestionDropdown);
}
function showSuggestionDropdown(items){
  if(!suggestionDropdown) createSuggestionDropdown();
  suggestionDropdown.innerHTML="";
  items.forEach(item=>{
    const b=document.createElement("div");
    b.className="live-suggestion";
    b.textContent=item.question;
    b.onclick=()=>{userInput.value=item.question;hideSuggestionDropdown();handleUserInput();};
    suggestionDropdown.appendChild(b);
  });
  suggestionDropdown.style.display=items.length?"block":"none";
}
function hideSuggestionDropdown(){
  if(suggestionDropdown) suggestionDropdown.style.display="none";
}

userInput.addEventListener("input",e=>{
  const q=e.target.value.toLowerCase().trim();
  suggestionsBox.innerHTML="";
  if(!q){hideSuggestionDropdown();return;}
  const matches=faqsData.filter(f=>f.question.toLowerCase().includes(q)).slice(0,5);
  matches.forEach(f=>{
    const chip=document.createElement("button");
    chip.className="suggestion";
    chip.textContent=f.question;
    chip.onclick=()=>{userInput.value=f.question;suggestionsBox.innerHTML="";handleUserInput();};
    suggestionsBox.appendChild(chip);
  });
  showSuggestionDropdown(matches);
});

function applyTheme(){
  const tMap={
    "Blue Gradient":["#007BFF","#00C6FF"],
    "Purple Gradient":["#7b61ff","#c56fff"],
    "Mint Gradient":["#00C9A7","#92FE9D"],
    "Sunset Gradient":["#ff9966","#ff5e62"]
  };
  const [c1,c2]=tMap[themeSelect.value]||tMap["Blue Gradient"];
  document.documentElement.style.setProperty("--primary-1",c1);
  document.documentElement.style.setProperty("--primary-2",c2);
}
themeSelect.addEventListener("change",applyTheme);
colorPicker.addEventListener("input",e=>{
  const c=e.target.value;
  document.documentElement.style.setProperty("--primary-1",c);
  document.documentElement.style.setProperty("--primary-2",c);
});
darkToggle.addEventListener("change",e=>{
  document.documentElement.classList.toggle("dark",e.target.checked);
});

menuBtn.addEventListener("click",e=>{
  e.stopPropagation();
  menuDropdown.classList.toggle("hidden");
});
document.addEventListener("click",()=>menuDropdown.classList.add("hidden"));
fullscreenBtn.addEventListener("click",()=>{
  chatWidget.classList.add("fullscreen");
  fullscreenBtn.classList.add("hidden");
  exitFullscreenBtn.classList.remove("hidden");
});
exitFullscreenBtn.addEventListener("click",()=>{
  chatWidget.classList.remove("fullscreen");
  fullscreenBtn.classList.remove("hidden");
  exitFullscreenBtn.classList.add("hidden");
});
chatLauncher.addEventListener("click",()=>chatWrapper.classList.toggle("minimized"));
sendBtn.addEventListener("click",handleUserInput);
clearBtn.addEventListener("click",clearChat);
userInput.addEventListener("keypress",e=>{if(e.key==="Enter")handleUserInput();});

window.addEventListener("load",()=>{
  applyTheme();
  appendMessage("bot","👋 Hello! I am your NextGen HR Assistant. How can I help you today?");
});
