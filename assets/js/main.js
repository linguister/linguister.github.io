// ============================================
// Linguister - Main JavaScript
// Handles section navigation, typewriter animations, and mobile scroll behavior
// ============================================

// Configuration for typewriter animation words
const TYPEWRITER_CONFIG = {
  words1: ['por', 'para'],
  words2: ['escritura', 'lógica'],
  delays: {
    start1: 0,
    start2: 500
  }
};

document.addEventListener('DOMContentLoaded', function() {

  // ============================================
  // SECTION NAVIGATION
  // Handles switching between landing view and section content
  // ============================================

  const cards = document.querySelectorAll('.section-card');
  const landingView = document.getElementById('landing-view');
  const sectionContents = document.querySelectorAll('.section-content');
  const headerTitle = document.querySelector('.site-header .landing-title');

  // Card click handler - shows section content
  cards.forEach(card => {
    card.addEventListener('click', function() {
      const sectionName = this.getAttribute('data-section');
      const sectionContent = document.getElementById(sectionName + '-content');

      if (sectionContent) {
        // Hide landing view and show selected section
        landingView.style.display = 'none';
        sectionContent.style.display = 'block';

        // Hide other sections
        sectionContents.forEach(content => {
          if (content.id !== sectionName + '-content') {
            content.style.display = 'none';
          }
        });

        // Update body class for section-specific styling
        document.body.className = sectionName + '-page';

        // Update card states (active/inactive)
        cards.forEach(c => {
          if (c.getAttribute('data-section') === sectionName) {
            c.classList.remove('inactive');
            c.classList.add('active');
          } else {
            c.classList.remove('active');
            c.classList.add('inactive');
          }
        });
      }
    });
  });

  // Header title click handler - returns to landing view
  if (headerTitle) {
    headerTitle.style.cursor = 'pointer';
    headerTitle.addEventListener('click', function(e) {
      e.preventDefault();

      // Hide all section contents
      sectionContents.forEach(content => {
        content.style.display = 'none';
      });

      // Show landing view
      landingView.style.display = 'flex';

      // Reset body class
      document.body.className = '';

      // Remove active/inactive states from cards
      cards.forEach(c => {
        c.classList.remove('active');
        c.classList.remove('inactive');
      });
    });
  }

  // ============================================
  // TYPEWRITER ANIMATION
  // Animates switching between word pairs in the subtitle
  // ============================================

  function createTypewriter(element, words, startDelay = 0) {
    let wordIndex = 0;
    let isDeleting = false;
    let currentText = '';
    let charIndex = 0;

    function typeWriter() {
      const currentWord = words[wordIndex];

      if (isDeleting) {
        // Delete characters from right to left
        currentText = currentWord.substring(0, charIndex - 1);
        charIndex--;

        if (charIndex === 0) {
          // Finished deleting, move to next word
          isDeleting = false;
          wordIndex = (wordIndex + 1) % words.length;
          setTimeout(typeWriter, 200);
          element.textContent = currentText;
          return;
        }
      } else {
        // Type characters from left to right
        currentText = currentWord.substring(0, charIndex + 1);
        charIndex++;

        if (charIndex === currentWord.length) {
          // Finished typing, pause then start deleting
          isDeleting = true;
          setTimeout(typeWriter, 2000);
          element.textContent = currentText;
          return;
        }
      }

      element.textContent = currentText;
      setTimeout(typeWriter, isDeleting ? 100 : 150);
    }

    // Start animation with optional delay
    setTimeout(typeWriter, startDelay);
  }

  // Initialize typewriter animations
  const typewriter1 = document.querySelector('.typewriter-1');
  if (typewriter1) {
    createTypewriter(typewriter1, TYPEWRITER_CONFIG.words1, TYPEWRITER_CONFIG.delays.start1);
  }

  const typewriter2 = document.querySelector('.typewriter-2');
  if (typewriter2) {
    createTypewriter(typewriter2, TYPEWRITER_CONFIG.words2, TYPEWRITER_CONFIG.delays.start2);
  }

  // ============================================
  // SMOOTH SCROLL FOR ANCHOR LINKS
  // ============================================

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });

  // ============================================
  // FADE-IN ANIMATION FOR SECTIONS
  // Uses Intersection Observer for performance
  // ============================================

  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  // Apply fade-in to all sections
  document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
  });

  // ============================================
  // MOBILE SCROLL HEADER TRANSFORMATION
  // Compacts navigation bar on scroll (mobile only)
  // ============================================

  let scrollTimeout;

  function handleScroll() {
    const scrollY = window.scrollY;
    const header = document.querySelector('.site-header');
    const sectionsGrid = document.querySelector('.sections-grid');

    // Only apply transformation on mobile devices
    if (window.innerWidth <= 768) {
      if (scrollY > 50) {
        // Add scrolled state after scrolling 50px
        header.classList.add('scrolled');
        if (sectionsGrid) {
          sectionsGrid.classList.add('scrolled');
        }
      } else {
        // Remove scrolled state when at top
        header.classList.remove('scrolled');
        if (sectionsGrid) {
          sectionsGrid.classList.remove('scrolled');
        }
      }
    } else {
      // Remove scrolled classes on desktop
      header.classList.remove('scrolled');
      if (sectionsGrid) {
        sectionsGrid.classList.remove('scrolled');
      }
    }
  }

  // Throttled scroll listener using requestAnimationFrame for performance
  window.addEventListener('scroll', function() {
    if (scrollTimeout) {
      window.cancelAnimationFrame(scrollTimeout);
    }
    scrollTimeout = window.requestAnimationFrame(handleScroll);
  }, { passive: true });

  // Handle window resize to adjust scroll behavior
  window.addEventListener('resize', handleScroll);
});
