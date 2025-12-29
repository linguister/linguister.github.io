# CLAUDE.md - Linguister Project Reference

## Project Overview

**Linguister** is a single-page web application showcasing two linguistic innovation projects:

1. **Cuchilleras**: A custom font designed for the Spanish language, introducing new graphemes to replace digraphs (ch, ll, rr) and adding crossed z and 7 following Spanish typographic tradition
2. **FLIPAR**: A logical representation system for the International Phonetic Alphabet (IPA)

**Philosophy**: "A space to organize ideas and open yourself to others. Don't let the status quo limit you. Writing should adapt to the needs of its users."

---

## Core Design Principles

### Visual Identity

**Minimalist Aesthetic**:
- Clean, modern design with subtle animations
- Smooth transitions, no jarring effects
- Everything flows - fade-in + slide-up pattern for entrances
- Subtle hover effects with theme colors

**Theme-Based Design**:
- Cuchilleras: Blue tones
- FLIPAR: Orange tones
- Each section has distinct color schemes that permeate all elements
- Use CSS custom properties for all colors

**Typography**:
- Custom "Cuchilleras" variable font family (serif and sans variants)
- Variable weights: 100-900
- Both regular and italic styles available

---

## Architecture

### Single-Page Application Pattern

The site uses a view-switching pattern:
- **Landing View**: Initial hero with quote and section cards
- **Section Views**: Hidden by default, shown when card clicked
- Navigation via `data-section` attributes
- Body classes control page state: `.landing-page`, `.cuchilleras-page`, `.flipar-page`

### State Management

JavaScript pattern for section switching:
```javascript
// Hide/show with display property
// Add .active class to trigger CSS animations
// Update body class for section-specific styling
```

**Fixed Header Navigation**:
- Desktop: Horizontal layout - title/subtitle on left, navigation cards on right
- Mobile: Two-row layout that compacts on scroll

---

## File Structure

```
linguister.github.io/
├── index.html                  # Single HTML file (all content)
├── assets/
│   ├── css/
│   │   ├── main.css           # Primary stylesheet
│   │   └── bg-circles.css     # Background animations
│   ├── js/
│   │   ├── main.js            # Core functionality
│   │   └── bg-circles.js      # Background circles
│   ├── fonts/
│   │   └── Cuchilleras*.ttf   # Variable font files
│   └── img/
├── README.md
└── CLAUDE.md                   # This file
```

---

## CSS Organization

### Structure Philosophy

1. **Font declarations** at top
2. **CSS custom properties** (`:root`) for colors and theme variables
3. **Global styles** (resets, base elements)
4. **Header navigation** (fixed header)
5. **Landing page** components
6. **Section cards** styling
7. **Section-specific styles** (Cuchilleras, FLIPAR)
8. **Animations** (keyframes)
9. **Mobile responsive** (`@media` queries at end)

### Key CSS Patterns

**Color System**:
- All colors defined in `:root` as CSS custom properties
- Use `var(--cuchilleras-primary)`, `var(--flipar-primary)`, etc.
- `color-mix()` for transparency variations
- Gradients for backgrounds and text effects

**Responsive Design**:
- Desktop-first approach
- Mobile breakpoint: `@media (max-width: 768px)`
- All mobile overrides at end of CSS file

**Transitions**:
- Standard duration: `0.3s ease`
- Page entrances: `1.2s ease-out`
- Smooth, never instant

---

## JavaScript Functionality

### Core Features

1. **Section Navigation**: Card click handlers, view switching, animation triggering
2. **Typewriter Animation**: Alternating word pairs on landing page
3. **Smooth Scroll**: For anchor links
4. **Fade-in Observer**: Intersection Observer for scroll-triggered animations
5. **Mobile Header Compression**: Compacts header on scroll (mobile only)
6. **Interactive Elements**: Font tester sliders, scroll indicators, etc.

### Performance Patterns

- Use `{ passive: true }` on all scroll/resize listeners
- Throttle with `requestAnimationFrame`
- Intersection Observer for lazy-loading animations
- No heavy dependencies - vanilla JavaScript only

---

## Design Patterns & Conventions

### Naming Conventions

- **BEM-inspired**: `.section-card`, `.section-card-content`
- **Descriptive**: `.cuchilleras-hero`, `.download-btn`
- **State classes**: `.active`, `.inactive`, `.scrolled`
- All code in English, all content in Spanish

### Spacing System

Use multiples of 8px for consistency:
- Small: 8px, 16px
- Medium: 24px, 32px
- Large: 48px, 64px

### Animation Principles

- **Entrance**: Fade + slide up (`fadeInUp`)
- **Hover**: Subtle shadow/transform
- **Scroll**: Fade in when in viewport
- **No jarring transitions**: Everything eases

