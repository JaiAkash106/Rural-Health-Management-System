import { Badge } from "../ui/Badge";
import { Card, CardContent, CardHeader } from "../ui/Card";
import { DataTable } from "../ui/DataTable";
import { Skeleton } from "../ui/Skeleton";

export function QueuePanel({ items = [], performance = [], isLoading = false, error = "" }) {
  const queueColumns = [
    { key: "service", label: "Service" },
    { key: "average", label: "Average Wait" },
    { key: "throughput", label: "Today's Throughput" },
  ];

  return (
    <Card>
      <CardHeader
        action={<Badge tone="success">Live data</Badge>}
        description="Priority triage, emergency routing, and completed-queue performance from saved records."
        eyebrow="Live Queue"
        title="Consultation flow and token priority"
      />

      <CardContent className="space-y-4">
        {isLoading ? <Skeleton className="h-64" /> : null}
        {!isLoading && error ? <p className="text-sm text-[var(--color-danger)]">{error}</p> : null}
        {!isLoading && !error && !items.length ? <p className="text-sm text-[var(--color-foreground-muted)]">No active queue entries today.</p> : null}
        {!isLoading && !error && items.map((item) => (
          <article
            key={item.id}
            className="flex flex-col gap-3 rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-foreground-muted)]">
                Token {item.token}
              </p>
              <h4 className="mt-2 text-lg font-semibold text-[var(--color-foreground)]">{item.patientName}</h4>
              <p className="mt-1 text-sm text-[var(--color-foreground-muted)]">
                {item.department}{Number.isFinite(item.estimatedWaitMinutes) ? ` - Estimated wait: ${item.estimatedWaitMinutes} min` : ""}
              </p>
            </div>
            <Badge tone={item.priority === "emergency" ? "danger" : item.priority !== "normal" ? "warning" : "neutral"}>
              {item.priority}
            </Badge>
          </article>
        ))}

        {!isLoading && !error ? <DataTable columns={queueColumns} rows={performance} /> : null}
      </CardContent>
    </Card>
  );
}
