import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logoImg from "@/assets/logo/logo.png";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Upload } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

const SetupName = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [city, setCity] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { userId, authUser, updateUserData } = useUser();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authUser) {
      navigate('/');
    }
  }, [authUser, navigate]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarPreview(result);
        setAvatarUrl(result); // For now, store as data URL
      };
      reader.readAsDataURL(file);
    }
  };

  const handleContinue = async () => {
    if (firstName && lastName && age && gender && city) {
      if (!userId) {
        alert('Please log in first');
        navigate('/');
        return;
      }

      setIsLoading(true);
      try {
        // Save all data to Supabase
        await updateUserData({
          id: userId,
          first_name: firstName,
          last_name: lastName,
          age: parseInt(age),
          gender: gender,
          city: city,
          avatar_url: avatarUrl,
          twitter_url: twitterUrl,
          linkedin_url: linkedinUrl,
          intro: '',
          interests: [],
          objectives: [],
        });

        navigate("/select-objectives");
      } catch (error) {
        console.error('Error saving data:', error);
        alert('Failed to save data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const isFormValid = firstName && lastName && age && gender && city;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-8">
        <div className="flex justify-center">
          <div className="flex items-center gap-2">
            <img src="/src/assets/logo/logo.png" alt="BuilderClub" className="w-10 h-10 rounded-full" />
            <span className="text-2xl font-bold text-primary">BuilderClub</span>
          </div>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Let's get to know you
          </h1>
          <p className="text-muted-foreground">
            Tell us about yourself to find the perfect cofounder match
          </p>
        </div>

        <div className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center space-y-3">
            <Label className="text-sm font-medium">Profile Photo</Label>
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <img src={logoImg} alt="BuilderClub" className="w-full h-full object-cover" />
                )}
              </div>  
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors"
              >
                <Upload className="w-4 h-4 text-primary-foreground" />
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name *</Label>
              <Input
                id="firstName"
                type="text"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="h-12 bg-muted border-0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name *</Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="h-12 bg-muted border-0"
              />
            </div>
          </div>

          {/* Age and Gender */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Age *</Label>
              <Input
                id="age"
                type="number"
                placeholder="25"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="h-12 bg-muted border-0"
                min="18"
                max="100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger className="h-12 bg-muted border-0">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                  <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* City */}
          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              type="text"
              placeholder="San Francisco"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="h-12 bg-muted border-0"
            />
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Social Links (Optional)</Label>
            <div className="space-y-3">
              <Input
                type="url"
                placeholder="Twitter/X URL"
                value={twitterUrl}
                onChange={(e) => setTwitterUrl(e.target.value)}
                className="h-12 bg-muted border-0"
              />
              <Input
                type="url"
                placeholder="LinkedIn URL"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                className="h-12 bg-muted border-0"
              />
            </div>
          </div>
        </div>

        <Button
          onClick={handleContinue}
          disabled={!isFormValid || isLoading}
          className="w-full h-14 text-base"
        >
          {isLoading ? 'Saving...' : "Continue"}
        </Button>
      </div>
    </div>
  );
};

export default SetupName;
