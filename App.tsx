import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button, ScrollView, AppState } from 'react-native';
import * as MediaListener from 'media-listener';

export default function App() {
    const [permission, setPermission] = useState(false);
    const [mediaData, setMediaData] = useState<any>(null);
    const [moduleStatus, setModuleStatus] = useState<string>('Checking...');

    const checkPermission = () => {
        try {
            const has = MediaListener.hasPermission();
            setPermission(has);
            setModuleStatus('Module loaded successfully!');
        } catch (error: any) {
            setModuleStatus(`Error: ${error.message}`);
        }
    };

    useEffect(() => {
        checkPermission();

        const subscription = MediaListener.addMediaListener((event) => {
            console.log('Media Event:', event);
            setMediaData(event);
        });

        // Check permission on app resume, as user might have come back from settings
        const appStateSub = AppState.addEventListener('change', (state) => {
            if (state === 'active') {
                checkPermission();
            }
        });

        return () => {
            subscription.remove();
            appStateSub.remove();
        };
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.header}>🎵 Media Listener</Text>

            <View style={styles.moduleStatus}>
                <Text style={styles.statusLabel}>Module Status:</Text>
                <Text style={[styles.statusValue, moduleStatus.includes('Error') ? styles.error : styles.success]}>
                    {moduleStatus}
                </Text>
            </View>

            <View style={styles.statusContainer}>
                <Text style={styles.statusText}>
                    Permission: {permission ? '✅ GRANTED' : '❌ DENIED'}
                </Text>
                {!permission && (
                    <Button
                        title="Open Settings to Grant Permission"
                        onPress={() => MediaListener.requestPermission()}
                    />
                )}
            </View>

            {permission && (
                <View style={styles.content}>
                    <Text style={styles.sectionHeader}>Now Playing</Text>
                    {mediaData ? (
                        <View style={styles.nowPlayingCard}>
                            <Text style={styles.trackTitle}>{mediaData.title || 'Unknown Title'}</Text>
                            <Text style={styles.trackArtist}>{mediaData.artist || 'Unknown Artist'}</Text>
                            <Text style={styles.trackAlbum}>{mediaData.album || 'Unknown Album'}</Text>
                            <Text style={styles.trackPackage}>App: {mediaData.package}</Text>
                        </View>
                    ) : (
                        <Text style={styles.placeholder}>Waiting for media playback...</Text>
                    )}

                    <Text style={styles.sectionHeader}>Raw Data</Text>
                    <ScrollView style={styles.rawContainer}>
                        <Text style={styles.rawText}>
                            {JSON.stringify(mediaData, null, 2) || 'No data yet'}
                        </Text>
                    </ScrollView>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
        paddingTop: 50,
        paddingHorizontal: 20,
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 20,
        textAlign: 'center',
    },
    moduleStatus: {
        backgroundColor: '#1a1a2e',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#333',
    },
    statusLabel: {
        color: '#888',
        fontSize: 14,
        marginBottom: 5,
    },
    statusValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    success: {
        color: '#00ff88',
    },
    error: {
        color: '#ff4444',
    },
    statusContainer: {
        marginBottom: 20,
        padding: 15,
        backgroundColor: '#1e1e1e',
        borderRadius: 8,
        alignItems: 'center',
    },
    statusText: {
        color: '#aaa',
        fontSize: 16,
        marginBottom: 10,
    },
    content: {
        flex: 1,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ccc',
        marginTop: 20,
        marginBottom: 10,
    },
    nowPlayingCard: {
        backgroundColor: '#252525',
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
    },
    trackTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 5,
    },
    trackArtist: {
        fontSize: 16,
        color: '#ddd',
        textAlign: 'center',
    },
    trackAlbum: {
        fontSize: 14,
        color: '#aaa',
        textAlign: 'center',
        marginTop: 2,
    },
    trackPackage: {
        fontSize: 12,
        color: '#555',
        marginTop: 10,
    },
    placeholder: {
        color: '#666',
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 20,
    },
    rawContainer: {
        flex: 1,
        backgroundColor: '#000',
        borderRadius: 8,
        padding: 10,
        marginBottom: 20,
    },
    rawText: {
        color: '#0f0',
        fontFamily: 'monospace',
        fontSize: 12,
    },
});
