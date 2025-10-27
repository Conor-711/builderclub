/**
 * Video Player Component
 * Renders local or remote video tracks
 */

import { useEffect, useRef } from 'react';
import { ICameraVideoTrack, IRemoteVideoTrack } from 'agora-rtc-sdk-ng';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';

interface VideoPlayerProps {
  videoTrack?: ICameraVideoTrack | IRemoteVideoTrack | null;
  audioTrack?: any;
  userName: string;
  userAvatar?: string;
  isLocal?: boolean;
  isSpeaking?: boolean;
  isVideoEnabled?: boolean;
  className?: string;
}

export function VideoPlayer({
  videoTrack,
  audioTrack,
  userName,
  userAvatar,
  isLocal = false,
  isSpeaking = false,
  isVideoEnabled = true,
  className = '',
}: VideoPlayerProps) {
  const videoContainerRef = useRef<HTMLDivElement>(null);

  // Play video track
  useEffect(() => {
    if (!videoContainerRef.current) return;

    if (videoTrack && isVideoEnabled) {
      // Play video track in the container
      videoTrack.play(videoContainerRef.current);
      
      return () => {
        // Stop playing when component unmounts or track changes
        videoTrack.stop();
      };
    }
  }, [videoTrack, isVideoEnabled]);

  // Play audio track (only for remote users)
  useEffect(() => {
    if (!isLocal && audioTrack) {
      audioTrack.play();
      
      return () => {
        audioTrack.stop();
      };
    }
  }, [audioTrack, isLocal]);

  return (
    <div
      className={`relative aspect-[4/3] bg-gray-800 rounded-xl overflow-hidden transition-all duration-300 ${
        isSpeaking
          ? 'ring-4 ring-primary shadow-2xl shadow-primary/50 scale-105'
          : 'ring-2 ring-gray-700'
      } ${className}`}
    >
      {/* Video container */}
      <div
        ref={videoContainerRef}
        className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-800 to-gray-900"
        style={{ objectFit: 'cover' }}
      >
        {/* Show avatar when video is off */}
        {(!videoTrack || !isVideoEnabled) && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Avatar className="w-32 h-32 border-4 border-gray-700">
              <AvatarImage src={userAvatar} />
              <AvatarFallback className="text-4xl font-bold bg-gray-700">
                {userName[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        )}
      </div>

      {/* User name label */}
      <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-black/70 backdrop-blur-sm rounded-lg">
        <span className="text-white text-sm font-semibold">
          {userName} {isLocal && '(You)'}
        </span>
      </div>

      {/* Speaking indicator */}
      {isSpeaking && (
        <div className="absolute top-4 right-4">
          <div className="flex gap-1 items-end">
            <div className="w-1 h-3 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
            <div className="w-1 h-5 bg-primary rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
            <div className="w-1 h-4 bg-primary rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      )}

      {/* Video off indicator */}
      {!isVideoEnabled && (
        <div className="absolute top-4 left-4 px-2 py-1 bg-red-500/80 backdrop-blur-sm rounded text-xs text-white font-medium">
          Camera Off
        </div>
      )}

      {/* Local indicator */}
      {isLocal && (
        <div className="absolute top-4 left-4 px-2 py-1 bg-blue-500/80 backdrop-blur-sm rounded text-xs text-white font-medium">
          You
        </div>
      )}
    </div>
  );
}

export default VideoPlayer;

