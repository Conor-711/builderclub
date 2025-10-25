import TopBar from "./TopBar";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <div className="pt-20">
        {children}
      </div>
    </div>
  );
};

export default AppLayout;
