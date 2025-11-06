/* style.css (FIXED for Overlap and User Experience + NEW MENU) */

/* Base Styles */
body {
  background: #eaf3ff; 
  font-family: "Poppins", Arial, sans-serif; 
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
}

/* Chat Container */
.chat-container {
  width: 420px; 
  height: 600px; 
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15); 
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.3s ease; /* For smooth fullscreen transition */
}

/* --- NEW: Fullscreen Style --- */
.chat-container.fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    border-radius: 0;
    box-shadow: none;
    max-width: none;
    z-index: 9999;
}
/* --- END NEW: Fullscreen Style --- */


/* Chat Header (Adjusted to accommodate menu) */
.chat-header {
  /* Default Theme */
  background: linear-gradient(135deg, #0078ff, #00b4ff); 
  color: white;
  padding: 15px 15px 15px 25px; 
  text-align: center;
  font-size: 1.2em;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: space-between; /* Aligns content and menu to edges */
  gap: 10px;
  position: relative; /* For dropdown positioning */
}

/* --- NEW: Theme Classes --- */
.chat-header.theme-default {
    background: linear-gradient(135deg, #0078ff, #00b4ff); /* Original Blue Wave */
}
.chat-header.theme-sunset {
    background: linear-gradient(135deg, #ff7e5f, #feb47b); /* Warm Orange/Pink */
}
.chat-header.theme-emerald {
    background: linear-gradient(135deg, #13aa52, #47cf73); /* Green/Emerald */
}
/* --- END NEW: Theme Classes --- */

/* Bot Avatar Styling */
.bot-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%; 
  background: white; 
  padding: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  line-height: 1;
}

.bot-avatar::before {
  content: '🤖'; /* The Robot Emoji */
}

/* --- NEW: Kebab Menu & Dropdown Styles --- */
.kebab-menu {
  position: relative;
}

#menu-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.5em;
  line-height: 1;
  padding: 0 5px;
  cursor: pointer;
  transition: opacity 0.2s;
  font-weight: 800;
  transform: translateY(-2px);
}

#menu-btn:hover {
  opacity: 0.8;
}

.options-dropdown {
  position: absolute;
  top: 100%; 
  right: 0;
  width: 200px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  padding: 10px;
  z-index: 200; 
  display: none; 
  transform: translateY(5px);
}

.options-dropdown.open {
  display: block;
}

.dropdown-section-title {
    font-size: 0.8em;
    font-weight: 600;
    color: #555;
    margin: 5px 0 5px 5px;
    padding: 0 5px;
}

.menu-item {
    width: 100%;
    padding: 8px 10px;
    margin-bottom: 5px;
    text-align: left;
    border: none;
    background: none;
    cursor: pointer;
    font-size: 0.9em;
    color: #333;
    border-radius: 4px;
    transition: background 0.2s;
}

.menu-item:hover {
    background-color: #f0f0f0;
}

.theme-options {
    display: flex;
    justify-content: space-between;
    padding: 5px;
}

.theme-option {
    padding: 5px 8px;
    font-size: 0.8em;
    border: 1px solid #ccc;
    border-radius: 4px;
    cursor: pointer;
    color: white;
    transition: all 0.2s;
    flex-grow: 1;
    margin: 0 3px;
    text-align: center;
}

.theme-option[data-theme="default"] { background: #007bff; border-color: #007bff; }
.theme-option[data-theme="sunset"] { background: #ff7e5f; border-color: #ff7e5f; }
.theme-option[data-theme="emerald"] { background: #13aa52; border-color: #13aa52; }

.theme-option:hover {
    opacity: 0.8;
}

/* --- END NEW: Kebab Menu & Dropdown Styles --- */


/* Chat Box: Added padding-bottom to prevent suggestions from hiding content */
.chat-box {
  flex: 1;
  padding: 15px;
  padding-bottom: 20px; 
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Chat Messages */
.message {
  margin-bottom: 10px;
  max-width: 80%;
  word-wrap: break-word;
  padding: 10px 15px;
  border-radius: 15px;
  display: flex;
  align-items: center;
}

.message p {
  margin: 0;
}

.message.user {
  align-self: flex-end;
  background-color: #007bff; 
  color: #fff;
}

.message.bot {
  align-self: flex-start;
  background-color: #f1f1f1;
  color: #333;
}

/* Input Container: Holds all elements at the bottom */
.input-container {
  display: flex; 
  padding: 10px;
  background: #f2f6fa; 
  border-top: 1px solid #ccc;
  gap: 8px; 
}

/* Autocomplete Container: Takes full width and provides relative context */
.autocomplete-container {
  flex: 1; 
  position: relative; 
}

/* User Input Field */
.input-container input {
  width: 100%; 
  border: 1px solid #ccc; 
  outline: none;
  padding: 10px;
  border-radius: 20px; 
  font-size: 14px;
  margin: 0;
  box-sizing: border-box; 
  z-index: 110; 
}

/* Suggestions List: Positioned directly above the input */
.suggestions-list {
  position: absolute;
  bottom: 50px; /* Positions it correctly above the input field */
  left: 0;
  right: 0;
  max-height: 180px; 
  overflow-y: auto;
  z-index: 100; 
  background: white;
  border: 1px solid #ccc;
  border-radius: 10px 10px 0 0;
  box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.15);
  display: none; 
  list-style: none;
  padding: 0;
  margin: 0;
}

.suggestion-item {
  padding: 10px 15px;
  cursor: pointer;
  font-size: 0.9em;
  color: #333;
  border-bottom: 1px solid #eee;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:hover {
  background-color: #e6f0ff; 
  color: #007bff;
}

/* Button Styles */
.input-container button {
  padding: 10px 18px; 
  border-radius: 20px; 
  border: none;
  color: white;
  cursor: pointer;
  font-weight: 600; 
  transition: background-color 0.2s;
}

#send-btn {
  background-color: #007bff;
}

#send-btn:hover:not(:disabled) {
  background-color: #0056b3;
}

#send-btn:disabled {
    cursor: not-allowed;
    opacity: 0.6;
}

#clear-btn {
  background-color: #dc3545; 
}

#clear-btn:hover {
  background-color: #c82333;
}


/* Typing Indicator Styles */
.typing-indicator {
  align-self: flex-start; 
  background-color: #f1f1f1;
  color: #333;
  padding: 10px 15px;
  border-radius: 15px;
  max-width: 100px; 
}

.typing-animation {
  display: flex;
  align-items: center;
  height: 10px; 
}

.typing-animation span {
  display: block;
  width: 6px;
  height: 6px;
  background-color: #333;
  border-radius: 50%;
  margin-right: 5px;
  opacity: 0;
  animation: typing-dot 1s infinite;
}

.typing-animation span:nth-child(1) {
  animation-delay: 0s;
}

.typing-animation span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-animation span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing-dot {
  0%, 80%, 100% {
    transform: translateY(0);
    opacity: 0;
  }
  40% {
    transform: translateY(-5px);
    opacity: 1;
  }
}
