import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { DollarSign, Heart, Sparkles, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TipIdeaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ideaProposer: string;
  ideaDescription: string;
  onTipSent?: (amount: number) => void;
}

const TIP_OPTIONS = [
  { amount: 2, label: '$2', description: 'Buy them a coffee ☕', emoji: '☕' },
  { amount: 10, label: '$10', description: 'Support their idea 🚀', emoji: '🚀' },
  { amount: 15, label: '$15', description: 'Become a believer 🌟', emoji: '🌟' }
];

export function TipIdeaDialog({
  open,
  onOpenChange,
  ideaProposer,
  ideaDescription,
  onTipSent
}: TipIdeaDialogProps) {
  const { toast } = useToast();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [tipSent, setTipSent] = useState(false);

  const handleTipSelect = (amount: number) => {
    setSelectedAmount(amount);
  };

  const handleSendTip = async () => {
    if (!selectedAmount) return;

    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setTipSent(true);

      toast({
        title: 'Tip sent successfully! 🎉',
        description: `You tipped ${ideaProposer} $${selectedAmount}`,
      });

      onTipSent?.(selectedAmount);

      // Close dialog after showing success
      setTimeout(() => {
        onOpenChange(false);
        setTipSent(false);
        setSelectedAmount(null);
      }, 1500);
    }, 1500);
  };

  const handleClose = () => {
    if (!isProcessing) {
      onOpenChange(false);
      setSelectedAmount(null);
      setTipSent(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-background via-primary/5 to-primary/10 border-2 border-primary/20">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <DialogTitle className="text-2xl">Tip the Creator</DialogTitle>
          </div>
          <DialogDescription className="text-base pt-2">
            Support <span className="font-semibold text-primary">{ideaProposer}</span> for this amazing idea
          </DialogDescription>
        </DialogHeader>

        {!tipSent ? (
          <>
            {/* Idea Preview */}
            <Card className="p-4 bg-background/50 border-primary/20">
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {ideaDescription}
              </p>
            </Card>

            {/* Tip Options */}
            <div className="space-y-3 py-4">
              {TIP_OPTIONS.map((option) => (
                <button
                  key={option.amount}
                  onClick={() => handleTipSelect(option.amount)}
                  disabled={isProcessing}
                  className={`
                    w-full p-4 rounded-lg border-2 transition-all duration-200
                    flex items-center justify-between
                    ${selectedAmount === option.amount
                      ? 'border-primary bg-primary/10 scale-[1.02] shadow-lg'
                      : 'border-border hover:border-primary/50 hover:bg-primary/5'
                    }
                    ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center text-2xl
                      ${selectedAmount === option.amount
                        ? 'bg-primary/20'
                        : 'bg-muted'
                      }
                    `}>
                      {option.emoji}
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-lg">{option.label}</p>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                  </div>
                  {selectedAmount === option.amount && (
                    <Check className="w-6 h-6 text-primary animate-in zoom-in" />
                  )}
                </button>
              ))}
            </div>

            {/* Payment Info */}
            <Card className="p-3 bg-primary/5 border-primary/20">
              <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-2">
                <Heart className="w-3 h-3 text-red-500" />
                100% of your tip goes directly to the creator
              </p>
            </Card>

            {/* Action Buttons */}
            <DialogFooter className="flex-row gap-2">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isProcessing}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendTip}
                disabled={!selectedAmount || isProcessing}
                className="flex-1 gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <DollarSign className="w-4 h-4" />
                    Send ${selectedAmount || 0}
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          // Success State
          <div className="py-8">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto animate-in zoom-in">
                <Check className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Tip Sent Successfully!</h3>
                <p className="text-muted-foreground">
                  Your ${selectedAmount} tip has been sent to {ideaProposer}
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="w-4 h-4 text-yellow-500" />
                <span>Thank you for supporting great ideas!</span>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

