import Link from "next/link";
import { MapPin, Users, ShieldCheck } from "lucide-react";

const actions = [
  {
    label: "Find ATMs",
    href: "/locations",
    icon: MapPin,
  },
  {
    label: "Refer Friends",
    href: "/referrals",
    icon: Users,
  },
  {
    label: "Credit Score",
    href: "/credit-score",
    icon: ShieldCheck,
  },
];

export default function QuickActions() {
  return (
    <div className="grid grid-cols-3 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
      {actions.map((action, index) => {
        const Icon = action.icon;

        return (
          <Link
            key={action.label}
            href={action.href}
            className={`flex flex-col items-center justify-center gap-2 px-2 py-4 text-center active:bg-slate-50 ${
              index === 1 ? "border-x" : ""
            }`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef4fb]">
              <Icon size={20} className="text-[#15589b]" />
            </div>

            <span className="text-[11px] font-medium text-slate-700">
              {action.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}