import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MapPin, Users, X } from "lucide-react";
import { ConnectionWithUser } from "@/lib/supabase";
import MatchScore from "./MatchScore";
import MatchReasons from "./MatchReasons";
import { useState } from "react";

interface MatchCardProps {
  connection: ConnectionWithUser;
  onConnect: (connectionId: string) => void;
  onReject: (connectionId: string) => void;
  isLoading?: boolean;
}

const MatchCard = ({ connection, onConnect, onReject, isLoading = false }: MatchCardProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const targetUser = connection.target_user;

  const getInitials = () => {
    const first = targetUser.first_name?.[0] || '';
    const last = targetUser.last_name?.[0] || '';
    return (first + last).toUpperCase();
  };

  const fullName = `${targetUser.first_name} ${targetUser.last_name}`;

  // 获取前3个匹配原因
  const topReasons = connection.match_reasons?.reasons?.slice(0, 3) || [];

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="space-y-4">
        {/* 用户基本信息 */}
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16 bg-[#8B7355]">
            <AvatarImage src={targetUser.avatar_url} />
            <AvatarFallback className="text-xl bg-[#8B7355] text-white">
              {getInitials()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-semibold text-foreground truncate">
              {fullName}
            </h3>
            {targetUser.city && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <MapPin className="w-4 h-4" />
                <span>{targetUser.city}</span>
              </div>
            )}
          </div>
        </div>

        {/* 匹配分数 */}
        <MatchScore score={connection.match_score} />

        {/* 简短介绍 */}
        {targetUser.intro && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {targetUser.intro}
          </p>
        )}

        {/* 前3个匹配原因（简化版） */}
        {topReasons.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">主要匹配原因</h4>
            <div className="space-y-1">
              {topReasons.map((reason, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <span className="text-primary">•</span>
                  <span className="text-muted-foreground">{reason.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 共同兴趣标签 */}
        {connection.match_reasons?.common_interests && 
         connection.match_reasons.common_interests.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {connection.match_reasons.common_interests.slice(0, 5).map((interest, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {interest}
              </Badge>
            ))}
            {connection.match_reasons.common_interests.length > 5 && (
              <Badge variant="secondary" className="text-xs">
                +{connection.match_reasons.common_interests.length - 5}
              </Badge>
            )}
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex gap-2 pt-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1">
                查看详情
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">{fullName}</DialogTitle>
                {targetUser.city && (
                  <DialogDescription className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {targetUser.city}
                  </DialogDescription>
                )}
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* 匹配分数 */}
                <div>
                  <MatchScore score={connection.match_score} size="lg" />
                </div>

                {/* 个人简介 */}
                {targetUser.intro && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">个人简介</h4>
                    <p className="text-sm text-muted-foreground">{targetUser.intro}</p>
                  </div>
                )}

                {/* 兴趣 */}
                {targetUser.interests && targetUser.interests.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">兴趣</h4>
                    <div className="flex flex-wrap gap-2">
                      {targetUser.interests.map((interest, index) => (
                        <Badge key={index} variant="secondary">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* 目标 */}
                {targetUser.objectives && targetUser.objectives.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">目标</h4>
                    <div className="flex flex-wrap gap-2">
                      {targetUser.objectives.map((objective, index) => (
                        <Badge key={index} variant="outline">
                          {objective}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* 详细匹配分析 */}
                <div>
                  <h4 className="text-sm font-semibold mb-3">匹配分析</h4>
                  <MatchReasons 
                    reasons={connection.match_reasons?.reasons || []}
                    commonGoals={connection.match_reasons?.common_goals}
                    commonInterests={connection.match_reasons?.common_interests}
                    maxReasons={10}
                  />
                </div>
              </div>

              {/* 对话框内的操作按钮 */}
              <div className="flex gap-2 mt-6">
                <Button 
                  onClick={() => {
                    onConnect(connection.id);
                    setIsDialogOpen(false);
                  }}
                  disabled={isLoading}
                  className="flex-1 gap-2"
                >
                  <Users className="w-4 h-4" />
                  发送连接请求
                </Button>
                <Button 
                  onClick={() => {
                    onReject(connection.id);
                    setIsDialogOpen(false);
                  }}
                  disabled={isLoading}
                  variant="outline"
                  className="gap-2"
                >
                  <X className="w-4 h-4" />
                  不感兴趣
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button 
            onClick={() => onConnect(connection.id)}
            disabled={isLoading}
            className="flex-1 gap-2"
          >
            <Users className="w-4 h-4" />
            连接
          </Button>

          <Button 
            onClick={() => onReject(connection.id)}
            disabled={isLoading}
            variant="ghost"
            size="icon"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default MatchCard;

