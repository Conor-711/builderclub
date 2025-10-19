import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Target, User, Flag, Star, Briefcase, Mail, MessageCircle } from "lucide-react";

const interestCategories = [
  {
    title: "Business",
    interests: ["entrepreneurship", "marketing", "sales", "consulting", "e-commerce", "retail", "real estate"],
  },
  {
    title: "Investing & Finance",
    interests: ["angel investing", "crypto", "quant finance", "venture capital", "investment banking", "economics"],
  },
  {
    title: "Lifestyle",
    interests: ["travel", "fitness", "food", "gaming", "writing", "reading", "dinner parties", "poker", "chess", "cooking", "wellness"],
  },
];

const SelectInterests = () => {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((item) => item !== interest)
        : [...prev, interest]
    );
  };

  const handleComplete = () => {
    // Navigate to a completion page or dashboard
    console.log("Selected interests:", selectedInterests);
  };

  const tabs = [
    { icon: Star, label: "Interests" },
    { icon: Briefcase, label: "Work" },
    { icon: Mail, label: "Education" },
    { icon: MessageCircle, label: "About" },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8 pt-8">
        <div className="flex justify-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <MapPin className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="w-24 h-1 bg-primary"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Target className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="w-24 h-1 bg-primary"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <User className="w-4 h-4 text-primary-foreground" />
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
            Tell us a little bit about yourself
          </h1>
        </div>

        <div className="flex justify-center gap-2">
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            return (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={`p-3 rounded-lg transition-colors ${
                  activeTab === index
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <Icon className="w-6 h-6" />
              </button>
            );
          })}
        </div>

        <div className="bg-card border rounded-2xl p-8 space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">
              What are you interested in?
            </h2>
            <p className="text-muted-foreground">
              Select from the list and add your own interests.
            </p>
          </div>

          {interestCategories.map((category) => (
            <div key={category.title} className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">
                {category.title}
              </h3>
              <div className="flex flex-wrap gap-2">
                {category.interests.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                      selectedInterests.includes(interest)
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border bg-background text-foreground hover:border-primary/50"
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-4 pt-4">
          <Button
            variant="outline"
            onClick={() => navigate("/select-objectives")}
            className="w-40 h-12"
          >
            Back
          </Button>
          <Button
            onClick={handleComplete}
            className="w-40 h-12"
          >
            Complete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SelectInterests;