---

## Language & Localization

**CRITICAL - Language Usage**:

### Code (English)
- HTML class names, IDs, attributes
- CSS selectors and comments
- JavaScript variables and comments
- Git commit messages
- Technical documentation
- Communication with Claude AI

### Content (Spain's Spanish)
- All user-facing text
- Headings, paragraphs, quotes
- Button labels and UI text
- Table contents and labels
- Linguistic terminology (e.g., "dígrafo", "grafema")

**Rationale**: English for universal developer accessibility; Spanish because the projects focus on Spanish language typography and phonetics.

---

## Style Guidelines

### DO:

✅ Use CSS custom properties for colors
✅ Follow 8px spacing increments
✅ Add smooth transitions to interactive elements
✅ Include both desktop and mobile responsive styles
✅ Use semantic HTML5 elements
✅ Comment major sections with header blocks
✅ Test on both desktop and mobile
✅ Maintain color theme consistency
✅ Use `fadeInUp` pattern for page/section entrances
✅ **Use `px` units exclusively for exact values**
✅ Use `%`, `vw`, `vh`, `auto` for responsive/relative sizing only

### DON'T:

❌ Add jarring or instant transitions
❌ Use hardcoded colors instead of CSS variables
❌ **Use `em` or `rem` units** - always use `px` for exact measurements
❌ Add heavy JavaScript libraries/frameworks
❌ Create new animation patterns without matching existing style
❌ Use `!important` unless absolutely necessary
❌ Forget mobile responsive styles
❌ Add emojis or decorative elements unless explicitly requested
❌ Use inline styles except for initial `display:none` states

---

## Key Technical Patterns

### Full-Width Elements (Breaking Out of Container)

To make an element span full viewport width while inside a max-width container:

```css
.full-width-element {
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  margin-right: calc(-50vw + 50%);
}

/* Reset on mobile */
@media (max-width: 768px) {
  .full-width-element {
    width: 100%;
    margin-left: 0;
    margin-right: 0;
  }
}
```

### Animation Restart Pattern

To ensure animations restart when switching views:

```javascript
element.classList.remove('active');
void element.offsetWidth; // Force reflow
element.classList.add('active'); // Triggers animation
```

### Scroll Indicators Pattern

For tables or scrollable content:
- Wrapper with `position: relative` (contains gradient overlays)
- Gradient pseudo-elements (`::before`, `::after`) with `position: absolute`
- Inner container with `overflow-x: auto`
- JavaScript toggles `.scroll-left` and `.scroll-right` classes based on scroll position

---

## Accessibility & Performance

**Accessibility**:
- Semantic HTML5 elements
- ARIA labels where appropriate
- Keyboard navigation support
- Maintained color contrast ratios
- Focus states on interactive elements

**Performance**:
- Passive event listeners on scroll/resize
- requestAnimationFrame for scroll handlers
- Intersection Observer for viewport-triggered animations
- CSS transitions over JavaScript animations
- Variable fonts (single file, multiple weights)
- No framework dependencies

---

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS Grid for layouts
- CSS `color-mix()` for transparency (modern browsers only)
- Variable fonts
- Intersection Observer
- CSS Custom Properties

Fallbacks or polyfills needed for older browsers if required.

---

## Common Modification Patterns

### Adding a New Section

1. Add section card HTML with `data-section` attribute
2. Add section content with matching ID (`newsection-content`)
3. Define theme colors in `:root` CSS
4. Add section-specific styling
5. Navigation automatically handles new sections

### Adjusting Spacing

- Desktop: Modify base CSS rules
- Mobile: Override in `@media (max-width: 768px)` section
- Use 8px increments for consistency

### Changing Colors

- Update CSS custom properties in `:root`
- All theme colors cascade automatically
- Use `color-mix()` for transparency variations

---

## Testing Checklist

When making changes, verify:

- [ ] Desktop layout (1200px+ width)
- [ ] Tablet layout (768px-1199px)
- [ ] Mobile layout (< 768px)
- [ ] Navigation between all sections
- [ ] Return to landing page
- [ ] Mobile scroll header compression
- [ ] Smooth animations and transitions
- [ ] No console errors
- [ ] Custom font loads properly
- [ ] Hover states on interactive elements

---

## Project Resources

- **Font Base**: Google Noto (open source)
- **Repository**: linguister.github.io
- **Content Language**: Spain's Spanish (Español de España)
- **Development Language**: English
- **Target Audience**: Spanish-speaking linguists, typography enthusiasts, orthographic innovation enthusiasts

---

*Last Updated: 2025-12-28*

**Note**: This document focuses on timeless principles and architecture. For specific implementation details (exact line numbers, specific CSS values, etc.), consult the actual source files as those details change frequently during development.
