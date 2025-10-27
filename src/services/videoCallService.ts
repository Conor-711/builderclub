/**
 * Agora Video Call Service
 * Handles all video call related operations
 */

import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  UID,
  NetworkQuality,
} from 'agora-rtc-sdk-ng';
import { AGORA_CONFIG } from '@/lib/agoraConfig';

// Enable Agora SDK logs in development
if (import.meta.env.DEV) {
  AgoraRTC.setLogLevel(3); // 0: DEBUG, 1: INFO, 2: WARNING, 3: ERROR, 4: NONE
}

export interface RemoteUser {
  uid: UID;
  hasAudio: boolean;
  hasVideo: boolean;
  audioTrack?: any;
  videoTrack?: any;
}

export interface VideoCallState {
  isJoined: boolean;
  localAudioEnabled: boolean;
  localVideoEnabled: boolean;
  remoteUsers: RemoteUser[];
  networkQuality: NetworkQuality | null;
  isPublishing: boolean;
}

export interface JoinChannelOptions {
  channelName: string;
  userId: string;
  token?: string; // Token is required for production
}

class VideoCallService {
  private client: IAgoraRTCClient | null = null;
  private localAudioTrack: IMicrophoneAudioTrack | null = null;
  private localVideoTrack: ICameraVideoTrack | null = null;
  private state: VideoCallState = {
    isJoined: false,
    localAudioEnabled: true,
    localVideoEnabled: true,
    remoteUsers: [],
    networkQuality: null,
    isPublishing: false,
  };

  // Event handlers
  private onStateChangeCallback: ((state: VideoCallState) => void) | null = null;
  private onRemoteUserJoinedCallback: ((user: RemoteUser) => void) | null = null;
  private onRemoteUserLeftCallback: ((uid: UID) => void) | null = null;
  private onVolumeIndicatorCallback: ((volumes: { uid: UID; level: number }[]) => void) | null = null;
  private onErrorCallback: ((error: Error) => void) | null = null;

  /**
   * Initialize Agora RTC Client
   */
  public async initialize(): Promise<void> {
    try {
      if (this.client) {
        console.warn('⚠️ Client already initialized');
        return;
      }

      console.log('🚀 Initializing Agora RTC Client...');
      
      this.client = AgoraRTC.createClient(AGORA_CONFIG.clientConfig);

      // Setup event listeners
      this.setupEventListeners();

      console.log('✅ Agora RTC Client initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Agora RTC Client:', error);
      this.handleError(error as Error);
      throw error;
    }
  }

  /**
   * Setup event listeners for RTC client
   */
  private setupEventListeners(): void {
    if (!this.client) return;

    // User published (joined with audio/video)
    this.client.on('user-published', async (user, mediaType) => {
      console.log(`👤 User ${user.uid} published ${mediaType}`);
      
      try {
        // Subscribe to the remote user
        await this.client!.subscribe(user, mediaType);
        console.log(`✅ Subscribed to user ${user.uid}'s ${mediaType}`);

        // Update remote users list
        this.updateRemoteUser(user, mediaType, true);
      } catch (error) {
        console.error(`❌ Failed to subscribe to user ${user.uid}:`, error);
        this.handleError(error as Error);
      }
    });

    // User unpublished (muted audio/video)
    this.client.on('user-unpublished', (user, mediaType) => {
      console.log(`👤 User ${user.uid} unpublished ${mediaType}`);
      this.updateRemoteUser(user, mediaType, false);
    });

    // User joined channel
    this.client.on('user-joined', (user) => {
      console.log(`👋 User ${user.uid} joined the channel`);
      this.addRemoteUser(user);
    });

    // User left channel
    this.client.on('user-left', (user, reason) => {
      console.log(`👋 User ${user.uid} left the channel. Reason: ${reason}`);
      this.removeRemoteUser(user.uid);
      
      if (this.onRemoteUserLeftCallback) {
        this.onRemoteUserLeftCallback(user.uid);
      }
    });

    // Network quality
    this.client.on('network-quality', (quality) => {
      this.state.networkQuality = quality;
      this.notifyStateChange();
    });

    // Connection state changed
    this.client.on('connection-state-change', (curState, prevState, reason) => {
      console.log(`🔌 Connection state changed: ${prevState} -> ${curState} (${reason})`);
    });

    // Volume indicator (for speaker detection)
    this.client.enableAudioVolumeIndicator();
    this.client.on('volume-indicator', (volumes) => {
      if (this.onVolumeIndicatorCallback) {
        this.onVolumeIndicatorCallback(volumes as any);
      }
    });

    // Exception handling
    this.client.on('exception', (event) => {
      console.error('⚠️ Agora exception:', event);
    });
  }

