
/* L'Oréal Beauty Advisor Chatbot */

// Connect to the HTML elements
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const sendBtn = document.getElementById("sendBtn");

// Your Cloudflare Worker URL (no API key needed here)
const workerURL =
  "https://loreal-beauty-advisor.eandamas.workers.dev/";

// Instructions for the AI chatbot
const systemPrompt = {
  role: "system",
  content: `You are a friendly and knowledgeable L'Oréal
  Beauty Advisor.

  Only answer questions about L'Oréal products,
  skincare, makeup, haircare, fragrances, and
  related beauty routines.

  If someone asks about an unrelated topic,
  politely explain that you can only help with
  L'Oréal beauty products and routines.

  Give personalized recommendations based on
  the user's skin type, hair type, concerns,
  preferences, and budget.

  Ask follow-up questions when you need more
  information before recommending products.

  Keep your responses friendly, clear, and helpful.
  Do not invent product names, prices, ingredients,
  or product claims. If unsure, say so.

  Do not provide medical diagnoses or treatments.
  For serious skin concerns, recommend speaking
  with a healthcare professional.`
};

// Store conversation history for bonus points
const messages = [systemPrompt];

// Function to display chat bubbles
function addMessage(text, sender) {
  const message = document.createElement("div");

  message.className = `msg ${sender}`;
  message.textContent = text;

  chatWindow.appendChild(message);

  // Automatically scroll to newest message
  chatWindow.scrollTop = chatWindow.scrollHeight;

  return message;
}

// Initial welcome message
addMessage(
  "👋 Welcome to L'Oréal Beauty Advisor! " +
  "I'm here to help you discover products and " +
  "create your perfect beauty routine. " +
  "What can I help you with today?",
  "ai"
);

// Handle messages when user clicks Send
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const question = userInput.value.trim();

  if (!question) return;

  // Show the user's question
  addMessage(question, "user");

  // Add question to conversation history
  messages.push({
    role: "user",
    content: question
  });

  // Clear input and prevent multiple requests
  userInput.value = "";
  sendBtn.disabled = true;

  // Show loading message
  const loadingMessage = addMessage(
    "Thinking about your beauty question...",
    "ai"
  );

  try {
    // Send conversation to Cloudflare Worker
    const response = await fetch(workerURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: messages
      })
    });

    const data = await response.json();

    // Check for API errors
    if (!response.ok) {
      throw new Error(
        data.error?.message ||
        data.error ||
        "Unable to connect to the chatbot."
      );
    }

    // Get the AI response
    const reply = data.choices[0].message.content;

    // Replace loading text with AI response
    loadingMessage.textContent = reply;

    // Remember the AI response
    messages.push({
      role: "assistant",
      content: reply
    });

  } catch (error) {
    loadingMessage.textContent =
      "Sorry, something went wrong. " + error.message;

    // Remove failed question from history
    messages.pop();

    console.error("Chatbot error:", error);
  }

  // Enable the send button again
  sendBtn.disabled = false;
  userInput.focus();

  // Scroll to latest message
  chatWindow.scrollTop = chatWindow.scrollHeight;
});
