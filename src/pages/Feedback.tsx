import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, UserPlus, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const Feedback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [preference, setPreference] = useState('');
  const [feedback, setFeedback] = useState('');
  const [friendRequests, setFriendRequests] = useState({
    mike: false,
    amanda: false
  });
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const preferenceOptions = [
    { value: 'mike', label: 'Mike' },
    { value: 'amanda', label: 'Amanda' },
    { value: 'both', label: 'Want to meet both' },
    { value: 'neither', label: "Don't want to meet either" }
  ];

  const friends = [
    { name: 'Mike', key: 'mike', avatar: '/src/assets/users/user2.jpg' },
    { name: 'Amanda', key: 'amanda', avatar: '/src/assets/users/user3.jpg' }
  ];

  const handleAddFriend = (friendKey: string) => {
    setFriendRequests(prev => ({
      ...prev,
      [friendKey]: true
    }));
    toast({
      title: '✓ Friend request sent',
      description: `Your friend request has been sent to ${friendKey === 'mike' ? 'Mike' : 'Amanda'}.`
    });
  };

  const handleSubmit = () => {
    if (rating === 0) {
      toast({
        title: 'Rating required',
        description: 'Please rate your meeting experience',
        variant: 'destructive'
      });
      return;
    }

    // 显示成功弹窗
    setShowSuccessDialog(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-6">
      <div className="w-full max-w-2xl mx-auto space-y-8">
        {/* 标题 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">
            Feedback on this match and meeting
          </h1>
          <p className="text-white/70">Help us improve your experience</p>
        </div>

        <Card className="p-8 space-y-8 bg-white/10 backdrop-blur-md border-white/20">
          {/* 问题1：星级评分 */}
          <div className="space-y-3">
            <label className="text-lg font-semibold text-white/90">
              How did you feel about this meeting?
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star 
                    className={`w-10 h-10 transition-colors ${
                      star <= (hoverRating || rating) 
                        ? 'fill-yellow-400 text-yellow-400' 
                        : 'text-gray-400'
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-white/70 text-sm">
                  {rating} star{rating > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {/* 问题2：单选题 */}
          <div className="space-y-3">
            <label className="text-lg font-semibold text-white/90">
              If there's a next time, would you rather be matched with Mike or Amanda?
            </label>
            <div className="space-y-2">
              {preferenceOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setPreference(option.value)}
                  className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left font-medium ${
                    preference === option.value
                      ? 'border-primary bg-primary/10 text-white shadow-lg'
                      : 'border-white/20 bg-white/5 text-white/70 hover:border-white/40 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      preference === option.value
                        ? 'border-primary bg-primary'
                        : 'border-white/40'
                    }`}>
                      {preference === option.value && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <span>{option.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 问题3：文本输入框 */}
          <div className="space-y-3">
            <label className="text-lg font-semibold text-white/90">
              Is there anything else you'd like to tell us to help improve your future match experience?
            </label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your thoughts..."
              rows={4}
              maxLength={500}
              className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-primary resize-none"
            />
            <p className="text-xs text-white/50 text-right">
              {feedback.length}/500
            </p>
          </div>

          {/* 添加好友模块 */}
          <div className="space-y-3">
            <label className="text-lg font-semibold text-white/90">
              Add Friends
            </label>
            <div className="grid grid-cols-2 gap-4">
              {friends.map((friend) => (
                <Card key={friend.key} className="p-4 bg-white/10 backdrop-blur-sm border-white/20 hover:border-white/40 transition-all duration-200">
                  <div className="flex flex-col items-center space-y-3">
                    <Avatar className="w-16 h-16 border-2 border-white/30">
                      <AvatarImage src={friend.avatar} />
                      <AvatarFallback className="bg-primary/30 text-white">
                        {friend.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <h4 className="text-center font-semibold text-white">{friend.name}</h4>
                    <Button
                      onClick={() => handleAddFriend(friend.key)}
                      disabled={friendRequests[friend.key as keyof typeof friendRequests]}
                      className={`w-full ${
                        friendRequests[friend.key as keyof typeof friendRequests]
                          ? 'bg-green-600 hover:bg-green-600'
                          : 'bg-primary hover:bg-primary/90'
                      }`}
                    >
                      {friendRequests[friend.key as keyof typeof friendRequests] ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Friend Request Sent
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Add Friend
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* 提交按钮 */}
          <Button
            onClick={handleSubmit}
            disabled={rating === 0}
            className="w-full h-12 text-lg font-semibold bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Feedback
          </Button>
        </Card>

        {/* 返回按钮 */}
        <div className="text-center">
          <button
            onClick={() => navigate('/connections')}
            className="text-white/70 hover:text-white transition-colors text-sm"
          >
            ← Back to Connections
          </button>
        </div>
      </div>

      {/* 成功弹窗 */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border-white/20 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white text-center mb-4">
              🎉 Congratulations!
            </DialogTitle>
            <DialogDescription className="text-white/90 text-center text-base leading-relaxed mb-6">
              You've successfully found your first group of friends who share the same ideas — it's time to build something of your own!
            </DialogDescription>
          </DialogHeader>
          <Button
            onClick={() => navigate('/team-space')}
            className="w-full h-12 text-lg font-semibold bg-primary hover:bg-primary/90"
          >
            Go To Team Space
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Feedback;

