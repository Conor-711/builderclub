import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Copy, Check, UserPlus, Lock, Share2, Mail, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InviteFriendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
}

export function InviteFriendDialog({
  open,
  onOpenChange,
  userName,
}: InviteFriendDialogProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  // Generate invite link (for demo purposes)
  const inviteLink = `https://builderclub.com/invite?ref=${encodeURIComponent(userName.toLowerCase().replace(' ', '-'))}-${Date.now().toString(36)}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast({
        title: 'Link copied!',
        description: 'Share this link with your friends',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Failed to copy',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent(`Join me on BuilderClub!`);
    const body = encodeURIComponent(
      `Hey!\n\nI'm using BuilderClub to connect with other builders and I think you'd love it too.\n\nJoin me here: ${inviteLink}\n\nLooking forward to connecting!`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(
      `Just found some amazing builders on @BuilderClub! Join me: ${inviteLink}`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-gradient-to-br from-background via-primary/5 to-primary/10 border-2 border-primary/20">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-full">
              <Lock className="w-5 h-5 text-primary" />
            </div>
            <DialogTitle className="text-2xl">Unlock Profile Details</DialogTitle>
          </div>
          <DialogDescription className="text-base pt-2">
            To view <span className="font-semibold text-primary">{userName}</span>'s full profile, 
            invite at least <span className="font-semibold text-foreground">1 friend</span> to join BuilderClub.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Why invite section */}
          <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
            <div className="flex items-start gap-3">
              <UserPlus className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <h4 className="font-semibold text-sm text-foreground">Why invite friends?</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  BuilderClub grows through trusted connections. By inviting friends, 
                  you help build a quality community of passionate builders.
                </p>
              </div>
            </div>
          </Card>

          {/* Invite link section */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Share2 className="w-4 h-4 text-primary" />
              Your Invite Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inviteLink}
                readOnly
                className="flex-1 px-3 py-2 text-sm bg-background border border-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono"
                onClick={(e) => e.currentTarget.select()}
              />
              <Button
                onClick={handleCopyLink}
                variant="outline"
                size="sm"
                className="px-4 border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2 text-green-500" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Quick share options */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-foreground">Quick Share</label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleShareEmail}
                variant="outline"
                className="gap-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all"
              >
                <Mail className="w-4 h-4" />
                Email
              </Button>
              <Button
                onClick={handleShareTwitter}
                variant="outline"
                className="gap-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                Twitter
              </Button>
            </div>
          </div>

          {/* Progress hint */}
          <Card className="p-3 bg-background/50 border-dashed border-primary/30">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Invites sent</span>
              <span className="font-semibold text-foreground">
                <span className="text-primary text-base">0</span> / 1
              </span>
            </div>
            <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-primary/60 w-0 transition-all duration-500" />
            </div>
          </Card>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="flex-1"
          >
            Maybe Later
          </Button>
          <Button
            onClick={handleCopyLink}
            className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            Copy & Share
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

