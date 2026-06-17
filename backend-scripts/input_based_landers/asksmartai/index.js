import { initLander } from "../../core/lander";
import { eventNames } from "../../constants";
let tbinit = {
    [eventNames.ic] :  { notify: 'event', name: 'CTA-Click', id: 1795853 },
    [eventNames.tyimp]:{notify: 'event', name: 'AIBrowser_Generic_Install', id: 1795853}
}
initLander("AI",tbinit,"AIChat");

window.addEventListener("load", () => {
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const mobileMenu = document.getElementById("mobileMenu");
  const chatInterface = document.getElementById("chatInterface");
  //I want to scroll to chatInterface but have margin on top of 10px
  function scrollToElementWithOffset(id, offset = 20) {
    const el = document.getElementById(id);
    if (!el) return;
  
    const rect = el.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const top = rect.top + scrollTop - offset;
  
    window.scrollTo({
      top: top,
      behavior: 'smooth'
    });
  }
  /* setTimeout(() => {
    if (window.innerWidth < 1024) {
      scrollToElementWithOffset("chatInterface", 100);
    }
  }, 4000); */
  mobileMenuBtn.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
    const icon = mobileMenuBtn.querySelector("i");
    icon.classList.toggle("ri-menu-line");
    icon.classList.toggle("ri-close-line");
  });
  const mobileMenuElements = document.querySelectorAll("#mobileMenu a");
  mobileMenuElements.forEach((element) => {
    element.addEventListener("click", () => {
      mobileMenu.classList.add("hidden");
      const icon = mobileMenuBtn.querySelector("i");
      icon.classList.add("ri-menu-line");
      icon.classList.remove("ri-close-line");
    });
  });
  document.addEventListener("click", (e) => {
    if (!mobileMenuBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
      mobileMenu.classList.add("hidden");
      const icon = mobileMenuBtn.querySelector("i");
      icon.classList.add("ri-menu-line");
      icon.classList.remove("ri-close-line");
    }
  });
  const smoothScroll = (target) => {
    const element = document.querySelector(target);
    if (element) {
      requestAnimationFrame(() => {
        const offset = window.innerWidth >= 768 ? 80 : 60;
        window.scrollTo({
          top: element.offsetTop - offset,
          behavior: "smooth",
        });
      });
      if (window.innerWidth < 768) {
        mobileMenu.classList.add("hidden");
        const icon = mobileMenuBtn.querySelector("i");
        icon.classList.add("ri-menu-line");
        icon.classList.remove("ri-close-line");
      }
    }
  };
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      smoothScroll(this.getAttribute("href"));
    });
  });
  const navbar = document.getElementById("navbar");
  window.addEventListener("scroll", function () {
    if (window.scrollY > 10) {
      navbar.classList.add("nav-shadow");
    } else {
      navbar.classList.remove("nav-shadow");
    }
  });
  // Focus input on page load
  if (window.innerWidth > 1024) {
    document.getElementById("messageInput").focus();
  }
  
  
  // Chat functionality
  const chatForm = document.getElementById("chatForm");
  const messageInput = document.getElementById("messageInput");
  const chatContainer = document.getElementById("chatContainer");
  const resetButton = document.getElementById("resetChat");
  // Keep track of conversation history
  let messageHistory = [
    {
      role: "assistant",
      content: "Hello! I'm your AI assistant. How can I help you today?",
    },
  ];
  
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
    modalMessageInput.disabled = false;
  }
  // Function to make streaming API call
  async function getChatResponseStream(messages, onChunk, onComplete, onError) {
    disableButtons();
    try {
      const controller = new AbortController();
      currentStreamController = controller;
      
      const response = await fetch("https://chatsmarter.ai/backend/api/chat", {
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
            } finally {
             
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
    const messageElement = document.createElement("div");
    messageElement.className = "flex gap-3 mb-4 justify-end";
    messageElement.innerHTML = `
    <div class="bg-blue-50 p-3 rounded-lg rounded-tr-none shadow-sm max-w-[80%]">
    <p class="text-gray-700">${message}</p>
    </div>
    <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
    <i class="ri-user-line text-gray-600"></i>
    </div>
    `;
    chatContainer.appendChild(messageElement);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    // Also scroll modal chat container if modal is open
    const modalChatContainer = document.getElementById("modalChatContainer");
    if (modalChatContainer && chatModal.classList.contains("active")) {
      setTimeout(() => {
        modalChatContainer.scrollTo({
          top: modalChatContainer.scrollHeight,
          behavior: "smooth"
        });
      }, 50);
    }
  }
  // Add AI typing animation
  function addTypingAnimation() {
    const typingElement = document.createElement("div");
    typingElement.className = "flex gap-3 mb-4 typing-indicator";
    typingElement.innerHTML = `
    <div class="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
    <img src="./images/2874f576ed30e2be9e8d552284e9c495.png" alt="AI Assistant" class="w-full h-full object-cover">
    </div>
    <div class="bg-white p-3 rounded-lg rounded-tl-none shadow-sm">
    <div class="typing-animation">
    <span class="typing-dot"></span>
    <span class="typing-dot"></span>
    <span class="typing-dot"></span>
    </div>
    </div>
    `;
    chatContainer.appendChild(typingElement);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    // Also scroll modal chat container if modal is open
    const modalChatContainer = document.getElementById("modalChatContainer");
    if (modalChatContainer && chatModal.classList.contains("active")) {
      setTimeout(() => {
        modalChatContainer.scrollTo({
          top: modalChatContainer.scrollHeight,
          behavior: "smooth"
        });
      }, 50);
    }
    
    return typingElement;
  }
  // Add AI message to chat
  function addAIMessage(message) {
    const messageElement = document.createElement("div");
    messageElement.className = "flex gap-3 mb-4";
    const htmlMessage = convertMarkdownToHtml(message);
    messageElement.innerHTML = `
    <div class="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
    <img src="./images/2874f576ed30e2be9e8d552284e9c495.png" alt="AI Assistant" class="w-full h-full object-cover">
    </div>
    <div class="bg-white p-3 rounded-lg rounded-tl-none shadow-sm max-w-[80%]">
    <div class="text-gray-700">${htmlMessage}</div>
    </div>
    `;
    chatContainer.appendChild(messageElement);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    // Also scroll modal chat container if modal is open
    const modalChatContainer = document.getElementById("modalChatContainer");
    if (modalChatContainer && chatModal.classList.contains("active")) {
      setTimeout(() => {
        modalChatContainer.scrollTo({
          top: modalChatContainer.scrollHeight,
          behavior: "smooth"
        });
      }, 50);
    }
  }

  // Add streaming AI message to chat
  function addStreamingAIMessage() {
    const messageElement = document.createElement("div");
    messageElement.className = "flex gap-3 mb-4 streaming-message";
    messageElement.innerHTML = `
    <div class="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
    <img src="./images/2874f576ed30e2be9e8d552284e9c495.png" alt="AI Assistant" class="w-full h-full object-cover">
    </div>
    <div class="bg-white p-3 rounded-lg rounded-tl-none shadow-sm max-w-[80%]">
    <p class="text-gray-700 streaming-content"></p>
    </div>
    `;
    chatContainer.appendChild(messageElement);
    
    // Also add to modal if it's open
    const modalChatContainer = document.getElementById("modalChatContainer");
    if (modalChatContainer && chatModal.classList.contains("active")) {
      const modalMessageElement = messageElement.cloneNode(true);
      modalChatContainer.appendChild(modalMessageElement);
    }
    
    return messageElement;
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

  // Update streaming message content
  function updateStreamingMessage(messageElement, content) {
    const contentElement = messageElement.querySelector('.streaming-content');
    if (contentElement) {
      // Convert markdown to HTML for better formatting
      const htmlContent = convertMarkdownToHtml(content);
      contentElement.innerHTML = htmlContent;
      
      // Only scroll to bottom on the first chunk (when content is very short)
      // This allows users to scroll up and read while response is still generating
      if (content.length < 100) { // Adjust this threshold as needed
        chatContainer.scrollTop = chatContainer.scrollHeight;
        
        // Also update modal if it's open
        const modalChatContainer = document.getElementById("modalChatContainer");
        if (modalChatContainer && chatModal.classList.contains("active")) {
          const modalStreamingMessage = modalChatContainer.querySelector('.streaming-message:last-child');
          if (modalStreamingMessage) {
            const modalContentElement = modalStreamingMessage.querySelector('.streaming-content');
            if (modalContentElement) {
              modalContentElement.innerHTML = htmlContent;
              modalChatContainer.scrollTo({
                top: modalChatContainer.scrollHeight,
                behavior: "smooth"
              });
            }
          }
        }
      } else {
        // For subsequent chunks, only update modal content without scrolling
        const modalChatContainer = document.getElementById("modalChatContainer");
        if (modalChatContainer && chatModal.classList.contains("active")) {
          const modalStreamingMessage = modalChatContainer.querySelector('.streaming-message:last-child');
          if (modalStreamingMessage) {
            const modalContentElement = modalStreamingMessage.querySelector('.streaming-content');
            if (modalContentElement) {
              modalContentElement.innerHTML = htmlContent;
            }
          }
        }
      }
    }
  }
  // Modal functionality
  const chatModal = document.querySelector(".chat-modal");
  const closeModalBtn = document.querySelector(".close-modal-btn");
  const modalChatContainer = document.getElementById("modalChatContainer");
  const modalChatForm = document.getElementById("modalChatForm");
  const modalMessageInput = document.getElementById("modalMessageInput");
  function openModal() {
    chatModal.classList.add("active");
    document.body.style.overflow = "hidden";
    // Sync chat content
    syncChatContent();
    // modalMessageInput.focus();
    
    // Scroll to bottom of modal chat container to show latest messages
    setTimeout(() => {
      const modalChatContainer = document.getElementById("modalChatContainer");
      if (modalChatContainer) {
        modalChatContainer.scrollTo({
          top: modalChatContainer.scrollHeight,
          behavior: "smooth"
        });
      }
    }, 100);
    
    //scroll to top
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }
  function syncChatContent() {
    if (!modalChatContainer || !chatContainer) return;
    
    // Store current scroll position
    const currentScrollTop = modalChatContainer.scrollTop;
    
    // Sync main chat to modal
    modalChatContainer.innerHTML = chatContainer.innerHTML;
    
    // If there are streaming messages, ensure they stay in sync
    const mainStreamingMessages = chatContainer.querySelectorAll('.streaming-message');
    const modalStreamingMessages = modalChatContainer.querySelectorAll('.streaming-message');
    
    if (mainStreamingMessages.length > 0 && modalStreamingMessages.length > 0) {
      // Update modal streaming messages to match main chat
      mainStreamingMessages.forEach((mainMsg, index) => {
        if (modalStreamingMessages[index]) {
          const mainContent = mainMsg.querySelector('.streaming-content');
          const modalContent = modalStreamingMessages[index].querySelector('.streaming-content');
          if (mainContent && modalContent) {
            modalContent.innerHTML = mainContent.innerHTML;
          }
        }
      });
    }
    
    // Restore scroll position
    setTimeout(() => {
      modalChatContainer.scrollTop = currentScrollTop;
    }, 10);
  }
  function closeModal() {
    chatModal.classList.remove("active");
    document.body.style.overflow = "";
    const chatInterface = document.getElementById("chatInterface");
    if (chatInterface) {
      chatInterface.style.display = "block";
    }
    
    // Copy modal chat messages back to main chat to preserve content
    if (modalChatContainer && chatContainer) {
      // Store the current scroll position
      const currentScrollTop = chatContainer.scrollTop;
      
      // Copy content from modal to main chat
      chatContainer.innerHTML = modalChatContainer.innerHTML;
      
      // Restore scroll position
      setTimeout(() => {
        chatContainer.scrollTop = currentScrollTop;
      }, 10);
    }
  }
  closeModalBtn.addEventListener("click", closeModal);
  // Handle form submission
  chatForm.addEventListener("submit", async function (e) {
    e.preventDefault();
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
    // Open modal on mobile and sync chat content
    if (window.innerWidth < 1024) {
      const chatInterface = document.getElementById("chatInterface");
      chatInterface.style.display = "none";
      openModal();
    }
    // Get AI response with streaming
    await getChatResponseStream(
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
          contentElement.className = 'text-gray-700';
          // Ensure final message also has proper HTML formatting
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
          contentElement.className = 'text-red-600';
        }
        
        messageInput.disabled = false;
        enableButtons();
      }
    );
  });

  // Debounced resize handler to prevent content loss
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if(window.innerWidth >= 1024){
          const chatModal = document.querySelector(".chat-modal");
          const chatInterface = document.getElementById("chatInterface");
          
          // Only close modal if it's actually open
          if (chatModal && chatModal.classList.contains("active")) {
            // Preserve chat content before closing modal
            if (modalChatContainer && chatContainer) {
              chatContainer.innerHTML = modalChatContainer.innerHTML;
            }
            
            const closeModalBtn = document.querySelector(".close-modal-btn");
            if (closeModalBtn) {
              closeModalBtn.click();
            }
          }
          
          // Ensure chat interface is visible
          if (chatInterface) {
            chatInterface.style.display = "block";
          }
      }
    }, 100); // 100ms debounce
  });

  // Handle modal form submission
  modalChatForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const message = modalMessageInput.value.trim();
    if (!message) return;
    
    // Add user message to chat and history
    addUserMessage(message);
    messageHistory.push({
      role: "user",
      content: message,
    });
    modalMessageInput.value = "";
    modalMessageInput.disabled = true;
    
    // Show typing animation
    const typingElement = addTypingAnimation();
    
    // Sync chat content after adding user message
    syncChatContent();
    
    // Create streaming message element
    const streamingMessageElement = addStreamingAIMessage();
    let currentContent = "";
    
    // Remove typing animation
    const typingIndicators = document.querySelectorAll(".typing-indicator");
    typingIndicators.forEach((indicator) => indicator.remove());
    
    // Get AI response with streaming
    await getChatResponseStream(
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
          contentElement.className = 'text-gray-700';
          // Ensure final message also has proper HTML formatting
          contentElement.innerHTML = convertMarkdownToHtml(fullResponse);
        }
        
        // Add to message history
        messageHistory.push({
          role: "assistant",
          content: fullResponse,
        });
        
        // Sync chat content after adding AI response
        syncChatContent();
        
        // Smooth scroll to bottom to show the latest message
        const modalChatContainer = document.getElementById("modalChatContainer");
        // if (modalChatContainer) {
        //   setTimeout(() => {
        //     modalChatContainer.scrollTo({
        //       top: modalChatContainer.scrollHeight,
        //       behavior: "smooth"
        //     });
        //   }, 100); // Small delay to ensure content is rendered
        // }
        
        modalMessageInput.disabled = false;
        enableButtons();
      },
      // onError callback
      (errorMessage) => {
        // Convert streaming message to error message
        streamingMessageElement.classList.remove('streaming-message');
        const contentElement = streamingMessageElement.querySelector('.streaming-content');
        if (contentElement) {
          contentElement.textContent = errorMessage;
          contentElement.className = 'text-red-600';
        }
        
        // Sync chat content
        syncChatContent();
        
        modalMessageInput.disabled = false;
        enableButtons();
      }
    );
  });
  // Reset chat
  resetButton.addEventListener("click", function () {
    // Clear all messages except the first one
    while (chatContainer.children.length > 1) {
      chatContainer.removeChild(chatContainer.lastChild);
    }
    // Reset message history to initial state
    messageHistory = [
      {
        role: "assistant",
        content: "Hello! I'm your AI assistant. How can I help you today?",
      },
    ];
    messageInput.disabled = false;
    messageInput.focus();
  });
  
  // Add stop button event listeners
  document.addEventListener("click", function(e) {
    if (e.target.classList.contains("stop-button") || e.target.closest(".stop-button")) {
      stopStream();
    }
  });
  
});
