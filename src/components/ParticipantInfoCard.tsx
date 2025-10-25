import { Card } from './ui/card';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Briefcase, MapPin, User, Lightbulb } from 'lucide-react';

export interface Participant {
  name: string;
  avatar: string;
  goodAt: string;
  city: string;
  age: number;
  idea: string;
  selfQualities: string[];
  otherQualities: string[];
}

interface ParticipantInfoCardProps {
  participant: Participant;
}

export function ParticipantInfoCard({ participant }: ParticipantInfoCardProps) {
  return (
    <Card className="p-3 space-y-2 bg-white/10 backdrop-blur-sm border-white/20 shadow-lg">
      {/* 头像和姓名 */}
      <div className="flex items-center gap-3">
        <Avatar className="w-12 h-12 border-2 border-white/30 flex-shrink-0 shadow-md">
          <AvatarImage src={participant.avatar} />
          <AvatarFallback className="text-sm font-bold bg-primary/30">
            {participant.name[0]}
          </AvatarFallback>
        </Avatar>
        <h3 className="text-base font-bold text-white">{participant.name}</h3>
      </div>
      
      {/* 基本信息 - 横向排列 */}
      <div className="flex items-center gap-3 text-xs text-white/90 flex-wrap">
        <div className="flex items-center gap-1">
          <Briefcase className="w-3 h-3 text-white/70" />
          <span>{participant.goodAt}</span>
        </div>
        
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3 text-white/70" />
          <span>{participant.city}</span>
        </div>
        
        <div className="flex items-center gap-1">
          <User className="w-3 h-3 text-white/70" />
          <span>{participant.age}</span>
        </div>
      </div>
      
      {/* IDEA */}
      <div className="flex items-center gap-2">
        <Lightbulb className="w-3 h-3 text-yellow-400/80 flex-shrink-0" />
        <div className="text-[10px] font-semibold text-white/60 uppercase tracking-wide flex-shrink-0">
          IDEA
        </div>
        <div className="text-xs text-white/90">
          {participant.idea}
        </div>
      </div>
      
      {/* Self Qualities */}
      <div className="space-y-1">
        <p className="text-[10px] font-semibold text-white/60 uppercase tracking-wide">
          How they see themselves
        </p>
        <div className="flex flex-wrap gap-1">
          {participant.selfQualities.map((quality, i) => (
            <Badge key={i} variant="secondary" className="text-[10px] py-0 px-1.5 bg-primary/30 text-white border-primary/40 shadow-sm">
              {quality}
            </Badge>
          ))}
        </div>
      </div>
      
      {/* Other Qualities */}
      <div className="space-y-1">
        <p className="text-[10px] font-semibold text-white/60 uppercase tracking-wide">
          What they value
        </p>
        <div className="flex flex-wrap gap-1">
          {participant.otherQualities.map((quality, i) => (
            <Badge key={i} variant="outline" className="text-[10px] py-0 px-1.5 border-white/30 text-white/90 bg-white/5">
              {quality}
            </Badge>
          ))}
        </div>
      </div>
    </Card>
  );
}

