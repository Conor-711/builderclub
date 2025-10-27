/**
 * Custom React Hook for Agora RTC
 * Simplifies the integration of Agora video calling in React components
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { UID } from 'agora-rtc-sdk-ng';
import { 
  getVideoCallService, 
  destroyVideoCallService, 
  VideoCallState, 
  RemoteUser, 
  JoinChannelOptions 
} from '@/services/videoCallService';
import { validateAppId } from '@/lib/agoraConfig';

export interface UseAgoraRTCOptions {
  onError?: (error: Error) => void;
  onRemoteUserJoined?: (user: RemoteUser) => void;
  onRemoteUserLeft?: (uid: UID) => void;
  onVolumeChange?: (volumes: { uid: UID; level: number }[]) => void;
}

export interface UseAgoraRTCResult {
  // State
  isJoined: boolean;
  isInitialized: boolean;
  localAudioEnabled: boolean;
  localVideoEnabled: boolean;
  remoteUsers: RemoteUser[];
  error: Error | null;
  
  // Actions
  initialize: () => Promise<void>;
  joinChannel: (options: JoinChannelOptions) => Promise<void>;
  leaveChannel: () => Promise<void>;
  toggleMicrophone: () => Promise<void>;
  toggleCamera: () => Promise<void>;
  
  // Video call service instance
  service: ReturnType<typeof getVideoCallService> | null;
}

/**
 * React Hook for Agora RTC
 */
export function useAgoraRTC(options: UseAgoraRTCOptions = {}): UseAgoraRTCResult {
  const [state, setState] = useState<VideoCallState>({
    isJoined: false,
    localAudioEnabled: true,
    localVideoEnabled: true,
    remoteUsers: [],
    networkQuality: null,
    isPublishing: false,
  });
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const serviceRef = useRef(getVideoCallService());

  /**
   * Initialize the video call service
   */
  const initialize = useCallback(async () => {
    try {
      // Validate App ID
      if (!validateAppId()) {
        throw new Error('Invalid or missing Agora App ID');
      }

      await serviceRef.current.initialize();
      setIsInitialized(true);
      setError(null);
      
      console.log('✅ useAgoraRTC: Initialized successfully');
    } catch (err) {
      const error = err as Error;
      console.error('❌ useAgoraRTC: Initialization failed:', error);
      setError(error);
      
      if (options.onError) {
        options.onError(error);
      }
      
      throw error;
    }
  }, [options]);

  /**
   * Join a channel
   */
  const joinChannel = useCallback(async (joinOptions: JoinChannelOptions) => {
    try {
      // Prevent duplicate join calls
      const currentState = serviceRef.current.getState();
      if (currentState.isJoined) {
        console.warn('⚠️ useAgoraRTC: Already joined, skipping join call');
        return;
      }

      if (!isInitialized) {
        await initialize();
      }

      await serviceRef.current.joinChannel(joinOptions);
      setError(null);
      
      console.log(`✅ useAgoraRTC: Joined channel ${joinOptions.channelName}`);
    } catch (err) {
      const error = err as Error;
      console.error('❌ useAgoraRTC: Failed to join channel:', error);
      setError(error);
      
      if (options.onError) {
        options.onError(error);
      }
      
      throw error;
    }
  }, [isInitialized, initialize, options]);

  /**
   * Leave the channel
   */
  const leaveChannel = useCallback(async () => {
    try {
      await serviceRef.current.leaveChannel();
      setError(null);
      
      console.log('✅ useAgoraRTC: Left channel successfully');
    } catch (err) {
      const error = err as Error;
      console.error('❌ useAgoraRTC: Failed to leave channel:', error);
      setError(error);
      
      if (options.onError) {
        options.onError(error);
      }
      
      throw error;
    }
  }, [options]);

  /**
   * Toggle microphone
   */
  const toggleMicrophone = useCallback(async () => {
    try {
      await serviceRef.current.toggleMicrophone();
      setError(null);
    } catch (err) {
      const error = err as Error;
      console.error('❌ useAgoraRTC: Failed to toggle microphone:', error);
      setError(error);
      
      if (options.onError) {
        options.onError(error);
      }
      
      throw error;
    }
  }, [options]);

  /**
   * Toggle camera
   */
  const toggleCamera = useCallback(async () => {
    try {
      await serviceRef.current.toggleCamera();
      setError(null);
    } catch (err) {
      const error = err as Error;
      console.error('❌ useAgoraRTC: Failed to toggle camera:', error);
      setError(error);
      
      if (options.onError) {
        options.onError(error);
      }
      
      throw error;
    }
  }, [options]);

  /**
   * Setup event listeners
   */
  useEffect(() => {
    const service = serviceRef.current;

    // State change listener
    service.onStateChange((newState) => {
      setState(newState);
    });

    // Remote user joined listener
    if (options.onRemoteUserJoined) {
      service.onRemoteUserJoined(options.onRemoteUserJoined);
    }

    // Remote user left listener
    if (options.onRemoteUserLeft) {
      service.onRemoteUserLeft(options.onRemoteUserLeft);
    }

    // Volume indicator listener
    if (options.onVolumeChange) {
      service.onVolumeIndicator(options.onVolumeChange);
    }

    // Error listener
    if (options.onError) {
      service.onError(options.onError);
    }
  }, [options]);

  /**
   * Cleanup on unmount - only run once
   */
  useEffect(() => {
    return () => {
      // Cleanup when component unmounts
      serviceRef.current.leaveChannel().catch(err => {
        console.error('Failed to cleanup on unmount:', err);
      });
    };
  }, []); // Empty deps - only run once on mount/unmount

  return {
    // State
    isJoined: state.isJoined,
    isInitialized,
    localAudioEnabled: state.localAudioEnabled,
    localVideoEnabled: state.localVideoEnabled,
    remoteUsers: state.remoteUsers,
    error,
    
    // Actions
    initialize,
    joinChannel,
    leaveChannel,
    toggleMicrophone,
    toggleCamera,
    
    // Service instance
    service: serviceRef.current,
  };
}

export default useAgoraRTC;

