import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
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
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { MapPin, Sparkles, PartyPopper, Calendar, Clock } from 'lucide-react';
import type { DemoPartner } from '../pages/Connections';
import { InviteFriendDialog } from './InviteFriendDialog';

interface MatchSuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserName: string;
  partners: DemoPartner[];
  meetingDate: string;
  meetingTime: string;
  meetingId: string;
}

export function MatchSuccessDialog({
  open,
  onOpenChange,
  currentUserName,
  partners,
  meetingDate,
  meetingTime,
  meetingId,
}: MatchSuccessDialogProps) {
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<string>('');

  // Trigger content animation when dialog opens
  useEffect(() => {
    if (open) {
      setShowContent(false);
      const timer = setTimeout(() => setShowContent(true), 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleAvatarClick = (partnerName: string) => {
    setSelectedPartner(partnerName);
    setShowInviteDialog(true);
  };

  // Format date to get day of week (e.g., "Wednesday")
  const formatDayOfWeek = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  // Format time to 12-hour format with AM/PM (e.g., "2:00 PM")
  const formatTime12Hour = (timeString: string): string => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  const handleRoomLinkClick = () => {
    navigate('/meeting-loading', {
      state: {
        partners: partners,
        meetingTime: `${meetingDate} ${meetingTime}`
      }
    });
    onOpenChange(false);
  };

  if (partners.length < 2) return null;

  const partnerNames = partners.map(p => p.name.split(' ')[0]).join(' & ');
  const dayOfWeek = formatDayOfWeek(meetingDate);
  const formattedTime = formatTime12Hour(meetingTime);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-background via-primary/5 to-primary/10 border-2 border-primary/20">
        <DialogHeader>
          <div className={`flex items-center gap-3 transition-all duration-500 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            <div className="relative">
              <Sparkles className="w-6 h-6 text-primary animate-pulse" />
              <PartyPopper className="w-4 h-4 text-yellow-500 absolute -top-1 -right-1 animate-bounce" />
            </div>
            <DialogTitle className="text-2xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Introduction: {partnerNames}
            </DialogTitle>
          </div>
          <DialogDescription className={`text-base pt-4 leading-relaxed transition-all duration-700 delay-100 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 rounded-lg border border-primary/20">
              <span className="font-semibold text-foreground">{currentUserName}</span>, your BuilderClub matches are{' '}
              <span className="font-semibold text-primary">{partners[0].name}</span> and{' '}
              <span className="font-semibold text-primary">{partners[1].name}</span>, based in{' '}
              <span className="font-semibold text-foreground">San Francisco Bay</span>! 
              <br /><br />
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-foreground">{dayOfWeek}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-foreground">{formattedTime}</span>
                </div>
              </div>
              <div className="mt-3">
                Join at{' '}
                <button
                  onClick={handleRoomLinkClick}
                  className="inline-flex items-center gap-1 text-primary hover:text-primary/80 underline underline-offset-2 font-semibold transition-all hover:gap-2"
                >
                  the room we created here
                  <Sparkles className="w-3 h-3" />
                </button>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {partners.map((partner, index) => (
              <Card
                key={index}
                className={`
                  p-6 bg-gradient-to-br from-background to-primary/5
                  border-2 border-primary/30
                  hover:shadow-2xl hover:shadow-primary/20 hover:scale-[1.02]
                  transition-all duration-500 ease-out
                  hover:border-primary/60
                  ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
                `}
                style={{ 
                  transitionDelay: `${200 + index * 150}ms`,
                  animation: showContent ? `float ${3 + index}s ease-in-out infinite` : 'none'
                }}
              >
                <div className="space-y-4">
                  {/* Avatar and Name */}
                  <div className="flex items-start gap-4">
                    <div className="relative group cursor-pointer" onClick={() => handleAvatarClick(partner.name)}>
                      <Avatar className="h-16 w-16 ring-4 ring-primary/30 transition-all duration-300 group-hover:ring-primary/60 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/50">
                        <AvatarImage src={partner.avatar} alt={partner.name} />
                        <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-primary/20 to-primary/40">
                          {partner.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background animate-pulse" />
                      {/* Click hint overlay */}
                      <div className="absolute inset-0 bg-primary/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-foreground bg-gradient-to-r from-foreground to-primary bg-clip-text">
                        {partner.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1 text-sm text-primary group">
                        <MapPin className="w-3.5 h-3.5 group-hover:animate-bounce" />
                        <span className="font-medium">{partner.city}</span>
                      </div>
                    </div>
                  </div>

                  {/* Introduction */}
                  <p className="text-sm text-muted-foreground leading-relaxed bg-background/50 p-3 rounded-lg border border-primary/10">
                    {partner.intro}
                  </p>

                  {/* Specialty Tag */}
                  <div className="pt-2 border-t border-primary/20">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary/20 to-primary/10 text-primary text-xs font-semibold hover:from-primary/30 hover:to-primary/20 transition-all hover:scale-105">
                      <Sparkles className="w-3 h-3" />
                      Good at: {partner.goodAt}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
        
        <style>{`
          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-5px);
            }
          }
        `}</style>

        <DialogFooter className={`transition-all duration-700 delay-500 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <Button
            onClick={() => onOpenChange(false)}
            size="lg"
            className="w-full sm:w-auto px-8 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl hover:shadow-primary/50 transition-all hover:scale-105 group"
          >
            <span>Got it, thanks!</span>
            <Sparkles className="w-4 h-4 ml-2 group-hover:animate-spin" />
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Invite Friend Dialog */}
      <InviteFriendDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
        userName={selectedPartner}
      />
    </Dialog>
  );
}

