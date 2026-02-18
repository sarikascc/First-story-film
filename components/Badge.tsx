import React from "react";
import { type LucideIcon } from "lucide-react";

export type BadgeColor = "indigo" | "emerald" | "amber" | "rose" | "slate" | "sky" | "blue" | "purple";

interface BadgeProps {
  children: React.ReactNode;
  color?: BadgeColor;
  icon?: LucideIcon;
  className?: string; // Allow overriding classes if absolutely necessary
}

const colorStyles: Record<BadgeColor, string> = {
  indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  rose: "bg-rose-50 text-rose-700 border-rose-200",
  slate: "bg-slate-50 text-slate-700 border-slate-200",
  sky: "bg-sky-50 text-sky-700 border-sky-200",
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  purple: "bg-purple-50 text-purple-700 border-purple-200",
};

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  color = "indigo", 
  icon: Icon,
  className = ""
}) => {
  return (
    <span
      className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${colorStyles[color]} ${className}`}
    >
      {Icon && <Icon size={12} className="mr-1.5" strokeWidth={2} />}
      {children}
    </span>
  );
};

export default Badge;
