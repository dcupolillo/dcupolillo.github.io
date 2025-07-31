# AI Coding Instructions for dcupolillo.github.io

## Project Overview
This is a personal portfolio website for Dario Cupolillo, a postdoc researcher. The site features a responsive design with SCSS-based styling, dynamic publication fetching from ORCID, and an interactive portfolio structure. It's deployed as a GitHub Pages site with a static build process.

## Architecture & Structure

### SCSS Organization (BEM-inspired)
- **Main entry**: `styles.scss` imports all components in dependency order
- **Abstract layer**: `src/scss/abstract/` contains variables, mixins, and global settings
- **Base layer**: `src/scss/base/` contains reset, typography, and layout fundamentals  
- **Components**: `src/scss/components/` for reusable UI elements (navbar, icons)
- **Sections**: `src/scss/sections/` for page-specific styling (about, projects, publications, timeline)

Key pattern: Always use `@use` instead of `@import` for SCSS modules, with namespace aliases like `@use '../abstract/variables' as var;`

### JavaScript Components
- **Vanilla JS only**: No frameworks, uses ES6+ features
- **Publication system**: Dynamic ORCID integration via `getOrcidPubs.js` + `Publication.js` + `ParseBibtex.js`
- **Navigation**: Mobile-responsive navbar with toggle functionality in `script.js`

### Color System & Design Tokens
Key variables in `_variables.scss`:
```scss
$primary-color: #2c4988;
$background-color: #161618;  
$text-color: #eae9f1;
$violet-blue: #5452A6ff;
$steel-pink: #B704BBff;
```

## Development Patterns

### SCSS Conventions
1. **Mixin usage**: Use `mx.flex-center()` for consistent flexbox centering
2. **Icon system**: Icons use SimpleIcons CDN via `@mixin icon($name, $size, $color)`
3. **Animations**: Centralized in `_animations.scss` with reusable keyframes like `pulsate`, `fadeInFromBottom`
4. **Glass effect**: Use `mx.glass-effect()` mixin for consistent backdrop blur styling

### Component Structure
Each section follows this pattern:
```scss
.section-name {
  @include mx.flex-center(column);
  height: 100vh;
  
  h1 {
    // Consistent title styling with gradient underline animation
    &:after {
      background: linear-gradient(to right, transparent, var.$primary-color, transparent);
      animation: pulsate 2s infinite;
    }
  }
}
```

### Publication System Integration
When working with publications:
- Publications are fetched dynamically from ORCID API
- `Publication.js` contains classes for different publication types (Article, InProceedings, etc.)
- BibTeX parsing handled by `ParseBibtex.js`
- Publications render with consistent styling in `.publication-section article`

## Build & Deployment

### SCSS Compilation
- No build tools - relies on VS Code SCSS compilation or similar
- Output: `styles.css` (should be gitignored in production)
- Source maps: `styles.css.map` for debugging

### GitHub Pages Deployment
- Direct static file serving
- Main branch serves from root directory
- Critical files: `index.html`, `styles.css`, `js/`, `src/assets/`

## Critical Integration Points

### ORCID API Integration
- Base URL: `https://pub.orcid.org/v2.0/`
- Requires CORS-friendly requests
- Publications auto-sorted by year (newest first)
- Error handling for network failures essential

### Responsive Breakpoints
- Mobile-first approach
- Key breakpoint: `768px` (tablet/desktop transition)
- Navbar transforms from mobile hamburger to horizontal layout
- Grid system uses `.bd-grid` class with responsive margins

### Animation System
- Consistent timing: `0.3s ease-in-out` for interactions
- Background animations: `pulsate 2s infinite` for accent elements
- Page load animations: `fadeInFromBottom` with delays for staggered effects

## File Naming & Organization
- Assets in `src/assets/` (images, PDFs, etc.)
- JavaScript modules use PascalCase for classes (`Publication.js`)
- SCSS partials use underscore prefix (`_variables.scss`)
- Sections named semantically (`_about.scss`, `_publications.scss`)

## Common Tasks
- **Adding new sections**: Create SCSS partial in `sections/`, add to main `styles.scss` import
- **Color changes**: Modify variables in `_variables.scss`, affects entire site
- **Icon additions**: Add new icon class using the `@mixin icon()` pattern
- **Animation tweaks**: Modify keyframes in `_animations.scss` or animation calls in component files
