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
    gradient: "from-primary-500 to-primary-600",
    bg: "bg-gradient-to-br from-primary-50 to-primary-100",
    iconBg: "bg-gradient-to-br from-primary-500 to-primary-600",
    icon: "text-white",
    border: "border-primary-200",
    shadow: "shadow-primary-500/20",
    text: "text-primary-700",
  },
  success: {
    gradient: "from-success-500 to-success-600",
    bg: "bg-gradient-to-br from-success-50 to-success-100",
    iconBg: "bg-gradient-to-br from-success-500 to-success-600",
    icon: "text-white",
    border: "border-success-200",
    shadow: "shadow-success-500/20",
    text: "text-success-700",
  },
  warning: {
    gradient: "from-orange-500 to-orange-600",
    bg: "bg-gradient-to-br from-orange-50 to-orange-100",
    iconBg: "bg-gradient-to-br from-orange-500 to-orange-600",
    icon: "text-white",
    border: "border-orange-200",
    shadow: "shadow-orange-500/20",
    text: "text-orange-700",
  },
  info: {
    gradient: "from-info-500 to-info-600",
    bg: "bg-gradient-to-br from-info-50 to-info-100",
    iconBg: "bg-gradient-to-br from-info-500 to-info-600",
    icon: "text-white",
    border: "border-info-200",
    shadow: "shadow-info-500/20",
    text: "text-info-700",
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
    <div
      className={`group relative overflow-hidden rounded-2xl border ${colors.border} ${colors.bg} p-6 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${colors.shadow}`}
    >
      {/* Decorative gradient overlay */}
      <div
        className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${colors.gradient} opacity-10 blur-2xl transition-opacity group-hover:opacity-20`}
      ></div>

      <div className="relative flex items-center justify-between">
        <div className="flex-1">
          <p className={`text-sm font-semibold ${colors.text} uppercase tracking-wide`}>
            {title}
          </p>
          <p className="mt-3 text-4xl font-bold text-foreground">{value}</p>
          {trend && (
            <div className="mt-3 flex items-center gap-2">
              <span
                className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  trend.isPositive
                    ? "bg-success-100 text-success-700"
                    : "bg-danger-100 text-danger-700"
                }`}
              >
                <span>{trend.isPositive ? "↑" : "↓"}</span>
                {trend.value}
              </span>
              <span className="text-xs text-text-secondary">vs last month</span>
            </div>
          )}
        </div>
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-2xl ${colors.iconBg} ${colors.icon} shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-3`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

