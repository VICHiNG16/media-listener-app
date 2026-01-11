import { requireNativeModule, EventEmitter } from 'expo-modules-core';
import { EventSubscription } from 'react-native';

const MediaSessionModule = requireNativeModule('MediaSession');
const emitter = new EventEmitter(MediaSessionModule);

export interface MediaEvent {
    package: string;
    title: string;
    artist: string;
    album: string;
    state: 'playing' | 'paused' | 'stopped' | 'buffering' | 'unknown';
    position: number;
    duration: number;
    timestamp: number;
    artworkUri?: string;
}

export function requestPermission(): void {
    return MediaSessionModule.requestPermission();
}

export function hasPermission(): boolean {
    return MediaSessionModule.hasPermission();
}

export function addMediaListener(listener: (event: MediaEvent) => void): EventSubscription {
    return (emitter as any).addListener('onMediaChanged', listener);
}

export function getState(): MediaEvent | null {
    return MediaSessionModule.getState();
}

export function play(): void {
    return MediaSessionModule.play();
}

export function pause(): void {
    return MediaSessionModule.pause();
}

export function skipNext(): void {
    return MediaSessionModule.skipNext();
}

export function skipPrevious(): void {
    return MediaSessionModule.skipPrevious();
}

export { MediaSessionModule };
