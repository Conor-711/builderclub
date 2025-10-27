/**
 * Question Module Component
 * Collects user answers via voice or text input for user profiling
 */

import { useState, useEffect } from 'react';
import { Mic, Keyboard, Send, AlertCircle, Info } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

export interface QuestionModuleProps {
  question: string;                              // Question text
  onAnswerSubmit: (answer: string, inputMethod: 'voice' | 'text') => void;  // Submit callback
  className?: string;                            // Additional CSS classes
}

export function QuestionModule({ 
  question, 
  onAnswerSubmit,
  className = '',
}: QuestionModuleProps) {
  // Input mode state
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');
  const [textAnswer, setTextAnswer] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showPermissionGuide, setShowPermissionGuide] = useState(false);

  // Voice recognition hook
  const {
    isListening,
    transcript,
    interimTranscript,
    error: speechError,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    lang: 'zh-CN',
    onError: (error) => {
      console.error('Speech recognition error:', error);
      // Show permission guide if permission error
      if (error.includes('权限')) {
        setShowPermissionGuide(true);
      }
    },
  });

  // Auto-switch to text mode if speech is not supported
  useEffect(() => {
    if (!isSupported && inputMode === 'voice') {
      setInputMode('text');
    }
  }, [isSupported, inputMode]);

  // Combined answer text (for voice mode)
  const fullTranscript = transcript + (interimTranscript ? ' ' + interimTranscript : '');

  /**
   * Handle microphone button click
   */
  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  /**
   * Handle submit answer
   */
  const handleSubmit = () => {
    const answer = inputMode === 'voice' ? transcript : textAnswer;
    
    if (!answer.trim()) {
      return;
    }

    onAnswerSubmit(answer.trim(), inputMode);
    setHasSubmitted(true);

    // Reset after submission
    if (inputMode === 'voice') {
      resetTranscript();
    } else {
      setTextAnswer('');
    }
  };

  /**
   * Switch input mode
   */
  const switchToTextMode = () => {
    if (isListening) {
      stopListening();
    }
    setInputMode('text');
  };

  const switchToVoiceMode = () => {
    if (isSupported) {
      setInputMode('voice');
      resetTranscript();
    }
  };

  return (
    <div className={`w-full max-w-2xl space-y-6 ${className}`}>
      {/* Question Text */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
        <h3 className="text-white text-xl font-semibold text-center">
          {question}
        </h3>
      </div>

      {/* Browser Not Supported Warning */}
      {!isSupported && inputMode === 'voice' && (
        <Alert className="bg-yellow-500/10 border-yellow-500/20">
          <Info className="h-4 w-4 text-yellow-300" />
          <AlertDescription className="text-yellow-200">
            您的浏览器不支持语音识别功能。已自动切换到文字输入模式。
            <br />
            <span className="text-xs text-yellow-300/80">
              建议使用最新版 Chrome 或 Edge 浏览器以获得最佳体验
            </span>
          </AlertDescription>
        </Alert>
      )}

      {/* Permission Guide */}
      {showPermissionGuide && (
        <Alert className="bg-blue-500/10 border-blue-500/20">
          <AlertCircle className="h-4 w-4 text-blue-300" />
          <AlertDescription className="text-blue-200">
            <p className="font-medium mb-2">如何授权麦克风权限？</p>
            <ol className="text-xs space-y-1 list-decimal list-inside text-blue-200/80">
              <li>点击地址栏旁边的锁形图标或麦克风图标</li>
              <li>找到"麦克风"设置</li>
              <li>将权限改为"允许"</li>
              <li>刷新页面</li>
            </ol>
            <Button
              onClick={() => {
                setShowPermissionGuide(false);
                switchToTextMode();
              }}
              variant="outline"
              size="sm"
              className="mt-3 bg-blue-500/20 border-blue-400/30 text-blue-200 hover:bg-blue-500/30"
            >
              改用文字输入
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Voice Input Mode */}
      {inputMode === 'voice' && (
        <div className="relative bg-white/5 backdrop-blur-md border border-white/20 rounded-lg p-6 sm:p-8 transition-all duration-300">
          {/* Mode Switch Button - Top Right */}
          <Button
            onClick={switchToTextMode}
            variant="ghost"
            size="sm"
            className="absolute top-3 right-3 sm:top-4 sm:right-4 text-white/70 hover:text-white hover:bg-white/10 transition-colors duration-200"
          >
            <Keyboard className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            <span className="text-xs">打字输入</span>
          </Button>

          {/* Microphone Button - Large, Centered */}
          <div className="flex flex-col items-center gap-4 sm:gap-6">
            <button
              onClick={handleMicClick}
              disabled={!isSupported}
              className={`
                relative w-24 h-24 sm:w-32 sm:h-32 rounded-full flex items-center justify-center
                transition-all duration-300 transform
                ${isListening 
                  ? 'bg-red-500 scale-110 animate-pulse-subtle shadow-lg shadow-red-500/50' 
                  : speechError
                  ? 'bg-yellow-500/80 hover:bg-yellow-500 active:scale-95'
                  : 'bg-white/20 hover:bg-white/30 hover:scale-105 active:scale-95'
                }
                ${!isSupported ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                focus:outline-none focus:ring-2 focus:ring-white/50
              `}
              aria-label={isListening ? '停止录音' : '开始录音'}
            >
              <Mic className={`w-12 h-12 sm:w-16 sm:h-16 ${isListening ? 'text-white' : 'text-white/90'} transition-all duration-200`} />
              
              {/* Recording indicator pulse rings */}
              {isListening && (
                <>
                  <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-20" />
                  <span className="absolute inset-0 rounded-full bg-red-500 animate-pulse opacity-30" />
                </>
              )}
            </button>

            {/* Status Text */}
            <div className="text-center min-h-[24px]">
              {isListening ? (
                <p className="text-white text-sm font-medium">🎤 正在聆听...</p>
              ) : speechError ? (
                <div className="space-y-2">
                  <p className="text-yellow-300 text-sm">{speechError}</p>
                  {speechError.includes('权限') && (
                    <Button
                      onClick={() => switchToTextMode()}
                      variant="ghost"
                      size="sm"
                      className="text-white/70 hover:text-white text-xs"
                    >
                      切换到文字输入
                    </Button>
                  )}
                </div>
              ) : !isSupported ? (
                <p className="text-white/60 text-sm">浏览器不支持语音识别</p>
              ) : (
                <p className="text-white/60 text-sm">点击麦克风开始说话</p>
              )}
            </div>

            {/* Transcript Display */}
            {(fullTranscript || hasSubmitted) && (
              <div className="w-full mt-4 p-4 bg-white/10 rounded-lg border border-white/20 min-h-[80px] animate-fade-in">
                {hasSubmitted ? (
                  <p className="text-green-300 text-center text-sm font-medium">✓ 答案已提交</p>
                ) : (
                  <p className="text-white text-sm sm:text-base leading-relaxed break-words">
                    {transcript && <span className="text-white">{transcript}</span>}
                    {interimTranscript && (
                      <span className="text-white/50 italic animate-pulse"> {interimTranscript}</span>
                    )}
                  </p>
                )}
              </div>
            )}

            {/* Submit Button */}
            {transcript && !hasSubmitted && (
              <Button
                onClick={handleSubmit}
                className="w-full mt-2 bg-primary hover:bg-primary/90 transition-all duration-200 active:scale-95 animate-fade-in"
                size="lg"
              >
                <Send className="w-4 h-4 mr-2" />
                提交答案
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Text Input Mode */}
      {inputMode === 'text' && (
        <div className="relative bg-white/5 backdrop-blur-md border border-white/20 rounded-lg p-6 sm:p-8 transition-all duration-300 animate-fade-in">
          {/* Mode Switch Button - Top Right */}
          {isSupported && (
            <Button
              onClick={switchToVoiceMode}
              variant="ghost"
              size="sm"
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-white/70 hover:text-white hover:bg-white/10 transition-colors duration-200"
            >
              <Mic className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="text-xs">语音输入</span>
            </Button>
          )}

          {/* Text Input Area */}
          <div className="space-y-4">
            <Textarea
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              placeholder="请输入您的答案..."
              className="w-full min-h-[120px] sm:min-h-[140px] bg-white/10 border-white/20 text-white placeholder:text-white/40 resize-none focus:ring-2 focus:ring-primary/50 transition-all duration-200"
              disabled={hasSubmitted}
              autoFocus
            />

            {hasSubmitted ? (
              <p className="text-green-300 text-center text-sm font-medium">✓ 答案已提交</p>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!textAnswer.trim()}
                className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95"
                size="lg"
              >
                <Send className="w-4 h-4 mr-2" />
                提交答案
              </Button>
            )}
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse-subtle {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.85;
          }
        }

        .animate-pulse-subtle {
          animation: pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }

        /* Smooth transition for mode switching */
        [data-mode-transition] {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
}

export default QuestionModule;

