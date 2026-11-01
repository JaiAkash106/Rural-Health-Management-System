import { FiActivity, FiAlertCircle, FiClock, FiShield } from "react-icons/fi";
import { Card, CardContent, CardHeader } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Skeleton } from "../ui/Skeleton";

function buildHighlights(operations) {
  return [
    {
      icon: FiAlertCircle,
      title: "Critical laboratory results",
      detail: `${operations.criticalLabResults} critical results recorded today.`,
      tone: operations.criticalLabResults > 0 ? "warning" : "neutral",
    },
    {
      icon: FiClock,
      title: "Pending prescriptions",
      detail: `${operations.pendingPrescriptions} prescription records await pharmacy processing.`,
      tone: operations.pendingPrescriptions > 0 ? "info" : "neutral",
    },
    {
      icon: FiShield,
      title: "Stock alerts",
      detail: `${operations.lowMedicineBatches + operations.lowVaccineBatches} low-stock medicine or vaccine batches recorded.`,
      tone: operations.lowMedicineBatches + operations.lowVaccineBatches > 0 ? "warning" : "success",
    },
    {
      icon: FiActivity,
      title: "Vaccinations today",
      detail: `${operations.todaysVaccinations} vaccination records administered today.`,
      tone: "brand",
    },
  ];
}

export function CareHighlights({ operations, isLoading = false, error = "" }) {
  const highlights = operations ? buildHighlights(operations) : [];

  return (
    <Card>
      <CardHeader
        description="Live operational counts derived from saved records."
        eyebrow="Clinical Signals"
        title="What needs attention right now"
      />
      <CardContent className="grid gap-4 md:grid-cols-2">
        {isLoading ? <Skeleton className="col-span-full h-48" /> : null}
        {!isLoading && error ? <p className="col-span-full text-sm text-[var(--color-danger)]">{error}</p> : null}
        {!isLoading && !error && !highlights.length ? <p className="col-span-full text-sm text-[var(--color-foreground-muted)]">No live clinical summary is available.</p> : null}
        {!isLoading && !error && highlights.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="rounded-2xl bg-[var(--color-surface-strong)] p-3 shadow-[var(--shadow-quiet)]">
                  <Icon className="text-[var(--color-brand)]" size={18} />
                </span>
                <Badge tone={item.tone}>{item.tone}</Badge>
              </div>
              <h4 className="mt-4 text-lg font-semibold text-[var(--color-foreground)]">{item.title}</h4>
              <p className="mt-2 text-sm leading-6 text-[var(--color-foreground-muted)]">{item.detail}</p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
