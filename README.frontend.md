# LifePulse Frontend Integration Guide

## Overview
LifePulse uses Bootstrap 5 with custom CSS variables and modular stylesheets for a futuristic, professional design. The system includes distinct themes for home, hospital, and donor sections.

## File Structure
```
public/
├── css/
│   ├── main.css      # Core variables, utilities, Bootstrap overrides
│   ├── home.css      # Home page styles
│   ├── hospital.css  # Hospital dashboard styles
│   └── donor.css     # Donor dashboard styles
└── js/
    └── hero-animation.js  # Minimal JS for animations and interactions
```

## Integration Steps

### 1. Include Bootstrap 5
Add Bootstrap CSS via CDN in your HTML `<head>`:
```html
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
```

### 2. Include Custom CSS
Load CSS files in this order in your HTML `<head>`:
```html
<link rel="stylesheet" href="/css/main.css">
<!-- Then load page-specific CSS -->
<link rel="stylesheet" href="/css/home.css"> <!-- For index.ejs -->
<link rel="stylesheet" href="/css/hospital.css"> <!-- For hospital-dashboard.ejs -->
<link rel="stylesheet" href="/css/donor.css"> <!-- For donor-dashboard.ejs -->
```

### 3. Include JavaScript
Add at the end of your HTML `<body>`:
```html
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
<script src="/js/hero-animation.js"></script>
```

### 4. Apply Themes
Add theme classes to the `<body>` element:
- Home: `<body class="home-container">`
- Hospital: `<body class="hospital-theme">`
- Donor: `<body class="donor-theme">`

### 5. HTML Structure Examples

#### Home Page (index.ejs)
```html
<body class="home-container">
  <div class="selector-area">
    <div class="selector-cards">
      <div class="selector-card donor-login">
        <h2>Donor Login</h2>
        <p>Access your dashboard</p>
      </div>
      <!-- Other cards -->
    </div>
    <div class="decorative-panel"></div>
  </div>
</body>
```

#### Hospital Dashboard
```html
<body class="hospital-theme">
  <div class="dashboard-layout">
    <aside class="sidebar">
      <!-- Filters -->
    </aside>
    <main class="main-panel">
      <table class="donor-table">
        <!-- Table content -->
      </table>
    </main>
    <aside class="right-panel">
      <!-- Stats -->
    </aside>
  </div>
</body>
```

#### Donor Dashboard
```html
<body class="donor-theme">
  <div class="hero-background">
    <div class="layer-1"></div>
    <div class="layer-2"></div>
    <div class="layer-3"></div>
  </div>
  <div class="dashboard-container">
    <!-- Dashboard content -->
  </div>
</body>
```

## Customization

### CSS Variables
Modify colors, spacing, and animations in `main.css` `:root`:
```css
:root {
  --bp-primary: #your-color;
  --space-md: 1rem;
  /* etc. */
}
```

### Responsive Breakpoints
- sm: 576px
- md: 768px
- lg: 992px
- xl: 1200px

### Accessibility
- High contrast colors (WCAG AA compliant)
- `prefers-reduced-motion` support
- Keyboard navigation with visible focus rings

### Performance
- Animations use `transform` and `opacity` only
- `will-change` used sparingly
- Canvas fallback for donor hero particles
- Pause animation button for low-power devices

### Browser Support
- Modern browsers with CSS Grid, Flexbox, and `backdrop-filter`
- Graceful fallbacks for older browsers

## Development Notes
- Use BEM-like class names (e.g., `.selector-card--active`)
- Minify CSS for production
- Test animations on low-power devices
- Validate color contrast with tools like WAVE or Lighthouse