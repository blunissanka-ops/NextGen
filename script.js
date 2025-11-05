const faq = {
  "apply": "You can apply directly through our Careers Page by selecting the role you’re interested in and clicking “Apply Now”.",
  "more than one position": "Absolutely! You may apply for multiple roles if you’re suitable for them.",
  "documents": "You need to upload your updated CV, and optionally a cover letter or LinkedIn profile.",
  "application received": "Once submitted, you’ll receive an email confirmation from our recruitment team.",
  "no experience": "Yes! We welcome fresh graduates and career changers who have a passion to learn.",
  "degree": "A degree is beneficial but not mandatory. Skills and experience matter most!",
  "qualifications": "You should have the background mentioned in the job post — typically a diploma or degree.",
  "age": "There’s no age limit, though senior roles may require 3–5 years of experience.",
  "training": "Yes, our Learning & Development team provides training to bridge skill gaps.",
  "status": "You can check your application status by logging into your candidate profile on our careers portal.",
  "feedback": "Our recruitment team provides feedback within 7–10 working days after your interview.",
  "not selected": "Yes, you’ll receive an email if you’re not selected once the process is complete.",
  "interview feedback": "You can request feedback by contacting the HR Recruitment Team through the portal.",
  "under review": "It means your application is still being evaluated by the recruitment team.",
  "update resume": "Yes, you can update details before the job posting closes.",
  "apply again": "Of course! You can apply for future roles or join our talent pool."
};

function sendMessage() {
  const input = document.getElementById("userInput");
  const chatbox = document.getElementById("chatbox");

  const userText = input.value.trim();
  if (userText === "") return;

  // Show user message
  const userDiv = document.createElement("div");
  userDiv.className = "user-message";
  userDiv.textContent = userText;
  chatbox.appendChild(userDiv);

  // Generate bot reply
  const botDiv = document.createElement("div");
  botDiv.className = "bot-message";

  let response = "I'm not sure I understand. Could you rephrase that? 😊";

  for (let key in faq) {
    if (userText.toLowerCase().includes(key)) {
      response = faq[key];
      break;
    }
  }

  botDiv.textContent = response;
  chatbox.appendChild(botDiv);

  input.value = "";
  chatbox.scrollTop = chatbox.scrollHeight;
}
