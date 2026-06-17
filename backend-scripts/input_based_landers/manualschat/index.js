import { initLander } from "../../core/lander";
import { eventNames } from "../../constants";
let tbinit = {
    [eventNames.ic] :  { notify: 'event', name: 'CTA-Click', id: 1795853 },
    [eventNames.tyimp]:{notify: 'event', name: 'AIBrowser_Generic_Install', id: 1795853}
}
initLander("Manuals",tbinit,"Manuals");
document.addEventListener("DOMContentLoaded", function () {
  
  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");
    const icon = question.querySelector("i");
    question.addEventListener("click", function () {
      const isOpen = !answer.classList.contains("hidden");
      faqItems.forEach((otherItem) => {
        const otherAnswer = otherItem.querySelector(".faq-answer");
        const otherIcon = otherItem.querySelector(".faq-question i");
        otherAnswer.classList.add("hidden");
        otherIcon.classList.remove("rotate-180");
      });
      if (!isOpen) {
        answer.classList.remove("hidden");
        icon.classList.add("rotate-180");
      }
    });
  });
});

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll('nav a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href");
      if (targetId === "#") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        document.querySelector(targetId).scrollIntoView({
          behavior: "smooth",
        });
      }
    });
  });

  const chatContent = document.getElementById("chat-content");
  const chatContentContainer = document.getElementById("chat-content-container");
  const inputForm = document.getElementById("input-form");
  const startChatButton = document.getElementById("start-chat");
  const issueInput = document.getElementById("issue-input");
  const brandInput = document.getElementById("brand-input");
  const modelInput = document.getElementById("model-input");
  const productInput = document.getElementById("product-input");
  const chatInput = document.getElementById("chat-input");
  const messageInput = chatInput.querySelector('input[type="text"]');
  const sendButton = chatInput.querySelector("button");
  const returnButton = document.getElementById("return-to-input");

  // Keep track of conversation history
  let messageHistory = [];
  
  // Keep track of current stream controller
  let currentStreamController = null;

  function enableButtons(){
    const sendButtons = document.querySelectorAll(".send-button");
    sendButtons.forEach((button) => {
      button.classList.remove("hidden");
      button.classList.add("flex");
    });
    const stopButtons = document.querySelectorAll(".stop-button");
    stopButtons.forEach((button) => {
      button.classList.add("hidden");
      button.classList.remove("flex");
    });
  }

  function disableButtons(){
    const sendButtons = document.querySelectorAll(".send-button");
    sendButtons.forEach((button) => {
      button.classList.add("hidden");
      button.classList.remove("flex");
    });
    const stopButtons = document.querySelectorAll(".stop-button");
    stopButtons.forEach((button) => {
      button.classList.remove("hidden");
      button.classList.add("flex");
    });
  }

  function stopStream() {
    if (currentStreamController) {
      currentStreamController.abort();
      currentStreamController = null;
    }
    enableButtons();
    messageInput.disabled = false;
  }

  // Convert markdown to HTML using marked library
  function convertMarkdownToHtml(text) {
    if (typeof marked !== 'undefined') {
      try {
        // Configure marked options
        marked.setOptions({
          breaks: true,
          gfm: true
        });
        return marked.parse(text);
      } catch (error) {
        console.error('Marked parsing error:', error);
        return text.replace(/\n/g, '<br>');
      }
    }
    
    // Fallback to basic conversion if marked is not available
    return text
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  }

  // Function to make streaming API call
  async function getManualsChatResponseStream(messages, onChunk, onComplete, onError) {
    disableButtons();
    try {
      const controller = new AbortController();
      currentStreamController = controller;
      
      const response = await fetch("https://manualschat.ai/backend/api/manuals-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: messages.slice(-10) }),
        signal: controller.signal
      });
      
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        
        // Process streaming data in real-time
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.trim()) {
            try {
              // Handle different response formats
              if (line.startsWith('f:')) {
                // Filter results - skip this
                continue;
              } else if (line.startsWith('0:')) {
                // Content chunk
                let content = line.substring(2);
                
                // Clean up extra quotes that might be added by the API
                // Remove surrounding quotes if they exist
                if (content.startsWith('"') && content.endsWith('"')) {
                  content = content.slice(1, -1);
                }
                
                // Convert literal \n characters to actual line breaks
                content = content.replace(/\\n/g, '\n');
                
                fullResponse += content;
                onChunk(content);
              } else if (line.startsWith('e:') || line.startsWith('d:')) {
                // End of stream
                onComplete(fullResponse);
                return;
              }
            } catch (parseError) {
              console.warn('Error parsing line:', line, parseError);
            }
          }
        }
      }
      
      // If we reach here without an end marker, complete with what we have
      onComplete(fullResponse);
      
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Stream was cancelled by user');
        // onError("Response stopped by user.");
      } else {
        console.error("Error:", error);
        onError("I apologize, but I'm having trouble connecting right now. Please try again.");
      }
    } finally {
      currentStreamController = null;
    }
  }

  // Add user message to chat
  function addUserMessage(message) {
    const messageDiv = document.createElement("div");
    messageDiv.className = "flex items-start space-x-3 justify-end";
      messageDiv.innerHTML = `
<div class="bg-primary text-white rounded-lg p-3 max-w-xs flex-1">
        <p class="text-sm whitespace-pre-line">${message.replace(/\n/g, "\n")}</p>
</div>
<div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
<i class="ri-user-line text-gray-600 text-sm"></i>
</div>
`;
    chatContent.appendChild(messageDiv);
    
    // Smooth scroll to bottom
    setTimeout(() => {
      chatContentContainer.scrollTo({
        top: chatContent.scrollHeight,
        behavior: 'smooth'
      });
    }, 10);
  }

  // Add AI typing animation
  function addTypingAnimation() {
    const typingElement = document.createElement("div");
    typingElement.className = "flex items-start space-x-3 typing-indicator";
    typingElement.innerHTML = `
      <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
        <i class="ri-robot-line text-white text-sm"></i>
      </div>
      <div class="bg-gray-100 rounded-lg p-3 max-w-xs flex-1">
        <div class="typing-animation">
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
        </div>
      </div>
    `;
    chatContent.appendChild(typingElement);
    
    // Smooth scroll to bottom
    setTimeout(() => {
      chatContentContainer.scrollTo({
        top: chatContent.scrollHeight,
        behavior: 'smooth'
      });
    }, 10);
    
    return typingElement;
  }

  // Add streaming AI message to chat
  function addStreamingAIMessage() {
    const messageElement = document.createElement("div");
    messageElement.className = "flex items-start space-x-3 streaming-message";
    messageElement.innerHTML = `
<div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
<i class="ri-robot-line text-white text-sm"></i>
</div>
<div class="bg-gray-100 rounded-lg p-3 max-w-xs flex-1">
        <div class="text-sm chat-message streaming-content"></div>
</div>
`;
    chatContent.appendChild(messageElement);
    return messageElement;
  }

  // Update streaming message content
  function updateStreamingMessage(messageElement, content) {
    const contentElement = messageElement.querySelector('.streaming-content');
    if (contentElement) {
      // Convert markdown to HTML for better formatting
      const htmlContent = convertMarkdownToHtml(content);
      contentElement.innerHTML = htmlContent;
      
      // Only scroll to bottom on the first chunk (when content is very short)
      // This allows users to scroll up and read while response is still generating
      if (content.length < 200) { // Adjust this threshold as needed
        setTimeout(() => {
          chatContentContainer.scrollTo({
            top: chatContent.scrollHeight,
            behavior: 'smooth'
          });
        }, 20);
      }
    }
  }

  // Add AI message to chat (for non-streaming messages)
  function addAIMessage(message) {
    const messageElement = document.createElement("div");
    messageElement.className = "flex items-start space-x-3";
    const htmlMessage = convertMarkdownToHtml(message);
    messageElement.innerHTML = `
      <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
        <i class="ri-robot-line text-white text-sm"></i>
      </div>
      <div class="bg-gray-100 rounded-lg p-3 max-w-xs flex-1">
        <div class="text-sm chat-message">${htmlMessage}</div>
      </div>
    `;
    chatContent.appendChild(messageElement);
    
    // Smooth scroll to bottom
    setTimeout(() => {
      chatContentContainer.scrollTo({
        top: chatContent.scrollHeight,
        behavior: 'smooth'
      });
    }, 10);
  }

  function startChat() {
    const issue = issueInput.value.trim();
    const brand = brandInput.value.trim();
    const model = modelInput.value.trim();
    const product = productInput.value.trim();
    
    if (!issue) {
      issueInput.classList.add("border-red-500");
      return;
    }
    
    // Ensure back button exists and has event listener
    let backButton = document.getElementById("back-to-input");
    if (!backButton) {
      // Create back button if it doesn't exist
      chatContent.innerHTML = `
<button id="back-to-input" class="absolute top-2 right-4 w-8 h-8 text-gray-600 hover:text-primary flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
<i class="ri-close-line"></i>
</button>
`;
      backButton = document.getElementById("back-to-input");
      // Attach event listener to the new button
      backButton.addEventListener("click", handleBackToInput);
    }
    
    backButton.classList.remove("hidden");
    inputForm.classList.add("hidden");
    chatContent.classList.remove("hidden");
    chatInput.classList.remove("hidden");
    
    let userMessage = `Issue: ${issue}`;
    if (product) userMessage += `\nProduct: ${product}`;
    if (brand) userMessage += `\nBrand: ${brand}`;
    if (model) userMessage += `\nModel: ${model}`;
    
    // Add user message to chat and history
    addUserMessage(userMessage);
    messageHistory.push({
      role: "user",
      content: userMessage,
    });
    
    // Show typing animation
    const typingElement = addTypingAnimation();
    
    // Create streaming message element
    const streamingMessageElement = addStreamingAIMessage();
    let currentContent = "";
    
    // Remove typing animation
    const typingIndicators = document.querySelectorAll(".typing-indicator");
    typingIndicators.forEach((indicator) => indicator.remove());
    
    // Get AI response with streaming
    getManualsChatResponseStream(
      messageHistory,
      // onChunk callback
      (chunk) => {
        currentContent += chunk;
        updateStreamingMessage(streamingMessageElement, currentContent);
      },
      // onComplete callback
      (fullResponse) => {
        // Convert streaming message to regular message
        streamingMessageElement.classList.remove('streaming-message');
        const contentElement = streamingMessageElement.querySelector('.streaming-content');
        if (contentElement) {
          contentElement.className = 'text-sm chat-message';
          contentElement.innerHTML = convertMarkdownToHtml(fullResponse);
        }
        
        // Add to message history
        messageHistory.push({
          role: "assistant",
          content: fullResponse,
        });
        
        enableButtons();
      },
      // onError callback
      (errorMessage) => {
        // Convert streaming message to error message
        streamingMessageElement.classList.remove('streaming-message');
        const contentElement = streamingMessageElement.querySelector('.streaming-content');
        if (contentElement) {
          contentElement.textContent = errorMessage;
          contentElement.className = 'text-sm text-red-600';
        }
        
        enableButtons();
      }
    );
  }

  function handleSendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;
    
    // Add user message to chat and history
    addUserMessage(message);
    messageHistory.push({
      role: "user",
      content: message,
    });
      messageInput.value = "";
    messageInput.disabled = true;
    
    // Show typing animation
    const typingElement = addTypingAnimation();
    
    // Create streaming message element
    const streamingMessageElement = addStreamingAIMessage();
    let currentContent = "";
    
    // Remove typing animation
    const typingIndicators = document.querySelectorAll(".typing-indicator");
    typingIndicators.forEach((indicator) => indicator.remove());
    
    // Get AI response with streaming
    getManualsChatResponseStream(
      messageHistory,
      // onChunk callback
      (chunk) => {
        currentContent += chunk;
        updateStreamingMessage(streamingMessageElement, currentContent);
      },
      // onComplete callback
      (fullResponse) => {
        // Convert streaming message to regular message
        streamingMessageElement.classList.remove('streaming-message');
        const contentElement = streamingMessageElement.querySelector('.streaming-content');
        if (contentElement) {
          contentElement.className = 'text-sm chat-message';
          contentElement.innerHTML = convertMarkdownToHtml(fullResponse);
        }
        
        // Add to message history
        messageHistory.push({
          role: "assistant",
          content: fullResponse,
        });
        
        messageInput.disabled = false;
        enableButtons();
      },
      // onError callback
      (errorMessage) => {
        // Convert streaming message to error message
        streamingMessageElement.classList.remove('streaming-message');
        const contentElement = streamingMessageElement.querySelector('.streaming-content');
        if (contentElement) {
          contentElement.textContent = errorMessage;
          contentElement.className = 'text-sm text-red-600';
        }
        
        messageInput.disabled = false;
        enableButtons();
      }
    );
  }

  startChatButton.addEventListener("click", startChat);
  issueInput.addEventListener("input", function () {
    issueInput.classList.remove("border-red-500");
  });
  sendButton.addEventListener("click", handleSendMessage);
  messageInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  });
  
  // Add stop button event listeners
  document.addEventListener("click", function(e) {
    if (e.target.classList.contains("stop-button") || e.target.closest(".stop-button")) {
      stopStream();
    }
  });
  
  // Function to handle back to input
  function handleBackToInput() {
    console.log("back-to-input clicked");
    
    // Stop any active stream
    if (currentStreamController) {
      currentStreamController.abort();
      currentStreamController = null;
    }
    
    // Reset UI state
    enableButtons();
    messageInput.disabled = false;
    
    // Clear chat content and reset to initial state
    chatContent.innerHTML = `
<button id="back-to-input" class="absolute top-2 right-4 w-8 h-8 text-gray-600 hover:text-primary flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
<i class="ri-close-line"></i>
</button>
`;
    
    // Show/hide appropriate sections
    chatContent.classList.add("hidden");
    chatInput.classList.add("hidden");
    inputForm.classList.remove("hidden");
    
    // Clear form inputs
    issueInput.value = "";
    brandInput.value = "";
    modelInput.value = "";
    productInput.value = "";
    
    // Clear message history
    messageHistory = [];
    
    // Reattach event listener to the new button
    document.getElementById("back-to-input").addEventListener("click", handleBackToInput);
  }
  
  // Attach event listener to back button
  document.getElementById("back-to-input").addEventListener("click", handleBackToInput);
});