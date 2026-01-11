import { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, AppState, Image, StatusBar, Dimensions } from 'react-native';
import * as MediaSession from './modules/media-session';

const { width } = Dimensions.get('window');

// Sober Color Palette
const COLORS = {
  background: '#000000',
  surface: '#0A0A0A',
  border: '#222222',
  primary: '#FFFFFF',
  secondary: '#777777',
  muted: '#444444',
  error: '#FF4444',
  success: '#FFFFFF',
};

export default function App() {
  const [permission, setPermission] = useState(false);
  const [mediaData, setMediaData] = useState<MediaSession.MediaEvent | null>(null);
  const [status, setStatus] = useState('Initializing...');
  const positionRef = useRef(0);
  const [displayPosition, setDisplayPosition] = useState(0);

  const checkPermission = () => {
    try {
      setPermission(MediaSession.hasPermission());
      setStatus('System Ready');
    } catch (err: any) {
      setStatus(`System Error: ${err.message}`);
    }
  };

  useEffect(() => {
    checkPermission();

    const mediaSub = MediaSession.addMediaListener((event) => {
      setMediaData(event);
      positionRef.current = event.position;
    });

    const appSub = AppState.addEventListener('change', (state) => {
      if (state === 'active') checkPermission();
    });

    const positionInterval = setInterval(() => {
      if (mediaData?.state === 'playing') {
        positionRef.current += 1000;
        setDisplayPosition(positionRef.current);
      } else if (mediaData) {
        setDisplayPosition(mediaData.position);
      }
    }, 1000);

    return () => {
      mediaSub.remove();
      appSub.remove();
      clearInterval(positionInterval);
    };
  }, [mediaData?.state, mediaData?.position]);

  const formatTime = (ms: number) => {
    if (!ms || ms < 0) return '0:00';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercent = mediaData?.duration
    ? Math.min((displayPosition / mediaData.duration) * 100, 100)
    : 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appTitle}>MEDIA SESSION</Text>
        <View style={[styles.statusIndicator, permission ? styles.statusActive : styles.statusInactive]} />
      </View>

      <View style={styles.mainContent}>
        {!permission ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>PERMISSION REQUIRED</Text>
            <Text style={styles.cardDesc}>
              Notification access is needed to listen for media events.
            </Text>
            <TouchableOpacity style={styles.primaryButton} onPress={() => MediaSession.requestPermission()}>
              <Text style={styles.primaryButtonText}>GRANT PERMISSION</Text>
            </TouchableOpacity>
          </View>
        ) : mediaData ? (
          <View style={styles.playerWrapper}>
            {/* Artwork */}
            <View style={styles.artworkContainer}>
              {mediaData.artworkUri ? (
                <Image
                  source={{ uri: mediaData.artworkUri }}
                  style={styles.artwork}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.artworkPlaceholder}>
                  <Text style={styles.placeholderIcon}>♪</Text>
                </View>
              )}
            </View>

            {/* Metadata */}
            <View style={styles.metaInfo}>
              <Text style={styles.titleText} numberOfLines={1}>{mediaData.title || 'No Title'}</Text>
              <Text style={styles.artistText} numberOfLines={1}>{mediaData.artist || 'Unknown Artist'}</Text>
              <Text style={styles.albumText} numberOfLines={1}>{mediaData.album || 'No Album'}</Text>
            </View>

            {/* Progress */}
            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressThumb, { width: `${progressPercent}%` }]} />
              </View>
              <View style={styles.timeLabels}>
                <Text style={styles.timeValue}>{formatTime(displayPosition)}</Text>
                <Text style={styles.timeValue}>{formatTime(mediaData.duration)}</Text>
              </View>
            </View>

            {/* Controls */}
            <View style={styles.controls}>
              <TouchableOpacity onPress={() => MediaSession.skipPrevious()} style={styles.iconButton}>
                <Text style={styles.iconText}>⏮</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => mediaData.state === 'playing' ? MediaSession.pause() : MediaSession.play()}
                style={styles.playButton}
              >
                <Text style={styles.playIconText}>
                  {mediaData.state === 'playing' ? '⏸' : '▶'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => MediaSession.skipNext()} style={styles.iconButton}>
                <Text style={styles.iconText}>⏭</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.packageText}>{mediaData.package}</Text>
          </View>
        ) : (
          <View style={styles.idleView}>
            <Text style={styles.idleMessage}>READY FOR PLAYBACK</Text>
            <Text style={styles.idleSubMessage}>No active media session detected</Text>
          </View>
        )}
      </View>

      {/* Footer / Debug */}
      {mediaData && (
        <View style={styles.footer}>
          <Text style={styles.debugText}>
            {mediaData.state.toUpperCase()} • {formatTime(displayPosition)} / {formatTime(mediaData.duration)}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    marginBottom: 40,
  },
  appTitle: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '300',
    letterSpacing: 4,
  },
  statusIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusActive: {
    backgroundColor: COLORS.primary,
  },
  statusInactive: {
    backgroundColor: COLORS.muted,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'center',
  },
  card: {
    padding: 30,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 2,
  },
  cardTitle: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 10,
  },
  cardDesc: {
    color: COLORS.secondary,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 30,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 2,
  },
  primaryButtonText: {
    color: COLORS.background,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  playerWrapper: {
    alignItems: 'center',
  },
  artworkContainer: {
    width: width * 0.7,
    aspectRatio: 1,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  artwork: {
    width: '100%',
    height: '100%',
  },
  artworkPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    color: COLORS.muted,
    fontSize: 40,
  },
  metaInfo: {
    width: '100%',
    marginBottom: 30,
  },
  titleText: {
    color: COLORS.primary,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  artistText: {
    color: COLORS.secondary,
    fontSize: 14,
    marginBottom: 2,
  },
  albumText: {
    color: COLORS.muted,
    fontSize: 12,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 30,
  },
  progressTrack: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 10,
  },
  progressThumb: {
    height: 1,
    backgroundColor: COLORS.primary,
  },
  timeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeValue: {
    color: COLORS.muted,
    fontSize: 10,
    fontFamily: 'monospace',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 50,
    marginBottom: 30,
  },
  iconButton: {
    padding: 10,
  },
  iconText: {
    color: COLORS.secondary,
    fontSize: 20,
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIconText: {
    color: COLORS.primary,
    fontSize: 24,
  },
  packageText: {
    color: COLORS.muted,
    fontSize: 9,
    letterSpacing: 1,
  },
  idleView: {
    alignItems: 'center',
  },
  idleMessage: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '300',
    letterSpacing: 3,
    marginBottom: 8,
  },
  idleSubMessage: {
    color: COLORS.muted,
    fontSize: 11,
  },
  footer: {
    padding: 30,
  },
  debugText: {
    color: COLORS.muted,
    fontSize: 9,
    fontFamily: 'monospace',
    textAlign: 'center',
    letterSpacing: 1,
  },
});

