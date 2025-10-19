import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Target, User, Flag } from "lucide-react";

const objectives = [
  { id: "brainstorm", label: "Brainstorm with peers", icon: "🧠" },
  { id: "grow-team", label: "Grow your team", icon: "👥" },
  { id: "start-company", label: "Start a company", icon: "😊" },
  { id: "business-dev", label: "Business development", icon: "💼" },
  { id: "invest", label: "Invest", icon: "💰" },
  { id: "explore-projects", label: "Explore new projects", icon: "📊" },
  { id: "mentor", label: "Mentor others", icon: "🌱" },
  { id: "organize-events", label: "Organize events", icon: "📅" },
  { id: "raise-funding", label: "Raise funding", icon: "👑" },
  { id: "find-cofounder", label: "Find a cofounder", icon: "🤝" },
  { id: "meet-people", label: "Meet interesting people", icon: "🍎" },
  { id: "explore-perspectives", label: "Explore new perspectives", icon: "🍊" },
  { id: "find-job", label: "Find a job", icon: "🚀" },
];

const SelectObjectives = () => {
  const [selectedObjectives, setSelectedObjectives] = useState<string[]>([]);
  const navigate = useNavigate();

  const toggleObjective = (id: string) => {
    setSelectedObjectives((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : prev.length < 3
        ? [...prev, id]
        : prev
    );
  };

  const handleNext = () => {
    if (selectedObjectives.length > 0) {
      navigate("/select-interests");
    }
  };

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
            What are your objectives?
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Select up to 3 objectives. These will be kept private from other users but help us find relevant matches.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {objectives.map((objective) => (
            <button
              key={objective.id}
              onClick={() => toggleObjective(objective.id)}
              className={`p-6 rounded-xl border-2 transition-all hover:border-primary ${
                selectedObjectives.includes(objective.id)
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card"
              }`}
            >
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="text-4xl">{objective.icon}</div>
                <span className="text-sm font-medium text-foreground leading-tight">
                  {objective.label}
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="flex justify-center">
          <button className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
            Tell us more →
          </button>
        </div>

        <div className="flex justify-center gap-4 pt-4">
          <Button
            variant="outline"
            onClick={() => navigate("/select-city")}
            className="w-40 h-12"
          >
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={selectedObjectives.length === 0}
            className="w-40 h-12"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SelectObjectives;
