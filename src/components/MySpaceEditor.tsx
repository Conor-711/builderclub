import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { 
  Pencil, 
  Save, 
  X, 
  Upload, 
  Building2,
  Sparkles,
  Users,
  Target,
  Rocket
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { useToast } from '@/hooks/use-toast';

export interface MySpace {
  id: string;
  name: string;
  tagline: string;
  description: string;
  logo: string;
  coverImage?: string;
  stage: 'idea' | 'building' | 'launching' | 'launched';
  goals?: string[];
  lookingFor?: string[];
  createdAt: string;
  updatedAt: string;
}

interface MySpaceEditorProps {
  space: MySpace | null;
  onSave: (space: MySpace) => void;
  onCancel?: () => void;
}

const STAGE_OPTIONS = [
  { value: 'idea', label: 'Idea Stage', color: 'bg-blue-500' },
  { value: 'building', label: 'Building', color: 'bg-yellow-500' },
  { value: 'launching', label: 'Launching', color: 'bg-orange-500' },
  { value: 'launched', label: 'Launched', color: 'bg-green-500' }
] as const;

export function MySpaceEditor({ space, onSave, onCancel }: MySpaceEditorProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(!space); // If no space exists, start in edit mode
  const [formData, setFormData] = useState<Partial<MySpace>>(
    space || {
      name: '',
      tagline: '',
      description: '',
      logo: '/src/assets/demo/lowercase.png',
      stage: 'idea',
      goals: [],
      lookingFor: []
    }
  );

  const [logoPreview, setLogoPreview] = useState(formData.logo || '');

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoPreview(result);
        setFormData({ ...formData, logo: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!formData.name || !formData.tagline) {
      toast({
        title: 'Missing information',
        description: 'Please fill in name and tagline',
        variant: 'destructive'
      });
      return;
    }

    const now = new Date().toISOString();
    const savedSpace: MySpace = {
      id: space?.id || `space-${Date.now()}`,
      name: formData.name!,
      tagline: formData.tagline!,
      description: formData.description || '',
      logo: formData.logo!,
      coverImage: formData.coverImage,
      stage: (formData.stage as MySpace['stage']) || 'idea',
      goals: formData.goals || [],
      lookingFor: formData.lookingFor || [],
      createdAt: space?.createdAt || now,
      updatedAt: now
    };

    onSave(savedSpace);
    setIsEditing(false);
    
    toast({
      title: 'Space saved!',
      description: 'Your space has been updated successfully'
    });
  };

  const handleCancel = () => {
    if (space) {
      setFormData(space);
      setLogoPreview(space.logo);
      setIsEditing(false);
    } else {
      onCancel?.();
    }
  };

  if (!isEditing && space) {
    // Display mode
    return (
      <Card className="p-8 bg-gradient-to-br from-background via-primary/5 to-primary/10 border-2 border-primary/20">
        <div className="space-y-6">
          {/* Header with Edit Button */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 ring-4 ring-primary/20">
                <AvatarImage src={space.logo} alt={space.name} />
                <AvatarFallback className="text-2xl font-bold">
                  {space.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  {space.name}
                </h2>
                <p className="text-lg text-muted-foreground mt-1">{space.tagline}</p>
              </div>
            </div>
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              className="gap-2"
            >
              <Pencil className="w-4 h-4" />
              Edit Space
            </Button>
          </div>

          {/* Stage Badge */}
          <div>
            {STAGE_OPTIONS.map(option => {
              if (option.value === space.stage) {
                return (
                  <Badge key={option.value} className={`${option.color} text-white`}>
                    {option.label}
                  </Badge>
                );
              }
              return null;
            })}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              About
            </h3>
            <p className="text-foreground leading-relaxed">
              {space.description || 'No description yet'}
            </p>
          </div>

          {/* Goals */}
          {space.goals && space.goals.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <Target className="w-4 h-4" />
                Goals
              </h3>
              <div className="flex flex-wrap gap-2">
                {space.goals.map((goal, index) => (
                  <Badge key={index} variant="secondary">
                    {goal}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Looking For */}
          {space.lookingFor && space.lookingFor.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                Looking For
              </h3>
              <div className="flex flex-wrap gap-2">
                {space.lookingFor.map((item, index) => (
                  <Badge key={index} variant="outline" className="border-primary/50 text-primary">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="pt-4 border-t text-xs text-muted-foreground flex items-center gap-4">
            <span>Created: {new Date(space.createdAt).toLocaleDateString()}</span>
            <span>•</span>
            <span>Updated: {new Date(space.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </Card>
    );
  }

  // Edit mode
  return (
    <Card className="p-8 bg-gradient-to-br from-background via-primary/5 to-primary/10 border-2 border-primary/20">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">
              {space ? 'Edit Your Space' : 'Create Your Space'}
            </h2>
          </div>
          {space && (
            <Button variant="ghost" size="icon" onClick={handleCancel}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Logo Upload */}
        <div className="space-y-2">
          <Label>Space Logo</Label>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 ring-2 ring-primary/20">
              <AvatarImage src={logoPreview} alt="Logo preview" />
              <AvatarFallback>
                <Upload className="w-8 h-8 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <div>
              <input
                type="file"
                id="logo-upload"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('logo-upload')?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Logo
              </Button>
              <p className="text-xs text-muted-foreground mt-1">
                Recommended: Square image, at least 200x200px
              </p>
            </div>
          </div>
        </div>

        {/* Space Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Space Name *</Label>
          <Input
            id="name"
            placeholder="e.g., My Awesome Startup"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        {/* Tagline */}
        <div className="space-y-2">
          <Label htmlFor="tagline">Tagline *</Label>
          <Input
            id="tagline"
            placeholder="A brief description of what you're building"
            value={formData.tagline || ''}
            onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Tell more about your project, vision, and what makes it special..."
            rows={4}
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        {/* Stage Selection */}
        <div className="space-y-2">
          <Label>Current Stage</Label>
          <div className="grid grid-cols-2 gap-2">
            {STAGE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setFormData({ ...formData, stage: option.value })}
                className={`
                  p-3 rounded-lg border-2 transition-all
                  flex items-center gap-2
                  ${formData.stage === option.value
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                  }
                `}
              >
                <div className={`w-3 h-3 rounded-full ${option.color}`} />
                <span className="text-sm font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          {(space || onCancel) && (
            <Button variant="outline" onClick={handleCancel} className="flex-1">
              Cancel
            </Button>
          )}
          <Button onClick={handleSave} className="flex-1 gap-2">
            <Save className="w-4 h-4" />
            {space ? 'Save Changes' : 'Create Space'}
          </Button>
        </div>
      </div>
    </Card>
  );
}

