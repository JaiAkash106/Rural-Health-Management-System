import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import { PageHeader } from "../../components/ui/PageHeader";
import { getBreadcrumbs } from "../../utils/breadcrumbs";

const sections = [
  {
    title: "Problem Statement",
    content:
      "Rural Primary Health Centres often depend on paper-based workflows that make patient history retrieval slow, duplicate registration common, queue management inefficient, and medicine, lab, and vaccination follow-up difficult to monitor.",
  },
  {
    title: "Proposed Solution",
    content:
      "RHMS digitizes patient registration, visit history, appointments, token queue, clinical consultation, pharmacy, laboratory, vaccination, analytics, referrals, and offline-first operational continuity in a single platform.",
  },
  {
    title: "Target Users",
    content:
      "Receptionists, doctors, pharmacists, laboratory technicians, health workers, facility administrators, district reviewers, and academic evaluators.",
  },
  {
    title: "Technology Stack",
    content:
      "React, React Router, Tailwind CSS, Framer Motion, Axios, Node.js, Express, MongoDB, Mongoose, JWT, Socket.IO, PDF/Excel exports, and Progressive Web App support.",
  },
  {
    title: "Expected Impact",
    content:
      "Faster record access, better queue visibility, improved follow-up tracking, clearer stock awareness, village-level reporting, and more reliable workflows in weak-connectivity environments.",
  },
  {
    title: "Limitations and Future Scope",
    content:
      "Real-world deployment would require clinical validation, legal review, production monitoring maturity, and approved external health-system integrations.",
  },
];

export function AboutProjectPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={getBreadcrumbs("/about-project")}
        description="Presentation-friendly explanation of the project objective, scope, users, architecture direction, and impact."
        eyebrow="About"
        title="About the RHMS Project"
      />

      <section className="grid gap-6 xl:grid-cols-2">
        {sections.map((section) => (
          <Card key={section.title}>
            <CardHeader eyebrow="Project Note" title={section.title} />
            <CardContent>
              <p className="text-sm leading-7 text-[var(--color-foreground-muted)]">{section.content}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
