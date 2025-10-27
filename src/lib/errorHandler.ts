/**
 * Error Handler for Video Call
 * Provides user-friendly error messages and handling strategies
 */

export enum VideoCallErrorType {
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  DEVICE_NOT_FOUND = 'DEVICE_NOT_FOUND',
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_PARAMS = 'INVALID_PARAMS',
  CHANNEL_JOIN_FAILED = 'CHANNEL_JOIN_FAILED',
  TRACK_CREATION_FAILED = 'TRACK_CREATION_FAILED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface VideoCallError {
  type: VideoCallErrorType;
  message: string;
  originalError?: Error;
  userMessage: string;
  suggestions: string[];
}

/**
 * Parse Agora error and return user-friendly error info
 */
export function parseAgoraError(error: any): VideoCallError {
  const errorMessage = error?.message || error?.toString() || 'Unknown error';
  const errorCode = error?.code;

  // Permission denied errors
  if (
    errorMessage.includes('NotAllowedError') ||
    errorMessage.includes('Permission denied') ||
    errorCode === 'PERMISSION_DENIED'
  ) {
    return {
      type: VideoCallErrorType.PERMISSION_DENIED,
      message: errorMessage,
      originalError: error,
      userMessage: '无法访问麦克风或摄像头',
      suggestions: [
        '请检查浏览器权限设置，允许网站访问麦克风和摄像头',
        '确保没有其他应用正在使用摄像头或麦克风',
        '尝试刷新页面并重新授权',
      ],
    };
  }

  // Device not found errors
  if (
    errorMessage.includes('NotFoundError') ||
    errorMessage.includes('DevicesNotFoundError') ||
    errorMessage.includes('No device found')
  ) {
    return {
      type: VideoCallErrorType.DEVICE_NOT_FOUND,
      message: errorMessage,
      originalError: error,
      userMessage: '未找到麦克风或摄像头设备',
      suggestions: [
        '请确保您的设备已连接麦克风和摄像头',
        '检查设备驱动是否正常',
        '尝试重新连接设备',
      ],
    };
  }

  // Network errors
  if (
    errorMessage.includes('Network') ||
    errorMessage.includes('timeout') ||
    errorMessage.includes('connection') ||
    errorCode === 'NETWORK_ERROR'
  ) {
    return {
      type: VideoCallErrorType.NETWORK_ERROR,
      message: errorMessage,
      originalError: error,
      userMessage: '网络连接出现问题',
      suggestions: [
        '请检查您的网络连接',
        '尝试切换到更稳定的网络',
        '关闭VPN或代理后重试',
      ],
    };
  }

  // Invalid parameters
  if (
    errorMessage.includes('Invalid') ||
    errorMessage.includes('INVALID_PARAMS') ||
    errorCode === 'INVALID_PARAMS'
  ) {
    return {
      type: VideoCallErrorType.INVALID_PARAMS,
      message: errorMessage,
      originalError: error,
      userMessage: '会议参数配置错误',
      suggestions: [
        '请联系技术支持',
        '尝试重新进入会议',
      ],
    };
  }

  // Channel join failed
  if (
    errorMessage.includes('join') ||
    errorMessage.includes('channel') ||
    errorCode === 'CAN_NOT_GET_GATEWAY_SERVER'
  ) {
    return {
      type: VideoCallErrorType.CHANNEL_JOIN_FAILED,
      message: errorMessage,
      originalError: error,
      userMessage: '无法加入会议',
      suggestions: [
        '请检查网络连接',
        '确认会议链接是否正确',
        '稍后重试',
      ],
    };
  }

  // Track creation failed
  if (errorMessage.includes('track') || errorMessage.includes('create')) {
    return {
      type: VideoCallErrorType.TRACK_CREATION_FAILED,
      message: errorMessage,
      originalError: error,
      userMessage: '无法初始化音视频设备',
      suggestions: [
        '请检查设备权限',
        '确保设备未被其他应用占用',
        '重启浏览器后重试',
      ],
    };
  }

  // Unknown error
  return {
    type: VideoCallErrorType.UNKNOWN_ERROR,
    message: errorMessage,
    originalError: error,
    userMessage: '发生未知错误',
    suggestions: [
      '请刷新页面重试',
      '如问题持续，请联系技术支持',
    ],
  };
}

/**
 * Get user-friendly error message
 */
export function getUserErrorMessage(error: any): string {
  const parsedError = parseAgoraError(error);
  return parsedError.userMessage;
}

/**
 * Get error suggestions
 */
export function getErrorSuggestions(error: any): string[] {
  const parsedError = parseAgoraError(error);
  return parsedError.suggestions;
}

/**
 * Check if error is recoverable
 */
export function isRecoverableError(error: any): boolean {
  const parsedError = parseAgoraError(error);
  
  // Network errors and channel join failures are typically recoverable
  return (
    parsedError.type === VideoCallErrorType.NETWORK_ERROR ||
    parsedError.type === VideoCallErrorType.CHANNEL_JOIN_FAILED
  );
}

/**
 * Log error with context
 */
export function logError(context: string, error: any): void {
  const parsedError = parseAgoraError(error);
  
  console.error(`[${context}]`, {
    type: parsedError.type,
    message: parsedError.message,
    userMessage: parsedError.userMessage,
    suggestions: parsedError.suggestions,
    originalError: parsedError.originalError,
  });
}