  /**
   * Join a channel
   */
  public async joinChannel(options: JoinChannelOptions): Promise<void> {
    try {
      if (!this.client) {
        throw new Error('Client not initialized. Call initialize() first.');
      }

      if (this.state.isJoined) {
        console.warn('⚠️ Already joined a channel');
        return;
      }

      // Check if client is already in connecting/connected state
      if (this.client.connectionState === 'CONNECTING' || this.client.connectionState === 'CONNECTED') {
        console.warn('⚠️ Client already in connecting/connected state, skipping join');
        return;
      }

      console.log(`🎯 Joining channel: ${options.channelName}...`);

      // Join the channel
      // For testing without token, pass null. For production, use token.
      const uid = await this.client.join(
        AGORA_CONFIG.appId,
        options.channelName,
        options.token || null,
        options.userId
      );

      console.log(`✅ Joined channel with UID: ${uid}`);

      this.state.isJoined = true;
      this.notifyStateChange();

      // Create and publish local tracks
      await this.createLocalTracks();
      await this.publishLocalTracks();

    } catch (error) {
      console.error('❌ Failed to join channel:', error);
      this.handleError(error as Error);
      throw error;
    }
  }

  /**
   * Create local audio and video tracks
   */
  private async createLocalTracks(): Promise<void> {
    try {
      console.log('🎥 Creating local tracks...');

      // Create microphone audio track
      this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack({
        encoderConfig: AGORA_CONFIG.audioConfig.profile,
        AEC: AGORA_CONFIG.audioConfig.echoCancellation,
        ANS: AGORA_CONFIG.audioConfig.noiseSuppression,
        AGC: AGORA_CONFIG.audioConfig.autoGainControl,
      });

      // Create camera video track
      this.localVideoTrack = await AgoraRTC.createCameraVideoTrack({
        encoderConfig: AGORA_CONFIG.videoEncoderConfig,
      });

      console.log('✅ Local tracks created successfully');
    } catch (error) {
      console.error('❌ Failed to create local tracks:', error);
      this.handleError(error as Error);
      throw error;
    }
  }

  /**
   * Publish local tracks to the channel
   */
  private async publishLocalTracks(): Promise<void> {
    try {
      if (!this.client || !this.localAudioTrack || !this.localVideoTrack) {
        throw new Error('Client or tracks not ready');
      }

      console.log('📤 Publishing local tracks...');

      await this.client.publish([this.localAudioTrack, this.localVideoTrack]);
      
      this.state.isPublishing = true;
      this.notifyStateChange();

      console.log('✅ Local tracks published successfully');
    } catch (error) {
      console.error('❌ Failed to publish local tracks:', error);
      this.handleError(error as Error);
      throw error;
    }
  }

  /**
   * Leave the channel and cleanup
   */
  public async leaveChannel(): Promise<void> {
    try {
      console.log('👋 Leaving channel...');

      // Stop and close local tracks
      if (this.localAudioTrack) {
        this.localAudioTrack.stop();
        this.localAudioTrack.close();
        this.localAudioTrack = null;
      }

      if (this.localVideoTrack) {
        this.localVideoTrack.stop();
        this.localVideoTrack.close();
        this.localVideoTrack = null;
      }

      // Leave the channel
      if (this.client && this.state.isJoined) {
        await this.client.leave();
      }

      // Reset state
      this.state = {
        isJoined: false,
        localAudioEnabled: true,
        localVideoEnabled: true,
        remoteUsers: [],
        networkQuality: null,
        isPublishing: false,
      };

      this.notifyStateChange();

      console.log('✅ Left channel successfully');
    } catch (error) {
      console.error('❌ Failed to leave channel:', error);
      this.handleError(error as Error);
      throw error;
    }
  }

  /**
   * Toggle microphone on/off
   */
  public async toggleMicrophone(enabled?: boolean): Promise<boolean> {
    try {
      const newState = enabled !== undefined ? enabled : !this.state.localAudioEnabled;
      
      if (this.localAudioTrack) {
        await this.localAudioTrack.setEnabled(newState);
        this.state.localAudioEnabled = newState;
        this.notifyStateChange();
        
        console.log(`🎤 Microphone ${newState ? 'enabled' : 'disabled'}`);
      }

      return newState;
    } catch (error) {
      console.error('❌ Failed to toggle microphone:', error);
      this.handleError(error as Error);
      throw error;
    }
  }

  /**
   * Toggle camera on/off
   */
  public async toggleCamera(enabled?: boolean): Promise<boolean> {
    try {
      const newState = enabled !== undefined ? enabled : !this.state.localVideoEnabled;
      
      if (this.localVideoTrack) {
        await this.localVideoTrack.setEnabled(newState);
        this.state.localVideoEnabled = newState;
        this.notifyStateChange();
        
        console.log(`📹 Camera ${newState ? 'enabled' : 'disabled'}`);
      }

      return newState;
    } catch (error) {
      console.error('❌ Failed to toggle camera:', error);
      this.handleError(error as Error);
      throw error;
    }
  }

