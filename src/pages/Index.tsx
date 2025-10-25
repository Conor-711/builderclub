

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronUp, Utensils } from "lucide-react";
import appleImage from "@/assets/founders/apple.png";
import googleImage from "@/assets/founders/google.png";
import facebookImage from "@/assets/founders/facebook.png";
import binanceImage from "@/assets/founders/binance.png";
import paypalImage from "@/assets/founders/paypal.png";
import figmaImage from "@/assets/founders/figma.png";
import notionImage from "@/assets/founders/notion.png";
import cursorImage from "@/assets/founders/cursor.png";
import cluelyImage from "@/assets/founders/cluely.png";
import canvaImage from "@/assets/founders/canva.png";

const Index = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [scrollY, setScrollY] = useState(0);
  const [showTopLogo, setShowTopLogo] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);
      // 当滚动到顶部区域（前100px）时显示Logo
      setShowTopLogo(currentScrollY <= 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Scroll to bottom on mount to show the latest time
    window.scrollTo(0, document.body.scrollHeight);
  }, []);

  const formatDateTime = (date: Date) => {
    const utc8Date = new Date(date.getTime() + (8 * 60 * 60 * 1000));
    const year = utc8Date.getUTCFullYear();
    const month = String(utc8Date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(utc8Date.getUTCDate()).padStart(2, '0');
    const hours = String(utc8Date.getUTCHours()).padStart(2, '0');
    const minutes = String(utc8Date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(utc8Date.getUTCSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const timeline = [
    { date: "1976", company: "Apple", founders: "Steve Jobs & Steve Wozniak", image: appleImage },
    { date: "1998", company: "Google", founders: "Larry Page & Sergey Brin", image: googleImage },
    { date: "1998", company: "PayPal", founders: "Peter Thiel & Elon Musk", image: paypalImage },
    { date: "2004", company: "Facebook", founders: "Mark Zuckerberg & Dustin Moskovitz", image: facebookImage },
    { date: "2013", company: "Notion", founders: "Ivan Zhao & Simon Last", image: notionImage },
    { date: "2013", company: "Canva", founders: "Melanie Perkins & Cliff Obrecht", image: canvaImage },
    { date: "2016", company: "Figma", founders: "Dylan Field & Evan Wallace", image: figmaImage },
    { date: "2017", company: "Binance", founders: "Changpeng Zhao & He Yi", image: binanceImage },
    { date: "2023", company: "Cursor", founders: "Aman Sanger & Arvid Lunnemark", image: cursorImage },
    { date: "2024", company: "Cluely", founders: "Roy Lee & Wanying Zhang", image: cluelyImage },
  ];

  const maxScroll = typeof document !== 'undefined' 
    ? document.body.scrollHeight - window.innerHeight 
    : 1;
  const centerLogoOpacity = Math.max(0, (scrollY - maxScroll * 0.85) / (maxScroll * 0.15));

  const renderFounders = (text: string) => {
    const parts = text.split('&');
    return (
      <span>
        {parts.map((part, index) => (
          <span key={index}>
            {part}
            {index < parts.length - 1 && (
              <span className="font-bold text-primary px-1.5 mx-0.5">
              &
              </span>
            )}
          </span>
        ))}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Top Logo - 仅在顶部显示 */}
      <div
        className={`fixed top-6 left-6 z-40 transition-all duration-500 ${
          showTopLogo
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-[-20px] pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <Utensils className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">BuilderClub</span>
        </div>
      </div>

      {/* Top Glow Effect */}
      <div 
        className="fixed top-0 left-0 right-0 h-96 pointer-events-none z-10 transition-opacity duration-700"
        style={{
          opacity: Math.max(0, 1 - (scrollY / (maxScroll * 0.5))),
          background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255, 252, 240, 0.4) 0%, rgba(255, 248, 220, 0.2) 30%, transparent 100%)',
          filter: 'blur(20px)'
        }}
      />
      
      {/* Scroll Up Indicator */}
      <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-30 animate-bounce transition-opacity duration-1000 ${
        scrollY >= maxScroll - 10 ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}>
        <ChevronUp className="w-12 h-12 text-muted-foreground opacity-50" strokeWidth={1} />
      </div>
      
      {/* Fixed Center Logo */}
      <div 
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none transition-opacity duration-300"
        style={{ opacity: centerLogoOpacity }}
      >
        <div className="glass-effect rounded-2xl p-12 backdrop-blur-xl min-w-[525px]">
          <h1 className="text-6xl md:text-7xl font-bold glow-text text-center">
            BuilderClub
          </h1>
          <p className="text-lg text-muted-foreground text-center mt-4">
          Make your ideas happen here.
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative max-w-7xl mx-auto px-8 py-32 flex flex-col-reverse">
        {/* Vertical Line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-border to-transparent" />

        {/* Current Time (Now at Bottom/Latest) */}
        <div
          className="relative mt-24 animate-fade-in text-center"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-primary ring-4 ring-background animate-glow" />
          
          {/* <div className="glass-effect rounded-xl p-8 inline-block hover-lift">
            <span className="text-3xl font-bold text-primary block mb-4">{formatDateTime(currentTime)}</span>
            <h3 className="text-2xl font-bold mb-2">现在</h3>
            <p className="text-muted-foreground">
              Your story starts here
            </p>
          </div> */}
        </div>

        {/* Historical Timeline (oldest to newest going up) */}
        {timeline.map((item, index) => (
          <div
            key={index}
            className={`relative mb-24 animate-fade-in ${
              index % 2 === 0 ? "text-right pr-[55%]" : "text-left pl-[55%]"
            }`}
            style={{ animationDelay: `${index * 0.2}s` }}
          >
            {/* Timeline Dot */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary ring-4 ring-background animate-glow" />

            {/* Content Card */}
            <div className="glass-effect rounded-xl p-6 hover-lift group">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-3xl font-bold text-primary">{item.date}</span>
                <div className="h-px flex-1 bg-border" />
              </div>
              
              <div className={`grid gap-6 ${index % 2 === 0 ? "md:grid-cols-[1fr_300px]" : "md:grid-cols-[300px_1fr]"}`}>
                <div className={index % 2 === 0 ? "order-1" : "order-2"}>
                  <h3 className="text-3xl font-bold mb-2">{item.company}</h3>
                  <p className="text-muted-foreground mb-4">{renderFounders(item.founders)}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Two visionaries came together to change the world
                  </p>
                </div>
                
                <div className={`overflow-hidden rounded-lg ${index % 2 === 0 ? "order-2" : "order-1"}`}>
                  <img
                    src={item.image}
                    alt={`${item.company} founders`}
                    className="w-full h-48 object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* CTA at Top (Beginning - scroll up to see) */}
        <div className="text-center mb-24 animate-fade-in" style={{ animationDelay: "1s" }}>
          <div className="glass-effect rounded-2xl p-12 inline-block">
            <h2 className="text-4xl font-bold mb-4">Where it all began</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Every legendary partnership has a starting point
            </p>
            <Button 
              size="lg" 
              className="text-lg px-8 py-6"
              onClick={() => navigate('/login')}
            >
              Begin Your Journey
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
