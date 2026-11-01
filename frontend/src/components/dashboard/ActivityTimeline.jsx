import { Card, CardContent, CardHeader } from "../ui/Card";
import { Skeleton } from "../ui/Skeleton";

export function ActivityTimeline({ activities = [], isLoading = false, error = "" }) {
  return (
    <Card>
      <CardHeader
        description="Designed to evolve into a full audit log, role activity stream, and notification feed."
        eyebrow="Activity Feed"
        title="Operational audit highlights"
      />

      <CardContent className="space-y-5">
        {isLoading ? <Skeleton className="h-44" /> : null}
        {!isLoading && error ? <p className="text-sm text-[var(--color-danger)]">{error}</p> : null}
        {!isLoading && !error && !activities.length ? <p className="text-sm text-[var(--color-foreground-muted)]">No recorded activity is available for your account.</p> : null}
        {!isLoading && !error && activities.map((activity) => (
          <div key={`${activity.time}-${activity.title}`} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="h-3 w-3 rounded-full bg-[var(--color-brand)]" />
              <div className="mt-2 h-full w-px bg-[var(--color-border)]" />
            </div>
            <div className="pb-4">
              <p className="text-sm font-medium text-[var(--color-foreground-muted)]">{activity.time}</p>
              <h4 className="mt-1 font-semibold text-[var(--color-foreground)]">{activity.title}</h4>
              <p className="mt-1 text-sm text-[var(--color-foreground-muted)]">{activity.note}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
