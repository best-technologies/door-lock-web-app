interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: "primary" | "success" | "warning" | "info";
}

const colorClasses = {
  primary: {
    bg: "bg-primary-50",
    icon: "text-primary-600",
    border: "border-primary-200",
  },
  success: {
    bg: "bg-success-50",
    icon: "text-success-600",
    border: "border-success-200",
  },
  warning: {
    bg: "bg-orange-50",
    icon: "text-orange-600",
    border: "border-orange-200",
  },
  info: {
    bg: "bg-info-50",
    icon: "text-info-600",
    border: "border-info-200",
  },
};

export default function StatsCard({
  title,
  value,
  icon,
  trend,
  color = "primary",
}: StatsCardProps) {
  const colors = colorClasses[color];

  return (
    <div className={`rounded-xl border ${colors.border} bg-surface p-6 ${colors.bg}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-text-secondary">{title}</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              <span
                className={`text-sm font-medium ${
                  trend.isPositive ? "text-success-600" : "text-danger-600"
                }`}
              >
                {trend.isPositive ? "↑" : "↓"} {trend.value}
              </span>
              <span className="text-xs text-text-secondary">vs last month</span>
            </div>
          )}
        </div>
        <div className={`rounded-lg ${colors.bg} p-3 ${colors.icon}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

