import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button, ScrollView, AppState } from 'react-native';
import * as MediaListener from 'media-listener';

export default function App() {
    const [permission, setPermission] = useState(false);
    const [mediaData, setMediaData] = useState<any>(null);
    const [status, setStatus] = useState('Loading...');

    const checkPermission = () => {
        try {
            setPermission(MediaListener.hasPermission());
            setStatus('Ready');
        } catch (err: any) {
            setStatus(`Error: ${err.message}`);
        }
    };

    useEffect(() => {
        checkPermission();

        const mediaSub = MediaListener.addMediaListener((event) => {
            setMediaData(event);
        });

        const appSub = AppState.addEventListener('change', (state) => {
            if (state === 'active') checkPermission();
        });

        return () => {
            mediaSub.remove();
            appSub.remove();
        };
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.header}>🎵 Media Listener</Text>

            <View style={styles.statusBox}>
                <Text style={styles.label}>Status</Text>
                <Text style={[styles.value, status.includes('Error') && styles.error]}>
                    {status}
                </Text>
            </View>

            <View style={styles.permissionBox}>
                <Text style={styles.permissionText}>
                    {permission ? '✅ Permission Granted' : '❌ Permission Required'}
                </Text>
                {!permission && (
                    <Button
                        title="Grant Permission"
                        onPress={() => MediaListener.requestPermission()}
                    />
                )}
            </View>

            {permission && (
                <View style={styles.content}>
                    <Text style={styles.section}>Now Playing</Text>
                    {mediaData ? (
                        <View style={styles.card}>
                            <Text style={styles.title}>{mediaData.title || 'Unknown'}</Text>
                            <Text style={styles.artist}>{mediaData.artist || 'Unknown'}</Text>
                            <Text style={styles.album}>{mediaData.album || ''}</Text>
                            <Text style={styles.source}>{mediaData.package}</Text>
                        </View>
                    ) : (
                        <Text style={styles.empty}>Play some music...</Text>
                    )}

                    <Text style={styles.section}>Debug</Text>
                    <ScrollView style={styles.debug}>
                        <Text style={styles.json}>
                            {JSON.stringify(mediaData, null, 2) || 'null'}
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
        backgroundColor: '#0a0a0a',
        paddingTop: 60,
        paddingHorizontal: 20,
    },
    header: {
        fontSize: 26,
        fontWeight: '700',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 24,
    },
    statusBox: {
        backgroundColor: '#151520',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    label: {
        color: '#666',
        fontSize: 12,
        marginBottom: 4,
    },
    value: {
        color: '#4ade80',
        fontSize: 15,
        fontWeight: '600',
    },
    error: {
        color: '#f87171',
    },
    permissionBox: {
        backgroundColor: '#1a1a1a',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 20,
    },
    permissionText: {
        color: '#ccc',
        fontSize: 15,
        marginBottom: 12,
    },
    content: {
        flex: 1,
    },
    section: {
        color: '#888',
        fontSize: 13,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    card: {
        backgroundColor: '#1e1e28',
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
        textAlign: 'center',
    },
    artist: {
        fontSize: 15,
        color: '#aaa',
        marginTop: 4,
    },
    album: {
        fontSize: 13,
        color: '#666',
        marginTop: 2,
    },
    source: {
        fontSize: 11,
        color: '#444',
        marginTop: 12,
    },
    empty: {
        color: '#555',
        fontStyle: 'italic',
        textAlign: 'center',
        padding: 20,
    },
    debug: {
        flex: 1,
        backgroundColor: '#000',
        borderRadius: 8,
        padding: 12,
        marginBottom: 20,
    },
    json: {
        color: '#22c55e',
        fontFamily: 'monospace',
        fontSize: 11,
    },
});
