import { initLander } from "../../core/lander";
import { eventNames } from "../../constants";
let tbinit = {
    [eventNames.ic] :  { notify: 'event', name: 'CTA-Click', id: 1795853 },
    [eventNames.tyimp]:{notify: 'event', name: 'AIBrowser_Generic_Install', id: 1795853}
}
initLander("Photo",tbinit,"Photo");

tailwind.config = {
    theme: {
    extend: {
    colors: {
    primary: '#2C7A7B',
    secondary: '#285E61'
    },
    borderRadius: {
    'none': '0px',
    'sm': '4px',
    DEFAULT: '8px',
    'md': '12px',
    'lg': '16px',
    'xl': '20px',
    '2xl': '24px',
    '3xl': '32px',
    'full': '9999px',
    'button': '8px'
    }
    }
    }
    }
    document.addEventListener('DOMContentLoaded', function() {
      // Mobile menu toggle functionality
      const mobileMenuButton = document.getElementById('mobile-menu-button');
      const mobileMenu = document.getElementById('mobile-menu');
      
      if (mobileMenuButton && mobileMenu) {
          let isMenuOpen = false;
          
          // Function to update icon
          function updateIcon() {
              const icon = mobileMenuButton.querySelector('svg');
              if (icon) {
                  if (isMenuOpen) {
                      // Show X icon
                      icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />';
                  } else {
                      // Show hamburger icon
                      icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />';
                  }
              }
          }
          
          // Function to close menu
          function closeMenu() {
              mobileMenu.classList.add('hidden');
              isMenuOpen = false;
              updateIcon();
          }
          
          // Function to open menu
          function openMenu() {
              mobileMenu.classList.remove('hidden');
              isMenuOpen = true;
              updateIcon();
          }
          
          // Mobile menu button click handler with improved reliability
          mobileMenuButton.addEventListener('click', function(e) {
              e.preventDefault();
              e.stopPropagation();
              
              if (isMenuOpen) {
                  closeMenu();
              } else {
                  openMenu();
              }
          });
          
          // Close mobile menu when clicking on a link
          mobileMenu.querySelectorAll('a').forEach(link => {
              link.addEventListener('click', function(e) {
                  e.preventDefault();
                  closeMenu();
                  
                  // Handle smooth scrolling
                  const targetId = this.getAttribute('href').substring(1);
                  const targetElement = document.getElementById(targetId);
                  if (targetElement) {
                      targetElement.scrollIntoView({ behavior: 'smooth' });
                  }
              });
          });
          
          // Close mobile menu when clicking outside (with improved detection)
          document.addEventListener('click', function(e) {
              if (isMenuOpen && !mobileMenuButton.contains(e.target) && !mobileMenu.contains(e.target)) {
                  closeMenu();
              }
          });
          
          // Close on escape key
          document.addEventListener('keydown', function(e) {
              if (e.key === 'Escape' && isMenuOpen) {
                  closeMenu();
              }
          });
          
          // Handle touch events for better mobile support
          mobileMenuButton.addEventListener('touchstart', function(e) {
              e.preventDefault();
          });
          
          mobileMenuButton.addEventListener('touchend', function(e) {
              e.preventDefault();
              e.stopPropagation();
              
              if (isMenuOpen) {
                  closeMenu();
              } else {
                  openMenu();
              }
          });
      }
      
      // Smooth scrolling for all navigation links
      document.querySelectorAll('nav a').forEach(link => {
          link.addEventListener('click', function(e) {
          e.preventDefault();
          const targetId = this.getAttribute('href').substring(1);
          const targetElement = document.getElementById(targetId);
          if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
          }
          });
      });
      const uploadZone = document.getElementById('uploadZone');
      const fileInput = document.getElementById('fileInput');
      const uploadProgress = document.getElementById('uploadProgress');
      const progressBar = document.getElementById('progressBar');
      const progressPercent = document.getElementById('progressPercent');
      uploadZone.addEventListener('click', () => fileInput.click());
      uploadZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadZone.classList.add('border-secondary', 'bg-white');
      });
      uploadZone.addEventListener('dragleave', () => {
      uploadZone.classList.remove('border-secondary', 'bg-white');
      });
      uploadZone.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadZone.classList.remove('border-secondary', 'bg-white');
      const files = e.dataTransfer.files;
      if (files.length > 0) {
      handleFile(files[0]);
      }
      });
      fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
      handleFile(e.target.files[0]);
      }
      });
      function handleFile(file) {
      if (!file.type.startsWith('image/')) {
      showNotification('Please select an image file', 'error');
      return;
      }
      uploadProgress.classList.remove('hidden');
      let progress = 0;
      const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress > 100) progress = 100;
      progressBar.style.width = progress + '%';
      progressPercent.textContent = Math.round(progress) + '%';
      if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
      processImage(file);
      }, 500);
      }
      }, 100);
      }
      function processImage(file) {
      // Convert file to data URL and load into Pixie
      const reader = new FileReader();
      
      reader.onload = function(e) {
      const dataUrl = e.target.result;
      
      // Load the image into Pixie editor as main background image
      if (window.pixie) {
      try {
      window.pixie.tools.import.openBackgroundImage(dataUrl);
      
      
      // Show success notification
      showNotification('Image loaded successfully!', 'success');
      } catch (error) {
      console.error('Error loading image into Pixie:', error);
      showNotification('Error loading image. Please try again.', 'error');
      }
      } else {
      showNotification('Editor not ready. Please try again.', 'error');
      }
      };
      
      reader.onerror = function() {
      showNotification('Error reading file. Please try again.', 'error');
      };
      
      reader.readAsDataURL(file);
      
      // Reset to default state after processing
      setTimeout(() => {
      resetUploadInterface();
      document.getElementById('uploadInterface').classList.add('hidden');
      document.getElementById('editor-container').classList.remove('hidden');
      }, 500);
      }
      function resetUploadInterface() {
      uploadProgress.classList.add('hidden');
      progressBar.style.width = '0%';
      progressPercent.textContent = '0%';
      fileInput.value = '';
      uploadZone.classList.remove('border-secondary', 'bg-white');
      }
      function showNotification(message, type = 'success') {
      const notification = document.createElement('div');
      notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
      type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
      }`;
      notification.textContent = message;
      document.body.appendChild(notification);
      setTimeout(() => {
      if (document.body.contains(notification)) {
      document.body.removeChild(notification);
      }
      }, 3000);
      }
      document.querySelectorAll('.faq-question').forEach(question => {
          question.addEventListener('click', function() {
          const faqItem = this.parentElement;
          const answer = faqItem.querySelector('.faq-answer');
          const arrow = this.querySelector('.faq-arrow');
          const isOpen = !answer.classList.contains('hidden');
          document.querySelectorAll('.faq-answer').forEach(a => a.classList.add('hidden'));
          document.querySelectorAll('.faq-arrow').forEach(a => a.style.transform = 'rotate(0deg)');
          if (!isOpen) {
          answer.classList.remove('hidden');
          arrow.style.transform = 'rotate(180deg)';
          }
          });
      });
  
      /* pixie */
      const pixie = new Pixie({
          selector: "#editor-container",
          baseUrl: 'assets',
          ui: {
            menubar: {
              items: [
                {
                  type: 'button',
                  icon: [
                    {
                      tag: 'path',
                      attr: {
                        d: 'm11.99 18.54-7.37-5.73L3 14.07l9 7 9-7-1.63-1.27zM12 16l7.36-5.73L21 9l-9-7-9 7 1.63 1.27L12 16zm0-11.47L17.74 9 12 13.47 6.26 9 12 4.53z',
                      },
                    },
                  ],
                  align: 'right',
                  position: 0,
                  action: editor => {
                    editor.togglePanel('objects');
                  },
                },
                {
                  type: 'button',
                  icon: [
                    {
                      tag: 'path',
                      attr: {
                        d: 'M18 20H4V6h9V4H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-9h-2v9zm-7.79-3.17-1.96-2.36L5.5 18h11l-3.54-4.71zM20 4V1h-2v3h-3c.01.01 0 2 0 2h3v2.99c.01.01 2 0 2 0V6h3V4h-3z',
                      },
                    },
                  ],
                  align: 'left',
                  buttonVariant: 'outline',
                  menuItems: [
                    {
                      action: editor => {
                        editor.tools.import.uploadAndReplaceMainImage();
                      },
                      label: 'Background Image',
                    },
                    {
                      action: editor => {
                        editor.tools.import.uploadAndAddImage();
                      },
                      label: 'Overlay Image',
                    },
                    {
                      action: editor => {
                        editor.tools.import.uploadAndOpenStateFile();
                      },
                      label: 'Editor Project File',
                    },
                  ],
                },
              ],
            },
            activeTheme: "My Custom Theme",
            themes: [
              {
                  name: "My Custom Theme",
                  colors: {
                  "--be-primary": "#2b7273",
                  "--be-primary-dark": "#1f5354",
                  },
              },
             ],
            tools: {
              zoom: {
                allowUserZoom: false,
                fitImageToScreen: true,
              },
            },
            nav: {
              position: 'bottom',
              replaceDefault: true,
              items: [
                {
                  name: 'AI Magic',
                  icon: 'images/ai-magic.png',
                  className: 'bg-primary',
                  action: (editor) => {
                    // AI Magic functionality - apply specific enhancement values
                    try {
                      // Temporarily disable history to prevent individual filter entries
                      const originalAddHistoryItem = editor.tools.history.addHistoryItem;
                      editor.tools.history.addHistoryItem = () => {}; // Disable individual history entries
                      
                      // Apply brightness (Exposure 25% = 0.25)
                      editor.tools.filter.apply('brightness');
                      editor.tools.filter.applyValue('brightness', 'brightness', 0.25);
                      
                      // Apply gamma adjustments for contrast and saturation
                      editor.tools.filter.apply('gamma');
                      editor.tools.filter.applyValue('gamma', 'red', 1.2); // Contrast 20%
                      editor.tools.filter.applyValue('gamma', 'green', 1.15); // Saturation 15%
                      editor.tools.filter.applyValue('gamma', 'blue', 1.2); // Contrast 20%
                      
                      // Apply sharpen for clarity (Clarity 30%)
                      editor.tools.filter.apply('sharpen');
                      
                      // Restore original history function
                      editor.tools.history.addHistoryItem = originalAddHistoryItem;
                      
                      // Mark changes as dirty and add single AI Magic history entry
                      editor.state.setDirty(true);
                      // Add custom history item with AI Magic display name
                      editor.tools.history.addHistoryItem({name: 'filter'});
                      
                      // Override history display for AI Magic entries and apply styling
                      setTimeout(() => {
                          // Target all buttons in the history panel
                          const historyButtons = document.querySelectorAll('button');
                          historyButtons.forEach(button => {
                              if (button.textContent && button.textContent.includes('Applied Filters')) {
                                  button.textContent = button.textContent.replace('Applied Filters', 'AI Magic');
                              }
                          });
                          
                          // Apply bg-primary styling to AI Magic button
                          const aiMagicButton = document.querySelector('button[title*="AI Magic"]') ||
                                              document.querySelector('button[aria-label*="AI Magic"]') ||
                                              document.querySelector('button:has(svg[src*="ai-magic"])') ||
                                              document.querySelector('button:has(img[src*="ai-magic"])') ||
                                              document.querySelector('button:has(svg[href*="ai-magic"])');
                          if (aiMagicButton) {
                              aiMagicButton.classList.add('bg-primary');
                              aiMagicButton.style.backgroundColor = 'var(--primary-color, #2b7273)';
                              aiMagicButton.style.color = 'white';
                          }
                      }, 100);
                      
                      // Show success notification
                      showNotification('AI Magic applied!');
                    } catch (error) {
                      console.error('Error applying AI Magic:', error);
                      showNotification('Error applying AI Magic. Please try again.', 'error');
                    }
                  }
                },
                {
                  name: 'filter',
                  icon: 'images/filter.svg',
                  action: (editor) => {
                    editor.state.setActiveTool('filter', null);
                  }
                },
                {
                  name: 'resize',
                  icon: 'images/resize.svg',
                  action: (editor) => {
                    editor.state.setActiveTool('resize', null);
                  }
                },
                {
                  name: 'crop',
                  icon: 'images/crop.svg',
                  action: (editor) => {
                    editor.state.setActiveTool('crop', null);
                  }
                },
                {
                  name: 'draw',
                  icon: 'images/draw.svg',
                  action: (editor) => {
                    editor.state.setActiveTool('draw', null);
                  }
                },
                {
                  name: 'text',
                  icon: 'images/text.svg',
                  action: (editor) => {
                    editor.state.setActiveTool('text', null);
                  }
                },
                {
                  name: 'shape',
                  icon: 'images/shapes.svg',
                  action: (editor) => {
                    editor.state.setActiveTool('shapes', null);
                  }
                },
                {
                  name: 'sticker',
                  icon: 'images/stickers.svg',
                  action: (editor) => {
                    editor.state.setActiveTool('stickers', null);
                  }
                },
                {
                  name: 'frame',
                  icon: 'images/frames.svg',
                  action: (editor) => {
                    editor.state.setActiveTool('frame', null);
                  }
                },
                {
                  name: 'corners',
                  icon: 'images/corners.svg',
                  action: (editor) => {
                    editor.state.setActiveTool('corners', null);
                  }
                },
                {
                  name: 'merge',
                  icon: 'images/merge.svg',
                  action: (editor) => {
                    editor.tools.merge.apply();
                  }
                }
              ]
            },
          },
        });
        window.pixie = pixie;
        
        // Set up mutation observer to override history display
          const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              if (mutation.type === 'childList') {
              mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) { // Element node
                  // Look for buttons with "Applied Filters" text
                  const historyButtons = node.querySelectorAll ? node.querySelectorAll('button') : [];
                historyButtons.forEach(button => {
                    if (button.textContent && button.textContent.includes('Applied Filters')) {
                      button.textContent = button.textContent.replace('Applied Filters', 'AI Magic');
                    }
                  });
                  
                  // Also check if the node itself is a button
                  if (node.tagName === 'BUTTON' && node.textContent && node.textContent.includes('Applied Filters')) {
                    node.textContent = node.textContent.replace('Applied Filters', 'AI Magic');
                    }
                  }
                });
              }
            });
          });
          
        // Start observing the entire document for history panel changes
        observer.observe(document.body, { childList: true, subtree: true });
        
        // Also check periodically for any missed buttons and apply AI Magic styling
        setInterval(() => {
          const allButtons = document.querySelectorAll('button');
          allButtons.forEach(button => {
            if (button.textContent && button.textContent.includes('Applied Filters')) {
              button.textContent = button.textContent.replace('Applied Filters', 'AI Magic');
            }
            
            // Apply bg-primary styling to AI Magic button - multiple detection methods
            const hasAiMagicIcon = button.querySelector('svg[src*="ai-magic"]') || 
                                  button.querySelector('img[src*="ai-magic"]') ||
                                  button.querySelector('svg[href*="ai-magic"]') ||
                                  button.querySelector('svg use[href*="ai-magic"]');
            
            const hasAiMagicText = button.title && button.title.includes('AI Magic') ||
                                  button.getAttribute('aria-label') && button.getAttribute('aria-label').includes('AI Magic') ||
                                  button.textContent.includes('AI Magic');
            
            // Also check if button contains the ai-magic.svg file path
            const hasAiMagicSvg = button.innerHTML.includes('ai-magic.svg') ||
                                 button.innerHTML.includes('images/ai-magic');
            
            if (hasAiMagicIcon || hasAiMagicText || hasAiMagicSvg) {
              button.classList.add('bg-primary');
              button.style.backgroundColor = 'var(--primary-color, #2b7273)';
              button.style.color = 'white';
              button.style.borderColor = 'var(--primary-color, #2b7273)';
            }
          });
        }, 500);
        
        // Ensure document can scroll when hovering over editor
        const ensureDocumentScroll = () => {
          // Add pointer-events: none to editor canvas to allow scroll-through
          const editorCanvas = document.querySelector('#editor-container canvas, [class*="pixie"] canvas, [class*="editor"] canvas');
          if (editorCanvas) {
            editorCanvas.style.pointerEvents = 'none';
          }
          
          // Allow scrolling on editor container
          const editorContainer = document.querySelector('#editor-container');
          if (editorContainer) {
            editorContainer.style.pointerEvents = 'auto';
            editorContainer.addEventListener('wheel', (e) => {
              // Let the scroll event bubble up to document
              e.stopPropagation();
            }, { passive: true });
          }
        };
        
        // Apply scroll-through behavior after editor loads
        setTimeout(ensureDocumentScroll, 1000);
        setInterval(ensureDocumentScroll, 2000);
        
        // Disable zoom via meta viewport
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
          viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
        } else {
          const meta = document.createElement('meta');
          meta.name = 'viewport';
          meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
          document.head.appendChild(meta);
        }
        
  });