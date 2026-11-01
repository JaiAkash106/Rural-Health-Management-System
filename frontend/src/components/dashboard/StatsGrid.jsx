import { motion } from "framer-motion";
import { FiActivity, FiCalendar, FiShield, FiUsers } from "react-icons/fi";
import { Skeleton } from "../ui/Skeleton";
import { EmptyState } from "../ui/EmptyState";
import { Button } from "../ui/Button";
import { StatCard } from "../ui/StatCard";
import { staggerParent } from "../../motion/transitions";

const iconMap = {
  "Today's Patients": FiUsers,
  "Patients Today": FiUsers,
  "Appointments Live": FiCalendar,
  Appointments: FiCalendar,
  "Queue Waiting": FiUsers,
  "Consultations Completed": FiActivity,
  "Vaccinations Due": FiShield,
  "Low Stock Alerts": FiShield,
};

export function StatsGrid({ metrics = [], isLoading = false, error = "", onRetry }) {
  if (isLoading) {
    return (
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="Loading dashboard metrics">
        {[0, 1, 2, 3].map((item) => <Skeleton className="h-40" key={item} />)}
      </section>
    );
  }

  if (error) {
    return <EmptyState action={<Button onClick={onRetry} type="button">Retry dashboard</Button>} description={error} title="Dashboard data could not be loaded" />;
  }

  if (!metrics.length) {
    return <EmptyState description="No dashboard metrics are available for the selected day." title="No live dashboard data" />;
  }

  return (
    <motion.section
      animate="visible"
      className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
      initial="hidden"
      variants={staggerParent}
    >
      {metrics.map((metric) => (
        <StatCard
          accent={metric.accent}
          detail={metric.detail}
          icon={iconMap[metric.label]}
          key={metric.label}
          label={metric.label}
          value={metric.value}
        />
      ))}
    </motion.section>
  );
}
