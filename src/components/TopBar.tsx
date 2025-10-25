import { useLocation, useNavigate } from "react-router-dom";
import { Users, Lightbulb, Building2, Store, User } from "lucide-react";

const TopBar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const rightNavItems = [
    { label: "IdeaHub", path: "/idea", icon: Lightbulb },
    { label: "Team Space", path: "/team-space", icon: Building2 },
    { label: "UGC Marketplace", path: "/marketplace", icon: Store },
    { label: "", path: "/profile", icon: User },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-16 bg-card border-b">
      <div className="h-full flex items-center justify-between px-6 relative">
        {/* Left Side - Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <img src="/logo.png" alt="BuilderClub" className="w-10 h-10 rounded-full" />
          <span className="text-2xl font-bold text-primary">BuilderClub</span>
        </div>

        {/* Center - Meet Button with Glass Effect */}
        <div className="absolute left-[49%] -translate-x-1/2">
          <button
            onClick={() => navigate('/connections')}
            className={`
              flex items-center gap-2 px-6 py-2.5 rounded-full
              backdrop-blur-md border transition-all duration-300
              ${isActive('/connections')
                ? 'bg-primary/20 border-primary/50 text-primary shadow-lg shadow-primary/25'
                : 'bg-background/60 border-border/50 text-muted-foreground hover:bg-background/80 hover:border-border hover:text-foreground'
              }
            `}
          >
            <Users className="w-6 h-6" />
            <span className="font-medium">Meet</span>
          </button>
        </div>

        {/* Right Side - Navigation Buttons */}
        <div className="flex items-center gap-6">
          {rightNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-2 text-base font-medium transition-colors ${
                  isActive(item.path)
                    ? "text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TopBar;
