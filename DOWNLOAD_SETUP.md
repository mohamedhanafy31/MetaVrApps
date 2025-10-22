# MetaVR Dashboard - Auto Download Setup

This project now includes automatic file downloading from Google Drive when starting the development server.

## 🚀 Quick Start

### Option 1: Start with Auto Download (Recommended)
```bash
npm run dev:with-download
```
This will:
1. Check if the file is already downloaded
2. Download the file from Google Drive if needed
3. Start the Next.js development server

### Option 2: Manual Download
```bash
npm run download-file
```
This will only download the file without starting the server.

### Option 3: Regular Development (No Download)
```bash
npm run dev
```
This starts the server without downloading any files.

## 📁 File Management

- **Download Location**: `./downloads/google-drive-file`
- **File Source**: [Google Drive File](https://drive.google.com/file/d/15jxv-pTmrQ9QgidJX1vscBJ4cC0xT4wi/view?usp=sharing)
- **File Type**: Firebase Service Account JSON (2.37KB)
- **Auto-Detection**: The system checks if files exist before downloading

## 🔧 Configuration

The download script automatically:
- Extracts the file ID from the Google Drive URL
- Uses multiple download methods (Node.js HTTPS + Python gdown)
- Handles large file confirmations
- Shows download progress
- Creates the downloads directory if it doesn't exist
- Skips download if files already exist
- Provides detailed error messages and troubleshooting tips

## 📝 Scripts Available

- `npm run dev:with-download` - Start development server with auto download
- `npm run download-file` - Download file only
- `npm run dev` - Start development server only
- `npm run build` - Build for production
- `npm run start` - Start production server

## 🛠️ Technical Details

The download system uses:
- **File ID**: `15jxv-pTmrQ9QgidJX1vscBJ4cC0xT4wi`
- **Primary Method**: Python `gdown` package (more reliable for Google Drive)
- **Fallback Method**: Node.js HTTPS with direct download URL
- **Download URL**: `https://drive.google.com/uc?export=download&id={fileId}`
- **Progress Tracking**: Real-time download progress display
- **Error Handling**: Graceful fallback between methods

## 🔍 Troubleshooting

If downloads fail:
1. Check your internet connection
2. Verify the Google Drive file is publicly accessible
3. Check the console for specific error messages
4. Try running `npm run download-file` manually
5. Ensure Python 3 and pip are installed for gdown fallback

The development server will start even if the download fails, ensuring you can continue working.

## 📋 Dependencies

The download system automatically installs:
- `gdown` Python package (for reliable Google Drive downloads)
- Required Python dependencies (beautifulsoup4, requests, tqdm, etc.)

## ✅ Success Indicators

When the download is successful, you'll see:
- ✅ Download successful with gdown!
- 📁 File: ./downloads/google-drive-file
- 📏 Size: 2370 bytes
- 📅 Modified: [timestamp]

The downloaded file is a Firebase service account JSON that can be used for authentication.
