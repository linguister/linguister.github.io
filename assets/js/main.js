// Linguister - Main JavaScript
// Handles smooth interactions and animations

document.addEventListener('DOMContentLoaded', function() {
  // Typewriter animation - reusable function
  function createTypewriter(element, words, startDelay = 0) {
    let wordIndex = 0;
    let isDeleting = false;
    let currentText = '';
    let charIndex = 0;

    function typeWriter() {
      const currentWord = words[wordIndex];

      if (isDeleting) {
        // Delete from right to left, but stop at first character (the space)
        currentText = currentWord.substring(0, charIndex - 1);
        charIndex--;

        if (charIndex === 1) { // Stop at 1 to keep the leading space
          isDeleting = false;
          wordIndex = (wordIndex + 1) % words.length;
          setTimeout(typeWriter, 200); // Pause before typing next word
          element.textContent = currentText;
          return;
        }
      } else {
        // Type from left to right
        currentText = currentWord.substring(0, charIndex + 1);
        charIndex++;

        if (charIndex === currentWord.length) {
          isDeleting = true;
          setTimeout(typeWriter, 2000); // Pause at end of word
          element.textContent = currentText;
          return;
        }
      }

      element.textContent = currentText;
      setTimeout(typeWriter, isDeleting ? 100 : 150); // Typing speed
    }

    // Start the animation with optional delay
    setTimeout(typeWriter, startDelay);
  }

  // Typewriter animation for por/para
  const typewriter1 = document.querySelector('.typewriter-1');
  if (typewriter1) {
    createTypewriter(typewriter1, [' por', ' para'], 0);
  }

  // Typewriter animation for escritura/lógica
  const typewriter2 = document.querySelector('.typewriter-2');
  if (typewriter2) {
    createTypewriter(typewriter2, [' escritura', ' lógica'], 500);
  }

  // Add smooth scroll behavior
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

  // Add hover effects to section cards with mouse-following gradient
  const cards = document.querySelectorAll('.section-card');
  cards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-10px) scale(1.02)';
    });

    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0) scale(1)';
    });

    card.addEventListener('mousemove', function(e) {
      const rect = this.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      // Update the gradient position based on mouse coordinates
      const isCuchilleras = this.classList.contains('cuchilleras');
      const accentColor = isCuchilleras ? 'var(--cuchilleras-accent)' : 'var(--flipar-accent)';

      this.style.setProperty('--mouse-x', `${x}%`);
      this.style.setProperty('--mouse-y', `${y}%`);
    });
  });

  // Add fade-in animation for content
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

  // Observe sections for fade-in animation
  document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
  });
});
