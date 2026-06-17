// Animation effects using Intersection Observer
document.addEventListener('DOMContentLoaded', () => {
  // Fade in elements when they enter the viewport
  const fadeInElements = document.querySelectorAll('.feature-card, .step, .benefit-item, .tool-card');
  
  // Set initial state (invisible)
  fadeInElements.forEach(element => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  });
  
  const fadeInObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Delay the animation slightly for cascading effect
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, 100);
        
        // Unobserve after animation
        fadeInObserver.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    threshold: 0.1,
    rootMargin: '0px'
  });
  
  fadeInElements.forEach(element => {
    fadeInObserver.observe(element);
  });
  
  // Section header animations
  const sectionHeaders = document.querySelectorAll('.section-header');
  
  sectionHeaders.forEach(header => {
    header.style.opacity = '0';
    header.style.transform = 'translateY(30px)';
    header.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
  });
  
  const headerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        
        // Unobserve after animation
        headerObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1
  });
  
  sectionHeaders.forEach(header => {
    headerObserver.observe(header);
  });
  
  // Hero content animation on page load
  const heroContent = document.querySelector('.hero-content');
  const heroImage = document.querySelector('.hero-image');
  
  if (heroContent) {
    heroContent.style.opacity = '0';
    heroContent.style.transform = 'translateX(-30px)';
    heroContent.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    
    setTimeout(() => {
      heroContent.style.opacity = '1';
      heroContent.style.transform = 'translateX(0)';
    }, 300);
  }
  
  if (heroImage) {
    heroImage.style.opacity = '0';
    heroImage.style.transform = 'translateX(30px)';
    heroImage.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    
    setTimeout(() => {
      heroImage.style.opacity = '1';
      heroImage.style.transform = 'translateX(0)';
    }, 600);
  }
  
  // Button hover effects
  const buttons = document.querySelectorAll('.btn');
  
  buttons.forEach(button => {
    button.addEventListener('mouseenter', () => {
      button.style.transform = 'translateY(-3px)';
      button.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.15)';
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.transform = 'translateY(0)';
      button.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    });
  });
});