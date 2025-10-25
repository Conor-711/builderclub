import { Card } from './ui/card';

export interface Bounty {
  id: string;
  image: string;
  title: string;
  totalAmount: number;
  paidAmount: number;
  reward: string;
  category: string;
  type: string;
  platform: string;
  projectId?: string;
  projectName?: string;
  projectDescription?: string;
  potentialCreators?: number;
}

interface BountyCardProps {
  bounty: Bounty;
}

const getPlatformIcon = (platform: string) => {
  const icons: { [key: string]: JSX.Element } = {
    'TikTok': (
      <div className="w-5 h-5 bg-black rounded-sm flex items-center justify-center">
        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
        </svg>
      </div>
    ),
    'Instagram': (
      <div className="w-5 h-5 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-sm flex items-center justify-center">
        <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
        </svg>
      </div>
    ),
    'YouTube': (
      <div className="w-5 h-5 bg-red-600 rounded-sm flex items-center justify-center">
        <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      </div>
    ),
    'Twitter': (
      <div className="w-5 h-5 bg-sky-500 rounded-sm flex items-center justify-center">
        <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      </div>
    ),
  };
  return icons[platform] || null;
};

export function BountyCard({ bounty }: BountyCardProps) {
  const progress = (bounty.paidAmount / bounty.totalAmount) * 100;
  
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200 flex flex-col h-full">
      {/* 项目图片 */}
      <div className="aspect-video w-full overflow-hidden bg-muted">
        <img 
          src={bounty.image} 
          alt={bounty.title} 
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      
      {/* 项目信息 */}
      <div className="p-4 space-y-3 flex-1 flex flex-col">
        {/* 标题 */}
        <h3 className="font-semibold text-sm line-clamp-2 min-h-[2.5rem]">
          {bounty.title}
        </h3>
        
        {/* 金额和进度 */}
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">
            ${bounty.paidAmount.toFixed(2)} of ${bounty.totalAmount.toFixed(2)} paid out
          </p>
          <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300" 
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="text-right text-xs font-medium">{progress.toFixed(0)}%</p>
        </div>
        
        {/* 标签信息 */}
        <div className="grid grid-cols-2 gap-2 text-xs mt-auto">
          <div>
            <span className="text-muted-foreground block mb-0.5">Reward</span>
            <p className="font-semibold text-primary bg-primary/10 px-2 py-1 rounded">
              {bounty.reward}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground block mb-0.5">Category</span>
            <p className="font-medium">{bounty.category}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="text-xs">
            <span className="text-muted-foreground block mb-0.5">Type</span>
            <p className="font-medium">{bounty.type}</p>
          </div>
          <div className="text-xs">
            <span className="text-muted-foreground block mb-0.5">Platforms</span>
            <div className="flex items-center gap-1 mt-0.5">
              {getPlatformIcon(bounty.platform)}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

