import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { UID } from 'agora-rtc-sdk-ng';
import { ParticipantInfoCard, Participant } from '@/components/ParticipantInfoCard';
import { MatchingReasonsPanel, MatchingReason, Topic } from '@/components/MatchingReasonsPanel';
import { VideoPlayer } from '@/components/VideoPlayer';
import { DevicePermissionCheck } from '@/components/DevicePermissionCheck';
import { useAgoraRTC } from '@/hooks/useAgoraRTC';
import { generateChannelName } from '@/lib/agoraConfig';
import { parseAgoraError, isRecoverableError } from '@/lib/errorHandler';
import { Mic, MicOff, Video, VideoOff, PhoneOff, ArrowLeft, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const Meeting = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Stabilize channel name and user ID - only compute once on mount
  const [channelName] = useState(() => 
    searchParams.get('channel') || generateChannelName()
  );
  const [userId] = useState(() => 
    searchParams.get('userId') || `user_${Date.now()}`
  );
  
  // Agora RTC Hook
  const {
    isJoined,
    isInitialized,
    localAudioEnabled,
    localVideoEnabled,
    remoteUsers,
    error: rtcError,
    initialize,
    joinChannel,
    leaveChannel,
    toggleMicrophone,
    toggleCamera,
    service,
  } = useAgoraRTC({
    onError: (error) => {
      console.error('❌ RTC Error:', error);
      toast.error(`会议错误: ${error.message}`);
    },
    onRemoteUserJoined: (user) => {
      console.log('👋 Remote user joined:', user.uid);
      toast.success(`参与者 ${user.uid} 加入了会议`);
    },
    onRemoteUserLeft: (uid) => {
      console.log('👋 Remote user left:', uid);
      toast.info(`参与者 ${uid} 离开了会议`);
    },
  });

  // Speaker detection state
  const [activeSpeaker, setActiveSpeaker] = useState<UID | 'local' | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [permissionsDenied, setPermissionsDenied] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [parsedError, setParsedError] = useState<ReturnType<typeof parseAgoraError> | null>(null);

  // Mock participant data (for UI display)
  const participants: Participant[] = [
    {
      name: 'Amy',
      avatar: '/users/user1.jpg',
      goodAt: 'Product',
      city: 'SF',
      age: 22,
      idea: 'Build a tool that helps Twitter KOLs grow.',
      selfQualities: ['Sincere', 'Resilience', 'Optimism', 'Visionary', 'Creativity'],
      otherQualities: ['Sincere', 'Open-mindedness', 'Optimism', 'Generosity', 'Smart']
    },
    {
      name: 'Mike',
      avatar: '/users/user2.jpg',
      goodAt: 'Programming',
      city: 'New York',
      age: 23,
      idea: 'Don\'t have one.',
      selfQualities: ['Sincere', 'Resilience', 'Optimism', 'Visionary', 'Creativity'],
      otherQualities: ['Sincere', 'Open-mindedness', 'Optimism', 'Generosity', 'Smart']
    },
    {
      name: 'Amanda',
      avatar: '/users/user3.jpg',
      goodAt: 'Design',
      city: 'Shanghai',
      age: 21,
      idea: 'Build a travel guide app, but open to discussion and pivots.',
      selfQualities: ['Sincere', 'Resilience', 'Optimism', 'Visionary', 'Creativity'],
      otherQualities: ['Sincere', 'Open-mindedness', 'Optimism', 'Generosity', 'Smart']
    }
  ];

  // Matching reasons data
  const matchingReasons: MatchingReason[] = [
    {
      id: '1',
      reason: 'Amy\'s product expertise complements Mike\'s programming skills for platform development.',
      type: 'skill'
    },
    {
      id: '2',
      reason: 'All three share interest in building creator-focused tools and early-stage startups.',
      type: 'interest'
    },
    {
      id: '3',
      reason: 'Amanda\'s design abilities combined with Mike\'s backend knowledge creates a complete tech stack.',
      type: 'skill'
    },
    {
      id: '4',
      reason: 'Shared goal of launching a product that helps content creators grow their audience.',
      type: 'goal'
    },
    {
      id: '5',
      reason: 'Amy (SF) and Amanda (Shanghai) provide geographic diversity for global reach and connections.',
      type: 'location'
    }
  ];

  // Meeting topics
  const meetingTopics: Topic[] = [
    {
      id: '1',
      title: 'Creator Monetization',
      description: 'Strategies to help creators earn sustainable income'
    },
    {
      id: '2',
      title: 'Tech Stack & MVP',
      description: 'Discuss architecture and prioritize features'
    },
    {
      id: '3',
      title: 'Go-to-Market Plan',
      description: 'Launch strategy and early user acquisition'
    }
  ];

  // Track if we've already joined to prevent duplicate joins
  const hasJoinedRef = useRef(false);

  // Initialize and join channel after permissions granted
  useEffect(() => {
    if (!permissionsGranted || hasJoinedRef.current) return;

    const initAndJoin = async () => {
      try {
        setIsJoining(true);
        setParsedError(null);
        
        console.log('🎯 Initializing video call...');
        console.log('📍 Channel:', channelName);
        console.log('👤 User ID:', userId);

        // Initialize Agora
        if (!isInitialized) {
          await initialize();
        }

        // Join channel (without token for testing)
        await joinChannel({
          channelName,
          userId,
          // token: undefined, // Will add token generation later
        });

        hasJoinedRef.current = true;
        console.log('✅ Successfully joined the meeting!');
        toast.success('成功加入会议！');
      } catch (error) {
        console.error('❌ Failed to join meeting:', error);
        
        const parsed = parseAgoraError(error);
        setParsedError(parsed);
        
        toast.error(parsed.userMessage);

        // Auto-retry for recoverable errors (max 3 times)
        if (isRecoverableError(error) && retryCount < 3) {
          console.log(`🔄 Auto-retrying... (${retryCount + 1}/3)`);
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
            hasJoinedRef.current = false;
            setPermissionsGranted(false);
            setTimeout(() => setPermissionsGranted(true), 100);
          }, 3000);
        }
      } finally {
        setIsJoining(false);
      }
    };

    initAndJoin();

    // Cleanup on unmount
    return () => {
      hasJoinedRef.current = false;
      leaveChannel().catch(err => console.error('Failed to leave channel:', err));
    };
  }, [permissionsGranted, channelName, userId, retryCount]); // 移除函数依赖

  // Setup volume indicator for speaker detection
  useEffect(() => {
    if (!service) return;

    service.onVolumeIndicator((volumes) => {
      // Find the loudest speaker
      let maxVolume = 0;
      let loudestUid: UID | 'local' | null = null;

      volumes.forEach(({ uid, level }) => {
        if (level > maxVolume && level > 10) { // Threshold: 10
          maxVolume = level;
          loudestUid = uid === 0 ? 'local' : uid;
        }
      });

      setActiveSpeaker(loudestUid);
    });
  }, [service]);

  // Handle microphone toggle
  const handleToggleMicrophone = useCallback(async () => {
    try {
      await toggleMicrophone();
      toast.info(localAudioEnabled ? '麦克风已关闭' : '麦克风已开启');
    } catch (error) {
      console.error('Failed to toggle microphone:', error);
    }
  }, [toggleMicrophone, localAudioEnabled]);

  // Handle camera toggle
  const handleToggleCamera = useCallback(async () => {
    try {
      await toggleCamera();
      toast.info(localVideoEnabled ? '摄像头已关闭' : '摄像头已开启');
    } catch (error) {
      console.error('Failed to toggle camera:', error);
    }
  }, [toggleCamera, localVideoEnabled]);

  // Handle leaving the call
  const handleLeaveCall = useCallback(async () => {
    try {
      await leaveChannel();
      toast.success('已离开会议');
      navigate('/feedback');
    } catch (error) {
      console.error('Failed to leave call:', error);
      navigate('/feedback');
    }
  }, [leaveChannel, navigate]);

  // Handle manual retry
  const handleRetry = useCallback(() => {
    setRetryCount(0);
    setParsedError(null);
    setPermissionsGranted(false);
    setPermissionsDenied(false);
    // Trigger permission check again
    setTimeout(() => {
      window.location.reload();
    }, 100);
  }, []);

  // Get local video track
  const localVideoTrack = service?.getLocalVideoTrack();
  const localAudioTrack = service?.getLocalAudioTrack();

  // Show permission check screen if permissions not granted yet
  if (!permissionsGranted && !permissionsDenied) {
    return (
      <DevicePermissionCheck
        onPermissionsReady={() => setPermissionsGranted(true)}
        onPermissionsDenied={() => setPermissionsDenied(true)}
      />
    );
  }

  // Show error screen if permissions denied
  if (permissionsDenied) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 space-y-4">
          <div className="text-center space-y-2">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
            <h2 className="text-2xl font-bold text-white">无法加入会议</h2>
            <p className="text-white/70">需要摄像头和麦克风权限才能继续</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleRetry} className="flex-1" variant="default">
              <RefreshCw className="w-4 h-4 mr-2" />
              重试
            </Button>
            <Button onClick={() => navigate('/connections')} className="flex-1" variant="outline">
              返回
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col">
      {/* Error Alert */}
      {(rtcError || parsedError) && (
        <div className="p-4">
          <Alert variant="destructive" className="bg-red-500/10 border-red-500/50">
            <AlertCircle className="h-4 w-4" />
            <div className="flex-1 space-y-2">
              <div className="font-medium text-sm">
                {parsedError?.userMessage || rtcError?.message || '发生错误'}
              </div>
              {parsedError?.suggestions && parsedError.suggestions.length > 0 && (
                <ul className="text-xs space-y-1 mt-2 list-disc list-inside text-red-200/90">
                  {parsedError.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              )}
              {isRecoverableError(rtcError || parsedError?.originalError) && retryCount < 3 && (
                <div className="text-xs mt-2 text-red-200/80">
                  正在自动重试... ({retryCount + 1}/3)
                </div>
              )}
              {retryCount >= 3 && (
                <Button onClick={handleRetry} size="sm" variant="outline" className="mt-2">
                  <RefreshCw className="w-3 h-3 mr-1" />
                  手动重试
                </Button>
              )}
            </div>
          </Alert>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left side: Video area (70%) */}
        <div className="w-full lg:w-[70%] flex flex-col items-center justify-center p-6 overflow-y-auto">
          <div className="w-full max-w-6xl space-y-4">
            {/* Matching reasons panel */}
            <MatchingReasonsPanel 
              reasons={matchingReasons} 
              topics={meetingTopics}
              defaultCollapsed={false} 
            />

            {/* Loading state */}
            {isJoining && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-white text-lg">正在加入会议...</p>
                <p className="text-white/60 text-sm">请允许浏览器访问您的麦克风和摄像头</p>
              </div>
            )}

            {/* Video grid */}
            {isJoined && !isJoining && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                {/* Local user video */}
                <VideoPlayer
                  videoTrack={localVideoTrack}
                  audioTrack={localAudioTrack}
                  userName="You"
                  userAvatar="/users/user1.jpg"
                  isLocal={true}
                  isSpeaking={activeSpeaker === 'local'}
                  isVideoEnabled={localVideoEnabled}
                />

                {/* Remote users videos */}
                {remoteUsers.map((user, index) => (
                  <VideoPlayer
                    key={user.uid}
                    videoTrack={user.videoTrack}
                    audioTrack={user.audioTrack}
                    userName={`User ${user.uid}`}
                    userAvatar={participants[index + 1]?.avatar || '/users/user2.jpg'}
                    isLocal={false}
                    isSpeaking={activeSpeaker === user.uid}
                    isVideoEnabled={user.hasVideo}
                  />
                ))}

                {/* Placeholder for empty slots */}
                {Array.from({ length: Math.max(0, 2 - remoteUsers.length) }).map((_, index) => (
                  <div
                    key={`placeholder-${index}`}
                    className="relative aspect-[4/3] bg-gray-800/50 rounded-xl overflow-hidden border-2 border-dashed border-gray-700 flex items-center justify-center"
                  >
                    <div className="text-center">
                      <p className="text-white/40 text-sm">等待参与者加入...</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right side: Participant info cards (30%) */}
        <div className="hidden lg:block w-[30%] bg-white/10 backdrop-blur-md border-l border-white/10 overflow-y-auto">
          <div className="p-3 space-y-2">
            <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <div className="w-1 h-4 bg-primary rounded-full"></div>
              Participants ({1 + remoteUsers.length})
            </h2>
            {participants.slice(0, 1 + remoteUsers.length).map((participant, index) => (
              <ParticipantInfoCard key={index} participant={participant} />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom toolbar */}
      <div className="h-20 bg-black/80 backdrop-blur-md border-t border-gray-800 flex items-center justify-center">
        <div className="flex items-center gap-4">
          {/* Microphone button */}
          <button
            onClick={handleToggleMicrophone}
            disabled={!isJoined}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
              !localAudioEnabled
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
            title={localAudioEnabled ? 'Mute' : 'Unmute'}
          >
            {!localAudioEnabled ? (
              <MicOff className="w-5 h-5 text-white" />
            ) : (
              <Mic className="w-5 h-5 text-white" />
            )}
          </button>

          {/* Camera button */}
          <button
            onClick={handleToggleCamera}
            disabled={!isJoined}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
              !localVideoEnabled
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
            title={localVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
          >
            {!localVideoEnabled ? (
              <VideoOff className="w-5 h-5 text-white" />
            ) : (
              <Video className="w-5 h-5 text-white" />
            )}
          </button>

          {/* End call button */}
          <button
            onClick={handleLeaveCall}
            className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all duration-200 shadow-lg"
            title="End call"
          >
            <PhoneOff className="w-6 h-6 text-white" />
          </button>

          {/* Back button */}
          <button
            onClick={() => navigate('/connections')}
            className="w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-all duration-200"
            title="Back to Connections"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Connection info (dev only) */}
      {import.meta.env.DEV && (
        <div className="fixed bottom-24 right-4 bg-black/80 text-white text-xs p-2 rounded font-mono">
          <div>Channel: {channelName}</div>
          <div>User ID: {userId}</div>
          <div>Status: {isJoined ? '✅ Joined' : '⏳ Connecting...'}</div>
          <div>Remote Users: {remoteUsers.length}</div>
        </div>
      )}
    </div>
  );
};

export default Meeting;
