# Recording Feature - Quick Start

## How to Use

### 1. Start Recording
```
Control Room Dashboard
    ↓
Click camera tile "Maximize" button
    ↓
Fullscreen modal opens
    ↓
Recording controls visible at bottom
    ↓
Click "Start Recording"
```

### 2. During Recording
- 🔴 **Red pulsing dot** shows recording is active
- **Duration display** shows elapsed time and remaining (out of 10 min)
- **Progress bar** visualizes recording progress
- Can **Pause/Resume** without losing footage
- **Auto-stops** at 10 minutes

### 3. After Recording
- Click **"Stop"** to finalize recording
- File size displays (usually 10-15 MB for full 10-min recording)
- Click **"Download"** to save as WebM file
- Or click **"Reset"** to discard and record again

## Key Info

| Feature | Details |
|---------|---------|
| **Max Duration** | 10 minutes |
| **File Format** | WebM (VP9/VP8) |
| **Resolution** | Matches camera stream (usually 1280×720) |
| **Frame Rate** | 30 FPS |
| **File Size** | ~10-15 MB per 10 minutes |
| **Playback** | VLC, Chrome, Firefox, Edge |

## Common Tasks

### Download Multiple Clips
1. Record first clip, download it
2. Click "Reset" to clear
3. Record second clip, download it
4. Repeat as needed

### Switch Cameras While Recording
- Recording auto-resets when switching cameras
- If still recording, click "Stop" first, then switch

### Find Downloaded Files
- Look in browser's default Downloads folder
- Files named: `recording-[timestamp].webm`
- Example: `recording-1738258620034.webm`

## Playback

### On Windows
1. **Windows Media Player** - Most videos work
2. **VLC Media Player** - Best WebM support (free download)
3. **Chrome/Edge** - Drag WebM file to browser
4. **Firefox** - Native WebM support

### On Mac/Linux
- **VLC** (free, works everywhere)
- **Firefox** (native WebM)
- **System player** (may need codec)

## Browser Support

✅ **Chrome** - Perfect  
✅ **Edge** - Perfect  
✅ **Firefox** - Good  
⚠️ **Safari** - Limited  
❌ **Mobile** - Limited  

## Status Indicators

| Indicator | Meaning |
|-----------|---------|
| 🔴 Pulsing red dot | Recording active |
| 📊 Progress bar green | Recording in progress |
| 📊 Progress bar amber | <60 seconds remaining |
| 💾 File size shown | Recording stopped, ready to download |

## Troubleshooting

**"Video element not found"**
- Make sure camera stream is visible before recording

**Recording stops immediately**
- Check if browser supports MediaRecorder (Chrome 49+)
- Try refreshing page

**Downloaded file won't play**
- Download VLC Player (best WebM support)
- Or use Chrome/Firefox browser

**Recording is slow/stuttering**
- Close other browser tabs
- Restart camera recording
- Try lower resolution camera

---

**Need help?** Check `INSTANT_PLAYBACK_RECORDING.md` for detailed technical docs.
