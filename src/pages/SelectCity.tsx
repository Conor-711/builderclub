import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Target, User, Flag, ChevronRight } from "lucide-react";

const cities = [
  { name: "San Francisco Bay", icon: "🌉" },
  { name: "Greater Los Angeles", icon: "🏙️" },
  { name: "New York City", icon: "🗽" },
  { name: "London", icon: "🌉" },
  { name: "Bangalore", icon: "🏛️" },
];

const SelectCity = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleCitySelect = (cityName: string) => {
    navigate("/select-objectives");
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-8 pt-8">
        <div className="flex justify-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <MapPin className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="w-24 h-1 bg-primary"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <Target className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="w-24 h-1 bg-muted"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <User className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="w-24 h-1 bg-muted"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <Flag className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        </div>

        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            Where are you based?
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Lunchclub can find you a match, wherever you are! Let us know where you call home.
          </p>
        </div>

        <div className="space-y-6">
          <Input
            type="text"
            placeholder="Find your city!"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-14 text-base bg-muted border-0"
          />

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Some of our major cities...</p>
            <div className="space-y-2">
              {cities.map((city) => (
                <button
                  key={city.name}
                  onClick={() => handleCitySelect(city.name)}
                  className="w-full bg-card border rounded-lg p-4 flex items-center justify-between hover:bg-accent transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{city.icon}</div>
                    <span className="text-lg font-medium text-foreground">{city.name}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectCity;
