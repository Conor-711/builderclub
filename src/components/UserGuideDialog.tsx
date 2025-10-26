import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Calendar,
  Users,
  Video,
  Sparkles
} from 'lucide-react';

interface GuideStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  content: string;
  tip?: string;
}

interface UserGuideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

// 默认引导步骤 - 可以后续替换为实际内容
const DEFAULT_GUIDE_STEPS: GuideStep[] = [
  {
    title: 'Welcome to BuilderClub',
    description: 'Let us show you how to connect with amazing builders',
    icon: <Sparkles className="w-8 h-8 text-primary" />,
    content: 'BuilderClub helps you meet and collaborate with other passionate builders. Follow this quick guide to get started!',
    tip: 'This guide will take about 1 minute'
  },
  {
    title: 'Select Your Available Time',
    description: 'Choose when you\'re free to meet',
    icon: <Calendar className="w-8 h-8 text-primary" />,
    content: 'Use the week calendar to select a date, then choose a time period (Morning, Noon, Afternoon, or Evening). We\'ll help you find the perfect time slot.',
    tip: 'You can select up to 5 time slots'
  },
  {
    title: 'Get Matched with Builders',
    description: 'We find the best matches for you',
    icon: <Users className="w-8 h-8 text-primary" />,
    content: 'After you save your time slots, we\'ll automatically match you with other builders who share similar interests and availability.',
    tip: 'Matches are based on your profile and goals'
  },
  {
    title: 'Join Your Meeting',
    description: 'Connect and collaborate',
    icon: <Video className="w-8 h-8 text-primary" />,
    content: 'When a match is found, you\'ll see your scheduled meeting in the "Confirmed Meetings" panel. Click "Join Meeting" when it\'s time to connect!',
    tip: 'You\'ll receive email notifications too'
  }
];

export function UserGuideDialog({
  open,
  onOpenChange,
  onComplete,
}: UserGuideDialogProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showContent, setShowContent] = useState(false);
  
  const steps = DEFAULT_GUIDE_STEPS;
  const totalSteps = steps.length;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;
  const currentStepData = steps[currentStep];

  // Trigger content animation when step changes
  useEffect(() => {
    if (open) {
      setShowContent(false);
      const timer = setTimeout(() => setShowContent(true), 100);
      return () => clearTimeout(timer);
    }
  }, [open, currentStep]);

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    setCurrentStep(0);
    onComplete?.();
    onOpenChange(false);
  };

  const handleSkip = () => {
    setCurrentStep(0);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-gradient-to-br from-background via-primary/5 to-primary/10 border-2 border-primary/20">
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        <DialogHeader>
          <div className={`transition-all duration-500 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full animate-pulse">
                {currentStepData.icon}
              </div>
            </div>
            
            {/* Title */}
            <DialogTitle className="text-2xl text-center bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {currentStepData.title}
            </DialogTitle>
            
            {/* Description */}
            <p className="text-center text-muted-foreground mt-2">
              {currentStepData.description}
            </p>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className={`py-6 transition-all duration-700 delay-100 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <Card className="p-6 bg-gradient-to-br from-background to-primary/5 border-primary/30">
            <p className="text-base leading-relaxed text-foreground">
              {currentStepData.content}
            </p>
            
            {currentStepData.tip && (
              <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-sm text-primary font-medium flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Tip: {currentStepData.tip}
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Progress indicators */}
        <div className="flex justify-center gap-2 mb-4">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentStep
                  ? 'w-8 bg-primary'
                  : index < currentStep
                  ? 'w-2 bg-primary/50'
                  : 'w-2 bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Footer with navigation */}
        <DialogFooter className={`flex-row justify-between items-center transition-all duration-700 delay-200 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-muted-foreground hover:text-foreground"
            >
              Skip
            </Button>
          </div>

          <div className="flex gap-2">
            {!isFirstStep && (
              <Button
                variant="outline"
                onClick={handlePrevious}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
            )}
            
            {!isLastStep ? (
              <Button
                onClick={handleNext}
                className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                Get Started
                <Sparkles className="w-4 h-4" />
              </Button>
            )}
          </div>
        </DialogFooter>

        {/* Step counter */}
        <div className="text-center text-sm text-muted-foreground">
          Step {currentStep + 1} of {totalSteps}
        </div>
      </DialogContent>
    </Dialog>
  );
}

