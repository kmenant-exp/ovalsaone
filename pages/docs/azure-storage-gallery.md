# Azure Storage Integration for Gallery

## Overview

The gallery now integrates with **Azure Storage Account** to store and dynamically load photos. This approach allows you to:
- Store unlimited photos in Azure Blob Storage
- Automatically display all photos from a container/folder
- Update photos without rebuilding the website
- Scale storage independently from the website

## Architecture

### Data Structure

Each gallery item in `src/_data/gallery.json` contains:
- **`mainImage`**: URL to the main/cover photo (displayed in grid)
- **`storageUrl`**: Base URL to the Azure Storage container/folder
- **`titre`**, **`description`**, **`date`**: Metadata
- **`categorie`**: Category for filtering
- **`alt`**: Alt text for accessibility

### How It Works

1. **Grid Display**: Shows main/cover image for each album
2. **Click to Open**: Opens lightbox with main image
3. **Dynamic Loading**: JavaScript fetches ALL images from the Azure Storage container
4. **Carousel**: Navigate through all images in that container

## Azure Storage Setup

### Step 1: Create Storage Account

```bash
# Create resource group (if needed)
az group create --name rg-ovalsaone --location westeurope

# Create storage account
az storage account create \
  --name ovalsaonestorage \
  --resource-group rg-ovalsaone \
  --location westeurope \
  --sku Standard_LRS \
  --kind StorageV2
```

### Step 2: Create Container

```bash
# Create container with public blob access
az storage container create \
  --name gallery \
  --account-name ovalsaonestorage \
  --public-access blob
```

### Step 3: Enable Blob Listing (CORS)

For the JavaScript to list blobs, enable CORS on the Storage Account:

```bash
az storage cors add \
  --account-name ovalsaonestorage \
  --services b \
  --methods GET OPTIONS \
  --origins https://ovalsaone.com http://localhost:8003 \
  --allowed-headers "*" \
  --exposed-headers "*" \
  --max-age 3600
```

Or via Azure Portal:
1. Go to Storage Account → Settings → **Resource sharing (CORS)**
2. Add rule for **Blob service**:
   - **Allowed origins**: `https://ovalsaone.com`, `http://localhost:8003`
   - **Allowed methods**: GET, OPTIONS
   - **Allowed headers**: *
   - **Exposed headers**: *
   - **Max age**: 3600

### Step 4: Upload Photos

```bash
# Upload photos to a specific folder
az storage blob upload-batch \
  --account-name ovalsaonestorage \
  --destination gallery/match-u12-octobre \
  --source ./local-photos-folder \
  --pattern "*.jpg"
```

## Folder Structure in Azure Storage

Organize photos by album/event:

```
gallery/                           (container)
├── match-u12-octobre/
│   ├── main.jpg                  (cover photo)
│   ├── photo-001.jpg
│   ├── photo-002.jpg
│   └── photo-003.jpg
├── entrainement-u8/
│   ├── main.jpg
│   ├── photo-001.jpg
│   └── photo-002.jpg
└── barbecue-rentree/
    ├── main.jpg
    ├── photo-001.jpg
    └── photo-002.jpg
```

## Adding a New Album

### 1. Upload Photos to Azure Storage

```bash
# Create folder and upload photos
az storage blob upload-batch \
  --account-name ovalsaonestorage \
  --destination gallery/nouveau-match \
  --source ./mes-photos
```

### 2. Update gallery.json

Add entry to `src/_data/gallery.json`:

```json
{
  "titre": "Match U14 contre Bourg-en-Bresse",
  "description": "Victoire mémorable",
  "date": "2025-11-05",
  "mainImage": "https://ovalsaonestorage.blob.core.windows.net/gallery/nouveau-match/main.jpg",
  "storageUrl": "https://ovalsaonestorage.blob.core.windows.net/gallery/nouveau-match",
  "categorie": "matches",
  "alt": "Match U14 contre Bourg-en-Bresse"
}
```

**Important**: 
- `mainImage` must point to the cover photo
- `storageUrl` should be the folder URL (without trailing slash)
- Name the cover photo `main.jpg` for consistency

### 3. Rebuild Site

```bash
npm run build
```

## URL Format

Azure Storage URLs follow this pattern:

```
https://<storage-account>.blob.core.windows.net/<container>/<folder>/<blob-name>
```

Example:
```
https://ovalsaonestorage.blob.core.windows.net/gallery/match-u12-octobre/main.jpg
```

## JavaScript API

The gallery uses Azure Storage REST API to list blobs:

```javascript
// List blobs in a container
const listUrl = `${storageUrl}?restype=container&comp=list`;
const response = await fetch(listUrl);
const xmlText = await response.text();

// Parse XML response to get blob URLs
```

## Security Considerations

### Public Access Level

