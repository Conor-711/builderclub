import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Zap } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

const skills = [
  { id: "programming", label: "Programming", icon: "💻" },
  { id: "design", label: "Design", icon: "🎨" },
  { id: "product", label: "Product", icon: "📱" },
  { id: "marketing", label: "Marketing", icon: "📢" },
  { id: "other", label: "Other", icon: "✨" },
];

const SelectSkill = () => {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { updateUserData } = useUser();

  const toggleSkill = (skillId: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skillId)
        ? prev.filter((item) => item !== skillId)
        : prev.length < 3
        ? [...prev, skillId]
        : prev
    );
  };

  const handleNext = async () => {
    if (selectedSkills.length > 0) {
      setIsLoading(true);
      try {
        await updateUserData({ skills: selectedSkills });
        navigate("/select-self");
      } catch (error) {
        console.error('Error saving skills:', error);
        alert('Failed to save. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8 pt-16">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
            <Zap className="w-6 h-6 text-primary-foreground" />
          </div>
        </div>

        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            What do you good at?
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Select up to 3 skills that best represent your strengths
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-4xl mx-auto">
          {skills.map((skill) => (
            <button
              key={skill.id}
              onClick={() => toggleSkill(skill.id)}
              disabled={!selectedSkills.includes(skill.id) && selectedSkills.length >= 3}
              className={`p-6 rounded-2xl border-2 transition-all hover:border-primary flex flex-col items-center gap-3 min-h-[140px] justify-center ${
                selectedSkills.includes(skill.id)
                  ? "border-primary bg-primary/5 shadow-lg"
                  : "border-border bg-card hover:shadow-md"
              } ${
                !selectedSkills.includes(skill.id) && selectedSkills.length >= 3
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              <div className="text-4xl">{skill.icon}</div>
              <span className="text-sm font-medium text-foreground text-center">
                {skill.label}
              </span>
            </button>
          ))}
        </div>

        <div className="text-center text-sm text-muted-foreground">
          {selectedSkills.length}/3 selected
        </div>

        <div className="flex justify-center gap-4 pt-4">
          <Button
            variant="outline"
            onClick={() => navigate("/select-about")}
            className="w-40 h-12"
          >
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={selectedSkills.length === 0 || isLoading}
            className="w-40 h-12"
          >
            {isLoading ? 'Saving...' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SelectSkill;

