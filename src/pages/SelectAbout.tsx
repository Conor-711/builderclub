import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

const fieldCategories = [
  {
    title: "TECH",
    fields: ["AI", "Blockchain", "Robotics"],
  },
  {
    title: "HEALTH",
    fields: ["Fitness", "Mental Health Solutions"],
  },
  {
    title: "EDUCATION",
    fields: ["Language Learning", "Gamified Learning"],
  },
  {
    title: "SOCIAL",
    fields: ["Dating", "Social Network"],
  },
  {
    title: "TRAVEL",
    fields: ["Travel Apps", "Event Planning"],
  },
];

const SelectAbout = () => {
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { updateUserData } = useUser();

  const toggleField = (field: string) => {
    setSelectedFields((prev) =>
      prev.includes(field)
        ? prev.filter((item) => item !== field)
        : prev.length < 3
        ? [...prev, field]
        : prev
    );
  };

  const handleNext = async () => {
    if (selectedFields.length > 0) {
      setIsLoading(true);
      try {
        await updateUserData({ idea_fields: selectedFields });
        navigate("/select-skill");
      } catch (error) {
        console.error('Error saving fields:', error);
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
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
        </div>

        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            What field is your idea about?
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Select up to 3 fields that align with your interests
          </p>
        </div>

        <div className="space-y-6">
          {fieldCategories.map((category) => (
            <div key={category.title} className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                {category.title}
              </h3>
              <div className="flex flex-wrap gap-3">
                {category.fields.map((field) => (
                  <button
                    key={field}
                    onClick={() => toggleField(field)}
                    disabled={!selectedFields.includes(field) && selectedFields.length >= 3}
                    className={`px-6 py-3 rounded-xl border-2 transition-all text-sm font-medium ${
                      selectedFields.includes(field)
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border bg-card text-foreground hover:border-primary/50"
                    } ${
                      !selectedFields.includes(field) && selectedFields.length >= 3
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {field}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center text-sm text-muted-foreground">
          {selectedFields.length}/3 selected
        </div>

        <div className="flex justify-center gap-4 pt-4">
          <Button
            variant="outline"
            onClick={() => navigate("/select-idea")}
            className="w-40 h-12"
          >
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={selectedFields.length === 0 || isLoading}
            className="w-40 h-12"
          >
            {isLoading ? 'Saving...' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SelectAbout;

