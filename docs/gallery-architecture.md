# Gallery Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                               │
│                         (Browser)                                    │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ User visits home page
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     GALLERY GRID (index.liquid)                      │
│                                                                       │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  │
│  │ Album 1 │  │ Album 2 │  │ Album 3 │  │ Album 4 │  │ Album 5 │  │
│  │  [img]  │  │  [img]  │  │  [img]  │  │  [img]  │  │  [img]  │  │
│  │ Match   │  │Training │  │ Event   │  │ Team    │  │ Match   │  │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘  │
│                                                                       │
│  Each shows: mainImage (cover photo from Azure Storage)             │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                  User clicks on Album 1  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    LIGHTBOX MODAL OPENS                              │
│                                                                       │
│  1. Show loading indicator                                          │
│  2. Display mainImage immediately                                   │
│  3. Fetch ALL images from storageUrl                                │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ JavaScript makes API call
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   AZURE BLOB STORAGE                                 │
│                                                                       │
│  GET https://storage.blob.core.windows.net/gallery/album-1?         │
│      restype=container&comp=list                                     │
│                                                                       │
│  Returns XML with list of all blobs:                                │
│  <?xml version="1.0" encoding="utf-8"?>                             │
│  <EnumerationResults>                                                │
│    <Blobs>                                                           │
│      <Blob><Name>main.jpg</Name></Blob>                             │
│      <Blob><Name>photo-001.jpg</Name></Blob>                        │
│      <Blob><Name>photo-002.jpg</Name></Blob>                        │
│      <Blob><Name>photo-003.jpg</Name></Blob>                        │
│    </Blobs>                                                          │
│  </EnumerationResults>                                               │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ Parse XML response
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  JAVASCRIPT PROCESSING                               │
│                  (gallery.js)                                        │
│                                                                       │
│  1. Parse XML to extract blob names                                 │
│  2. Build full URLs for each image                                  │
│  3. Filter only image files (.jpg, .png, .webp)                     │
│  4. Store in currentAlbumImages[]                                   │
│                                                                       │
│  Result:                                                             │
│  currentAlbumImages = [                                              │
│    "https://...blob.../gallery/album-1/main.jpg",                   │
│    "https://...blob.../gallery/album-1/photo-001.jpg",              │
│    "https://...blob.../gallery/album-1/photo-002.jpg",              │
│    "https://...blob.../gallery/album-1/photo-003.jpg"               │
│  ]                                                                   │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ Update UI
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    CAROUSEL DISPLAY                                  │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  ◀ [Prev]                                                        │
│  │                                                                   │
│  │              [Current Image Display]                             │
│  │                                                                   │
│  │                                          [Next] ▶     [X] Close  │
│  │                                                                   │
│  │              Photo 1 / 4                                         │
│  ├───────────────────────────────────────────────────────────────┤  │
│  │  Title: Match U12 contre Villefranche                           │
│  │  Description: Belle victoire de nos U12                         │
│  │  Date: 15/10/2025                                               │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  User can:                                                           │
│  - Navigate: ← → (keyboard) or click arrows                        │
│  - Close: ESC or click X                                            │
│  - Swipe: (mobile touch)                                            │
└─────────────────────────────────────────────────────────────────────┘


DATA FLOW SUMMARY
═════════════════

1. INITIAL LOAD (Gallery Grid)
   ┌──────────────┐
   │ gallery.json │──→ Eleventy builds HTML with mainImage URLs
   └──────────────┘

2. USER CLICKS ALBUM
   ┌──────────────┐
   │ User clicks  │──→ Open lightbox
   │   Album 1    │    Show mainImage
   └──────────────┘    Trigger fetch

3. FETCH IMAGES
   ┌──────────────┐      ┌─────────────────┐
   │ gallery.js   │──→   │ Azure Storage   │
   │ fetch()      │ GET  │ List Blobs API  │
   └──────────────┘  ←── └─────────────────┘
                    XML      (with CORS)

4. DISPLAY CAROUSEL
   ┌──────────────┐
   │ Parse XML    │──→ Extract URLs
   │              │    Filter images
   │              │    Update carousel
   └──────────────┘


AZURE STORAGE STRUCTURE
════════════════════════

Storage Account: ovalsaonestorage
├── Container: gallery (public blob access)
    ├── Folder: match-u12-octobre/
    │   ├── main.jpg          ← mainImage (cover)
    │   ├── photo-001.jpg     ← Album photos
    │   ├── photo-002.jpg
    │   └── photo-003.jpg
    ├── Folder: entrainement-u8/
    │   ├── main.jpg
    │   └── ...
    └── Folder: barbecue-rentree/
        ├── main.jpg
        └── ...


SECURITY CONFIGURATION
═══════════════════════

Azure Storage Account Settings:
├── Container Access Level: Blob
│   ✅ Public read for individual blobs
│   ❌ No public listing of container
│
├── CORS Configuration:
│   ├── Allowed Origins:
│   │   - https://ovalsaone.com
│   │   - http://localhost:8003
│   ├── Allowed Methods: GET, OPTIONS
│   ├── Allowed Headers: *
│   └── Max Age: 3600s
│
└── Optional: SAS Tokens for additional security


PERFORMANCE OPTIMIZATIONS
══════════════════════════

1. Grid Load:
   - Lazy loading (loading="lazy")
   - Only mainImage loaded initially
   - Responsive images

2. Lightbox:
   - Show mainImage immediately
   - Fetch album in background
   - Progressive display

3. Caching:
   - Browser caches blob URLs
   - Azure CDN can be added
   - Optimized image sizes (<500KB)


ERROR HANDLING
══════════════

┌──────────────────┐
│ Fetch fails?     │
└──────────────────┘
         │
         ├──→ CORS Error
         │    └─→ Show mainImage only
         │        Log error to console
         │
         ├──→ 403 Forbidden
         │    └─→ Check blob access
         │        Verify container settings
         │
         └──→ Network Error
              └─→ Retry logic
                  Fallback to mainImage
```

This architecture provides:
- ✅ Scalable storage (unlimited photos)
- ✅ Fast loading (direct Azure access)
- ✅ Dynamic updates (no site rebuild)
- ✅ Secure access (public read, CORS controlled)
- ✅ Great UX (immediate feedback, smooth navigation)
