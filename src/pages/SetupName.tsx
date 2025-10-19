import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Utensils } from "lucide-react";

const SetupName = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const navigate = useNavigate();

  const handleContinue = () => {
    if (firstName && lastName) {
      navigate("/select-city");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-12">
        <div className="flex justify-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <Utensils className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-primary">lunchclub</span>
          </div>
        </div>

        <div className="flex justify-center gap-2 py-8">
          <div className="w-24 h-24 bg-orange-400 rounded-lg flex items-center justify-center">
            <div className="text-4xl">🏢</div>
          </div>
          <div className="w-24 h-24 bg-red-400 rounded-lg flex items-center justify-center">
            <div className="text-4xl">☕</div>
          </div>
          <div className="w-24 h-24 bg-orange-500 rounded-lg flex items-center justify-center">
            <div className="text-4xl">🏪</div>
          </div>
          <div className="w-24 h-24 bg-blue-400 rounded-lg flex items-center justify-center">
            <div className="text-4xl">☕</div>
          </div>
        </div>

        <div className="space-y-4">
          <Input
            type="text"
            placeholder="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="h-14 text-base bg-muted border-0"
          />
          <Input
            type="text"
            placeholder="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="h-14 text-base bg-muted border-0"
            onKeyPress={(e) => e.key === "Enter" && handleContinue()}
          />
        </div>

        <Button
          onClick={handleContinue}
          disabled={!firstName || !lastName}
          className="w-full h-14 text-base"
        >
          Let's get started
        </Button>
      </div>
    </div>
  );
};

export default SetupName;