  /**
   * Get local video track for rendering
   */
  public getLocalVideoTrack(): ICameraVideoTrack | null {
    return this.localVideoTrack;
  }

  /**
   * Get local audio track
   */
  public getLocalAudioTrack(): IMicrophoneAudioTrack | null {
    return this.localAudioTrack;
  }

  /**
   * Get remote user by UID
   */
  public getRemoteUser(uid: UID): RemoteUser | undefined {
    return this.state.remoteUsers.find(user => user.uid === uid);
  }

  /**
   * Get all remote users
   */
  public getRemoteUsers(): RemoteUser[] {
    return this.state.remoteUsers;
  }

  /**
   * Get current state
   */
  public getState(): VideoCallState {
    return { ...this.state };
  }

  /**
   * Register state change callback
   */
  public onStateChange(callback: (state: VideoCallState) => void): void {
    this.onStateChangeCallback = callback;
  }

  /**
   * Register remote user joined callback
   */
  public onRemoteUserJoined(callback: (user: RemoteUser) => void): void {
    this.onRemoteUserJoinedCallback = callback;
  }

  /**
   * Register remote user left callback
   */
  public onRemoteUserLeft(callback: (uid: UID) => void): void {
    this.onRemoteUserLeftCallback = callback;
  }

  /**
   * Register volume indicator callback (for speaker detection)
   */
  public onVolumeIndicator(callback: (volumes: { uid: UID; level: number }[]) => void): void {
    this.onVolumeIndicatorCallback = callback;
  }

  /**
   * Register error callback
   */
  public onError(callback: (error: Error) => void): void {
    this.onErrorCallback = callback;
  }

  /**
   * Update remote user state
   */
  private updateRemoteUser(user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video', published: boolean): void {
    const index = this.state.remoteUsers.findIndex(u => u.uid === user.uid);
    
    if (index !== -1) {
      if (mediaType === 'audio') {
        this.state.remoteUsers[index].hasAudio = published;
        this.state.remoteUsers[index].audioTrack = published ? user.audioTrack : undefined;
      } else {
        this.state.remoteUsers[index].hasVideo = published;
        this.state.remoteUsers[index].videoTrack = published ? user.videoTrack : undefined;
      }
    } else if (published) {
      // User not in list yet, add them
      this.addRemoteUser(user);
    }

    this.notifyStateChange();
  }

  /**
   * Add remote user to list
   */
  private addRemoteUser(user: IAgoraRTCRemoteUser): void {
    const exists = this.state.remoteUsers.find(u => u.uid === user.uid);
    
    if (!exists) {
      const remoteUser: RemoteUser = {
        uid: user.uid,
        hasAudio: user.hasAudio,
        hasVideo: user.hasVideo,
        audioTrack: user.audioTrack,
        videoTrack: user.videoTrack,
      };

      this.state.remoteUsers.push(remoteUser);
      this.notifyStateChange();

      if (this.onRemoteUserJoinedCallback) {
        this.onRemoteUserJoinedCallback(remoteUser);
      }
    }
  }

  /**
   * Remove remote user from list
   */
  private removeRemoteUser(uid: UID): void {
    this.state.remoteUsers = this.state.remoteUsers.filter(user => user.uid !== uid);
    this.notifyStateChange();
  }

  /**
   * Notify state change
   */
  private notifyStateChange(): void {
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback(this.getState());
    }
  }

  /**
   * Handle errors
   */
  private handleError(error: Error): void {
    if (this.onErrorCallback) {
      this.onErrorCallback(error);
    }
  }

  /**
   * Cleanup and destroy the service
   */
  public async destroy(): Promise<void> {
    try {
      await this.leaveChannel();
      this.client = null;
      console.log('✅ Video call service destroyed');
    } catch (error) {
      console.error('❌ Failed to destroy service:', error);
    }
  }
}

// Singleton instance
let videoCallServiceInstance: VideoCallService | null = null;

/**
 * Get or create video call service instance
 */
export function getVideoCallService(): VideoCallService {
  if (!videoCallServiceInstance) {
    videoCallServiceInstance = new VideoCallService();
  }
  return videoCallServiceInstance;
}

/**
 * Destroy video call service instance
 */
export async function destroyVideoCallService(): Promise<void> {
  if (videoCallServiceInstance) {
    await videoCallServiceInstance.destroy();
    videoCallServiceInstance = null;
  }
}

export default VideoCallService;

