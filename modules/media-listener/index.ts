import { requireNativeModule, EventEmitter } from 'expo-modules-core';
import { EventSubscription } from 'react-native';

const MediaListenerModule = requireNativeModule('MediaListener');
const emitter = new EventEmitter(MediaListenerModule);

export function requestPermission() {
    return MediaListenerModule.requestPermission();
}

export function hasPermission(): boolean {
    return MediaListenerModule.hasPermission();
}

export function addMediaListener(listener: (event: any) => void): EventSubscription {
    return (emitter as any).addListener('onMediaChanged', listener);
}

export { MediaListenerModule };
