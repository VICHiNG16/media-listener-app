# 🎵 Media Session Module

An Expo native module for Android that uses **MediaSessionManager** API to capture and control media playback from any audio source on your device.

## Features

- 🔔 **Real-time Media Events** – Captures metadata as soon as media playback changes
- ▶️ **Playback State** – Tracks playing/paused/stopped/buffering states
- ⏱️ **Position Tracking** – Current playback position and duration
- 🎛️ **Transport Controls** – Play, pause, skip to next/previous track
- 🖼️ **Album Artwork** – Extracts artwork as base64 data URI
- 📱 **Source App Detection** – Identifies which app is playing media

## Version Comparison

| Feature | v1.0 | v2.0 | v3.0 |
|---------|------|------|------|
| **API Used** | NotificationListenerService | MediaSessionManager | MediaSessionManager |
| **Playback State** | ❌ | ✅ Playing/Paused/Stopped/Buffering | ✅ |
| **Track Position** | ❌ | ✅ Current position + duration | ✅ |
| **Playback Control** | ❌ | ✅ Play/Pause/Skip | ✅ |
| **Album Artwork** | ❌ | ❌ | ✅ Base64 data URI |
| **Get Current State** | ❌ | ❌ | ✅ `getState()` |
| **Event Detection** | Notification parsing | MediaController callbacks | MediaController callbacks |

### v3.0 Highlights

1. **Album Artwork Extraction** – Retrieves artwork bitmap from MediaSession metadata and converts to base64 data URI
2. **`getState()` API** – Synchronously get the current media state without waiting for an event
3. **`artworkUri` Field** – New optional field in `MediaEvent` containing the artwork as a data URI

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **React Native** | 0.81.5 | Cross-platform mobile framework |
| **Expo** | ~54.0.30 | Development and build toolchain |
| **Kotlin** | 2.1.20 | Native Android module implementation |
| **TypeScript** | ~5.9.2 | Type-safe JavaScript |

## Architecture

```
modules/media-session/
├── index.ts                          # TypeScript API wrapper
├── expo-module.config.json           # Expo native module config
└── android/src/main/kotlin/
    └── expo/modules/mediasession/
        ├── MediaSessionModule.kt     # Expo module bridge
        ├── MediaSessionService.kt    # NotificationListener + MediaSessionManager
        └── MediaEventManager.kt      # Event emission singleton
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

// Get current state (v3.0+)
const currentState = MediaSession.getState();
if (currentState) {
  console.log('Currently playing:', currentState.title);
}

// Listen for media changes
const subscription = MediaSession.addMediaListener((event) => {
  console.log('Track:', event.title, 'by', event.artist);
  console.log('State:', event.state);
  console.log('Position:', event.position, '/', event.duration);
  
  // Album artwork (v3.0+)
  if (event.artworkUri) {
    console.log('Artwork available as data URI');
  }
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
  title: string;       // Track title
  artist: string;      // Artist name
  album: string;       // Album name
  package: string;     // Source app package name
  state: 'playing' | 'paused' | 'stopped' | 'buffering' | 'unknown';
  position: number;    // Current position in ms
  duration: number;    // Track duration in ms
  timestamp: number;   // Event timestamp
  artworkUri?: string; // Album artwork as base64 data URI (v3.0+)
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
