# 🎵 Media Listener

A React Native / Expo application that uses Android's **MediaSessionManager** API to capture and control media playback from any audio source on your Android device.

## Features

- 🔔 **Real-time Media Events** – Captures metadata as soon as media playback changes
- ▶️ **Playback State** – Tracks playing/paused/stopped/buffering states
- ⏱️ **Position Tracking** – Shows current playback position with progress bar
- 🎛️ **Transport Controls** – Play, pause, skip to next/previous track
- 🎨 **Clean Dark UI** – Modern interface displaying track info
- 📱 **Source App Detection** – Shows which app is playing the media
- 🔧 **Raw Data View** – JSON output for debugging and development

## v2.0 Updates

| Feature | v1.0 | v2.0 |
|---------|------|------|
| **API Used** | NotificationListenerService only | MediaSessionManager + NotificationListenerService |
| **Playback State** | ❌ Not available | ✅ Playing/Paused/Stopped/Buffering |
| **Track Position** | ❌ Not available | ✅ Current position + duration |
| **Playback Control** | ❌ Not available | ✅ Play/Pause/Skip Next/Previous |
| **Progress Bar** | ❌ Not available | ✅ Visual progress with time display |
| **Event Detection** | Notification parsing | Direct MediaController callbacks |

### Key Improvements in v2.0

1. **MediaSessionManager Integration** – Uses `MediaController.Callback` for real-time playback state and metadata changes
2. **Transport Controls** – Play, pause, skip to next/previous track
3. **Position Tracking** – Shows current playback position with progress bar
4. **More Reliable Events** – Gets metadata directly from MediaSession instead of parsing notifications
5. **Cleaner Architecture** – Separates MediaSessionService from module logic

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **React Native** | 0.81.5 | Cross-platform mobile framework |
| **Expo** | ~54.0.27 | Development and build toolchain |
| **Kotlin** | 2.1.20 | Native Android module implementation |
| **TypeScript** | ~5.9.2 | Type-safe JavaScript |

## Architecture

```
media-listener-app/
├── App.tsx                           # Main React Native UI with controls
├── modules/
│   └── media-session/
│       ├── index.ts                  # TypeScript API wrapper
│       ├── expo-module.config.json   # Expo native module config
│       └── android/src/main/kotlin/
│           └── expo/modules/mediasession/
│               ├── MediaSessionModule.kt     # Expo module bridge
│               ├── MediaSessionService.kt    # NotificationListener + MediaSessionManager
│               └── MediaEventManager.kt      # Event emission singleton
└── android/                          # Generated native Android project
```

## Installation

```bash
# Clone the repository
git clone https://github.com/VICHiNG16/media-listener-app.git
cd media-listener-app

# Install dependencies
npm install

# Generate native project
npx expo prebuild --platform android

# Run on Android device
npx expo run:android
```

## Building Standalone APK

```bash
cd android
./gradlew assembleRelease
```

The APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

## Permissions

The app requires **Notification Listener** permission to access MediaSessionManager. On first launch:

1. Tap "Grant Permission"
2. Find and enable the app in Notification Access settings
3. Return to the app

> **Note:** MediaSessionManager.getActiveSessions() requires NotificationListenerService permission for third-party apps. The MEDIA_CONTENT_CONTROL permission is only available to system apps.

## API Usage

```typescript
import * as MediaSession from './modules/media-session';

// Check/request permission
const hasPermission = MediaSession.hasPermission();
MediaSession.requestPermission();

// Listen for media changes
const subscription = MediaSession.addMediaListener((event) => {
  console.log('Track:', event.title, 'by', event.artist);
  console.log('State:', event.state);
  console.log('Position:', event.position, '/', event.duration);
});

// Transport controls
MediaSession.play();
MediaSession.pause();
MediaSession.skipNext();
MediaSession.skipPrevious();

// Clean up
subscription.remove();
```

## Media Event Object

```typescript
{
  title: string;      // Track title
  artist: string;     // Artist name
  album: string;      // Album name
  package: string;    // Source app package name
  state: 'playing' | 'paused' | 'stopped' | 'buffering' | 'unknown';
  position: number;   // Current position in ms
  duration: number;   // Track duration in ms
  timestamp: number;  // Event timestamp
}
```

## Why MediaSessionManager?

Android's MediaSessionManager provides a more robust way to interact with media sessions:

- **Direct access** to playback state instead of parsing notification text
- **Transport controls** to control playback
- **Callback-based updates** for real-time state changes
- **Position tracking** for progress display

However, it still requires NotificationListenerService permission for third-party apps to access sessions from other applications.

## License

MIT

## Author

Built with ❤️ using React Native, Expo, and Kotlin
