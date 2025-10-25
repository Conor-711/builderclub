import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lightbulb } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

const ideaOptions = [
  { id: "clear", label: "Yes, I have a very clear idea", icon: "💡" },
  { id: "no-idea", label: "No, I don't have any idea", icon: "🤔" },
  { id: "open", label: "I have an idea, but I'm open to discussions and pivots", icon: "💬" },
];

const SelectIdea = () => {
  const [selectedIdea, setSelectedIdea] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { updateUserData } = useUser();

  const handleNext = async () => {
    if (selectedIdea) {
      setIsLoading(true);
      try {
        await updateUserData({ idea_status: selectedIdea });
        navigate("/select-about");
      } catch (error) {
        console.error('Error saving idea status:', error);
        alert('Failed to save. Please try again.');
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
            <Lightbulb className="w-6 h-6 text-primary-foreground" />
          </div>
        </div>

        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            Do you have an idea?
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Tell us about where you are in your journey
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 max-w-2xl mx-auto">
          {ideaOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelectedIdea(option.id)}
              className={`p-6 rounded-2xl border-2 transition-all hover:border-primary flex items-center gap-6 ${
                selectedIdea === option.id
                  ? "border-primary bg-primary/5 shadow-lg"
                  : "border-border bg-card hover:shadow-md"
              }`}
            >
              <div className="text-5xl flex-shrink-0">{option.icon}</div>
              <span className="text-lg font-medium text-foreground text-left flex-1">
                {option.label}
              </span>
            </button>
          ))}
        </div>

        <div className="flex justify-center gap-4 pt-8">
          <Button
            variant="outline"
            onClick={() => navigate("/select-objectives")}
            className="w-40 h-12"
          >
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={!selectedIdea || isLoading}
            className="w-40 h-12"
          >
            {isLoading ? 'Saving...' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SelectIdea;

