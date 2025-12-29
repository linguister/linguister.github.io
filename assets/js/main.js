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

  // Set initial state to landing page
  document.body.classList.add('landing-page');

  // Card click handler - shows section content
  cards.forEach(card => {
    card.addEventListener('click', function() {
      const sectionName = this.getAttribute('data-section');
      const sectionContent = document.getElementById(sectionName + '-content');

      if (sectionContent) {
        // Scroll to top of page
        window.scrollTo(0, 0);

        // Hide landing view and show selected section
        landingView.style.display = 'none';
        sectionContent.style.display = 'block';

        // Reset animation by removing and re-adding active class
        sectionContent.classList.remove('active');
        // Force reflow to restart animation
        void sectionContent.offsetWidth;
        sectionContent.classList.add('active');

        // Hide other sections
        sectionContents.forEach(content => {
          if (content.id !== sectionName + '-content') {
            content.style.display = 'none';
            content.classList.remove('active');
          }
        });

        // Update body class for section-specific styling
        // Remove landing-page class and add section-specific class
        document.body.classList.remove('landing-page');
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

        // Trigger slider position update for Cuchilleras section
        if (sectionName === 'cuchilleras') {
          setTimeout(() => {
            const event = new Event('cuchilleras-visible');
            window.dispatchEvent(event);
          }, 50);
        }
      }
    });
  });

  // Header title click handler - returns to landing view
  if (headerTitle) {
    headerTitle.style.cursor = 'pointer';
    headerTitle.addEventListener('click', function(e) {
      e.preventDefault();

      // Scroll to top of page
      window.scrollTo(0, 0);

      // Hide all section contents
      sectionContents.forEach(content => {
        content.style.display = 'none';
      });

      // Show landing view
      landingView.style.display = 'flex';

      // Reset body class to landing page
      document.body.className = 'landing-page';

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
    const cuchillerasTitle = document.querySelector('.section-card.cuchilleras .section-title');
    const fliparTitle = document.querySelector('.section-card.flipar .section-title');

    // Only apply transformation on mobile devices
    if (window.innerWidth <= 768) {
      if (scrollY > 50) {
        // Add scrolled state after scrolling 50px
        header.classList.add('scrolled');
        if (sectionsGrid) {
          sectionsGrid.classList.add('scrolled');
        }

        // Change card text to abbreviated versions
        if (cuchillerasTitle) {
          cuchillerasTitle.innerHTML = 'C';
        }
        if (fliparTitle) {
          fliparTitle.textContent = 'F';
        }
      } else {
        // Remove scrolled state when at top
        header.classList.remove('scrolled');
        if (sectionsGrid) {
          sectionsGrid.classList.remove('scrolled');
        }

        // Restore full card text
        if (cuchillerasTitle) {
          cuchillerasTitle.innerHTML = 'Cuchilleras';
        }
        if (fliparTitle) {
          fliparTitle.textContent = 'FLIPAR';
        }
      }
    } else {
      // Remove scrolled classes on desktop
      header.classList.remove('scrolled');
      if (sectionsGrid) {
        sectionsGrid.classList.remove('scrolled');
      }

      // Restore full text on desktop
      if (cuchillerasTitle) {
        cuchillerasTitle.innerHTML = 'Cuchilleras';
      }
      if (fliparTitle) {
        fliparTitle.textContent = 'FLIPAR';
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

  // ============================================
  // TABLE SCROLL INDICATORS
  // Shows gradient indicators for scrollable tables
  // ============================================

  function updateScrollIndicators(wrapper, container) {
    const scrollLeft = container.scrollLeft;
    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;
    const scrollRight = scrollWidth - clientWidth - scrollLeft;

    // Show left gradient if scrolled away from left edge (threshold: 5px)
    if (scrollLeft > 5) {
      wrapper.classList.add('scroll-left');
    } else {
      wrapper.classList.remove('scroll-left');
    }

    // Show right gradient if more content exists to the right (threshold: 5px)
    if (scrollRight > 5) {
      wrapper.classList.add('scroll-right');
    } else {
      wrapper.classList.remove('scroll-right');
    }
  }

  // Initialize scroll indicators for all table wrappers
  const tableWrappers = document.querySelectorAll('.table-wrapper');
  tableWrappers.forEach(wrapper => {
    const container = wrapper.querySelector('.table-container');
    if (!container) return;

    // Initial check
    updateScrollIndicators(wrapper, container);

    // Update on scroll
    container.addEventListener('scroll', function() {
      updateScrollIndicators(wrapper, container);
    }, { passive: true });

    // Update on window resize (table might become scrollable or not)
    window.addEventListener('resize', function() {
      updateScrollIndicators(wrapper, container);
    });
  });

  // Re-check scroll indicators when Cuchilleras section becomes visible
  window.addEventListener('cuchilleras-visible', function() {
    setTimeout(() => {
      tableWrappers.forEach(wrapper => {
        const container = wrapper.querySelector('.table-container');
        if (container) {
          updateScrollIndicators(wrapper, container);
        }
      });
    }, 50);
  });
});
