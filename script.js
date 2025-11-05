// --- 1. CORE FAQ DATA (Your specific NextGen Q&A) ---
const faqData = [
    // Structure: {keywords: "key, words, separated, by, comma", response: "The answer..."}
    { keywords: "apply, job, how, career, portal", response: "You can apply directly through our **Careers Page** by selecting the role you’re interested in and clicking 'Apply Now'. Once you submit your CV and details, our team will review it." },
    { keywords: "more, multiple, position, different", response: "Absolutely! If you feel you’re suitable for multiple roles, you’re welcome to apply for **more than one**. Just make sure each application matches your skills and experience." },
    { keywords: "documents, submit, upload, cv, resume, portfolio", response: "You will need to upload your **updated CV**. We also encourage you to include a cover letter and links to your portfolio or LinkedIn." },
    { keywords: "received, confirmation, application", response: "Once your application is successfully submitted, you will receive an **email confirmation**. You may also receive a message from RecruIT acknowledging your submission." },
    { keywords: "no experience, fresh, graduate, entry-level", response: "Yes! We welcome applications from **fresh graduates** and candidates from different industries. If you have passion and willingness to learn, we encourage you to apply. Some roles are specifically designed for entry-level applicants." },
    { keywords: "degree, education, mandatory, academic", response: "A degree is beneficial, but **not mandatory for all roles**. We value skills, practical experience, problem-solving ability, and creativity. We'd love to hear from you even without a degree if you have a strong portfolio." },
    { keywords: "basic, qualifications, needed, requirements", response: "To apply for any position, you should have at least the educational background and experience represented in the job ad. Generally, for starter level roles, a diploma or degree in the related field is needed." },
    { keywords: "age, limit, experience, senior, junior", response: "No, there isn’t an exact **age requirement** to apply. But some positions do require a certain time period of experience (e.g., 3-5 years for senior roles, while internships are for new graduates)." },
    { keywords: "meet, check, suitable, fit", response: "Each job posting includes a **detailed list of required qualifications, skills, and experience**. Compare your background and work experience with those mentioned to see if you meet most requirements." },
    { keywords: "professional, certification, CIMA, ACCA, PMP, HRM", response: "**Not always!** Certifications like CIMA, ACCA, PMP and HRM Diplomas are considered an advantage but not a strict requirement unless mentioned otherwise." },
    { keywords: "training, growth, gap, skills, development", response: "**Yes! We believe in growth.** Our Learning and Development team offers training programs to assist employees in acquiring skills gaps for their current and future roles." },
    { keywords: "status, current, progress, where is my application", response: "You can check your application status by logging into your **candidate profile on our careers portal**. Select 'My Applications' to view whether your application is under review, shortlisted, or completed." },
    { keywords: "feedback, interview, time, duration", response: "Typically, our recruitment team provides feedback within **7 to 10 working days** after your interview. However, timelines may vary depending on the position and number of applicants." },
    { keywords: "not selected, rejected, outcome, failed", response: "**Yes**, we ensure every candidate is informed of the outcome. You will receive an email notification with feedback or a general update once the recruitment process for that role is completed." },
    { keywords: "detailed feedback, request, performance", response: "**Yes**, you may request feedback by replying to your interview confirmation email or contacting the HR Recruitment Team. Feedback is provided where possible to help candidates improve." },
    { keywords: "under review, long time, evaluation, waiting", response: "**'Under Review'** means your application is still being evaluated by our recruitment team or the hiring manager. Sometimes, reviews take longer due to a high volume of applications or ongoing internal discussions." },
    { keywords: "update, resume, after application, edit", response: "**Yes**, you can update your details by logging into your profile *before* the job posting closes. Once the deadline passes, edits can no longer be made." },
    { keywords: "apply again, not selected, future, different role", response: "Absolutely! We encourage you to apply for other roles that match your skills and experience. You can also join our talent pool to be considered for **future openings**." }
];

// --- 2. SOCIAL/GREETING RESPONSES ---
const socialResponses = {
    greetings: ["hi", "hello", "hey", "good morning", "good evening"],
    gratitude: ["thank you", "thanks", "cheers", "much obliged"],
    greetingsResponse: ["Hello there! I'm RecruIT. How can I assist you with your career journey at NextGen Systems?", "Hi! Ready to find your next role? Ask me about applications, qualifications, or your interview status!", "Greetings! I'm RecruIT, NextGen's AI recruitment assistant. What's your question today?"],
    gratitudeResponse: ["You're welcome! Happy to help.", "My pleasure. Good luck with your application!", "No problem at all! Let me know if you have any other questions."],
};

function getBotResponse(userMessage) {
    const cleanedMsg = userMessage.toLowerCase().trim();

    // 1. Check for Greetings (Social Intent)
    for (const greeting of socialResponses.greetings) {
        if (cleanedMsg === greeting || cleanedMsg.startsWith(greeting + " ")) {
            // Return a random, creative greeting
            const randomIndex = Math.floor(Math.random() * socialResponses.greetingsResponse.length);
            return socialResponses.greetingsResponse[randomIndex];
        }
    }

    // 2. Check for Gratitude (Social Intent)
    for (const thank of socialResponses.gratitude) {
        if (cleanedMsg.includes(thank)) {
            // Return a random gratitude response
            const randomIndex = Math.floor(Math.random() * socialResponses.gratitudeResponse.length);
            return socialResponses.gratitudeResponse[randomIndex];
        }
    }

    // 3. Check for FAQ/Keyword Match (Primary Intent)
    for (const qa of faqData) {
        const keywords = qa.keywords.split(',').map(k => k.trim());
        for (const keyword of keywords) {
            // Check if cleaned message contains the keyword (must be longer than 2 chars to avoid matching 'a', 'to', etc.)
            if (cleanedMsg.includes(keyword) && keyword.length > 2) {
                return qa.response;
            }
        }
    }

    // 4. Default/Fallback Response
    return "That's an interesting question, but I'm an AI specialized in NextGen Systems' **job applications, qualifications, and interview status**. Could you rephrase it or ask about one of those topics?";
}

// --- (UI Logic for chat interface - KEEP THIS THE SAME) ---
const chatbox = document.getElementById('chatbox');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

function displayMessage(message, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    messageDiv.innerHTML = message; // Use innerHTML to render bold tags (**)
    chatbox.appendChild(messageDiv);
    chatbox.scrollTop = chatbox.scrollHeight; // Scroll to bottom
}

function sendMessage() {
    const userText = userInput.value.trim();
    if (userText === "") return;

    displayMessage(userText, 'user');
    userInput.value = '';

    // Get and display bot response after a short delay
    setTimeout(() => {
        const botResponse = getBotResponse(userText);
        displayMessage(botResponse, 'bot');
    }, 500);
}

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Initial welcome message (now pulls from the social response array)
window.onload = () => {
    // Generate a creative welcome message on load
    const welcomeIndex = Math.floor(Math.random() * socialResponses.greetingsResponse.length);
    displayMessage("🤖 RecruIT: " + socialResponses.greetingsResponse[welcomeIndex], 'bot');
};
