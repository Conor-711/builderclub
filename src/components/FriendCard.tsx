import { Card } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { MapPin, ChevronRight } from 'lucide-react';
import type { FriendshipWithUser } from '../lib/supabase';

interface FriendCardProps {
  friendship: FriendshipWithUser;
  currentUserId: string;
  onClick?: (userId: string) => void;
}

export function FriendCard({ friendship, currentUserId, onClick }: FriendCardProps) {
  const friend = friendship.user;

  return (
    <Card
      className="p-4 cursor-pointer hover:shadow-md transition-all hover:bg-accent/50"
      onClick={() => onClick?.(friend.id)}
    >
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={friend.avatar_url} />
          <AvatarFallback>
            {friend.first_name[0]}
            {friend.last_name[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg truncate">
            {friend.first_name} {friend.last_name}
          </h3>
          {friend.city && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{friend.city}</span>
            </div>
          )}
          {friend.intro && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {friend.intro}
            </p>
          )}
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </div>
    </Card>
  );
}

