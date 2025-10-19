import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Utensils } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (email) {
      navigate("/setup-name");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="flex justify-between items-center p-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <Utensils className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold text-primary">lunchclub</span>
        </div>
        <Button variant="outline" className="text-primary border-primary hover:bg-primary hover:text-primary-foreground">
          Log in
        </Button>
      </header>

      <main className="container mx-auto px-6 pt-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Your network is waiting for you.
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg">
                We facilitate casual conversations that lead to not-so-casual professional impact. Powered by AI.
              </p>
            </div>

            <div className="bg-card rounded-2xl shadow-lg p-8 space-y-6 max-w-lg border">
              <Button 
                variant="outline" 
                className="w-full h-12 text-base border-2"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign up with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-card px-4 text-muted-foreground">OR</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 h-12 text-base"
                  onKeyPress={(e) => e.key === "Enter" && handleGetStarted()}
                />
                <Button 
                  onClick={handleGetStarted}
                  className="h-12 px-6 text-base"
                >
                  Get started
                </Button>
              </div>
            </div>

            <p className="text-muted-foreground">
              Already have an account?{" "}
              <a href="#" className="text-primary hover:underline">
                Log in here.
              </a>
            </p>

            <div className="pt-4">
              <div className="bg-card border rounded-xl p-4 inline-flex flex-col items-center shadow-sm">
                <div className="text-sm font-medium mb-2">Download on the</div>
                <div className="text-lg font-bold">App Store</div>
                <div className="mt-2 w-32 h-32 bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-xs text-center text-muted-foreground">QR Code</div>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex flex-col items-center justify-center space-y-8">
            <div className="text-sm uppercase tracking-wide text-muted-foreground">
              HOW IT WORKS
            </div>
            <h2 className="text-4xl font-bold text-center">
              It's simple, <span className="relative inline-block">
                <span className="relative z-10">really</span>
                <span className="absolute bottom-2 left-0 w-full h-3 bg-primary/20 -rotate-1"></span>
              </span>
            </h2>
            <div className="bg-muted/30 rounded-full p-16 relative">
              <div className="w-48 h-48 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
                <div className="space-y-4 text-center">
                  <div className="text-6xl">✨</div>
                  <div className="text-4xl">😊</div>
                  <div className="text-3xl">🎵</div>
                </div>
              </div>
            </div>
            <p className="text-center text-muted-foreground max-w-md">
              Tell us your background, goals, and what you're excited about
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
