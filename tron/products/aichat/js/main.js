document.addEventListener('DOMContentLoaded', function() {
  // Header scroll effect
  const header = document.getElementById('header');
  const scrollThreshold = 50;

  window.addEventListener('scroll', function() {
    if (window.scrollY > scrollThreshold) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Mobile navigation
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  hamburger.addEventListener('click', function() {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
  });

  // Close mobile menu when clicking on a link
  const navLinkElements = document.querySelectorAll('.nav-link');
  navLinkElements.forEach(link => {
    link.addEventListener('click', function() {
      hamburger.classList.remove('active');
      navLinks.classList.remove('active');
    });
  });

  // Scroll reveal animation
  const revealElements = document.querySelectorAll('.features-grid, .steps, .use-cases-grid, .benefits-content');
  
  function revealOnScroll() {
    const windowHeight = window.innerHeight;
    
    revealElements.forEach(element => {
      const elementTop = element.getBoundingClientRect().top;
      
      if (elementTop < windowHeight - 100) {
        element.classList.add('stagger-children', 'active');
      }
    });
  }
  
  // Initial check
  revealOnScroll();
  
  // Add event listener
  window.addEventListener('scroll', revealOnScroll);

  // Chat typing animation simulation
  setTimeout(() => {
    const typingMessage = document.querySelector('.message.bot.typing');
    const chatMessages = document.querySelector('.chat-messages');
    
    if (typingMessage && chatMessages) {
      typingMessage.innerHTML = '<div class="message-content">I can summarize the content for you. What article would you like me to analyze?</div>';
      typingMessage.classList.remove('typing');
      
      // Scroll to the bottom of chat
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }, 2000);

  // Send message functionality for demo
  const sendButton = document.querySelector('.send-btn');
  const messageInput = document.querySelector('.chat-input input');
  const chatMessages = document.querySelector('.chat-messages');
  
  if (sendButton && messageInput && chatMessages) {
    sendButton.addEventListener('click', function() {
      const message = messageInput.value.trim();
      
      if (message !== '') {
        // Add user message
        const userMessage = document.createElement('div');
        userMessage.classList.add('message', 'user');
        userMessage.innerHTML = `<div class="message-content">${message}</div>`;
        chatMessages.appendChild(userMessage);
        
        // Clear input
        messageInput.value = '';
        
        // Add typing indicator
        const typingMessage = document.createElement('div');
        typingMessage.classList.add('message', 'bot', 'typing');
        typingMessage.innerHTML = `<div class="message-content">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>`;
        chatMessages.appendChild(typingMessage);
        
        // Scroll to the bottom of chat
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Simulate response after delay
        setTimeout(() => {
          typingMessage.classList.remove('typing');
          typingMessage.innerHTML = '<div class="message-content">I understand. How else can I help you today?</div>';
          
          // Scroll to the bottom of chat again
          chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 1500);
      }
    });
    
    // Allow pressing Enter to send a message
    messageInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        sendButton.click();
      }
    });
  }

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        const headerHeight = header.offsetHeight;
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
});

// FAQ Accordion
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
  item.addEventListener('click', () => {
    item.classList.toggle('active');
  });
});