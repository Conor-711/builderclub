import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Target } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

const objectives = [
  { id: "founder", label: "Become a founder", icon: "🚀" },
  { id: "join-team", label: "Join a startup team", icon: "👥" },
  { id: "both", label: "Both are good", icon: "🤝" },
];

const SelectObjectives = () => {
  const [selectedObjective, setSelectedObjective] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { updateUserData } = useUser();

  const handleNext = async () => {
    if (selectedObjective) {
      setIsLoading(true);
      try {
        await updateUserData({ objectives: [selectedObjective] });
        navigate("/select-idea");
      } catch (error) {
        console.error('Error saving objective:', error);
        alert('Failed to save objective. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto space-y-8 pt-16">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
            <Target className="w-6 h-6 text-primary-foreground" />
          </div>
        </div>

        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            What is your objective?
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Choose the option that best describes your goal
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {objectives.map((objective) => (
            <button
              key={objective.id}
              onClick={() => setSelectedObjective(objective.id)}
              className={`p-8 rounded-2xl border-2 transition-all hover:border-primary min-h-[200px] flex flex-col items-center justify-center gap-4 ${
                selectedObjective === objective.id
                  ? "border-primary bg-primary/5 shadow-lg"
                  : "border-border bg-card hover:shadow-md"
              }`}
            >
              <div className="text-6xl">{objective.icon}</div>
              <span className="text-lg font-medium text-foreground text-center leading-tight">
                {objective.label}
              </span>
            </button>
          ))}
        </div>

        <div className="flex justify-center gap-4 pt-8">
          <Button
            variant="outline"
            onClick={() => navigate("/setup-name")}
            className="w-40 h-12"
          >
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={!selectedObjective || isLoading}
            className="w-40 h-12"
          >
            {isLoading ? 'Saving...' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SelectObjectives;
