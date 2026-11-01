import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { quickActionLinks } from "../../config/navigation";
import { canAccess } from "../../config/access";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/Button";
import { Card, CardContent, CardHeader } from "../ui/Card";

export function QuickActions() {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <Card className="overflow-hidden section-hero text-white">
      <CardHeader
        description="Reusable CTA cluster for registration, queue, consultation, and escalation actions."
        eyebrow="Quick Actions"
        title="Front-desk shortcuts for peak-hour speed"
      />

      <CardContent className="grid gap-3 sm:grid-cols-2">
        {quickActionLinks.filter((action) => canAccess(action.allowedRoles, user?.role)).map((action) => {
          const Icon = action.icon;

          return (
            <Link key={action.to} to={action.to}>
              <Button
                className="w-full justify-start border border-white/20 bg-white/10 text-left text-white hover:bg-white/16"
                size="lg"
                type="button"
                variant="ghost"
              >
                <Icon size={18} />
                {t(action.labelKey)}
              </Button>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
