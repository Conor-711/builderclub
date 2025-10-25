import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface EditableFieldProps {
  label: string;
  value: string;
  onSave: (value: string) => Promise<void>;
  type?: 'text' | 'email' | 'url' | 'textarea';
  multiline?: boolean;
}

const EditableField = ({
  label,
  value,
  onSave,
  type = 'text',
  multiline = false,
}: EditableFieldProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await onSave(editValue);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save');
      setEditValue(value);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
    setError(null);
  };

  if (!isEditing) {
    return (
      <div className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded border border-border hover:border-primary/50 transition-colors group">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground mb-1">{label}</p>
          <p className="text-base text-foreground break-words">
            {value || <span className="text-muted-foreground italic">(未设置)</span>}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditing(true)}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          编辑
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2 p-3 bg-card border-2 border-primary rounded">
      <p className="text-xs font-semibold text-foreground">{label}</p>
      {multiline ? (
        <Textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="min-h-[100px] resize-none"
          disabled={isSaving}
        />
      ) : (
        <Input
          type={type}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          disabled={isSaving}
        />
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex gap-2">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          size="sm"
        >
          {isSaving ? '保存中...' : '保存'}
        </Button>
        <Button
          variant="outline"
          onClick={handleCancel}
          disabled={isSaving}
          size="sm"
        >
          取消
        </Button>
      </div>
    </div>
  );
};

export default EditableField;
