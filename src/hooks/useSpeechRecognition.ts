/**
 * Custom React Hook for Web Speech Recognition API
 * Provides voice-to-text functionality with browser compatibility handling
 */

import { useState, useEffect, useRef, useCallback } from 'react';

// Extend Window interface for browser compatibility
interface IWindow extends Window {
  SpeechRecognition?: typeof SpeechRecognition;
  webkitSpeechRecognition?: typeof SpeechRecognition;
}

export interface UseSpeechRecognitionOptions {
  lang?: string;              // Language code (default: 'zh-CN')
  continuous?: boolean;       // Continuous recognition (default: false)
  interimResults?: boolean;   // Return interim results (default: true)
  maxAlternatives?: number;   // Max number of alternatives (default: 1)
  onError?: (error: string) => void;  // Error callback
}

export interface UseSpeechRecognitionResult {
  isListening: boolean;          // Whether currently listening
  transcript: string;            // Final transcript
  interimTranscript: string;     // Temporary transcript
  error: string | null;          // Error message
  isSupported: boolean;          // Browser support status
  startListening: () => void;    // Start recognition
  stopListening: () => void;     // Stop recognition
  resetTranscript: () => void;   // Reset transcript
}

/**
 * Custom hook for speech recognition
 */
export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions = {}
): UseSpeechRecognitionResult {
  const {
    lang = 'zh-CN',
    continuous = false,
    interimResults = true,
    maxAlternatives = 1,
    onError,
  } = options;

  // Check browser support
  const isBrowser = typeof window !== 'undefined';
  const SpeechRecognition = isBrowser
    ? (window as IWindow).SpeechRecognition || (window as IWindow).webkitSpeechRecognition
    : null;
  const isSupported = !!SpeechRecognition;

  // State
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Refs
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const interimDebounceRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Initialize speech recognition instance
   */
  useEffect(() => {
    if (!isSupported) {
      return;
    }

    // Create recognition instance
    const recognition = new SpeechRecognition!();
    recognition.lang = lang;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.maxAlternatives = maxAlternatives;

    // Event: Recognition starts
    recognition.onstart = () => {
      console.log('🎤 Speech recognition started');
      setIsListening(true);
      setError(null);
    };

    // Event: Recognition results
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let tempInterimTranscript = '';

      // Process results
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcriptText = result[0].transcript;

        if (result.isFinal) {
          finalTranscript += transcriptText;
        } else {
          tempInterimTranscript += transcriptText;
        }
      }

      // Update state
      if (finalTranscript) {
        setTranscript((prev) => prev + finalTranscript);
        setInterimTranscript('');
        console.log('✅ Final transcript:', finalTranscript);
        
        // Clear any pending interim debounce
        if (interimDebounceRef.current) {
          clearTimeout(interimDebounceRef.current);
          interimDebounceRef.current = null;
        }
      } else {
        // Debounce interim results to avoid too frequent updates
        if (interimDebounceRef.current) {
          clearTimeout(interimDebounceRef.current);
        }
        
        interimDebounceRef.current = setTimeout(() => {
          setInterimTranscript(tempInterimTranscript);
        }, 100); // 100ms debounce
      }
    };

    // Event: Recognition error
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('❌ Speech recognition error:', event.error);
      
      let errorMessage = '';
      
      switch (event.error) {
        case 'no-speech':
          errorMessage = '未检测到语音，请重试';
          break;
        case 'audio-capture':
          errorMessage = '无法访问麦克风，请检查设备';
          break;
        case 'not-allowed':
          errorMessage = '麦克风权限被拒绝，请在浏览器设置中允许权限';
          break;
        case 'network':
          errorMessage = '网络错误，请检查网络连接';
          break;
        case 'aborted':
          errorMessage = '语音识别已中止';
          break;
        case 'service-not-allowed':
          errorMessage = '语音识别服务不可用';
          break;
        default:
          errorMessage = `语音识别错误: ${event.error}`;
      }

      setError(errorMessage);
      setIsListening(false);
      
      if (onError) {
        onError(errorMessage);
      }
    };

    // Event: Recognition ends
    recognition.onend = () => {
      console.log('🛑 Speech recognition ended');
      setIsListening(false);
      setInterimTranscript('');
      
      // Clear timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    // Event: Speech start detected
    recognition.onspeechstart = () => {
      console.log('🗣️ Speech detected');
    };

    // Event: Speech end detected
    recognition.onspeechend = () => {
      console.log('🔇 Speech ended');
    };

    recognitionRef.current = recognition;

    // Cleanup
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (err) {
          // Ignore errors during cleanup
        }
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (interimDebounceRef.current) {
        clearTimeout(interimDebounceRef.current);
      }
    };
  }, [isSupported, lang, continuous, interimResults, maxAlternatives, onError]);

  /**
   * Start listening
   */
  const startListening = useCallback(() => {
    if (!isSupported) {
      const errorMsg = '您的浏览器不支持语音识别，请使用最新版 Chrome 或 Edge';
      setError(errorMsg);
      if (onError) {
        onError(errorMsg);
      }
      return;
    }

    if (isListening) {
      console.warn('⚠️ Already listening');
      return;
    }

    try {
      recognitionRef.current?.start();
      
      // Set 10-second timeout
      timeoutRef.current = setTimeout(() => {
        console.log('⏱️ Recognition timeout (10s)');
        stopListening();
      }, 10000);
    } catch (err: any) {
      console.error('Failed to start recognition:', err);
      setError('启动语音识别失败');
      if (onError) {
        onError('启动语音识别失败');
      }
    }
  }, [isSupported, isListening, onError]);

  /**
   * Stop listening
   */
  const stopListening = useCallback(() => {
    if (!isListening) {
      return;
    }

    try {
      recognitionRef.current?.stop();
      
      // Clear timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    } catch (err: any) {
      console.error('Failed to stop recognition:', err);
    }
  }, [isListening]);

  /**
   * Reset transcript
   */
  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setError(null);
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  };
}

export default useSpeechRecognition;

