import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "./contexts/UserContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import SetupName from "./pages/SetupName";
import SelectObjectives from "./pages/SelectObjectives";
import SelectIdea from "./pages/SelectIdea";
import SelectAbout from "./pages/SelectAbout";
import SelectSkill from "./pages/SelectSkill";
import SelectSelf from "./pages/SelectSelf";
import SelectOther from "./pages/SelectOther";
import Home from "./pages/Home";
import Connections from "./pages/Connections";
import Idea from "./pages/Idea";
import TeamSpace from "./pages/TeamSpace";
import Marketplace from "./pages/Marketplace";
import ConnectionHistory from "./pages/ConnectionHistory";
import Settings from "./pages/Settings";
import UserProfile from "./pages/UserProfile";
import MeetingLoading from "./pages/MeetingLoading";
import Meeting from "./pages/Meeting";
import TeamSpaceMeeting from "./pages/TeamSpaceMeeting";
import BountyMeeting from "./pages/BountyMeeting";
import Feedback from "./pages/Feedback";
import TestSupabase from "./pages/TestSupabase";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <UserProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          
          {/* Protected setup routes */}
          <Route path="/setup-name" element={
            <ProtectedRoute><SetupName /></ProtectedRoute>
          } />
          <Route path="/select-objectives" element={
            <ProtectedRoute><SelectObjectives /></ProtectedRoute>
          } />
          <Route path="/select-idea" element={
            <ProtectedRoute><SelectIdea /></ProtectedRoute>
          } />
          <Route path="/select-about" element={
            <ProtectedRoute><SelectAbout /></ProtectedRoute>
          } />
          <Route path="/select-skill" element={
            <ProtectedRoute><SelectSkill /></ProtectedRoute>
          } />
          <Route path="/select-self" element={
            <ProtectedRoute><SelectSelf /></ProtectedRoute>
          } />
          <Route path="/select-other" element={
            <ProtectedRoute><SelectOther /></ProtectedRoute>
          } />
          
          {/* Protected main app routes */}
          <Route path="/connections" element={
            <ProtectedRoute><Connections /></ProtectedRoute>
          } />
          <Route path="/idea" element={
            <ProtectedRoute><Idea /></ProtectedRoute>
          } />
          <Route path="/team-space" element={
            <ProtectedRoute><TeamSpace /></ProtectedRoute>
          } />
          <Route path="/marketplace" element={
            <ProtectedRoute><Marketplace /></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><Home /></ProtectedRoute>
          } />
          {/* Keep /home for backward compatibility, redirect to /profile */}
          <Route path="/home" element={
            <ProtectedRoute><Home /></ProtectedRoute>
          } />
          <Route path="/profile/:userId" element={
            <ProtectedRoute><UserProfile /></ProtectedRoute>
          } />
          <Route path="/connection-history" element={
            <ProtectedRoute><ConnectionHistory /></ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute><Settings /></ProtectedRoute>
          } />
          
          {/* Meeting routes */}
          <Route path="/meeting-loading" element={
            <ProtectedRoute><MeetingLoading /></ProtectedRoute>
          } />
          <Route path="/meeting" element={
            <ProtectedRoute><Meeting /></ProtectedRoute>
          } />
          <Route path="/team-space-meeting" element={
            <ProtectedRoute><TeamSpaceMeeting /></ProtectedRoute>
          } />
          <Route path="/bounty-meeting" element={
            <ProtectedRoute><BountyMeeting /></ProtectedRoute>
          } />
          <Route path="/feedback" element={
            <ProtectedRoute><Feedback /></ProtectedRoute>
          } />
          
          {/* Dev/Test routes */}
          <Route path="/test-supabase" element={<TestSupabase />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </TooltipProvider>
    </UserProvider>
  </QueryClientProvider>
);

export default App;
