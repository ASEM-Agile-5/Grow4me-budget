import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  variant?: "default" | "success" | "warning" | "danger";
}

const variantStyles = {
  default: "bg-card stat-card-shadow hover:stat-card-shadow-hover",
  success: "bg-card stat-card-shadow hover:stat-card-shadow-hover",
  warning: "bg-card stat-card-shadow hover:stat-card-shadow-hover",
  danger: "bg-card stat-card-shadow hover:stat-card-shadow-hover",
};

const iconVariants = {
  default: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-destructive/10 text-destructive",
};

const StatCard = ({ title, value, subtitle, icon: Icon, variant = "default" }: StatCardProps) => (
  <div className={`rounded-xl border p-5 transition-shadow duration-200 ${variantStyles[variant]}`}>
    <div className="flex items-start justify-between">
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      <div className={`rounded-lg p-2.5 ${iconVariants[variant]}`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </div>
);

export default StatCard;
