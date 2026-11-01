import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FiActivity, FiArrowRight, FiCalendar, FiClock, FiShield } from "react-icons/fi";
import { Link } from "react-router-dom";
import { api } from "../../services/api";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Card, CardContent } from "../../components/ui/Card";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { ActivityTimeline } from "../../components/dashboard/ActivityTimeline";
import { CareHighlights } from "../../components/dashboard/CareHighlights";
import { QueuePanel } from "../../components/dashboard/QueuePanel";
import { QuickActions } from "../../components/dashboard/QuickActions";
import { StatsGrid } from "../../components/dashboard/StatsGrid";
import { DoctorAvailabilityPanel } from "../dashboard/DoctorAvailabilityPanel";
import { NotificationsSummary } from "../dashboard/NotificationsSummary";

export function DashboardPage() {
  const { t, i18n } = useTranslation();
  const [summary, setSummary] = useState({
    metrics: [],
    recentActivities: [],
    queueEntries: [],
    queuePerformance: [],
    doctorAvailability: [],
    recentNotifications: [],
    operations: null,
  });
  const [summaryState, setSummaryState] = useState("loading");
  const [summaryError, setSummaryError] = useState("");
  const locale = i18n.language === "ta" ? "ta-IN" : "en-IN";

  const formattedDate = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        weekday: "long",
        day: "numeric",
        month: "long",
      }).format(new Date()),
    [locale],
  );

  async function loadSummary() {
    setSummaryState("loading");
    setSummaryError("");

    try {
      const response = await api.get("/dashboard/summary");
      setSummary(response.data.data);
      setSummaryState("success");
    } catch (error) {
      setSummaryState("error");
      setSummaryError(error.response?.data?.message || "The dashboard could not retrieve live data. Check your connection and try again.");
    }
  }

  useEffect(() => {
    loadSummary();
  }, []);

  const isLoading = summaryState === "loading";
  const hasError = summaryState === "error";
  const currentConsultations = summary.operations?.currentConsultations;
  const completedConsultations = summary.operations?.completedConsultations;

  return (
    <div className="space-y-6">
      <section className="section-hero relative overflow-hidden rounded-[2rem] p-6 text-white shadow-[0_28px_90px_rgba(15,108,189,0.26)] md:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.14),transparent_22%)]" />
        <div className="relative grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="bg-white/16 !text-white ring-white/16" tone="neutral">{t("dashboard.liveCommandCenter")}</Badge>
              <Badge className="bg-white/16 !text-white ring-white/16" tone="neutral">{formattedDate}</Badge>
            </div>
            <h1 className="ui-display mt-4 max-w-3xl !text-white [text-shadow:0_0_12px_rgba(96,165,250,0.15)]">
              {t("dashboard.heroTitle")}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/90">
              {t("dashboard.heroDescription")}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/patients/register">
                <Button size="lg" type="button">
                  {t("dashboard.openPatientIntake")}
                  <FiArrowRight size={18} />
                </Button>
              </Link>
              <Link to="/appointments">
                <Button className="border-white/12 bg-white/10 !text-white hover:bg-white/14" size="lg" type="button" variant="ghost">
                  <FiCalendar size={18} />
                  {t("dashboard.reviewAppointments")}
                </Button>
              </Link>
              <Link to="/appointments/queue">
                <Button className="border-white/12 bg-white/10 !text-white hover:bg-white/14" size="lg" type="button" variant="ghost">
                  <FiShield size={18} />
                  {t("dashboard.emergencyReadiness")}
                </Button>
              </Link>
            </div>
          </div>

          <Card className="glass-panel border-white/14 bg-white/10 !text-white shadow-none">
            <CardContent className="mt-0 grid gap-4">
              <div className="flex items-center justify-between rounded-[1.4rem] bg-white/10 p-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/84">Current consultations</p>
                  <p className="ui-stat mt-2 text-3xl font-semibold text-white [text-shadow:0_0_12px_rgba(96,165,250,0.15)]">{isLoading ? "…" : hasError ? "—" : currentConsultations}</p>
                </div>
                <FiActivity size={24} />
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-[1.4rem] bg-white/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/84">Completed consultations</p>
                  <p className="mt-2 text-lg font-semibold text-white">{isLoading ? "Loading live data" : hasError ? "Not available" : `${completedConsultations} completed today`}</p>
                </div>
                <div className="rounded-[1.4rem] bg-white/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/84">Dashboard source</p>
                  <p className="mt-2 flex items-center gap-2 text-lg font-semibold text-white">
                    <FiClock size={18} />
                    {isLoading ? "Loading" : hasError ? "Connection required" : "Saved RHMS records"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <SectionHeader description={t("dashboard.sectionDescription")} eyebrow={t("dashboard.liveOperations")} title={t("dashboard.sectionTitle")} />

      <StatsGrid error={summaryError} isLoading={isLoading} metrics={summary.metrics} onRetry={loadSummary} />

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <QueuePanel error={summaryError} isLoading={isLoading} items={summary.queueEntries} performance={summary.queuePerformance} />
        <ActivityTimeline activities={summary.recentActivities} error={summaryError} isLoading={isLoading} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <DoctorAvailabilityPanel doctors={summary.doctorAvailability} error={summaryError} isLoading={isLoading} />
        <NotificationsSummary error={summaryError} isLoading={isLoading} items={summary.recentNotifications} />
      </section>

      <CareHighlights error={summaryError} isLoading={isLoading} operations={summary.operations} />
      <QuickActions />
    </div>
  );
}
