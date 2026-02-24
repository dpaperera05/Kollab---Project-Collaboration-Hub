import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useLayoutEffect } from "react";
import { ThemeProvider } from "next-themes";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";
import ProjectsPage from "./pages/ProjectsPage";
import ProjectDetailsPage from "./pages/ProjectDetailsPage";
import PostProjectPage from "./pages/PostProjectPage";
import Chatbot from "./components/chatbot/Chatbot";
import ProfilePage from "./pages/profile/ProfilePage";
import PortfolioShowcasePage from "./pages/portfolio/PortfolioShowcasePage";

import PeoplePage from "./pages/PeoplePage";
import PersonProfilePage from "./pages/PersonProfilePage";
import MentorsPage from "./pages/MentorsPage";
import MentorProfilePage from "./pages/MentorProfilePage";

import ProjectWorkspacePage from "./pages/projects/ProjectWorkspacePage";
import EventsListingPage from "./pages/events/EventsListingPage";
import CreateEventPage from "@/pages/events/CreateEventPage";
import BlogsPage from "@/pages/BlogsPage";
import BlogDetailPage from "@/pages/BlogDetailPage";
import CreateBlogPage from "@/pages/blogs/CreateBlogPage";

//Auth related webpages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import VerifyEmailPage from "./pages/auth/VerifyEmailPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";

//Onboridng related webpages
import RoleStep from "./pages/onboarding/RoleStep";
import BasicsStep from "./pages/onboarding/BasicsStep";
import SkillsStep from "./pages/onboarding/SkillsStep";
import LinksStep from "./pages/onboarding/LinksStep";
import AvailabilityStep from "./pages/onboarding/AvailabilityStep";
import InterestsStep from "./pages/onboarding/InterestsStep";

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);
  return null;
};

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:id" element={<ProjectDetailsPage />} />
            <Route path="/projects/new" element={<PostProjectPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/portfolio/:id" element={<PortfolioShowcasePage />} />
            <Route path="/projects/:id/workspace" element={<ProjectWorkspacePage />} />

            <Route path="/events" element={<EventsListingPage />} />
            <Route path="/events/create" element={<CreateEventPage />} />
            <Route path="/blogs" element={<BlogsPage />} />
            <Route path="/blogs/create" element={<CreateBlogPage />} />
            <Route path="/blogs/:id" element={<BlogDetailPage />} />

            <Route path="/people" element={<PeoplePage />} />
            <Route path="/people/:id" element={<PersonProfilePage />} />
            <Route path="/mentors" element={<MentorsPage />} />
            <Route path="/mentors/:id" element={<MentorProfilePage />} />

            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            <Route path="/onboarding/role" element={<RoleStep />} />
            <Route path="/onboarding/basics" element={<BasicsStep />} />
            <Route path="/onboarding/skills" element={<SkillsStep />} />
            <Route path="/onboarding/links" element={<LinksStep />} />
            <Route path="/onboarding/availability" element={<AvailabilityStep />} />
            <Route path="/onboarding/interests" element={<InterestsStep />} />


            <Route path="*" element={<NotFound />} />
          </Routes>
          <Chatbot />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
