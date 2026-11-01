import { AnimatePresence, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Outlet } from "react-router-dom";
import { PostLoginIntro } from "../components/intro/PostLoginIntro";
import { Header } from "../components/nav/Header";
import { Sidebar } from "../components/nav/Sidebar";
import { useAuth } from "../context/AuthContext";
import { MotionPage } from "../motion/MotionPage";

export function AppShell() {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const reduceMotion = useReducedMotion();
  const [isCompact, setIsCompact] = useState(() => window.localStorage.getItem("rhms-sidebar-compact") === "true");
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(() => window.sessionStorage.getItem("rhms-show-welcome") === "true");
  const [messageIndex, setMessageIndex] = useState(0);
  const duration = reduceMotion ? 1400 : 5000;

  const welcomeMessages = useMemo(
    () => [t("intro.loading1"), t("intro.loading2"), t("intro.loading3"), t("intro.loading4")],
    [t],
  );

  useEffect(() => {
    window.localStorage.setItem("rhms-sidebar-compact", String(isCompact));
  }, [isCompact]);

  useEffect(() => {
    document.documentElement.dataset.lang = i18n.language;
    document.documentElement.lang = i18n.language === "ta" ? "ta" : "en";
  }, [i18n.language]);

  useEffect(() => {
    if (!showWelcome) {
      return undefined;
    }

    const stepDuration = reduceMotion ? duration : 900;
    const interval = window.setInterval(() => {
      setMessageIndex((current) => (current < welcomeMessages.length - 1 ? current + 1 : current));
    }, stepDuration);
    const timeout = window.setTimeout(() => {
      setShowWelcome(false);
      window.sessionStorage.removeItem("rhms-show-welcome");
      setMessageIndex(0);
    }, duration);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [duration, reduceMotion, showWelcome, welcomeMessages.length]);

  useEffect(() => {
    function handleReplayWelcome() {
      setMessageIndex(0);
      setShowWelcome(true);
      window.sessionStorage.setItem("rhms-show-welcome", "true");
    }

    window.addEventListener("rhms-replay-welcome", handleReplayWelcome);
    return () => window.removeEventListener("rhms-replay-welcome", handleReplayWelcome);
  }, []);

  useEffect(() => {
    if (!isMobileOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileOpen]);

  const greeting = useMemo(() => {
    const firstName = user?.fullName?.split(" ")[0] || "Team";
    return i18n.language === "ta" ? `${firstName}, மீண்டும் வரவேற்கிறோம்` : `Welcome back, ${firstName}`;
  }, [i18n.language, user?.fullName]);

  const facilityName = useMemo(() => user?.tenant?.facilityName || user?.primaryFacility?.name || "", [user?.primaryFacility?.name, user?.tenant?.facilityName]);
  const statusMessage = welcomeMessages[messageIndex];
  const showSuccess = messageIndex >= welcomeMessages.length - 1;
  const expandedSidebarWidth = i18n.language === "ta" ? 316 : 292;

  return (
    <div className="app-shell-bg min-h-screen px-3 py-3 md:px-5 md:py-5 lg:px-6 lg:py-6">
      {isMobileOpen ? (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-slate-950/45 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
          type="button"
        />
      ) : null}

      <div
        className={`mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-[1600px] grid-cols-1 gap-5 ${isCompact ? "lg:grid-cols-[76px_1fr]" : "lg:grid-cols-[minmax(292px,316px)_1fr]"}`}
        style={!isCompact ? { gridTemplateColumns: `minmax(${expandedSidebarWidth}px, ${expandedSidebarWidth}px) 1fr` } : undefined}
      >
        <Sidebar
          isCompact={isCompact}
          isMobileOpen={isMobileOpen}
          onCloseMobile={() => setIsMobileOpen(false)}
          onToggleCompact={() => setIsCompact((current) => !current)}
        />

        <div className="glass-panel overflow-hidden rounded-[2rem] border border-[var(--color-border)] shadow-[var(--shadow-soft)]">
          <Header onOpenMobileNav={() => setIsMobileOpen(true)} onToggleSidebar={() => setIsCompact((current) => !current)} />
          <main aria-hidden={showWelcome} className={`${showWelcome ? "invisible opacity-0" : "visible opacity-100"} p-3 transition-opacity duration-300 md:p-5 lg:p-6`}>
            <AnimatePresence mode="wait">
              <MotionPage>
                <Outlet />
              </MotionPage>
            </AnimatePresence>
          </main>
          <footer className={`${showWelcome ? "invisible opacity-0" : "visible opacity-100"} flex flex-col gap-2 border-t border-[var(--color-border)] px-6 py-4 text-sm text-[var(--color-foreground-muted)] transition-opacity duration-300 md:flex-row md:items-center md:justify-between`}>
            <span>{t("footer.line1")}</span>
            <span>{t("footer.line2")}</span>
          </footer>
        </div>
      </div>

      <AnimatePresence>
        {showWelcome ? (
          <PostLoginIntro
            duration={duration}
            facilityName={facilityName}
            greeting={greeting}
            onSkip={() => {
              setShowWelcome(false);
              window.sessionStorage.removeItem("rhms-show-welcome");
              setMessageIndex(0);
            }}
            showSuccess={showSuccess}
            statusMessage={statusMessage}
            userRole={user?.role || "Staff"}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
