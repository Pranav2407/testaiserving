// Mobile navigation toggle
document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinksContainer = document.querySelector('.nav-links-container');
  
  if (menuToggle && navLinksContainer) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      navLinksContainer.classList.toggle('active');
      document.body.classList.toggle('menu-open');
    });
  }
  
  // Close mobile menu when clicking on a nav link
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (menuToggle.classList.contains('active')) {
        menuToggle.classList.remove('active');
        navLinksContainer.classList.remove('active');
        document.body.classList.remove('menu-open');
      }
    });
  });
  
  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        // Get the height of the header
        const header = document.querySelector('.header');
        const headerHeight = header ? header.offsetHeight : 0;
        
        // Calculate the position to scroll to
        const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - headerHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
  
  // Add active class to nav links on scroll
  const sections = document.querySelectorAll('section[id]');
  
  function highlightNavLink() {
    const scrollPosition = window.scrollY;
    const header = document.querySelector('.header');
    const headerHeight = header ? header.offsetHeight : 0;
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop - headerHeight - 100;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');
      
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        document.querySelectorAll('.nav-link').forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }
  
  window.addEventListener('scroll', highlightNavLink);
  
  // Add background color to header on scroll
  function toggleHeaderBackground() {
    const header = document.querySelector('.header');
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
  
  window.addEventListener('scroll', toggleHeaderBackground);
  toggleHeaderBackground(); // Set initial state
});