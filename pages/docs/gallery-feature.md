# Photo Gallery Feature Documentation

## Overview

A responsive photo gallery has been added to the home page (`src/index.liquid`) to showcase the latest pictures of the association.

## Features

### 1. **Responsive Grid Layout**
- Modern masonry-style grid that adapts to all screen sizes
- Desktop: 3 columns
- Tablet: 2 columns  
- Mobile: 1 column

### 2. **Category Filtering**
Filter photos by category with one click:
- **Toutes** (All): Shows all photos
- **Matchs**: Match and tournament photos
- **Entraînements**: Training session photos
- **Événements**: Events (BBQ, parties, celebrations)
- **Équipes**: Team photos

### 3. **Interactive Lightbox**
- Click any photo to view it full-screen
- Navigate between photos with arrow buttons or keyboard (← →)
- Close with X button or ESC key
- Displays photo title, description, and date

### 4. **Smooth Animations**
- Hover effects on photos
- Fade-in animations when filtering
- Smooth transitions between lightbox photos

### 5. **Performance Optimized**
- Lazy loading for images
- Only first 6 photos loaded initially
- "Voir plus" button to load additional photos

## File Structure

### Data
- **`src/_data/gallery.json`** - Gallery data (photos list)

### Templates
- **`src/index.liquid`** - Home page with gallery section

### Styles
- **`src/css/pages/index.css`** - Gallery CSS (at the end of file)

### JavaScript
- **`src/js/gallery.js`** - Gallery functionality
- **`src/js-bundle.njk`** - Includes gallery.js

### Assets
- **`src/assets/gallery/`** - Photo storage folder
- **`src/assets/gallery/README.md`** - Instructions for adding photos

## How to Add New Photos

### Step 1: Add Image File
Place your image in `src/assets/gallery/`:
```bash
cp my-photo.jpg src/assets/gallery/
```

Recommended:
- Format: JPG or WebP
- Size: 1200x800px (landscape) or 800x1200px (portrait)
- File size: < 500KB (use image compression)

### Step 2: Update gallery.json
Add an entry to `src/_data/gallery.json`:
```json
{
  "titre": "Match U12 contre Villefranche",
  "description": "Belle victoire de nos U12",
  "date": "2025-10-15",
  "image": "assets/gallery/match-u12-1.jpg",
  "categorie": "matches",
  "alt": "Match U12 contre Villefranche"
}
```

### Step 3: Rebuild Site
```bash
npm run build
# or for development
npm run start
```

## Categories Reference

Use one of these values for the `categorie` field:

| Category | Description |
|----------|-------------|
| `matches` | Match photos, tournaments |
| `entrainements` | Training sessions |
| `evenements` | Events (BBQ, parties, celebrations) |
| `equipes` | Team photos, group shots |

## Customization

### Change Number of Initial Photos
In `src/index.liquid`, modify the `limit` parameter:
```liquid
{% for photo in gallery limit:6 %}  <!-- Change 6 to your desired number -->
```

### Add More Categories
1. Add a new filter button in `src/index.liquid`:
```html
<button class="gallery-filter-btn" data-filter="your-category">
    <i class="fas fa-icon"></i> Your Category
</button>
```

2. Use the category in `gallery.json`:
```json
{
  "categorie": "your-category",
  ...
}
```

### Customize Colors
Gallery uses CSS variables from `src/css/styles.css`:
- `--primary-color` - Main color for buttons and accents
- `--secondary-color` - Secondary color
- `--background-light` - Gallery background

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Accessibility

- ✅ Keyboard navigation (Tab, Enter, Esc, Arrow keys)
- ✅ Alt text for all images
- ✅ ARIA labels for interactive elements
- ✅ Focus indicators on buttons

## Performance

- Images are lazy-loaded (`loading="lazy"`)
- CSS animations use GPU-accelerated properties
- JavaScript uses event delegation for efficiency
- Grid layout uses CSS Grid (modern, performant)

## Troubleshooting

### Photos Not Displaying
1. Check image paths in `gallery.json` are correct
2. Ensure images exist in `src/assets/gallery/`
3. Rebuild the site: `npm run build`

### Filters Not Working
1. Check browser console for JavaScript errors
2. Ensure `src/js/gallery.js` is included in `js-bundle.njk`
3. Clear browser cache

### Lightbox Not Opening
1. Verify modal HTML exists in `src/index.liquid`
2. Check that gallery.js is loaded
3. Look for JavaScript errors in browser console

## Future Enhancements

Possible improvements:
- [ ] Pagination for large galleries
- [ ] Swipe gestures on mobile
- [ ] Share buttons in lightbox
- [ ] Image captions overlay
- [ ] Multiple image upload at once
- [ ] Admin interface for managing gallery
