/**
 * Device Permission Check Component
 * Checks and requests camera/microphone permissions before joining meeting
 */

import { useState, useEffect } from 'react';
import { Camera, Mic, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Card } from './ui/card';

export interface DevicePermissionStatus {
  camera: 'checking' | 'granted' | 'denied' | 'unavailable';
  microphone: 'checking' | 'granted' | 'denied' | 'unavailable';
}

interface DevicePermissionCheckProps {
  onPermissionsReady: () => void;
  onPermissionsDenied: () => void;
}

export function DevicePermissionCheck({
  onPermissionsReady,
  onPermissionsDenied,
}: DevicePermissionCheckProps) {
  const [status, setStatus] = useState<DevicePermissionStatus>({
    camera: 'checking',
    microphone: 'checking',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('您的浏览器不支持音视频通话功能，请使用最新版 Chrome、Safari 或 Firefox');
        setStatus({
          camera: 'unavailable',
          microphone: 'unavailable',
        });
        onPermissionsDenied();
        return;
      }

      // Request permissions
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        // Permissions granted
        setStatus({
          camera: 'granted',
          microphone: 'granted',
        });

        // Stop tracks immediately (we'll create them again when joining)
        stream.getTracks().forEach(track => track.stop());

        // Notify parent
        onPermissionsReady();
      } catch (err: any) {
        console.error('Permission error:', err);
        
        if (err.name === 'NotAllowedError') {
          setStatus({
            camera: 'denied',
            microphone: 'denied',
          });
          setError('需要麦克风和摄像头权限才能加入会议');
          onPermissionsDenied();
        } else if (err.name === 'NotFoundError') {
          setStatus({
            camera: 'unavailable',
            microphone: 'unavailable',
          });
          setError('未找到麦克风或摄像头设备');
          onPermissionsDenied();
        } else {
          setStatus({
            camera: 'denied',
            microphone: 'denied',
          });
          setError(`权限检查失败: ${err.message}`);
          onPermissionsDenied();
        }
      }
    } catch (err: any) {
      console.error('Unexpected error:', err);
      setError('发生未知错误');
      onPermissionsDenied();
    }
  };

  const handleRetry = () => {
    setError(null);
    setStatus({
      camera: 'checking',
      microphone: 'checking',
    });
    checkPermissions();
  };

  const getStatusIcon = (deviceStatus: 'checking' | 'granted' | 'denied' | 'unavailable') => {
    switch (deviceStatus) {
      case 'checking':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'granted':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'denied':
      case 'unavailable':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusText = (deviceStatus: 'checking' | 'granted' | 'denied' | 'unavailable') => {
    switch (deviceStatus) {
      case 'checking':
        return '检查中...';
      case 'granted':
        return '已授权';
      case 'denied':
        return '权限被拒绝';
      case 'unavailable':
        return '设备不可用';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-6">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-white/20 p-6 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">设备权限检查</h2>
          <p className="text-white/70 text-sm">
            正在检查您的麦克风和摄像头权限...
          </p>
        </div>

        <div className="space-y-4">
          {/* Camera status */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center gap-3">
              <Camera className="w-6 h-6 text-white/70" />
              <div>
                <p className="text-white font-medium">摄像头</p>
                <p className="text-white/60 text-xs">{getStatusText(status.camera)}</p>
              </div>
            </div>
            {getStatusIcon(status.camera)}
          </div>

          {/* Microphone status */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center gap-3">
              <Mic className="w-6 h-6 text-white/70" />
              <div>
                <p className="text-white font-medium">麦克风</p>
                <p className="text-white/60 text-xs">{getStatusText(status.microphone)}</p>
              </div>
            </div>
            {getStatusIcon(status.microphone)}
          </div>
        </div>

        {/* Error alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Instructions */}
        {(status.camera === 'denied' || status.microphone === 'denied') && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <p className="text-blue-200 text-sm font-medium mb-2">如何授权权限？</p>
            <ol className="text-blue-200/80 text-xs space-y-1 list-decimal list-inside">
              <li>点击地址栏旁边的锁形图标或摄像头图标</li>
              <li>找到"摄像头"和"麦克风"设置</li>
              <li>将权限改为"允许"</li>
              <li>刷新页面</li>
            </ol>
          </div>
        )}

        {/* Retry button */}
        {error && (
          <Button
            onClick={handleRetry}
            className="w-full"
            variant="default"
          >
            重新检查
          </Button>
        )}
      </Card>
    </div>
  );
}

export default DevicePermissionCheck;

