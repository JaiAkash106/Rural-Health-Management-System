import { Link } from "react-router-dom";
import { FiActivity, FiArrowRight, FiDatabase, FiGlobe, FiShield, FiSmartphone } from "react-icons/fi";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatCard } from "../../components/ui/StatCard";
import { getBreadcrumbs } from "../../utils/breadcrumbs";

const highlights = [
  {
    title: "Offline-first care continuity",
    description: "IndexedDB-backed drafts, queued sync, and resilient queue workflows for weak-connectivity rural environments.",
    icon: FiGlobe,
  },
  {
    title: "Safe AI assistance",
    description: "Review-only summaries and duplicate detection with redaction, disclaimers, and audit trails.",
    icon: FiShield,
  },
  {
    title: "Multi-PHC foundation",
    description: "Organization and facility hierarchy, referrals, consent checks, and tenant-aware APIs.",
    icon: FiDatabase,
  },
];

const stats = [
  { label: "Core Modules", value: "12+", detail: "Patients, queue, lab, pharmacy, vaccination, analytics, AI, outreach", accent: "linear-gradient(135deg,#2E7D32,#6bd388)" },
  { label: "Languages", value: "2", detail: "English and Tamil interfaces", accent: "linear-gradient(135deg,#00879a,#6bd8e2)" },
  { label: "Workflow Shortcuts", value: "9", detail: "Guided operational navigation", accent: "linear-gradient(135deg,#d89812,#f7d27d)" },
  { label: "Deployment Ready", value: "PWA", detail: "Browser installable with offline support", accent: "linear-gradient(135deg,#8f4bd6,#c69cff)" },
];

export function PresentationDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={getBreadcrumbs("/presentation")}
        description="Presentation-first summary for faculty review and portfolio walk-through."
        eyebrow="Showcase"
        title="RHMS Presentation Dashboard"
      />

      <section className="relative overflow-hidden rounded-4xl border border-white/10 bg-[linear-gradient(130deg,#12391d_0%,#2E7D32_35%,#006b77_100%)] p-6 text-white shadow-[0_24px_80px_rgba(10,44,25,0.32)] md:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.10),transparent_24%)]" />
        <div className="relative max-w-4xl">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-white/78">Academic Project Showcase</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight md:text-5xl">
            Rural Health Management System for Primary Health Centres
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/88">
            A MERN-based platform for patient registration, longitudinal records, appointments, token queue, consultation,
            pharmacy, laboratory, vaccination, analytics, offline-first workflows, multilingual access, and safe AI assistance.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/"><Button size="lg" type="button">Open live system <FiArrowRight size={18} /></Button></Link>
            <Link to="/about-project"><Button className="border-white/12 bg-white/10 text-white hover:bg-white/14" size="lg" type="button" variant="ghost">About project</Button></Link>
            <Link to="/ai-governance"><Button className="border-white/12 bg-white/10 text-white hover:bg-white/14" size="lg" type="button" variant="ghost"><FiActivity size={18} /> AI safety</Button></Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <StatCard key={item.label} accent={item.accent} label={item.label} value={item.value} detail={item.detail} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        {highlights.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title}>
              <CardHeader eyebrow="Innovation" title={item.title} />
              <CardContent>
                <div className="mb-4 inline-flex rounded-2xl bg-[var(--color-surface-strong)] p-3 text-[var(--color-brand)] shadow-[var(--shadow-quiet)]">
                  <Icon size={20} />
                </div>
                <p className="text-sm leading-7 text-[var(--color-foreground-muted)]">{item.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader eyebrow="Live Shortcuts" title="Workflow shortcuts" />
          <CardContent className="grid gap-3 md:grid-cols-2">
            <Link to="/patients/register"><Button className="w-full justify-start" size="md" type="button" variant="secondary">1. Patient registration</Button></Link>
            <Link to="/appointments"><Button className="w-full justify-start" size="md" type="button" variant="secondary">2. Appointment booking</Button></Link>
            <Link to="/appointments/queue"><Button className="w-full justify-start" size="md" type="button" variant="secondary">3. Token queue</Button></Link>
            <Link to="/doctors"><Button className="w-full justify-start" size="md" type="button" variant="secondary">4. Doctor consultation</Button></Link>
            <Link to="/pharmacy"><Button className="w-full justify-start" size="md" type="button" variant="secondary">5. Pharmacy</Button></Link>
            <Link to="/laboratory"><Button className="w-full justify-start" size="md" type="button" variant="secondary">6. Laboratory</Button></Link>
            <Link to="/vaccination"><Button className="w-full justify-start" size="md" type="button" variant="secondary">7. Vaccination</Button></Link>
            <Link to="/analytics"><Button className="w-full justify-start" size="md" type="button" variant="secondary">8. Analytics</Button></Link>
            <Link to="/referrals"><Button className="w-full justify-start" size="md" type="button" variant="secondary">9. Referral workflow</Button></Link>
            <Link to="/ai-governance"><Button className="w-full justify-start" size="md" type="button" variant="secondary">10. Safe AI review</Button></Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader eyebrow="Portfolio Notes" title="Why this project stands out" />
          <CardContent className="space-y-4 text-sm leading-7 text-[var(--color-foreground-muted)]">
            <p>Built on a layered MERN architecture with role-aware workflows for reception, doctor, pharmacy, lab, vaccination, health worker, and administrators.</p>
            <p>Designed for rural healthcare constraints with offline-first behavior, multilingual interface support, resilient queue management, and printable artifacts.</p>
            <p>Extended into a platform direction with multi-PHC readiness, consent-controlled referrals, FHIR-style exports, AI governance, outreach operations, and device management foundations.</p>
            <p>Prepared for academic evaluation with report-ready documentation, viva preparation, and release packaging.</p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
