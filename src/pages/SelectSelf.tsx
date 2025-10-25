import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ChevronUp, ChevronDown } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { QualityWithOrder } from "@/lib/supabase";

const qualities = [
  "Sincere",
  "Smart",
  "Leadership",
  "Creativity",
  "Ambition",
  "Confidence",
  "Patience",
  "Courage",
  "Open-mindedness",
  "Hardworking",
  "Resilience",
  "Generosity",
  "Optimism",
  "Collaborative",
  "Visionary",
];

const SelectSelf = () => {
  const [selectedQualities, setSelectedQualities] = useState<string[]>([]);
  const [isRanking, setIsRanking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { updateUserData } = useUser();

  const toggleQuality = (quality: string) => {
    setSelectedQualities((prev) =>
      prev.includes(quality)
        ? prev.filter((item) => item !== quality)
        : prev.length < 5
        ? [...prev, quality]
        : prev
    );
  };

  const moveUp = (index: number) => {
    if (index > 0) {
      const newQualities = [...selectedQualities];
      [newQualities[index - 1], newQualities[index]] = [newQualities[index], newQualities[index - 1]];
      setSelectedQualities(newQualities);
    }
  };

  const moveDown = (index: number) => {
    if (index < selectedQualities.length - 1) {
      const newQualities = [...selectedQualities];
      [newQualities[index], newQualities[index + 1]] = [newQualities[index + 1], newQualities[index]];
      setSelectedQualities(newQualities);
    }
  };

  const handleContinueToRanking = () => {
    if (selectedQualities.length === 5) {
      setIsRanking(true);
    }
  };

  const handleNext = async () => {
    if (selectedQualities.length === 5) {
      setIsLoading(true);
      try {
        const qualitiesWithOrder: QualityWithOrder[] = selectedQualities.map((quality, index) => ({
          quality,
          order: index + 1,
        }));
        await updateUserData({ self_qualities: qualitiesWithOrder });
        navigate("/select-other");
      } catch (error) {
        console.error('Error saving qualities:', error);
        alert('Failed to save. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (isRanking) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto space-y-8 pt-16">
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <Heart className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>

          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground">
              Rank your qualities
            </h1>
            <p className="text-muted-foreground text-lg">
              Arrange them in order of importance (most important first)
            </p>
          </div>

          <div className="space-y-3 max-w-xl mx-auto">
            {selectedQualities.map((quality, index) => (
              <div
                key={quality}
                className="flex items-center gap-3 p-4 bg-card border-2 border-primary/20 rounded-xl"
              >
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className={`p-1 rounded hover:bg-muted ${
                      index === 0 ? "opacity-30 cursor-not-allowed" : ""
                    }`}
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveDown(index)}
                    disabled={index === selectedQualities.length - 1}
                    className={`p-1 rounded hover:bg-muted ${
                      index === selectedQualities.length - 1 ? "opacity-30 cursor-not-allowed" : ""
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                    {index + 1}
                  </div>
                  <span className="text-lg font-medium">{quality}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-4 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsRanking(false)}
              className="w-40 h-12"
            >
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={isLoading}
              className="w-40 h-12"
            >
              {isLoading ? 'Saving...' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8 pt-16">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
            <Heart className="w-6 h-6 text-primary-foreground" />
          </div>
        </div>

        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            How would you like others to see you?
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Select exactly 5 qualities that best represent you
          </p>
        </div>

        <div className="flex flex-wrap gap-3 justify-center max-w-4xl mx-auto">
          {qualities.map((quality) => (
            <button
              key={quality}
              onClick={() => toggleQuality(quality)}
              disabled={!selectedQualities.includes(quality) && selectedQualities.length >= 5}
              className={`px-6 py-3 rounded-xl border-2 transition-all text-sm font-medium ${
                selectedQualities.includes(quality)
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border bg-card text-foreground hover:border-primary/50"
              } ${
                !selectedQualities.includes(quality) && selectedQualities.length >= 5
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {quality}
            </button>
          ))}
        </div>

        <div className="text-center text-sm text-muted-foreground">
          {selectedQualities.length}/5 selected
        </div>

        <div className="flex justify-center gap-4 pt-4">
          <Button
            variant="outline"
            onClick={() => navigate("/select-skill")}
            className="w-40 h-12"
          >
            Back
          </Button>
          <Button
            onClick={handleContinueToRanking}
            disabled={selectedQualities.length !== 5}
            className="w-40 h-12"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SelectSelf;

