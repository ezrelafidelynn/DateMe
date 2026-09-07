import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

import Navbar from "./components/Navbar";
import MatchModal from "./components/MatchModal";

import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import OnboardingPage from "./pages/OnboardingPage";
import DiscoverPage from "./pages/DiscoverPage";
import MatchesPage from "./pages/MatchesPage";
import ChatPage from "./pages/ChatPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";

import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import { useMatchStore } from "./store/useMatchStore";

export default function App() {
  const { authUser, checkAuth, isCheckingAuth, socket } = useAuthStore();
  const { theme } = useThemeStore();
  const { subscribe, unsubscribe } = useMatchStore();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!socket) return undefined;
    subscribe();
    return () => unsubscribe();
  }, [socket, subscribe, unsubscribe]);

  if (isCheckingAuth && !authUser) {
    return (
      <div data-theme={theme} className="min-h-screen paper flex items-center justify-center">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  const needsOnboarding = authUser && !authUser.onboarded;
  const onOnboarding = location.pathname === "/onboarding";
  const showNav = authUser && !needsOnboarding;

  return (
    <div data-theme={theme} className="min-h-screen paper text-base-content">
      {showNav && <Navbar />}

      <Routes>
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />

        <Route
          path="/onboarding"
          element={
            !authUser ? <Navigate to="/login" /> : needsOnboarding ? <OnboardingPage /> : <Navigate to="/" />
          }
        />

        <Route path="/" element={guard(authUser, needsOnboarding, <DiscoverPage />)} />
        <Route path="/matches" element={guard(authUser, needsOnboarding, <MatchesPage />)} />
        <Route path="/chat/:matchId" element={guard(authUser, needsOnboarding, <ChatPage />)} />
        <Route path="/profile" element={guard(authUser, needsOnboarding, <ProfilePage />)} />
        <Route path="/settings" element={guard(authUser, needsOnboarding, <SettingsPage />)} />

        <Route path="*" element={<Navigate to={authUser ? "/" : "/login"} />} />
      </Routes>

      {showNav && !onOnboarding && <MatchModal />}
      <Toaster position="top-center" />
    </div>
  );
}

function guard(authUser, needsOnboarding, element) {
  if (!authUser) return <Navigate to="/login" />;
  if (needsOnboarding) return <Navigate to="/onboarding" />;
  return element;
}
