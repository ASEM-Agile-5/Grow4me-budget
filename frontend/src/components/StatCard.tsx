import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  variant?: "default" | "success" | "warning" | "danger" | "hero" | "purple";
  className?: string;
}

const variantStyles = {
  default: "bg-card/60 border-white/5 stat-card-shadow hover:stat-card-shadow-hover",
  success: "bg-card/60 border-white/5 stat-card-shadow hover:stat-card-shadow-hover",
  warning: "bg-card/60 border-white/5 stat-card-shadow hover:stat-card-shadow-hover",
  danger: "bg-card/60 border-white/5 stat-card-shadow hover:stat-card-shadow-hover",
  hero: "finance-card-gradient border-white/20 hero-card-shadow",
  purple: "finance-card-gradient-purple border-white/20 hero-card-shadow",
};

const iconVariants = {
  default: "bg-primary/20 text-primary neon-glow-primary",
  success: "bg-success/20 text-success",
  warning: "bg-warning/20 text-warning",
  danger: "bg-destructive/20 text-destructive",
  hero: "bg-white/20 text-white backdrop-blur-md",
  purple: "bg-white/20 text-white backdrop-blur-md",
};

const StatCard = ({ title, value, subtitle, icon: Icon, variant = "default", className }: StatCardProps) => (
  <div 
    className={`relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 hover:scale-[1.02] ${variantStyles[variant]} ${className}`}
  >
    {variant === "hero" && (
      <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
    )}
    
    <div className="flex items-start justify-between relative z-10">
      <div className="space-y-1">
        <p className={`text-xs font-medium uppercase tracking-wider ${
          variant === "hero" || variant === "purple" ? "text-white/80" : "text-muted-foreground/80"
        }`}>{title}</p>
        <p className={`text-3xl font-bold tracking-tight ${
          variant === "hero" || variant === "purple" ? "text-white" : "text-foreground"
        }`}>{value}</p>
        {subtitle && (
          <p className={`text-[11px] font-medium mt-1 ${
            variant === "hero" || variant === "purple" ? "text-white/70" : "text-muted-foreground"
          }`}>{subtitle}</p>
        )}
      </div>
      <div className={`rounded-xl p-3 ${iconVariants[variant]}`}>
        <Icon className="h-6 w-6" />
      </div>
    </div>
  </div>
);

export default StatCard;
