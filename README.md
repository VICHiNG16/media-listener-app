# 🎵 Media Listener

A React Native / Expo application that listens to and displays real-time media playback information from any audio source on your Android device.

## Overview

Media Listener uses Android's **Notification Listener Service** API to capture media metadata from all music players, podcasts apps, and audio streaming services. The app displays the currently playing track information and provides raw debugging data for developers.

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **React Native** | 0.81.5 | Cross-platform mobile framework |
| **Expo** | ~54.0.27 | Development and build toolchain |
| **Kotlin** | 2.1.20 | Native Android module implementation |
| **TypeScript** | ~5.9.2 | Type-safe JavaScript |
| **KSP** | 2.1.20-2.0.1 | Kotlin Symbol Processing |

## Features

- 🔔 **Real-time Media Events** – Captures metadata as soon as media playback changes
- 🎨 **Clean Dark UI** – Modern interface displaying track info (title, artist, album)
- 📱 **Source App Detection** – Shows which app is playing the media
- 🔧 **Raw Data View** – JSON output for debugging and development
- ⚡ **Standalone APK** – Works without Metro bundler after release build

## Architecture

```
media-listener-app/
├── App.tsx                           # Main React Native UI
├── modules/
│   └── media-listener/
│       ├── index.ts                  # TypeScript API wrapper
│       ├── expo-module.config.json   # Expo native module config
│       └── android/src/main/kotlin/
│           └── expo/modules/medialistener/
│               ├── MediaListenerModule.kt        # Expo module bridge
│               └── MediaNotificationService.kt   # Android notification listener
└── android/                          # Generated native Android project
```

## Prerequisites

- Node.js 18+
- Android SDK (API 24+)
- Java 17+
- An Android device or emulator

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

To build a release APK that works without a development server:

```bash
cd android
./gradlew assembleRelease
```

The APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

## Permissions

The app requires **Notification Listener** permission to access media notifications. On first launch:

1. Tap "Open Settings to Grant Permission"
2. Find and enable the app in Notification Access settings
3. Return to the app

## API Usage

```typescript
import * as MediaListener from 'media-listener';

// Check if permission is granted
const hasPermission = MediaListener.hasPermission();

// Request permission (opens system settings)
MediaListener.requestPermission();

// Listen for media changes
const subscription = MediaListener.addMediaListener((event) => {
  console.log('Now Playing:', event.title, 'by', event.artist);
});

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
}
```

## License

MIT

## Author

Built with ❤️ using React Native, Expo, and Kotlin
