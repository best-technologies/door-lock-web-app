import { ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  iconBgColor: string;
  iconTextColor: string;
}

export default function FeatureCard({
  icon,
  title,
  description,
  iconBgColor,
  iconTextColor,
}: FeatureCardProps) {
  return (
    <div className="group rounded-xl border border-border bg-surface p-6 transition-all hover:border-primary-300 hover:shadow-lg">
      <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${iconBgColor} ${iconTextColor}`}>
        {icon}
      </div>
      <h3 className="mt-4 text-xl font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-text-secondary">{description}</p>
    </div>
  );
}