Set container access to **Blob** (not Container):
- ✅ **Blob**: Anonymous read access for blobs only (secure)
- ❌ **Container**: Anonymous read for blobs AND list (less secure)

For the gallery to work, you need:
1. **Public read access** for individual blobs (to display images)
2. **CORS enabled** to allow list operations from JavaScript

### SAS Tokens (Optional)

For additional security, use SAS (Shared Access Signature) tokens:

```bash
# Generate SAS token with list permissions
az storage container generate-sas \
  --account-name ovalsaonestorage \
  --name gallery \
  --permissions rl \
  --expiry 2026-12-31T23:59:59Z \
  --output tsv
```

Then append to URLs in `gallery.json`:
```
https://ovalsaonestorage.blob.core.windows.net/gallery/match-u12?sv=2021-06-08&st=...
```

## Performance Optimization

### 1. Image Optimization

Compress images before upload:

```bash
# Using ImageMagick
magick input.jpg -resize 1920x1280^ -quality 85 output.jpg
```

### 2. CDN (Optional)

Add Azure CDN for faster global delivery:

```bash
az cdn profile create \
  --name ovalsaone-cdn \
  --resource-group rg-ovalsaone \
  --sku Standard_Microsoft

az cdn endpoint create \
  --name ovalsaone-gallery \
  --profile-name ovalsaone-cdn \
  --resource-group rg-ovalsaone \
  --origin ovalsaonestorage.blob.core.windows.net
```

Then use CDN URLs in `gallery.json`:
```
https://ovalsaone-gallery.azureedge.net/gallery/match-u12-octobre/main.jpg
```

### 3. Lazy Loading

Images are already lazy-loaded with `loading="lazy"` attribute.

## Troubleshooting

### CORS Errors

**Error**: `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solution**: Add CORS rules to Storage Account (see Step 3 above)

### 403 Forbidden

**Error**: Blob returns 403 when accessing

**Solution**: 
- Check container access level is set to "Blob"
- Verify blob exists at the URL

### Empty Album

**Error**: Modal opens but no images shown

**Solution**:
- Verify `storageUrl` is correct in `gallery.json`
- Check console for JavaScript errors
- Ensure blobs are uploaded to the correct folder

### Images Not Loading

**Error**: Images don't display in grid

**Solution**:
- Verify `mainImage` URL is correct
- Check blob exists and is publicly accessible
- Test URL directly in browser

## Testing

### Test Blob Listing

```bash
# Test REST API
curl "https://ovalsaonestorage.blob.core.windows.net/gallery/match-u12-octobre?restype=container&comp=list"
```

Should return XML with list of blobs.

### Test Image Access

```bash
# Test direct image access
curl -I "https://ovalsaonestorage.blob.core.windows.net/gallery/match-u12-octobre/main.jpg"
```

Should return `200 OK`.

## Example: Complete Workflow

```bash
# 1. Create folder and upload photos
mkdir -p temp-photos
# ... add your photos to temp-photos/

# 2. Upload to Azure
az storage blob upload-batch \
  --account-name ovalsaonestorage \
  --destination gallery/match-novembre-2025 \
  --source temp-photos

# 3. Get the URL (replace with your storage account name)
STORAGE_URL="https://ovalsaonestorage.blob.core.windows.net/gallery/match-novembre-2025"

# 4. Update gallery.json
cat >> src/_data/gallery.json << EOF
,{
  "titre": "Match Novembre 2025",
  "description": "Description du match",
  "date": "2025-11-15",
  "mainImage": "${STORAGE_URL}/main.jpg",
  "storageUrl": "${STORAGE_URL}",
  "categorie": "matches",
  "alt": "Match Novembre 2025"
}
EOF

# 5. Rebuild site
npm run build
```

## Benefits

✅ **Scalable**: Store thousands of photos without affecting site performance  
✅ **Dynamic**: Add/remove photos without rebuilding site  
✅ **Cost-effective**: Azure Storage is cheap (~$0.02/GB/month)  
✅ **Fast**: Direct access from CDN-backed storage  
✅ **Maintainable**: No need to commit large images to Git  

## Costs (Estimated)

For a rugby club with moderate photo usage:

- **Storage**: ~$0.02/GB/month (50GB = $1/month)
- **Bandwidth**: ~$0.09/GB (1000 views/month = ~$1/month)
- **Operations**: Negligible for list operations

**Total**: ~$2-5/month for unlimited photos

## Migration from Local Images

If you have existing local images in `src/assets/gallery/`:

```bash
# Upload all local images to Azure
az storage blob upload-batch \
  --account-name ovalsaonestorage \
  --destination gallery \
  --source src/assets/gallery

# Update gallery.json URLs (manually or script)
```

---

**Your gallery is now powered by Azure Storage! 🎉**
