import AppLayout from "@/components/AppLayout";

const Settings = () => {
  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-6">Settings</h1>
        <div className="bg-card border rounded-lg p-8 text-center">
          <p className="text-muted-foreground">Settings page content goes here</p>
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings;
